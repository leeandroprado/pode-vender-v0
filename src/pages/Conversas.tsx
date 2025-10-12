import { useState } from "react";
import { useConversations, useMessages } from "@/hooks/useConversations";
import { ConversationList } from "@/components/ConversationList";
import { ConversationDetail } from "@/components/ConversationDetail";
import { MessageInput } from "@/components/MessageInput";
import { MessageCircle, ArrowLeft, Bug } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { runDiagnostics } from "@/utils/diagnostics";

const Conversas = () => {
  const { conversations, isLoadingConversations, sendMessage, updateConversationOwner, isSendingMessage } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages, isLoadingMessages } = useMessages(selectedConversationId);
  const isMobile = useIsMobile();

  const selectedConversation = conversations?.find((c) => c.id === selectedConversationId);
  const { toast } = useToast();

  const handleSendMessage = (content: string) => {
    if (!selectedConversationId) return;
    sendMessage({ conversationId: selectedConversationId, content });
  };

  const handleOwnerChange = (conversationId: string, owner: 'ia' | 'human') => {
    updateConversationOwner({ id: conversationId, owner });
  };

  const handleRunDiagnostics = async () => {
    console.clear();
    toast({
      title: "🔍 Executando diagnóstico...",
      description: "Verifique o console do navegador (F12)",
    });
    
    const result = await runDiagnostics();
    
    if (result.success) {
      toast({
        title: "✅ Diagnóstico concluído",
        description: `${result.conversationsCount} conversas encontradas. Veja detalhes no console.`,
      });
    } else {
      toast({
        title: "❌ Erro no diagnóstico",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  if (isLoadingConversations) {
    return (
      <div className="flex h-[calc(100vh-4rem)] border rounded-lg overflow-hidden">
        <div className="w-80 border-r">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Debug Info */}
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-xs">
        <div className="flex items-center gap-4">
          <span>📊 Conversas: <strong>{conversations?.length || 0}</strong></span>
          <span>💬 Mensagens: <strong>{messages?.length || 0}</strong></span>
          <span>🔄 Loading: <strong>{isLoadingConversations ? 'Sim' : 'Não'}</strong></span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRunDiagnostics}
          className="gap-2 h-7"
        >
          <Bug className="h-3 w-3" />
          Diagnóstico
        </Button>
      </div>

      <div className="flex h-[calc(100vh-8rem)] border rounded-lg overflow-hidden bg-background">
        {/* Lista de conversas - oculta em mobile quando conversa selecionada */}
        <div 
          className={cn(
            "border-r flex-shrink-0 transition-all",
            isMobile ? (selectedConversationId ? "hidden" : "w-full") : "w-80"
          )}
        >
          <ConversationList
            conversations={conversations || []}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>

      {/* Área de chat - oculta em mobile quando nenhuma conversa selecionada */}
      <div 
        className={cn(
          "flex-1 flex flex-col",
          isMobile && !selectedConversationId && "hidden"
        )}
      >
        {!selectedConversationId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
            <div className="text-center max-w-md">
              <div className="rounded-full bg-muted p-8 inline-flex mb-6">
                <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Escolha uma conversa da lista ao lado para visualizar as mensagens e interagir com seus clientes
              </p>
            </div>
          </div>
        ) : (
          <>
            {isMobile && (
              <div className="flex items-center gap-2 p-3 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedConversationId(null)}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedConversation?.whatsapp_phone}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfo(!showInfo)}
                  className="h-8 w-8"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isLoadingMessages ? (
              <div className="flex-1 p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <>
                <ConversationDetail
                  messages={messages || []}
                  conversationPhone={selectedConversation?.whatsapp_phone || ""}
                  conversationId={selectedConversationId}
                  ownerConversation={selectedConversation?.owner_conversation || 'ia'}
                  onOwnerChange={handleOwnerChange}
                  clientId={selectedConversation?.client_id}
                  clientName={selectedConversation?.clients?.name}
                />
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={isSendingMessage}
                />
              </>
            )}
          </>
        )}
      </div>

      </div>
    </div>
  );
};

export default Conversas;
