import { useState, useEffect, useRef } from "react";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Agent = Tables<"agents">;

interface QRCodeDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WhatsAppInstance {
  id: string;
  instance_name: string;
  instance_id: string | null;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  qr_code_base64: string | null;
  qr_code_text: string | null;
  created_at: string;
  updated_at: string;
}

export function QRCodeDialog({ agent, open, onOpenChange }: QRCodeDialogProps) {
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeExpiry, setQrCodeExpiry] = useState<number>(60); // 60 seconds
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && agent) {
      createOrGetInstance();
    }

    return () => {
      // Cleanup polling and timer when dialog closes
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (expiryTimerRef.current) {
        clearInterval(expiryTimerRef.current);
      }
    };
  }, [open, agent]);

  const createOrGetInstance = async () => {
    if (!agent) return;

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar autenticado');
      }

      // Call Edge Function to create/get instance
      const { data, error } = await supabase.functions.invoke('whatsapp-create-instance', {
        body: { agentId: agent.id },
      });

      if (error) {
        throw error;
      }

      if (data.success && data.instance) {
        setInstance(data.instance);
        
        // Start polling for status updates if not connected
        if (data.instance.status !== 'connected') {
          startPolling();
          startExpiryTimer();
        }

        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp para conectar",
        });
      }
    } catch (error: any) {
      console.error('Error creating instance:', error);
      
      // Extract specific error message
      const errorMessage = error?.message || error?.error || "Tente novamente em alguns instantes";
      
      toast({
        title: "Erro ao gerar QR Code",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(async () => {
      await checkInstanceStatus();
    }, 3000);
  };

  const startExpiryTimer = () => {
    // QR code expires in 60 seconds
    setQrCodeExpiry(60);
    
    expiryTimerRef.current = setInterval(() => {
      setQrCodeExpiry((prev) => {
        if (prev <= 1) {
          if (expiryTimerRef.current) {
            clearInterval(expiryTimerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkInstanceStatus = async () => {
    if (!agent) return;

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-get-instance-status', {
        body: { agentId: agent.id },
      });

      if (error) {
        console.error('Error checking status:', error);
        return;
      }

      if (data.success && data.instance) {
        setInstance(data.instance);

        // If QR Code arrived, stop polling
        if (data.instance.qr_code_base64 && pollingIntervalRef.current) {
          console.log('✅ QR Code received, stopping polling');
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        // Stop polling if connected
        if (data.instance.status === 'connected') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          if (expiryTimerRef.current) {
            clearInterval(expiryTimerRef.current);
          }
          
          toast({
            title: "✅ WhatsApp Conectado!",
            description: "Seu agente está pronto para atender",
          });
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleRefreshQRCode = async () => {
    // Clear existing timers
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current);
    }

    await createOrGetInstance();
  };

  if (!agent) return null;

  const isConnected = instance?.status === 'connected';
  const isExpired = qrCodeExpiry === 0;

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
            {isConnected ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Conectado
              </Badge>
            ) : instance?.status === 'connecting' ? (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Conectando...
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
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              </div>
            ) : isConnected ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="h-16 w-16 text-success" />
                <div>
                  <p className="font-semibold text-lg">WhatsApp Conectado!</p>
                  <p className="text-sm text-muted-foreground">
                    Seu agente está pronto para atender
                  </p>
                </div>
              </div>
            ) : instance?.qr_code_base64 && !isExpired ? (
              <>
                <div className="p-4 bg-white rounded-lg border-2 border-border">
                  <img 
                    src={instance.qr_code_base64} 
                    alt="QR Code WhatsApp" 
                    className="w-[250px] h-[250px]" 
                  />
                </div>
                
                {/* Timer */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Expira em: {qrCodeExpiry}s</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshQRCode}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Gerar Novo QR Code
                </Button>
              </>
            ) : isExpired ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <XCircle className="h-16 w-16 text-destructive" />
                <div>
                  <p className="font-semibold text-lg">QR Code Expirado</p>
                  <p className="text-sm text-muted-foreground">
                    Clique no botão abaixo para gerar um novo
                  </p>
                </div>
                <Button
                  onClick={handleRefreshQRCode}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Gerar Novo QR Code
                </Button>
              </div>
            ) : null}
          </div>

          {/* Instruções */}
          {!isConnected && instance?.qr_code_base64 && !isExpired && (
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
