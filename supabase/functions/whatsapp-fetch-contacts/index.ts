import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching WhatsApp contacts...");

    // Autenticar usuário
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("User authenticated:", user.id);

    // Receber agentId da requisição (opcional)
    const { agentId } = await req.json();

    // Buscar instância WhatsApp do usuário
    let query = supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'connected');

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data: instances, error: instanceError } = await query.limit(1).single();

    if (instanceError || !instances) {
      console.error("Instance not found:", instanceError);
      return new Response(
        JSON.stringify({ error: 'Nenhuma instância WhatsApp conectada encontrada' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("WhatsApp instance found:", instances.instance_name);

    // Buscar configurações da API
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['base_url', 'send_text_endpoint'])
      .eq('setting_category', 'whatsapp_api');

    if (settingsError || !settings || settings.length === 0) {
      console.error("Settings error:", settingsError);
      return new Response(
        JSON.stringify({ error: 'Configurações da API não encontradas' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = settings.find(s => s.setting_key === 'base_url')?.setting_value;
    const apiKey = Deno.env.get('APIZAP_API_KEY');

    if (!baseUrl || !apiKey) {
      console.error("Missing configuration:", { baseUrl: !!baseUrl, apiKey: !!apiKey });
      return new Response(
        JSON.stringify({ error: 'Configuração da API incompleta' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fazer requisição para Evolution API
    const url = `${baseUrl}/chat/findContacts/${instances.instance_name}`;
    console.log("Calling Evolution API:", url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({ where: {} }), // Vazio retorna todos os contatos
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Evolution API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Erro ao buscar contatos: ${response.statusText}` }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contactsData = await response.json();
    console.log("Contacts fetched:", contactsData.length || 0);

    // Formatar contatos para o padrão do sistema
    const formattedContacts = (Array.isArray(contactsData) ? contactsData : []).map((contact: any) => {
      // Extrair telefone do ID (remove @s.whatsapp.net)
      const phone = contact.id?.replace('@s.whatsapp.net', '').replace('@c.us', '') || '';
      
      return {
        name: contact.name || contact.pushName || 'Contato sem nome',
        phone: phone,
        email: null,
        cpf: null,
        city: null,
      };
    }).filter(c => c.phone); // Apenas contatos com telefone válido

    console.log("Formatted contacts:", formattedContacts.length);

    return new Response(
      JSON.stringify({ 
        contacts: formattedContacts,
        total: formattedContacts.length 
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar contatos';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
