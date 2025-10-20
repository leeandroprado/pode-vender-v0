import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { agentId } = await req.json();

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'agentId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting deletion process for agent: ${agentId}`);

    // Fetch agent and verify ownership
    const { data: agent, error: agentFetchError } = await supabaseClient
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("user_id", user.id)
      .single();

    if (agentFetchError || !agent) {
      console.error('Agent fetch error:', agentFetchError);
      return new Response(
        JSON.stringify({ error: 'Agente não encontrado ou você não tem permissão' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch associated WhatsApp instance
    const { data: instance, error: instanceFetchError } = await supabaseClient
      .from("whatsapp_instances")
      .select("*")
      .eq("agent_id", agentId)
      .maybeSingle();

    if (instanceFetchError) {
      console.error('Instance fetch error:', instanceFetchError);
    }

    let apiZapDeleted = false;
    let apiZapError = null;

    // Delete from ApiZap if instance exists
    if (instance?.hash && instance?.instance_name) {
      console.log(`Deleting instance from ApiZap: ${instance.instance_name}`);
      
      // Get base URL from system_settings
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: settingsData } = await supabaseAdmin
        .from('system_settings')
        .select('setting_value')
        .eq('setting_category', 'apizap')
        .eq('setting_key', 'base_url')
        .maybeSingle();

      const baseUrl = settingsData?.setting_value || 'https://application.wpp.imidiahouse.com.br';
      console.log('Using API base URL:', baseUrl);
      
      try {
        const apiZapResponse = await fetch(
          `${baseUrl}/instance/delete/${instance.instance_name}`,
          {
            method: "DELETE",
            headers: {
              "apikey": instance.hash
            }
          }
        );

        if (apiZapResponse.ok) {
          apiZapDeleted = true;
          console.log('Successfully deleted instance from ApiZap');
        } else {
          const errorText = await apiZapResponse.text();
          apiZapError = `ApiZap deletion failed: ${apiZapResponse.status} - ${errorText}`;
          console.error(apiZapError);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        apiZapError = `ApiZap API error: ${errorMessage}`;
        console.error(apiZapError);
      }
    }

    // Delete WhatsApp instance from database
    if (instance) {
      console.log(`Deleting instance from database: ${instance.id}`);
      const { error: instanceDeleteError } = await supabaseClient
        .from("whatsapp_instances")
        .delete()
        .eq("id", instance.id);

      if (instanceDeleteError) {
        console.error('Instance database deletion error:', instanceDeleteError);
        return new Response(
          JSON.stringify({ error: `Erro ao deletar instância do banco: ${instanceDeleteError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delete agent from database
    console.log(`Deleting agent from database: ${agentId}`);
    const { error: agentDeleteError } = await supabaseClient
      .from("agents")
      .delete()
      .eq("id", agentId);

    if (agentDeleteError) {
      console.error('Agent deletion error:', agentDeleteError);
      return new Response(
        JSON.stringify({ error: `Erro ao deletar agente: ${agentDeleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Agent and instance successfully deleted');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Agente e instância WhatsApp deletados com sucesso',
        apiZapDeleted,
        apiZapError,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
