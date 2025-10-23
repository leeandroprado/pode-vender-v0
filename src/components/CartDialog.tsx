import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  clientId?: string;
  onOrderCreated?: () => void;
}

export const CartDialog = ({
  open,
  onOpenChange,
  conversationId,
  clientId,
  onOrderCreated,
}: CartDialogProps) => {
  const { cartItems, loading, totalAmount, itemCount, updateCartItem, removeFromCart, clearCart } = useCart(conversationId);
  const { createOrder } = useOrders();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const handleQuantityChange = (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 1) {
      updateCartItem(itemId, newQuantity);
    }
  };

  const handleCreateOrder = async () => {
    setCreatingOrder(true);
    const order = await createOrder(conversationId, clientId);
    setCreatingOrder(false);
    
    if (order) {
      onOpenChange(false);
      onOrderCreated?.();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho de Compras
            </DialogTitle>
            <DialogDescription>
              {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'} no carrinho` : 'Seu carrinho está vazio'}
            </DialogDescription>
          </DialogHeader>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhum produto no carrinho</p>
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-lg border bg-card">
                      {item.products.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="h-20 w-20 rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.products.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.price.toFixed(2)} × {item.quantity}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 ml-auto text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={loading}
                >
                  Limpar Carrinho
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={loading || creatingOrder}
                  className="flex-1"
                >
                  {creatingOrder ? 'Criando pedido...' : 'Finalizar Pedido'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar carrinho?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os itens serão removidos do carrinho. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearCart();
                setShowClearConfirm(false);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
