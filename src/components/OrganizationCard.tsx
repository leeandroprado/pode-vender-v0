import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Organization } from "@/hooks/useOrganizations";

interface OrganizationCardProps {
  organization: Organization;
  onViewDetails: (org: Organization) => void;
}

export function OrganizationCard({ organization, onViewDetails }: OrganizationCardProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Ativo" },
      trial: { variant: "secondary", label: "Trial" },
      canceled: { variant: "destructive", label: "Cancelado" },
      blocked: { variant: "destructive", label: "Bloqueado" },
    };

    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {organization.full_name || organization.email}
              </CardTitle>
              <CardDescription className="text-sm">
                {organization.email}
              </CardDescription>
            </div>
          </div>
          {organization.subscription && getStatusBadge(organization.subscription.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{organization.user_count} usuário(s)</span>
          </div>

          {organization.subscription && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>
                  {organization.subscription.plan.name} - R$ {organization.subscription.plan.price}/
                  {organization.subscription.plan.billing_cycle === 'MONTHLY' ? 'mês' : 'ano'}
                </span>
              </div>

              {organization.subscription.trial_ends_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Trial até {format(new Date(organization.subscription.trial_ends_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Criado em {format(new Date(organization.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => onViewDetails(organization)}
          >
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
