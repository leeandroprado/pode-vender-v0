import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useSubscriptionActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createOrUpdateSubscription = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Buscar organization_id e dados do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, email, full_name, cpf_cnpj, phone')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error("Organização não encontrada");
      }

      // 2. Verificar se já existe subscription
      const { data: existingSubscription } = await supabase
        .from('organization_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('organization_id', profile.organization_id)
        .maybeSingle();

      // 3. Buscar dados do novo plano
      const { data: newPlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (!newPlan) {
        throw new Error("Plano não encontrado");
      }

      // Verificar se é plano pago e se precisa de CPF/CNPJ
      if (newPlan.slug !== 'trial' && !profile.cpf_cnpj) {
        throw new Error('MISSING_PAYMENT_DATA');
      }

      // Se for plano Trial, apenas criar subscription no banco
      if (newPlan.slug === 'trial') {
        const { data, error } = await supabase
          .from('organization_subscriptions')
          .upsert({
            organization_id: profile.organization_id,
            plan_id: planId,
            status: 'trial',
            trial_ends_at: new Date(Date.now() + newPlan.trial_days * 24 * 60 * 60 * 1000).toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + newPlan.trial_days * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return { subscription: data, requiresPayment: false };
      }

      // Para planos pagos, integrar com Asaas
      let asaasCustomerId = existingSubscription?.asaas_customer_id;

      // 4. Se não existe cliente no Asaas, criar
      if (!asaasCustomerId) {
        const { data: customerData, error: customerError } = await supabase.functions.invoke(
          'asaas-create-customer',
          {
            body: {
              name: profile.full_name || profile.email.split('@')[0],
              email: profile.email,
            },
          }
        );

        if (customerError) throw customerError;
        asaasCustomerId = customerData.customerId;
      }

      // 5. Criar/atualizar subscription no Asaas (inclui atualização do customer)
      const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke(
        'asaas-create-subscription',
        {
          body: {
            customerId: asaasCustomerId,
            planId: planId,
            billingType: 'BOLETO',
            cpfCnpj: profile.cpf_cnpj,
            phone: profile.phone,
            fullName: profile.full_name,
          },
        }
      );

      if (subscriptionError) throw subscriptionError;

      // 6. Atualizar subscription no banco
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('organization_subscriptions')
        .upsert({
          organization_id: profile.organization_id,
          plan_id: planId,
          status: 'active',
          asaas_customer_id: asaasCustomerId,
          asaas_subscription_id: subscriptionData.subscriptionId,
          asaas_next_due_date: subscriptionData.nextDueDate,
          current_period_start: new Date().toISOString(),
          current_period_end: subscriptionData.nextDueDate,
        })
        .select('*, plan:subscription_plans(*)')
        .single();

      if (updateError) throw updateError;

      return {
        subscription: updatedSubscription,
        requiresPayment: true,
        invoiceUrl: subscriptionData.invoiceUrl,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organization-subscription'] });
      
      if (data.requiresPayment && data.invoiceUrl) {
        toast({
          title: "Plano alterado com sucesso!",
          description: "Você será redirecionado para a página de pagamento.",
        });
        
        // Abrir boleto/PIX em nova aba
        setTimeout(() => {
          window.open(data.invoiceUrl, '_blank');
          navigate('/conta');
        }, 1000);
      } else {
        toast({
          title: "Plano ativado com sucesso!",
          description: "Seu novo plano já está ativo.",
        });
        navigate('/conta');
      }
    },
    onError: (error: any) => {
      console.error('Erro ao criar/atualizar subscription:', error);
      toast({
        title: "Erro ao alterar plano",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  return {
    createOrUpdateSubscription,
    isLoading: createOrUpdateSubscription.isPending,
  };
};
