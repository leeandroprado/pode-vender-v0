import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MediaFile = {
  id: string;
  conversation_id: string;
  message_id: string | null;
  user_id: string;
  file_name: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  mime_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  uploaded_at: string;
  created_at: string;
  metadata: Record<string, any>;
};

export const useConversationMedia = (conversationId: string | null) => {
  const { data: media, isLoading } = useQuery({
    queryKey: ['conversation-media', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('uploaded_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as MediaFile[];
    },
    enabled: !!conversationId,
    staleTime: 60000, // Cache for 1 minute
  });

  // Group media by type
  const mediaByType = media?.reduce((acc, item) => {
    if (!acc[item.file_type]) {
      acc[item.file_type] = [];
    }
    acc[item.file_type].push(item);
    return acc;
  }, {} as Record<string, MediaFile[]>);

  const images = mediaByType?.image || [];
  const videos = mediaByType?.video || [];
  const documents = mediaByType?.document || [];
  const audio = mediaByType?.audio || [];

  return {
    media: media || [],
    images,
    videos,
    documents,
    audio,
    isLoading,
    totalCount: media?.length || 0,
  };
};
