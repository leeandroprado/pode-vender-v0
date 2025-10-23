import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!;
const ASAAS_BASE_URL = 'https://sandbox.asaas.com/api/v3'; // Usar sandbox para testes

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

    // Verificar autenticação
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Não autenticado');
    }

    const { name, email, cpfCnpj, phone } = await req.json();

    console.log('Criando customer no Asaas:', { name, email, cpfCnpj });

    // Criar customer no Asaas
    const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name,
        email,
        cpfCnpj,
        phone,
        notificationDisabled: false,
      }),
    });

    const customer = await response.json();

    if (!response.ok) {
      console.error('Erro ao criar customer no Asaas:', customer);
      throw new Error(`Asaas API error: ${JSON.stringify(customer)}`);
    }

    console.log('Customer criado com sucesso:', customer.id);

    // Buscar organization_id do usuário
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id) {
      // Atualizar organization_subscriptions com asaas_customer_id
      await supabaseClient
        .from('organization_subscriptions')
        .update({ asaas_customer_id: customer.id })
        .eq('organization_id', profile.organization_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        asaas_customer_id: customer.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro em asaas-create-customer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
