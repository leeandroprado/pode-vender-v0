import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { Plus, X, Search, ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
  createManualOrder: (
    clientId: string | null,
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>,
    notes?: string
  ) => Promise<any>;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  stock: number;
}

export function NewOrderDialog({
  open,
  onOpenChange,
  onOrderCreated,
  createManualOrder,
}: NewOrderDialogProps) {
  const { clients } = useClients();
  const { products, filters, setFilters } = useProducts();
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedClientId('');
      setOrderItems([]);
      setNotes('');
      setSearchProduct('');
    }
  }, [open]);

  // Filter products based on search
  useEffect(() => {
    setFilters({ ...filters, search: searchProduct });
  }, [searchProduct]);

  const addProduct = (product: any) => {
    const existingItem = orderItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([
        ...orderItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          price: Number(product.price),
          stock: product.stock,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setOrderItems(orderItems.map(item =>
      item.product_id === productId ? { ...item, quantity } : item
    ));
  };

  const updatePrice = (productId: string, price: number) => {
    setOrderItems(orderItems.map(item =>
      item.product_id === productId ? { ...item, price } : item
    ));
  };

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createManualOrder(
        selectedClientId || null,
        orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        notes || undefined
      );
      onOrderCreated();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Criar Novo Pedido
          </DialogTitle>
          <DialogDescription>
            Selecione o cliente, adicione produtos e finalize o pedido manualmente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente (opcional)</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem cliente vinculado</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Search */}
          <div className="space-y-2">
            <Label>Adicionar Produtos</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-40 border rounded-md">
              <div className="p-2 space-y-1">
                {products.filter(p => p.status === 'active').map((product) => (
                  <Card
                    key={product.id}
                    className="p-3 flex items-center justify-between hover:bg-accent cursor-pointer"
                    onClick={() => addProduct(product)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          R$ {Number(product.price).toFixed(2)}
                        </p>
                        <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'} className="text-xs">
                          Estoque: {product.stock}
                        </Badge>
                      </div>
                    </div>
                    <Button type="button" size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
                {products.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Nenhum produto encontrado
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Products */}
          {orderItems.length > 0 && (
            <div className="space-y-2">
              <Label>Produtos Selecionados ({orderItems.length})</Label>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <Card key={item.product_id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product_name}</p>
                        {item.quantity > item.stock && (
                          <p className="text-xs text-destructive">
                            ⚠️ Estoque insuficiente ({item.stock} disponíveis)
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Label className="text-xs">Qtd:</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 0)}
                              className="w-16 h-8 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Label className="text-xs">Preço:</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.price}
                              onChange={(e) => updatePrice(item.product_id, parseFloat(e.target.value) || 0)}
                              className="w-24 h-8 text-xs"
                            />
                          </div>
                          <p className="text-sm font-semibold ml-auto">
                            R$ {(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.product_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre o pedido..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <Card className="p-4 bg-primary/5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Itens:</span>
                  <span className="font-medium">{orderItems.length} produto(s)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade total:</span>
                  <span className="font-medium">
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)} unidade(s)
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={orderItems.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Criando...' : 'Criar Pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
