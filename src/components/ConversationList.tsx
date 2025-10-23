import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, UserCheck, ShoppingBag } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Conversation } from "@/hooks/useConversations";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList = ({ conversations, selectedId, onSelect }: ConversationListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500";
      case "waiting":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimestamp = (date: Date) => {
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: ptBR });
    }
    if (isYesterday(date)) {
      return "Ontem";
    }
    return format(date, "dd/MM", { locale: ptBR });
  };

  const getInitials = (phone: string) => {
    return phone.slice(-2);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Mensagens</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma conversa ainda</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => {
              const isSelected = selectedId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer transition-colors duration-200 ${
                    isSelected 
                      ? "bg-primary/15 border-l-2 border-primary" 
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => onSelect(conversation.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className={isSelected ? "bg-primary/20" : "bg-primary/10"}>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm truncate ${
                            isSelected ? "text-primary" : ""
                          }`}>
                            {conversation.clients?.name || conversation.whatsapp_phone}
                          </h3>
                          {conversation.client_id && (
                            <UserCheck className="w-3 h-3 text-primary shrink-0" />
                          )}
                        </div>
                        <span className={`text-xs shrink-0 ${
                          isSelected ? "text-foreground/80 font-medium" : "text-muted-foreground"
                        }`}>
                          {formatTimestamp(new Date(conversation.last_message_at))}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate flex-1 ${
                          isSelected ? "text-foreground/70" : "text-muted-foreground"
                        }`}>
                          {conversation.last_message ? (
                            <>
                              {conversation.last_message.sender_type !== 'client' && '✓ '}
                              {conversation.last_message.content}
                            </>
                          ) : (
                            'Nenhuma mensagem ainda'
                          )}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {conversation.orders_count && conversation.orders_count > 0 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                              <ShoppingBag className="w-3 h-3 mr-0.5" />
                              {conversation.orders_count}
                            </Badge>
                          )}
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
