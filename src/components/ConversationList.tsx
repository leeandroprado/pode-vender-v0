import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, User, UserCheck, Search, Plus } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Conversation } from "@/hooks/useConversations";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList = ({ conversations, selectedId, onSelect }: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-success";
      case "waiting":
        return "bg-warning";
      case "closed":
        return "bg-muted-foreground";
      default:
        return "bg-muted-foreground";
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

  const filteredConversations = conversations.filter((conv) => {
    const search = searchTerm.toLowerCase();
    return (
      conv.whatsapp_phone.toLowerCase().includes(search) ||
      conv.clients?.name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header com busca */}
      <div className="p-4 space-y-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80">
            <MessageSquare className="h-3 w-3" />
            Inbox
            <span className="ml-1 text-xs font-semibold">{conversations.length}</span>
          </Badge>
          <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-accent">
            Explorar
            <span className="ml-1 text-xs">10</span>
          </Badge>
        </div>
      </div>

      {/* Seção de Mensagens */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Mensagens</h3>
          <Button size="sm" className="h-8">
            Criar Novo Grupo
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma conversa ainda</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                  selectedId === conversation.id ? "bg-accent" : ""
                }`}
                onClick={() => onSelect(conversation.id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-primary/10">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {conversation.clients?.name || conversation.whatsapp_phone}
                        </h3>
                        {conversation.client_id && (
                          <UserCheck className="w-3 h-3 text-primary shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimestamp(new Date(conversation.last_message_at))}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conversation.clients?.name ? conversation.whatsapp_phone : `Última mensagem há ${formatTimestamp(new Date(conversation.last_message_at))}`}
                      </p>
                      <div className="shrink-0">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
