import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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

    const { conversationId, content } = await req.json();

    if (!conversationId || !content) {
      throw new Error('conversationId e content são obrigatórios');
    }

    console.log('Sending WhatsApp message for conversation:', conversationId);

    // Buscar dados da conversa e instância
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select(`
        whatsapp_phone,
        whatsapp_instance_id,
        whatsapp_instances (
          instance_name,
          hash
        )
      `)
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('Error fetching conversation:', convError);
      throw new Error('Conversa não encontrada');
    }

    if (!conversation.whatsapp_instance_id || !conversation.whatsapp_instances) {
      throw new Error('Instância do WhatsApp não encontrada');
    }

    const { instance_name, hash } = conversation.whatsapp_instances as any;

    // Buscar configurações da API usando service role key
    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching API settings from system_settings...');
    
    const { data: settings, error: settingsError } = await serviceRoleClient
      .from('system_settings')
      .select('setting_key, setting_value')
      .eq('setting_category', 'apizap')
      .in('setting_key', ['base_url', 'send_text_endpoint']);

    console.log('Settings query result:', { settings, error: settingsError });

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw new Error(`Erro ao buscar configurações: ${settingsError.message}`);
    }

    if (!settings || settings.length === 0) {
      console.error('No settings found for category apizap');
      throw new Error('Nenhuma configuração encontrada para ApiZap. Verifique as configurações do sistema.');
    }

    const baseUrl = settings.find(s => s.setting_key === 'base_url')?.setting_value;
    const endpoint = settings.find(s => s.setting_key === 'send_text_endpoint')?.setting_value;

    console.log('Parsed settings:', { baseUrl, endpoint });

    if (!baseUrl || !endpoint) {
      const missing = [];
      if (!baseUrl) missing.push('base_url');
      if (!endpoint) missing.push('send_text_endpoint');
      console.error('Missing settings:', missing);
      throw new Error(`Configurações faltando: ${missing.join(', ')}`);
    }

    // Construir URL completa
    const apiUrl = `${baseUrl}${endpoint}/${instance_name}`;

    console.log('Sending to API:', apiUrl);

    // Enviar mensagem via API
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': hash,
      },
      body: JSON.stringify({
        number: conversation.whatsapp_phone,
        text: content,
        delay: 2000,
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API Error:', errorText);
      throw new Error(`Erro ao enviar mensagem: ${apiResponse.status} - ${errorText}`);
    }

    const result = await apiResponse.json();
    console.log('Message sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-send-message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
