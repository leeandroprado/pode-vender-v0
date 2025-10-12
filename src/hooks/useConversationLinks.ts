import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ConversationLink = {
  id: string;
  conversation_id: string;
  message_id: string | null;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  domain: string | null;
  shared_at: string;
  created_at: string;
  metadata: Record<string, any>;
};

export const useConversationLinks = (conversationId: string | null) => {
  const { data: links, isLoading } = useQuery({
    queryKey: ['conversation-links', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('conversation_links')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('shared_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ConversationLink[];
    },
    enabled: !!conversationId,
    staleTime: 60000, // Cache for 1 minute
  });

  // Group links by domain
  const linksByDomain = links?.reduce((acc, link) => {
    const domain = link.domain || 'other';
    if (!acc[domain]) {
      acc[domain] = [];
    }
    acc[domain].push(link);
    return acc;
  }, {} as Record<string, ConversationLink[]>);

  return {
    links: links || [],
    linksByDomain: linksByDomain || {},
    isLoading,
    totalCount: links?.length || 0,
  };
};
