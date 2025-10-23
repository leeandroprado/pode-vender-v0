import { useState } from "react";
import { usePlans } from "@/hooks/usePlans";
import { PlanFormDialog } from "@/components/PlanFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, EyeOff, CreditCard, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function GerenciarPlanos() {
  const navigate = useNavigate();
  const { data: plans, isLoading } = usePlans();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const formatBillingCycle = (cycle: string) => {
    return cycle === 'MONTHLY' ? 'mês' : 'ano';
  };

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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/gerenciar-funcionalidades')}>
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Funcionalidades
            </Button>
            <Button onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </div>

        {/* Plans List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando planos...
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      {plan.name}
                    </CardTitle>
                    {!plan.is_active && (
                      <Badge variant="secondary" className="shrink-0">Inativo</Badge>
                    )}
                  </div>
                  {plan.description && (
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1 space-y-4 pb-4">
                  <div className="pb-4 border-b">
                    <div className="text-4xl font-bold text-primary">
                      R$ {formatPrice(plan.price)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      por {formatBillingCycle(plan.billing_cycle)}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Identificador:</span>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{plan.slug}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Período trial:</span>
                      <span className="font-medium">{plan.trial_days} dias</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Ordem exibição:</span>
                      <span className="font-medium">{plan.display_order}</span>
                    </div>
                  </div>
                </CardContent>

                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant={plan.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleActive(plan)}
                    >
                      {plan.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </Button>
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
      
      <PlanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={selectedPlan}
      />
    </div>
  );
}
