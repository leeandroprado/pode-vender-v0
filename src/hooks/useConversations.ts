import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export type Conversation = {
  id: string;
  user_id: string;
  whatsapp_phone: string;
  whatsapp_instance_id: string | null;
  status: 'open' | 'closed' | 'waiting';
  owner_conversation: 'ia' | 'human';
  last_message_at: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  client_id?: string | null;
  assigned_to?: string | null;
  clients?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  assigned_profile?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_type: 'client' | 'ai' | 'system';
  sender_id: string | null;
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document';
  timestamp: string;
  whatsapp_message_id: string | null;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
};

export const useConversations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations with optimized query
  const { data: conversations, isLoading: isLoadingConversations, error: conversationsError } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, 
          user_id, 
          whatsapp_phone, 
          whatsapp_instance_id, 
          status, 
          owner_conversation, 
          last_message_at, 
          created_at, 
          updated_at, 
          metadata,
          client_id,
          assigned_to,
          clients (
            id,
            name,
            phone
          )
        `)
        .order('last_message_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Fetch assigned profiles separately to avoid FK issues
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv: any) => {
          if (conv.assigned_to) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .eq('id', conv.assigned_to)
              .single();
            
            return { ...conv, assigned_profile: profile };
          }
          return conv;
        })
      );

      return conversationsWithProfiles as Conversation[];
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Setup realtime subscriptions
  useEffect(() => {
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [queryClient]);

  // Update conversation status
  const updateConversationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'open' | 'closed' | 'waiting' }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Status atualizado",
        description: "O status da conversa foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update conversation owner
  const updateConversationOwner = useMutation({
    mutationFn: async ({ id, owner }: { id: string; owner: 'ia' | 'human' }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ owner_conversation: owner, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Responsável atualizado",
        description: "O responsável pela conversa foi alterado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      // 1. PRIMEIRO: Enviar via WhatsApp API
      const { data: apiData, error: apiError } = await supabase.functions.invoke('whatsapp-send-message', {
        body: { conversationId, content }
      });

      if (apiError) {
        console.error('Error sending WhatsApp message:', apiError);
        throw new Error('Falha ao enviar mensagem via WhatsApp');
      }

      // 2. DEPOIS: Salvar no banco (apenas se API funcionou)
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'system',
          content,
          message_type: 'text',
          whatsapp_message_id: apiData?.data?.key?.id || null,
        });

      if (messageError) throw messageError;

      // 3. Atualizar conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          owner_conversation: 'human',
          updated_at: new Date().toISOString() 
        })
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      return apiData;
    },
    
    onMutate: async ({ conversationId, content }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
      
      // Snapshot do estado anterior
      const previousMessages = queryClient.getQueryData(['messages', conversationId]);
      
      // Adicionar mensagem otimista com status 'sending'
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_type: 'system' as const,
        sender_id: null,
        content,
        message_type: 'text' as const,
        timestamp: new Date().toISOString(),
        whatsapp_message_id: null,
        status: 'sending' as const,
      };
      
      queryClient.setQueryData(['messages', conversationId], (old: any) => 
        [...(old || []), optimisticMessage]
      );
      
      return { previousMessages };
    },
    
    onSuccess: (data, variables) => {
      // Atualizar status para 'sent' quando API retornar sucesso
      queryClient.setQueryData(['messages', variables.conversationId], (old: any) => {
        if (!old) return old;
        return old.map((msg: Message) => 
          msg.id.startsWith('temp-') && msg.content === variables.content
            ? { ...msg, status: 'sent' as const, id: data?.messageId || msg.id }
            : msg
        );
      });
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
    
    onError: (error, variables, context) => {
      // Atualizar mensagem com status 'failed' em vez de remover
      queryClient.setQueryData(['messages', variables.conversationId], (old: any) => {
        if (!old) return old;
        return old.map((msg: Message) => 
          msg.id.startsWith('temp-') 
            ? { ...msg, status: 'failed' as const }
            : msg
        );
      });
    },
  });

  // Assign conversation to vendedor
  const assignConversation = useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string | null }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          assigned_to: userId,
          owner_conversation: userId ? 'human' : 'ia',
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversa atribuída",
        description: "O vendedor foi atribuído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atribuir conversa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    conversations,
    isLoadingConversations,
    conversationsError,
    updateConversationStatus: updateConversationStatus.mutate,
    updateConversationOwner: updateConversationOwner.mutate,
    sendMessage: sendMessage.mutate,
    isSendingMessage: sendMessage.isPending,
    assignConversation: assignConversation.mutate,
    isAssigning: assignConversation.isPending,
  };
};

export const useMessages = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_type, sender_id, content, message_type, timestamp, whatsapp_message_id')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })
        .limit(200);

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
    staleTime: 10000, // Cache for 10 seconds
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
  });

  // Setup realtime subscriptions for messages
  useEffect(() => {
    if (!conversationId) return;

    const messagesChannel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [conversationId, queryClient]);

  return {
    messages,
    isLoadingMessages,
  };
};
