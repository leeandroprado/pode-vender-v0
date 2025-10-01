import { useState } from "react";
import { useConversations, useMessages } from "@/hooks/useConversations";
import { ConversationList } from "@/components/ConversationList";
import { ConversationDetail } from "@/components/ConversationDetail";
import { MessageInput } from "@/components/MessageInput";
import { MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const Conversas = () => {
  const { conversations, isLoadingConversations } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages, isLoadingMessages } = useMessages(selectedConversationId);
  const { toast } = useToast();

  const selectedConversation = conversations?.find((c) => c.id === selectedConversationId);

  const handleSendMessage = (content: string) => {
    // TODO: Implementar envio de mensagem
    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada com sucesso.",
    });
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
      {/* Lista de conversas */}
      <div className="w-80 border-r flex-shrink-0">
        <ConversationList
          conversations={conversations || []}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {!selectedConversationId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-sm">Escolha uma conversa da lista para começar</p>
            </div>
          </div>
        ) : (
          <>
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
                />
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={false}
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
