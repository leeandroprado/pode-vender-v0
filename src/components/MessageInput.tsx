import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="min-h-[44px] max-h-[120px] resize-none pr-10"
            disabled={disabled}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1"
            disabled={disabled}
          >
            <Smile className="w-5 h-5" />
          </Button>
        </div>

        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="shrink-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
