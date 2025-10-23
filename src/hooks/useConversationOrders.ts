import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useConversationOrders = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['conversation-orders', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total,
          notes,
          created_at,
          updated_at,
          client_id,
          conversation_id,
          order_items (
            id,
            quantity,
            price,
            product_id,
            products (
              id,
              name,
              description,
              image_url
            )
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
    staleTime: 30000, // Cache for 30 seconds
  });
};
