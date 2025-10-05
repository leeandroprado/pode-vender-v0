import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, MoreVertical, Phone, Video, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Message } from "@/hooks/useConversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ConversationDetailProps {
  messages: Message[];
  conversationPhone: string;
  conversationId: string;
  ownerConversation: 'ia' | 'human';
  onOwnerChange: (conversationId: string, owner: 'ia' | 'human') => void;
}

export const ConversationDetail = ({ 
  messages, 
  conversationPhone, 
  conversationId,
  ownerConversation,
  onOwnerChange 
}: ConversationDetailProps) => {
  const handleOwnerToggle = (checked: boolean) => {
    const newOwner = checked ? 'ia' : 'human';
    onOwnerChange(conversationId, newOwner);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{conversationPhone}</h2>
              <p className="text-xs text-muted-foreground">online</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r pr-3">
              <Label htmlFor="owner-toggle" className="text-xs cursor-pointer">
                {ownerConversation === 'ia' ? 'IA' : 'Humano'}
              </Label>
              <Switch 
                id="owner-toggle"
                checked={ownerConversation === 'ia'}
                onCheckedChange={handleOwnerToggle}
              />
            </div>
            
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-hidden bg-muted/10">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma mensagem ainda</p>
            </div>
          ) : (
            messages.map((message) => {
              const isClient = message.sender_type === "client";
              const isAI = message.sender_type === "ai";
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isClient ? "justify-start" : "justify-end"}`}
                >
                  {isClient && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`flex flex-col ${isClient ? "items-start" : "items-end"} max-w-[70%]`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isClient
                          ? "bg-background border"
                          : isAI
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent"
                      }`}
                    >
                      {isAI && (
                        <Badge variant="secondary" className="mb-1 text-xs">
                          <Bot className="w-3 h-3 mr-1" />
                          IA
                        </Badge>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isClient ? "text-muted-foreground" : "opacity-70"
                        }`}
                      >
                        {format(new Date(message.timestamp), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {!isClient && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-secondary/10">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
