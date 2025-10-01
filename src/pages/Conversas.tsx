import { useState } from "react";
import { useConversations, useMessages } from "@/hooks/useConversations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Phone, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Conversas = () => {
  const { conversations, isLoadingConversations, updateConversationStatus } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages, isLoadingMessages } = useMessages(selectedConversationId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      case 'waiting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta';
      case 'closed':
        return 'Fechada';
      case 'waiting':
        return 'Aguardando';
      default:
        return status;
    }
  };

  if (isLoadingConversations) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Conversas</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px] lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Conversas</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de conversas */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Todas as Conversas
          </h2>
          
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {conversations?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma conversa ainda
                </p>
              )}
              
              {conversations?.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                    selectedConversationId === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedConversationId(conversation.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{conversation.whatsapp_phone}</span>
                    </div>
                    <Badge className={getStatusColor(conversation.status)}>
                      {getStatusLabel(conversation.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(conversation.last_message_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Detalhes da conversa */}
        <Card className="p-4 lg:col-span-2">
          {!selectedConversationId ? (
            <div className="h-[500px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para ver os detalhes</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Mensagens</h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateConversationStatus({ id: selectedConversationId, status: 'closed' })}
                  >
                    Fechar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateConversationStatus({ id: selectedConversationId, status: 'open' })}
                  >
                    Reabrir
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[500px]">
                {isLoadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages?.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhuma mensagem ainda
                      </p>
                    )}
                    
                    {messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'client' ? 'justify-start' : 'justify-end'}`}
                      >
                        <Card className={`p-4 max-w-[70%] ${
                          message.sender_type === 'client' 
                            ? 'bg-secondary' 
                            : message.sender_type === 'ai'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {message.sender_type === 'client' ? 'Cliente' : message.sender_type === 'ai' ? 'IA' : 'Sistema'}
                            </Badge>
                            <span className="text-xs opacity-70">
                              {format(new Date(message.timestamp), "HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Conversas;
