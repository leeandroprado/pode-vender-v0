import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, MoreVertical, Search, UserPlus, UserCheck, PanelRightClose, PanelRightOpen, AlertCircle, Check, Clock, CheckCheck, ShoppingCart, ShoppingBag, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Message } from "@/hooks/useConversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddClientDialog } from "@/components/AddClientDialog";
import { CartDialog } from "@/components/CartDialog";
import { useClients } from "@/hooks/useClients";
import { useCart } from "@/hooks/useCart";
import { useQueryClient } from "@tanstack/react-query";
import { useVendedores } from "@/hooks/useVendedores";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsMobile } from "@/hooks/use-mobile";
import { useConversationOrders } from "@/hooks/useConversationOrders";
import { Card } from "@/components/ui/card";

interface ConversationDetailProps {
  messages: Message[];
  conversationPhone: string;
  conversationId: string;
  ownerConversation: 'ia' | 'human';
  onOwnerChange: (conversationId: string, owner: 'ia' | 'human') => void;
  onAssignVendedor: (conversationId: string, userId: string | null) => void;
  clientId?: string | null;
  clientName?: string | null;
  assignedTo?: string | null;
  assignedName?: string | null;
  showContactInfo?: boolean;
  onToggleContactInfo?: () => void;
}

export const ConversationDetail = ({ 
  messages, 
  conversationPhone, 
  conversationId,
  ownerConversation,
  onOwnerChange,
  onAssignVendedor,
  clientId,
  clientName,
  assignedTo,
  assignedName,
  showContactInfo,
  onToggleContactInfo
}: ConversationDetailProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const { clients } = useClients();
  const { vendedores } = useVendedores();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { itemCount } = useCart(conversationId);
  const { data: conversationOrders = [] } = useConversationOrders(conversationId);

  const currentClient = clientId ? clients.find(c => c.id === clientId) : null;
  const displayName = currentClient?.name || clientName || conversationPhone;
  const hasClient = !!clientId;

  // Calcular estatísticas de pedidos
  const totalOrders = conversationOrders.length;
  const totalSpent = conversationOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const lastOrder = conversationOrders[0];

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

            {isAdmin && (
              <Select 
                value={assignedTo || "unassigned"}
                onValueChange={(value) => 
                  onAssignVendedor(conversationId, value === "unassigned" ? null : value)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sem vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sem vendedor</SelectItem>
                  {vendedores.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.full_name || v.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
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
              variant="outline" 
              size="sm"
              onClick={() => setShowCartDialog(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrinho
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            
            {!isMobile && onToggleContactInfo && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleContactInfo}
                className="transition-transform hover:scale-110"
              >
                {showContactInfo ? (
                  <PanelRightClose className="w-5 h-5" />
                ) : (
                  <PanelRightOpen className="w-5 h-5" />
                )}
              </Button>
            )}
            
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Card de Estatísticas de Pedidos */}
      {totalOrders > 0 && (
        <Card className="mx-4 mt-3 p-3 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 font-medium">
                <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                {totalOrders} pedido{totalOrders > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                <DollarSign className="w-3.5 h-3.5" />
                R$ {totalSpent.toFixed(2)}
              </span>
              {lastOrder && (
                <span className="text-muted-foreground">
                  Último: {format(new Date(lastOrder.created_at), "dd/MM", { locale: ptBR })}
                </span>
              )}
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onToggleContactInfo}
              className="h-7 text-xs"
            >
              Ver Pedidos
            </Button>
          </div>
        </Card>
      )}

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
                      <div className="flex items-center gap-1 mt-1">
                        <p
                          className={`text-xs ${
                            isClient ? "text-muted-foreground" : "opacity-70"
                          }`}
                        >
                          {format(new Date(message.timestamp), "HH:mm", { locale: ptBR })}
                        </p>
                        {!isClient && message.status && (
                          <>
                            {message.status === 'sending' && (
                              <Clock className="w-3 h-3 opacity-70" />
                            )}
                            {message.status === 'sent' && (
                              <Check className="w-3 h-3 opacity-70" />
                            )}
                            {message.status === 'delivered' && (
                              <CheckCheck className="w-3 h-3 opacity-70" />
                            )}
                            {message.status === 'read' && (
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            )}
                            {message.status === 'failed' && (
                              <AlertCircle className="w-4 h-4 text-destructive" />
                            )}
                          </>
                        )}
                      </div>
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

      <CartDialog
        open={showCartDialog}
        onOpenChange={setShowCartDialog}
        conversationId={conversationId}
        clientId={clientId || undefined}
        onOrderCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }}
      />
    </div>
  );
};
