import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Pin, Settings, X } from "lucide-react";

interface ContactInfoProps {
  conversationPhone: string;
  clientName: string | null;
  onClose: () => void;
}

export const ContactInfo = ({ 
  conversationPhone, 
  clientName,
  onClose 
}: ContactInfoProps) => {
  const displayName = clientName || conversationPhone;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Informações</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Avatar e nome */}
      <div className="p-6 flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarFallback className="bg-primary/10 text-2xl">
            <User className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-xl mb-1">{displayName}</h2>
        <p className="text-sm text-muted-foreground">{conversationPhone}</p>
      </div>

      <Separator />

      {/* Botões de ação */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <Button variant="outline" className="flex flex-col h-auto py-3 gap-2">
          <Bell className="w-5 h-5" />
          <span className="text-xs">Notificar</span>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 gap-2">
          <Pin className="w-5 h-5" />
          <span className="text-xs">Fixar</span>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 gap-2">
          <Settings className="w-5 h-5" />
          <span className="text-xs">Config</span>
        </Button>
      </div>

      <Separator />

      {/* Área para futuras expansões */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground text-center py-8">
          Mais informações em breve
        </p>
      </div>
    </div>
  );
};
