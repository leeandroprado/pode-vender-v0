import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  conversation_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  products: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    price: number;
    stock: number;
    active: boolean;
  };
}

export const useCart = (conversationId?: string) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCartItems = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products:product_id (
            id,
            name,
            description,
            image_url,
            price,
            stock,
            active
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCartItems(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar carrinho:', error);
      toast({
        title: 'Erro ao carregar carrinho',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1, price: number) => {
    if (!conversationId) return;

    try {
      // Verifica se já existe no carrinho
      const existingItem = cartItems.find(item => item.product_id === productId);

      if (existingItem) {
        // Atualiza quantidade
        const newQuantity = existingItem.quantity + quantity;
        await updateCartItem(existingItem.id, newQuantity);
        return;
      }

      // Adiciona novo item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          conversation_id: conversationId,
          product_id: productId,
          quantity,
          price,
        });

      if (error) throw error;

      toast({
        title: 'Produto adicionado',
        description: 'Item adicionado ao carrinho com sucesso!',
      });

      await fetchCartItems();
    } catch (error: any) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast({
        title: 'Erro ao adicionar produto',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      await fetchCartItems();
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: 'Erro ao atualizar item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Item removido',
        description: 'Item removido do carrinho.',
      });

      await fetchCartItems();
    } catch (error: any) {
      console.error('Erro ao remover item:', error);
      toast({
        title: 'Erro ao remover item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const clearCart = async () => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) throw error;

      toast({
        title: 'Carrinho limpo',
        description: 'Todos os itens foram removidos.',
      });

      setCartItems([]);
    } catch (error: any) {
      console.error('Erro ao limpar carrinho:', error);
      toast({
        title: 'Erro ao limpar carrinho',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  useEffect(() => {
    if (conversationId) {
      fetchCartItems();
    }
  }, [conversationId]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`cart_items_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchCartItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return {
    cartItems,
    loading,
    totalAmount: getCartTotal(),
    itemCount: getItemCount(),
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetch: fetchCartItems,
  };
};
