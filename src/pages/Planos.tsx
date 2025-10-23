import { useNavigate } from "react-router-dom";
import { usePlans } from "@/hooks/usePlans";
import { useSubscription } from "@/hooks/useSubscription";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";
import { PlanCard } from "@/components/PlanCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Planos() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { data: plans, isLoading } = usePlans();

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
                onSelect={() => {
                  if (plan.is_custom) {
                    // Abrir WhatsApp ou email para contato
                    window.open(
                      'https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Enterprise. Gostaria de mais informações sobre preços e recursos personalizados.',
                      '_blank'
                    );
                  } else {
                    // Navegar para checkout (implementaremos depois)
                    console.log('Selecionar plano:', plan.slug);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
