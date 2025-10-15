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
      .in('setting_key', ['base_url'])
      .eq('setting_category', 'apizap');

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
    const totalFetched = Array.isArray(contactsData) ? contactsData.length : 0;
    console.log("Contacts fetched:", totalFetched);

    // Debug: mostrar estrutura do primeiro contato
    if (contactsData && contactsData.length > 0) {
      console.log("📱 Sample contact structure:", JSON.stringify(contactsData[0], null, 2));
    }

    // Formatar contatos para o padrão do sistema
    const formattedContacts = (Array.isArray(contactsData) ? contactsData : []).map((contact: any) => {
      // ✅ Priorizar remoteJid (contém o número real)
      let phone = '';
      
      if (contact.remoteJid) {
        phone = contact.remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
      } else if (contact.id && contact.id.includes('@')) {
        phone = contact.id.replace('@s.whatsapp.net', '').replace('@c.us', '');
      }
      
      // Remover caracteres não-numéricos e validar
      phone = phone.replace(/\D/g, '');
      const isValidPhone = phone.length >= 10; // Mínimo 10 dígitos
      
      if (!isValidPhone) {
        console.warn(`⚠️ Contato sem telefone válido:`, contact.pushName || contact.name, 'ID:', contact.id);
        return null;
      }
      
      return {
        name: contact.pushName || contact.name || 'Contato sem nome',
        phone: phone,
        email: null,
        cpf: null,
        city: null,
      };
    }).filter(c => c !== null);

    const validContacts = formattedContacts.length;
    const invalidContacts = totalFetched - validContacts;

    console.log(`📊 Stats: ${validContacts} válidos, ${invalidContacts} ignorados (sem telefone)`);

    return new Response(
      JSON.stringify({ 
        contacts: formattedContacts,
        total: validContacts,
        stats: {
          fetched: totalFetched,
          valid: validContacts,
          invalid: invalidContacts
        }
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
