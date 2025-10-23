import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!;
const ASAAS_BASE_URL = 'https://api.asaas.com/v3';

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

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Não autenticado');
    }

    const { planId, billingType, creditCardToken, creditCardHolderInfo, cpfCnpj, phone, fullName } = await req.json();

    console.log('Criando assinatura:', { planId, billingType });

    // Buscar dados do usuário
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('Organização não encontrada');
    }

    // Buscar plano
    const { data: plan } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    // Buscar subscription atual
    const { data: currentSubscription } = await supabaseClient
      .from('organization_subscriptions')
      .select('asaas_customer_id')
      .eq('organization_id', profile.organization_id)
      .single();

    if (!currentSubscription?.asaas_customer_id) {
      throw new Error('Customer Asaas não encontrado. Crie um customer primeiro.');
    }

    // Atualizar customer com CPF/CNPJ e telefone antes de criar subscription
    if (cpfCnpj) {
      console.log('Atualizando customer no Asaas:', currentSubscription.asaas_customer_id);
      
      const updatePayload: any = {
        cpfCnpj: cpfCnpj,
      };

      if (phone) updatePayload.mobilePhone = phone;
      if (fullName) updatePayload.name = fullName;

      const updateResponse = await fetch(`${ASAAS_BASE_URL}/customers/${currentSubscription.asaas_customer_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_API_KEY,
        },
        body: JSON.stringify(updatePayload),
      });

      const updatedCustomer = await updateResponse.json();

      if (!updateResponse.ok) {
        console.error('Erro ao atualizar customer no Asaas:', updatedCustomer);
        throw new Error(`Falha ao atualizar dados do cliente: ${JSON.stringify(updatedCustomer)}`);
      }

      console.log('Customer atualizado com sucesso:', updatedCustomer.id);
    }

    // Calcular próximo vencimento (30 dias para MONTHLY)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);
    const nextDueDateStr = nextDueDate.toISOString().split('T')[0];

    // Criar assinatura no Asaas
    const subscriptionPayload: any = {
      customer: currentSubscription.asaas_customer_id,
      billingType: billingType,
      value: plan.price,
      nextDueDate: nextDueDateStr,
      cycle: plan.billing_cycle,
      description: `Assinatura ${plan.name} - Pode Vender`,
    };

    // Adicionar dados de cartão se for pagamento com cartão
    if (billingType === 'CREDIT_CARD' && creditCardToken) {
      subscriptionPayload.creditCard = {
        creditCardToken: creditCardToken,
      };
      subscriptionPayload.creditCardHolderInfo = creditCardHolderInfo;
    }

    console.log('Payload da assinatura:', subscriptionPayload);

    const response = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const asaasSubscription = await response.json();

    if (!response.ok) {
      console.error('Erro ao criar assinatura no Asaas:', asaasSubscription);
      throw new Error(`Asaas API error: ${JSON.stringify(asaasSubscription)}`);
    }

    console.log('Assinatura criada com sucesso:', asaasSubscription.id);

    // Atualizar no banco
    const { error: updateError } = await supabaseClient
      .from('organization_subscriptions')
      .update({
        plan_id: planId,
        asaas_subscription_id: asaasSubscription.id,
        asaas_next_due_date: asaasSubscription.nextDueDate,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: nextDueDate.toISOString(),
      })
      .eq('organization_id', profile.organization_id);

    if (updateError) {
      console.error('Erro ao atualizar subscription no banco:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: asaasSubscription,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro em asaas-create-subscription:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
