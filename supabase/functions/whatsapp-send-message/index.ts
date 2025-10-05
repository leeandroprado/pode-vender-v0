import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // Buscar configurações da API
    const { data: settings, error: settingsError } = await supabaseClient
      .from('system_settings')
      .select('setting_key, setting_value')
      .eq('category', 'apizap')
      .in('setting_key', ['base_url', 'send_text_endpoint']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw new Error('Erro ao buscar configurações');
    }

    const baseUrl = settings?.find(s => s.setting_key === 'base_url')?.setting_value;
    const endpoint = settings?.find(s => s.setting_key === 'send_text_endpoint')?.setting_value;

    if (!baseUrl || !endpoint) {
      throw new Error('Configurações da API não encontradas');
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
