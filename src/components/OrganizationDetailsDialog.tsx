import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useOrganizations, type Organization } from "@/hooks/useOrganizations";
import { Building2, Users, Calendar, TrendingUp, Lock, Unlock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrganizationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
}

export function OrganizationDetailsDialog({
  open,
  onOpenChange,
  organization,
}: OrganizationDetailsDialogProps) {
  const { getOrganizationDetails, updateOrganizationStatus } = useOrganizations();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && organization) {
      setLoading(true);
      getOrganizationDetails(organization.id)
        .then(setDetails)
        .finally(() => setLoading(false));
    }
  }, [open, organization]);

  if (!organization) return null;

  const handleToggleStatus = () => {
    const newStatus = organization.subscription?.status === 'blocked' ? 'active' : 'blocked';
    updateOrganizationStatus.mutate({
      orgId: organization.id,
      status: newStatus,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Detalhes da Organização
          </DialogTitle>
          <DialogDescription>
            Visualize e gerencie informações da organização
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando detalhes...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Informações Básicas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium">{organization.full_name || "Não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{organization.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs">{organization.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="font-medium">
                    {format(new Date(organization.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Assinatura */}
            {organization.subscription && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Assinatura</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge>{organization.subscription.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plano:</span>
                    <span className="font-medium">{organization.subscription.plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">
                      R$ {organization.subscription.plan.price}/
                      {organization.subscription.plan.billing_cycle === 'MONTHLY' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  {organization.subscription.trial_ends_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trial até:</span>
                      <span className="font-medium">
                        {format(new Date(organization.subscription.trial_ends_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  {organization.subscription.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renova em:</span>
                      <span className="font-medium">
                        {format(new Date(organization.subscription.current_period_end), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Usuários */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários ({details?.users?.length || 0})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {details?.users?.map((user: any) => (
                  <div key={user.id} className="flex justify-between items-center text-sm py-2 px-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.full_name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(user.created_at), "dd/MM/yy", { locale: ptBR })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Ações */}
            <div className="flex gap-2">
              <Button
                variant={organization.subscription?.status === 'blocked' ? 'default' : 'destructive'}
                size="sm"
                className="flex-1"
                onClick={handleToggleStatus}
              >
                {organization.subscription?.status === 'blocked' ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Desbloquear
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Bloquear
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
