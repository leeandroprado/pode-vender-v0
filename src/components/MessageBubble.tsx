import { memo } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Message } from "@/hooks/useConversations";

interface MessageBubbleProps {
  message: Message;
  displayName: string;
}

const MessageBubble = memo(({ message, displayName }: MessageBubbleProps) => {
  const isClient = message.sender_type === "client";
  const isAI = message.sender_type === "ai";

  return (
    <div
      className={`flex gap-2 ${isClient ? "justify-start" : "justify-end"}`}
    >
      {isClient && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isClient ? "items-start" : "items-end"} max-w-[70%]`}>
        {isClient && (
          <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
            {displayName}
          </span>
        )}
        {isAI && (
          <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
            Agente IA
          </span>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 shadow-sm ${isClient
              ? "bg-card border"
              : isAI
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p
            className={`text-xs mt-1 ${isClient ? "text-muted-foreground" : "text-white/80"}`}>
            {format(new Date(message.timestamp), "HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>

      {!isClient && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={`${isAI 
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}>
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});

export default MessageBubble;
