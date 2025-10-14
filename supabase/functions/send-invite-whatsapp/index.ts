import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Verificar permissões do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Não autenticado');
    }

    // Verificar se é admin ou super_admin
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: userRole } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || !['admin', 'super_admin'].includes(userRole.role)) {
      throw new Error('Sem permissão para enviar convites');
    }

    const { phone, email, role, token } = await req.json();

    if (!phone || !email || !role || !token) {
      throw new Error('Dados incompletos: phone, email, role e token são obrigatórios');
    }

    console.log('Enviando convite via WhatsApp para:', phone);

    // Buscar configurações do ApiZap
    const { data: settings } = await serviceClient
      .from('system_settings')
      .select('setting_key, setting_value')
      .eq('setting_category', 'apizap');

    if (!settings || settings.length === 0) {
      throw new Error('Configurações do ApiZap não encontradas');
    }

    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    const baseUrl = settingsMap['base_url'];
    const apiKey = Deno.env.get('APIZAP_API_KEY');

    if (!baseUrl || !apiKey) {
      throw new Error('Configurações do ApiZap incompletas');
    }

    // Buscar qualquer instância ativa de WhatsApp (não filtra por user_id)
    console.log('Buscando instâncias do WhatsApp disponíveis...');
    const { data: instances } = await serviceClient
      .from('whatsapp_instances')
      .select('instance_name, hash')
      .in('status', ['open', 'connected'])
      .not('instance_name', 'is', null)
      .not('hash', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('Instâncias encontradas:', instances?.length || 0);
    
    if (!instances || instances.length === 0) {
      console.error('Nenhuma instância encontrada. Verifique:');
      console.error('1. Se existe instância criada na página de Agentes');
      console.error('2. Se o status está como "open" ou "connected"');
      console.error('3. Se a instância foi conectada via QR Code');
      
      throw new Error(
        'Nenhuma instância do WhatsApp disponível. ' +
        'Configure e conecte uma instância na página de Agentes.'
      );
    }

    console.log('Usando instância:', instances[0].instance_name);

    const instance = instances[0];
    const appUrl = Deno.env.get('APP_URL') || 'https://tefidquitahjjxpeowzt.supabase.co';
    const inviteLink = `${appUrl}/aceitar-convite?token=${token}`;

    // Mapear roles para nomes amigáveis
    const roleNames: Record<string, string> = {
      'user': 'Usuário',
      'vendedor': 'Vendedor',
      'moderator': 'Moderador',
      'admin': 'Administrador',
      'super_admin': 'Super Administrador'
    };

    const roleName = roleNames[role] || role;

    // Montar mensagem
    const message = `🎉 *Convite para a Equipe*

Olá! Você foi convidado para fazer parte da nossa equipe como *${roleName}*.

📋 *Detalhes do convite:*
• Email: ${email}
• Cargo: ${roleName}
• Validade: 7 dias

🔗 *Aceitar convite:*
${inviteLink}

_Este convite expira em 7 dias._`;

    // Enviar mensagem via ApiZap
    const sendEndpoint = settingsMap['send_text_endpoint'] || '/message/sendText';
    const apiUrl = `${baseUrl}${sendEndpoint}/${instance.instance_name}`;

    console.log('Enviando para URL:', apiUrl);

    const whatsappResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: phone.replace(/\D/g, ''),
        text: message,
      }),
    });

    const whatsappData = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('Erro ao enviar WhatsApp:', whatsappData);
      throw new Error(`Erro ao enviar WhatsApp: ${JSON.stringify(whatsappData)}`);
    }

    console.log('Convite enviado com sucesso:', whatsappData);

    // Não atualizamos status para 'sent' pois o enum não inclui esse valor
    // O convite permanece com status 'pending' até ser aceito

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Convite enviado com sucesso',
        whatsappResponse: whatsappData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro ao enviar convite:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
