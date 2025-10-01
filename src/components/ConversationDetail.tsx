import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Message } from "@/hooks/useConversations";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationDetailProps {
  messages: Message[];
  conversationPhone: string;
}

export const ConversationDetail = ({ messages, conversationPhone }: ConversationDetailProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">{conversationPhone}</h2>
        <p className="text-sm text-muted-foreground">Conversa com cliente</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma mensagem ainda</p>
            </div>
          ) : (
            messages.map((message) => {
              const isClient = message.sender_type === "client";
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isClient ? "" : "flex-row-reverse"}`}
                >
                  <Avatar className="h-8 w-8">
                    {isClient ? (
                      <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-secondary/10 w-full h-full flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                  </Avatar>
                  <div className={`flex-1 ${isClient ? "" : "text-right"}`}>
                    <Card className={`inline-block p-3 ${isClient ? "" : "bg-primary/5"}`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(message.timestamp), "HH:mm", { locale: ptBR })}
                      </p>
                    </Card>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
