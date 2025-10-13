import { useState } from "react";
import { useConversations, useMessages } from "@/hooks/useConversations";
import { ConversationList } from "@/components/ConversationList";
import { ConversationDetail } from "@/components/ConversationDetail";
import { MessageInput } from "@/components/MessageInput";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Conversas = () => {
  const { conversations, isLoadingConversations, sendMessage, updateConversationOwner, isSendingMessage } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages, isLoadingMessages } = useMessages(selectedConversationId);
  const isMobile = useIsMobile();

  const selectedConversation = conversations?.find((c) => c.id === selectedConversationId);

  const handleSendMessage = (content: string) => {
    if (!selectedConversationId) return;
    sendMessage({ conversationId: selectedConversationId, content });
  };

  const handleOwnerChange = (conversationId: string, owner: 'ia' | 'human') => {
    updateConversationOwner({ id: conversationId, owner });
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
    <div className="flex h-[calc(100vh-4rem)] border rounded-lg overflow-hidden bg-background">
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
            <div className="text-center">
              <MessageCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-base md:text-lg font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-xs md:text-sm">Escolha uma conversa da lista para começar</p>
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
  );
};

export default Conversas;
