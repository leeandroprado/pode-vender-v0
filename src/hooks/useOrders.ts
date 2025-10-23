import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  user_id: string;
  conversation_id: string;
  client_id: string | null;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
  conversations?: {
    id: string;
    whatsapp_phone: string;
  };
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  products: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
  };
}

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const useOrders = (filters?: OrderFilters) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const pageSize = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('orders')
        .select(`
          *,
          clients:client_id (id, name, phone, email),
          conversations:conversation_id (id, whatsapp_phone)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setOrders(data || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: 'Erro ao carregar pedidos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    conversationId: string,
    clientId?: string,
    notes?: string
  ) => {
    try {
      // 1. Buscar itens do carrinho
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('*, products:product_id(price, stock)')
        .eq('conversation_id', conversationId);

      if (cartError) throw cartError;

      if (!cartItems || cartItems.length === 0) {
        toast({
          title: 'Carrinho vazio',
          description: 'Adicione produtos antes de finalizar o pedido.',
          variant: 'destructive',
        });
        return null;
      }

      // 2. Calcular total
      const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

      // 3. Obter user_id atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 4. Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          client_id: clientId || null,
          total,
          notes: notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 5. Mover itens do carrinho para order_items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 6. Limpar carrinho
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('conversation_id', conversationId);

      if (clearError) throw clearError;

      toast({
        title: 'Pedido criado!',
        description: `Pedido #${order.id.slice(0, 8)} criado com sucesso.`,
      });

      await fetchOrders();
      return order;
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: 'Erro ao criar pedido',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const getOrderDetails = async (orderId: string): Promise<OrderWithItems | null> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          clients:client_id (id, name, phone, email),
          conversations:conversation_id (id, whatsapp_phone),
          order_items (
            *,
            products:product_id (id, name, description, image_url)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      toast({
        title: 'Erro ao carregar pedido',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: `Pedido marcado como ${status}.`,
      });

      await fetchOrders();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const cancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'cancelled');
  };

  const createManualOrder = async (
    clientId: string | null,
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>,
    notes?: string
  ) => {
    try {
      // 1. Calcular total
      const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

      // 2. Obter user_id atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 3. Criar pedido (sem conversation_id para pedidos manuais)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          conversation_id: null, // Pedidos manuais não têm conversa
          client_id: clientId,
          total,
          notes: notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 4. Inserir order_items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'Pedido criado!',
        description: `Pedido manual #${order.id.slice(0, 8)} criado com sucesso.`,
      });

      await fetchOrders();
      return order;
    } catch (error: any) {
      console.error('Erro ao criar pedido manual:', error);
      toast({
        title: 'Erro ao criar pedido',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filters]);

  return {
    orders,
    loading,
    page,
    totalPages,
    setPage,
    createOrder,
    createManualOrder,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder,
    refetch: fetchOrders,
  };
};
