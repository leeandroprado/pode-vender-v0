import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Plan } from "@/hooks/usePlans";

interface PlanCardProps {
  plan: Plan;
  current: boolean;
  isProcessing?: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, current, isProcessing = false, onSelect }: PlanCardProps) {
  const renderFeatureValue = (value: any): string => {
    if (value === -1) return "Ilimitado";
    if (value === true) return "Incluído";
    if (value === false) return "Não incluído";
    return String(value);
  };

  const getFeatureLabel = (key: string): string => {
    const labels: Record<string, string> = {
      max_agents: "Agentes IA",
      max_conversations_per_month: "Conversas/mês",
      max_products: "Produtos",
      can_use_ai_agents: "Agentes IA",
      can_export_reports: "Exportar relatórios",
      can_manage_team: "Gerenciar equipe",
      max_team_members: "Membros da equipe",
      whatsapp_instances: "Instâncias WhatsApp",
      api_access: "Acesso API",
      custom_branding: "Marca personalizada",
      priority_support: "Suporte prioritário",
      can_create_agendas: "Criar agendas",
      dedicated_support: "Suporte dedicado",
    };
    return labels[key] || key;
  };

  // Destacar o plano Profissional
  const isRecommended = plan.slug === 'professional';

  return (
    <Card className={`relative ${current ? 'border-primary shadow-lg' : ''} ${isRecommended ? 'border-primary/50' : ''}`}>
      {isRecommended && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Mais Popular
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {plan.name}
          {current && <Badge variant="secondary">Atual</Badge>}
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          {plan.is_custom ? (
            <p className="text-2xl font-bold">Personalizado</p>
          ) : (
            <>
              <span className="text-4xl font-bold">
                R$ {plan.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground">/mês</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features */}
        <ul className="space-y-2 min-h-[300px]">
          {Object.entries(plan.features)
            .filter(([_, value]) => value !== false)
            .map(([key, value]) => (
              <li key={key} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <span className="font-medium">{getFeatureLabel(key)}:</span>{" "}
                  {renderFeatureValue(value)}
                </span>
              </li>
            ))}
        </ul>

        <Button
          className="w-full"
          variant={current ? 'outline' : isRecommended ? 'default' : 'outline'}
          disabled={current || isProcessing}
          onClick={onSelect}
        >
          {current
            ? 'Plano Atual'
            : plan.is_custom
            ? 'Entrar em Contato'
            : 'Selecionar Plano'}
        </Button>
      </CardContent>
    </Card>
  );
}
