import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Users, Plus, Settings, User, FileText, Link as LinkIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import type { Conversation } from "@/hooks/useConversations";
import { useConversationMedia } from "@/hooks/useConversationMedia";
import { useConversationLinks } from "@/hooks/useConversationLinks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversationInfoProps {
  conversation: Conversation | undefined;
}

export const ConversationInfo = ({ conversation }: ConversationInfoProps) => {
  const { images, documents, isLoading: isLoadingMedia, totalCount: mediaCount } = useConversationMedia(conversation?.id || null);
  const { links, isLoading: isLoadingLinks, totalCount: linkCount } = useConversationLinks(conversation?.id || null);
  
  if (!conversation) return null;

  const displayName = conversation.clients?.name || conversation.whatsapp_phone;
  const memberCount = 1;

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <h3 className="font-semibold text-sm text-muted-foreground mb-4">
          Informações do Contato
        </h3>
        
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarFallback className="bg-primary/10 text-2xl">
              <User className="w-10 h-10" />
            </AvatarFallback>
          </Avatar>
          <h2 className="font-semibold text-lg mb-1">{displayName}</h2>
          <p className="text-sm text-muted-foreground">
            {conversation.clients?.phone || conversation.whatsapp_phone}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-4 gap-2">
          <Button variant="ghost" size="sm" className="flex-col h-auto py-3 gap-1">
            <Bell className="h-5 w-5" />
            <span className="text-xs">Notificação</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-3 gap-1">
            <Users className="h-5 w-5" />
            <span className="text-xs">Pin Group</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-3 gap-1">
            <Plus className="h-5 w-5" />
            <span className="text-xs">Membro</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-3 gap-1">
            <Settings className="h-5 w-5" />
            <span className="text-xs">Config</span>
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Members Section */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Membros</h3>
            <Button variant="link" size="sm" className="h-auto p-0 text-primary">
              Ver Todos
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{memberCount} membro{memberCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Images Section */}
        {conversation.clients && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Imagens</h3>
              <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                Ver Todos
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border"
                />
              ))}
            </div>
          </div>
        )}

        {/* Files Section */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Arquivos</h3>
            <Button variant="link" size="sm" className="h-auto p-0 text-primary">
              Ver Todos
            </Button>
          </div>
          <div className="space-y-2">
            {conversation.clients && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">documento_cliente.pdf</p>
                  <p className="text-xs text-muted-foreground">1.5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Links</h3>
            <Button variant="link" size="sm" className="h-auto p-0 text-primary">
              Ver Todos
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                <LinkIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Link compartilhado</p>
                <p className="text-xs text-muted-foreground truncate">
                  exemplo.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
