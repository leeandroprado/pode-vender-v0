import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrders } from '@/hooks/useOrders';
import { useUserRole } from '@/hooks/useUserRole';
import { OrderStatusBadge } from './OrderStatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Package, User, Phone, Calendar, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export const OrderDetailsDialog = ({
  open,
  onOpenChange,
  orderId,
}: OrderDetailsDialogProps) => {
  const { getOrderDetails, updateOrderStatus } = useOrders();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      loadOrderDetails();
    }
  }, [open, orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    const data = await getOrderDetails(orderId);
    setOrder(data);
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    loadOrderDetails();
  };

  if (!order && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pedido #{order?.id.slice(0, 8)}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do pedido
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                {isAdmin ? (
                  <Select value={order.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <OrderStatusBadge status={order.status} />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Data do Pedido
                </p>
                <p className="font-medium">
                  {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Client Info */}
            {order.clients && (
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{order.clients.name}</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {order.clients.phone}
                  </p>
                  {order.clients.email && (
                    <p className="text-muted-foreground">{order.clients.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp Phone & Conversation Link */}
            {order.conversations && (
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <p className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-muted-foreground">WhatsApp:</span>
                  <span className="font-medium">{order.conversations.whatsapp_phone}</span>
                </p>
                {order.conversation_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/conversas?id=${order.conversation_id}`);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ir para conversa
                  </Button>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="font-semibold">Itens do Pedido</h4>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-lg border bg-card">
                      {item.products.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium">{item.products.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {item.products.description}
                        </p>
                        <p className="text-sm mt-1">
                          R$ {item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          R$ {(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-primary text-xl">
                R$ {order.total.toFixed(2)}
              </span>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-semibold mb-2">Observações</h4>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
