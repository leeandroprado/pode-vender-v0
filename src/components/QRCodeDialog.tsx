import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Agent = Tables<"agents">;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useAgents } from "@/hooks/useAgents";

interface QRCodeDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeDialog({ agent, open, onOpenChange }: QRCodeDialogProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { updateAgent } = useAgents();

  useEffect(() => {
    if (open && agent) {
      generateQRCode();
    }
  }, [open, agent]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    // Simula geração de QR Code (em produção, isso seria uma chamada à API do WhatsApp)
    setTimeout(() => {
      // Gera um QR code simulado usando a API do QR Code Generator
      const qrData = `whatsapp://connect?agent=${agent?.id}&name=${encodeURIComponent(agent?.name || '')}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      setQrCode(qrCodeUrl);
      setIsGenerating(false);
    }, 1500);
  };

  const handleConnect = async () => {
    if (!agent) return;
    
    // Simula conexão bem-sucedida
    await updateAgent.mutateAsync({
      id: agent.id,
      whatsapp_connected: true,
    });
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com seu WhatsApp para conectar o agente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status da Conexão */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <span className="text-sm font-medium">Status da Conexão</span>
            {agent.whatsapp_connected ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
                <XCircle className="h-3 w-3" />
                Desconectado
              </Badge>
            )}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              </div>
            ) : qrCode ? (
              <>
                <div className="p-4 bg-white rounded-lg border-2 border-border">
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-[250px] h-[250px]" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateQRCode}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Gerar Novo QR Code
                </Button>
              </>
            ) : null}
          </div>

          {/* Instruções */}
          {!agent.whatsapp_connected && (
            <div className="space-y-3 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-sm">Como conectar:</h4>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em Mais opções (⋮) e depois em Aparelhos conectados</li>
                <li>Toque em "Conectar um aparelho"</li>
                <li>Aponte o celular para esta tela para escanear o QR code</li>
              </ol>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            {!agent.whatsapp_connected && qrCode && (
              <Button onClick={handleConnect}>
                Confirmar Conexão
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
