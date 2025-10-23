import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { usePlans } from "@/hooks/usePlans";
import { PlanFormDialog } from "@/components/PlanFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, EyeOff, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function GerenciarPlanos() {
  const { data: plans, isLoading } = usePlans();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setDialogOpen(true);
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleToggleActive = async (plan: any) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: plan.is_active ? "Plano desativado" : "Plano ativado",
        description: `O plano foi ${plan.is_active ? "desativado" : "ativado"} com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              Gerenciar Planos
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie e edite planos de assinatura
            </p>
          </div>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>

        {/* Plans List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando planos...
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        {!plan.is_active && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {plan.description || "Sem descrição"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">
                        R$ {plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.billing_cycle === 'MONTHLY' ? 'mês' : 'ano'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Slug:</span>
                        <span className="font-mono text-xs">{plan.slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trial:</span>
                        <span className="font-medium">{plan.trial_days} dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ordem:</span>
                        <span className="font-medium">{plan.display_order}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(plan)}
                      >
                        {plan.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum plano cadastrado</p>
            <Button onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </div>
        )}
      </div>

      <PlanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={selectedPlan}
      />
    </DashboardLayout>
  );
}
