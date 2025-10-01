import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, MessageSquare, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

const activities = [
  {
    type: "cart",
    action: "Carrinho finalizado",
    client: "João Silva",
    details: "R$ 2.450,00 - 3 itens",
    time: "2 minutos atrás",
    icon: CheckCircle,
    variant: "success",
  },
  {
    type: "product",
    action: "Consulta de produto",
    client: "Maria Santos",
    details: "Notebook Dell Inspiron 15",
    time: "15 minutos atrás",
    icon: MessageSquare,
    variant: "info",
  },
  {
    type: "cart",
    action: "Item adicionado ao carrinho",
    client: "Pedro Costa",
    details: "Mouse Gamer RGB",
    time: "32 minutos atrás",
    icon: ShoppingCart,
    variant: "info",
  },
  {
    type: "client",
    action: "Novo cliente cadastrado",
    client: "Ana Oliveira",
    details: "CPF: 321.654.987-00",
    time: "1 hora atrás",
    icon: UserPlus,
    variant: "success",
  },
  {
    type: "support",
    action: "Encaminhado para humano",
    client: "Carlos Pereira",
    details: "Dúvida sobre garantia",
    time: "2 horas atrás",
    icon: AlertCircle,
    variant: "warning",
  },
  {
    type: "cart",
    action: "Carrinho abandonado",
    client: "Lucia Fernandes",
    details: "R$ 899,00 - 2 itens",
    time: "3 horas atrás",
    icon: ShoppingCart,
    variant: "warning",
  },
  {
    type: "product",
    action: "Consulta de estoque",
    client: "Roberto Alves",
    details: "Teclado Mecânico",
    time: "4 horas atrás",
    icon: MessageSquare,
    variant: "info",
  },
  {
    type: "cart",
    action: "Carrinho finalizado",
    client: "Fernanda Lima",
    details: "R$ 1.299,00 - 1 item",
    time: "5 horas atrás",
    icon: CheckCircle,
    variant: "success",
  },
];

export default function Atividades() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Atividades</h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
          Histórico detalhado das ações dos agentes de IA
        </p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar atividades..." className="pl-10" />
            </div>
          </div>

          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 md:p-4 transition-colors hover:bg-muted/50"
              >
                <div
                  className={`rounded-lg p-2 flex-shrink-0 ${
                    activity.variant === "success"
                      ? "bg-success/10"
                      : activity.variant === "warning"
                      ? "bg-warning/10"
                      : "bg-primary/10"
                  }`}
                >
                  <activity.icon
                    className={`h-4 w-4 md:h-5 md:w-5 ${
                      activity.variant === "success"
                        ? "text-success"
                        : activity.variant === "warning"
                        ? "text-warning"
                        : "text-primary"
                    }`}
                  />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm md:text-base leading-snug">{activity.action}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Cliente: {activity.client}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs self-start">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-snug">{activity.details}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
