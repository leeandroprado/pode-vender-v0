import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Phone, Clock, AlertCircle, Unplug } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAgents } from "@/hooks/useAgents";

type Agent = Tables<"agents">;
type WhatsAppInstance = Tables<"whatsapp_instances">;

interface WhatsAppStatusDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WhatsAppStatusDialog = ({ agent, open, onOpenChange }: WhatsAppStatusDialogProps) => {
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { disconnectWhatsApp } = useAgents();

  useEffect(() => {
    if (open && agent) {
      fetchInstanceDetails();
    }
  }, [open, agent]);

  const fetchInstanceDetails = async () => {
    if (!agent) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("agent_id", agent.id)
        .single();

      if (error) throw error;
      setInstance(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes da instância:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!instance) return null;

    const statusConfig = {
      connected: { label: "Conectado", variant: "default" as const, icon: CheckCircle },
      connecting: { label: "Conectando", variant: "secondary" as const, icon: Clock },
      disconnected: { label: "Desconectado", variant: "destructive" as const, icon: AlertCircle },
      error: { label: "Erro", variant: "destructive" as const, icon: AlertCircle },
    };

    const config = statusConfig[instance.status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Status da Conexão WhatsApp</DialogTitle>
          <DialogDescription>
            Informações sobre a conexão do agente {agent?.name}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : instance ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge()}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nome da Instância:</span>
              <span className="text-sm text-muted-foreground">{instance.instance_name}</span>
            </div>

            {agent?.whatsapp_phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone:
                </span>
                <span className="text-sm text-muted-foreground">{agent.whatsapp_phone}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Conectado desde:
              </span>
              <span className="text-sm text-muted-foreground">{formatDate(instance.created_at)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Última atualização:</span>
              <span className="text-sm text-muted-foreground">{formatDate(instance.updated_at)}</span>
            </div>

            {instance.status === "connected" && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  ✓ Sua instância está conectada e funcionando corretamente.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhuma instância encontrada
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {instance?.status === "connected" && (
            <Button 
              variant="destructive"
              onClick={() => {
                if (agent) {
                  disconnectWhatsApp.mutate(agent.id);
                  onOpenChange(false);
                }
              }}
              disabled={disconnectWhatsApp.isPending}
              className="gap-2"
            >
              <Unplug className="h-4 w-4" />
              Desconectar
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
