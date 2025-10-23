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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event = await req.json();
    console.log('Webhook Asaas recebido:', JSON.stringify(event));

    const { event: eventType, payment } = event;

    switch (eventType) {
      case 'PAYMENT_RECEIVED':
        console.log('Pagamento recebido:', payment.id);

        // Atualizar invoice
        await supabaseClient
          .from('subscription_invoices')
          .update({
            status: 'received',
            payment_date: new Date().toISOString().split('T')[0],
          })
          .eq('asaas_payment_id', payment.id);

        // Ativar assinatura se estava bloqueada
        if (payment.subscription) {
          await supabaseClient
            .from('organization_subscriptions')
            .update({ status: 'active' })
            .eq('asaas_subscription_id', payment.subscription);
        }
        break;

      case 'PAYMENT_OVERDUE':
        console.log('Pagamento atrasado:', payment.id);

        // Atualizar invoice
        await supabaseClient
          .from('subscription_invoices')
          .update({ status: 'overdue' })
          .eq('asaas_payment_id', payment.id);

        // Marcar assinatura como atrasada
        if (payment.subscription) {
          await supabaseClient
            .from('organization_subscriptions')
            .update({ status: 'past_due' })
            .eq('asaas_subscription_id', payment.subscription);
        }
        break;

      case 'PAYMENT_CONFIRMED':
        console.log('Pagamento confirmado (cobrança criada):', payment.id);

        // Buscar subscription do payment
        const { data: subscription } = await supabaseClient
          .from('organization_subscriptions')
          .select('organization_id, id')
          .eq('asaas_subscription_id', payment.subscription)
          .single();

        if (subscription) {
          // Criar registro da invoice
          await supabaseClient
            .from('subscription_invoices')
            .insert({
              organization_id: subscription.organization_id,
              subscription_id: subscription.id,
              asaas_payment_id: payment.id,
              asaas_invoice_url: payment.invoiceUrl,
              amount: payment.value,
              due_date: payment.dueDate,
              status: 'pending',
              billing_type: payment.billingType,
            });
        }
        break;

      case 'PAYMENT_DELETED':
      case 'PAYMENT_REFUNDED':
        console.log('Pagamento deletado/reembolsado:', payment.id);

        await supabaseClient
          .from('subscription_invoices')
          .update({ status: eventType === 'PAYMENT_REFUNDED' ? 'refunded' : 'canceled' })
          .eq('asaas_payment_id', payment.id);
        break;

      case 'SUBSCRIPTION_DELETED':
      case 'SUBSCRIPTION_EXPIRED':
        console.log('Assinatura cancelada/expirada:', event.subscription);

        await supabaseClient
          .from('organization_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('asaas_subscription_id', event.subscription);
        break;

      default:
        console.log('Evento não tratado:', eventType);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro no webhook Asaas:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
