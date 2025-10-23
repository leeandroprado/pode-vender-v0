import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { usePlans } from "@/hooks/usePlans";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionActions } from "@/hooks/useSubscriptionActions";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Loader2 } from "lucide-react";
import { PlanCard } from "@/components/PlanCard";
import { PaymentDataDialog } from "@/components/PaymentDataDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Planos() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { data: plans, isLoading } = usePlans();
  const { createOrUpdateSubscription, isLoading: isProcessing } = useSubscriptionActions();
  const [paymentDataDialogOpen, setPaymentDataDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleSelectPlan = (planId: string, isCustom: boolean) => {
    if (isCustom) {
      // Abrir WhatsApp ou email para contato
      window.open(
        'https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Enterprise. Gostaria de mais informações sobre preços e recursos personalizados.',
        '_blank'
      );
    } else {
      // Tentar criar/atualizar subscription
      setSelectedPlanId(planId);
      createOrUpdateSubscription.mutate(planId, {
        onError: (error: any) => {
          if (error.message === 'MISSING_PAYMENT_DATA') {
            setPaymentDataDialogOpen(true);
          }
        },
      });
    }
  };

  const handlePaymentDataSuccess = () => {
    if (selectedPlanId) {
      createOrUpdateSubscription.mutate(selectedPlanId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Escolha seu Plano</h1>
          <p className="text-muted-foreground mt-2">
            Comece grátis e faça upgrade quando precisar
          </p>
        </div>

        {/* Plano atual */}
        {subscription && subscription.plan && (
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertTitle>Plano Atual: {subscription.plan.name}</AlertTitle>
            <AlertDescription>
              {subscription.status === 'trial' && subscription.trial_ends_at
                ? `Trial válido até ${format(new Date(subscription.trial_ends_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
                : subscription.current_period_end 
                  ? `Renovação em ${format(new Date(subscription.current_period_end), "dd/MM/yyyy", { locale: ptBR })}`
                  : 'Sem data de renovação'}
            </AlertDescription>
          </Alert>
        )}

        {/* Grid de planos */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                current={subscription?.plan_id === plan.id}
                isProcessing={isProcessing}
                onSelect={() => handleSelectPlan(plan.id, plan.is_custom)}
              />
            ))}
          </div>
        )}

        {/* Loading overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-8 rounded-lg shadow-lg flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Processando alteração de plano...</p>
              <p className="text-sm text-muted-foreground">Aguarde um momento</p>
            </div>
          </div>
        )}

        {/* Dialog de dados de pagamento */}
        <PaymentDataDialog
          open={paymentDataDialogOpen}
          onOpenChange={setPaymentDataDialogOpen}
          onSuccess={handlePaymentDataSuccess}
        />
      </div>
    </DashboardLayout>
  );
}
