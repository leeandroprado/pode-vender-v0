import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, UserPlus, UserCheck, Info } from "lucide-react";
import MessageBubble from "./MessageBubble";
import type { Message } from "@/hooks/useConversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AddClientDialog } from "@/components/AddClientDialog";
import { useClients } from "@/hooks/useClients";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Mail, MapPin, Phone as PhoneIcon, Calendar } from "lucide-react";
import { useConversationMedia } from "@/hooks/useConversationMedia";
import { useConversationLinks } from "@/hooks/useConversationLinks";

interface ConversationDetailProps {
  messages: Message[];
  conversationPhone: string;
  conversationId: string;
  ownerConversation: 'ia' | 'human';
  onOwnerChange: (conversationId: string, owner: 'ia' | 'human') => void;
  clientId?: string | null;
  clientName?: string | null;
}

export const ConversationDetail = ({ 
  messages, 
  conversationPhone, 
  conversationId,
  ownerConversation,
  onOwnerChange,
  clientId,
  clientName
}: ConversationDetailProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const { clients } = useClients();
  const queryClient = useQueryClient();

  const currentClient = clientId ? clients.find(c => c.id === clientId) : null;
  const displayName = currentClient?.name || clientName || conversationPhone;
  const hasClient = !!clientId;
  
  const { images, documents, totalCount: mediaCount } = useConversationMedia(conversationId);
  const { links, totalCount: linkCount } = useConversationLinks(conversationId);

  const handleOwnerToggle = (checked: boolean) => {
    const newOwner = checked ? 'ia' : 'human';
    onOwnerChange(conversationId, newOwner);
  };

  const handleClientAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  // Auto-scroll para novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Scroll inicial ao trocar de conversa
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [conversationId]);

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
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{displayName}</h2>
                {hasClient && (
                  <Badge variant="secondary" className="text-xs">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Cliente
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasClient ? conversationPhone : "online"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border-r pr-3 mr-1">
              <Label htmlFor="owner-toggle" className="text-xs cursor-pointer">
                {ownerConversation === 'ia' ? 'IA' : 'Humano'}
              </Label>
              <Switch 
                id="owner-toggle"
                checked={ownerConversation === 'ia'}
                onCheckedChange={handleOwnerToggle}
              />
            </div>
            
            {!hasClient && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddClientDialog(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Cliente
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={() => setShowContactInfo(true)}
            >
              <Info className="w-5 h-5" />
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
            messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                displayName={displayName} 
              />
            ))
          )}
          <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <AddClientDialog
        open={showAddClientDialog}
        onOpenChange={setShowAddClientDialog}
        conversationId={conversationId}
        defaultPhone={conversationPhone}
        onClientAdded={handleClientAdded}
      />

      {/* Contact Info Sheet */}
      <Sheet open={showContactInfo} onOpenChange={setShowContactInfo}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Informações do Contato</SheetTitle>
            <SheetDescription>
              Detalhes e histórico da conversa
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Contact Info */}
            <div className="flex flex-col items-center text-center pb-6 border-b">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarFallback className="bg-primary/10 text-2xl">
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{displayName}</h3>
              {hasClient && currentClient && (
                <Badge variant="secondary" className="mt-2">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Cliente Cadastrado
                </Badge>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                <span>{conversationPhone}</span>
              </div>
              
              {currentClient?.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{currentClient.email}</span>
                </div>
              )}
              
              {currentClient?.city && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{currentClient.city}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{messages.length}</p>
                <p className="text-xs text-muted-foreground">Mensagens</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{mediaCount}</p>
                <p className="text-xs text-muted-foreground">Arquivos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{linkCount}</p>
                <p className="text-xs text-muted-foreground">Links</p>
              </div>
            </div>

            {/* Media Preview */}
            {images.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Imagens Compartilhadas</h4>
                <div className="grid grid-cols-3 gap-2">
                  {images.slice(0, 6).map((img) => (
                    <div key={img.id} className="aspect-square rounded-lg bg-muted overflow-hidden">
                      <img 
                        src={img.file_url} 
                        alt={img.file_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {images.length > 6 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    +{images.length - 6} imagens
                  </p>
                )}
              </div>
            )}

            {/* Links */}
            {links.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Links Compartilhados</h4>
                <div className="space-y-2">
                  {links.slice(0, 5).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{link.title || link.url}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.domain}</p>
                    </a>
                  ))}
                </div>
                {links.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    +{links.length - 5} links
                  </p>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
