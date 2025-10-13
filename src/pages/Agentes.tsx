import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot, Plus, QrCode, Settings, Loader2, CheckCircle } from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { NewAgentDialog } from "@/components/NewAgentDialog";
import { ConfigureAgentDialog } from "@/components/ConfigureAgentDialog";
import { QRCodeDialog } from "@/components/QRCodeDialog";
import { WhatsAppStatusDialog } from "@/components/WhatsAppStatusDialog";
import type { Tables } from "@/integrations/supabase/types";

type Agent = Tables<"agents">;

const modelLabels: Record<string, string> = {
  "google/gemini-2.5-pro": "Gemini 2.5 Pro",
  "google/gemini-2.5-flash": "Gemini 2.5 Flash",
  "google/gemini-2.5-flash-lite": "Gemini 2.5 Flash Lite",
  "openai/gpt-5": "GPT-5",
  "openai/gpt-5-mini": "GPT-5 Mini",
  "openai/gpt-5-nano": "GPT-5 Nano",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  training: "Em Treinamento",
};

export default function Agentes() {
  const { agents, isLoading, updateAgent, whatsappInstances, fetchWhatsappInstances } = useAgents();
  const [configureAgent, setConfigureAgent] = useState<Agent | null>(null);
  const [qrCodeAgent, setQrCodeAgent] = useState<Agent | null>(null);
  const [statusAgent, setStatusAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (agents.length > 0) {
      fetchWhatsappInstances();
    }
  }, [agents, fetchWhatsappInstances]);

  const handleToggleStatus = async (agent: Agent, checked: boolean) => {
    await updateAgent.mutateAsync({
      id: agent.id,
      status: checked ? "active" : "inactive",
    });
  };

  const getWhatsappStatus = (agentId: string) => {
    const instance = whatsappInstances.find((inst) => inst.agent_id === agentId);
    if (!instance) return { label: "Desconectado", connected: false };
    
    const statusMap: Record<string, { label: string; connected: boolean }> = {
      connected: { label: "Conectado", connected: true },
      open: { label: "Conectado", connected: true },
      connecting: { label: "Conectando", connected: false },
      disconnected: { label: "Desconectado", connected: false },
      error: { label: "Erro", connected: false },
    };
    
    return statusMap[instance.status] || { label: "Desconhecido", connected: false };
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meus Agentes</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
            Configure e gerencie seus agentes de IA
          </p>
        </div>
        <NewAgentDialog>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Agente
          </Button>
        </NewAgentDialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription>{modelLabels[agent.model] || agent.model}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={agent.status === "active"}
                      onCheckedChange={(checked) => handleToggleStatus(agent, checked)}
                      disabled={updateAgent.isPending}
                    />
                    <Badge
                      variant="outline"
                      className={
                        agent.status === "active"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {statusLabels[agent.status]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WhatsApp</span>
                    <span 
                      className={`font-medium ${
                        getWhatsappStatus(agent.id).connected 
                          ? "text-success" 
                          : "text-muted-foreground"
                      }`}
                    >
                      {getWhatsappStatus(agent.id).label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversas</span>
                    <span className="font-medium">{agent.conversations_count}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    const whatsappStatus = getWhatsappStatus(agent.id);
                    if (whatsappStatus.connected) {
                      setStatusAgent(agent);
                    } else {
                      setQrCodeAgent(agent);
                    }
                  }}
                >
                  {getWhatsappStatus(agent.id).connected ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Status
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      QR Code
                    </>
                  )}
                </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setConfigureAgent(agent)}
                  >
                    <Settings className="h-4 w-4" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <NewAgentDialog>
            <Card className="border-dashed transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] gap-4">
                <div className="rounded-full bg-muted p-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">Criar Novo Agente</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure um novo agente de IA
                  </p>
                </div>
              </CardContent>
            </Card>
          </NewAgentDialog>
        </div>
      )}

      <ConfigureAgentDialog
        agent={configureAgent}
        open={!!configureAgent}
        onOpenChange={(open) => !open && setConfigureAgent(null)}
      />

      <QRCodeDialog
        agent={qrCodeAgent}
        open={!!qrCodeAgent}
        onOpenChange={(open) => !open && setQrCodeAgent(null)}
      />
      
      <WhatsAppStatusDialog
        agent={statusAgent}
        open={!!statusAgent}
        onOpenChange={(open) => !open && setStatusAgent(null)}
      />
    </div>
  );
}
