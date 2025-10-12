import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/database.types";

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Conversation = Tables<'conversations'> & { clients: Tables<'clients'> | null };
export type Message = Tables<'messages'>;

export const useConversations = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations with optimized query
  const { data: conversations, isLoading: isLoadingConversations, error: conversationsError } = useQuery({
    queryKey: ['conversations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          organization_id,
          whatsapp_phone, 
          whatsapp_instance_id, 
          status, 
          owner_conversation, 
          last_message_at, 
          created_at, 
          updated_at, 
          metadata,
          client_id,
          clients (*)
        `)
        .eq('organization_id', profile.organization_id)
        .order('last_message_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Conversation[];
    },
    staleTime: 30000, // Cache de 30 segundos
    gcTime: 5 * 60 * 1000, // Manter em cache por 5 minutos
    refetchOnWindowFocus: false, // Não re-fetch ao trocar de aba
  });

  // Setup realtime subscriptions
  useEffect(() => {
    const handleRealtimeUpdate = (payload: any) => {
      const newRecord = payload.new as Conversation;
      const oldRecord = payload.old as Conversation;

      queryClient.setQueryData<Conversation[]>(['conversations'], (oldData) => {
        if (!oldData) return [];

        let newData = [...oldData];

        if (payload.eventType === 'INSERT') {
          // Adiciona a nova conversa no início e remove a última se o limite for excedido
          newData.unshift(newRecord);
          if (newData.length > 50) {
            newData.pop();
          }
        } else if (payload.eventType === 'UPDATE') {
          const index = newData.findIndex(c => c.id === newRecord.id);
          if (index !== -1) {
            // Atualiza a conversa existente
            newData[index] = newRecord;
          } else {
            // Se não encontrar, adiciona (caso raro)
            newData.unshift(newRecord);
          }
        } else if (payload.eventType === 'DELETE') {
          newData = newData.filter(c => c.id !== oldRecord.id);
        }

        // Reordena pela data da última mensagem para manter a consistência
        return newData.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      });
    };

    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        handleRealtimeUpdate
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
      return { id, status };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (old) => {
        if (!old) return old;
        return old.map(conv => 
          conv.id === data.id 
            ? { ...conv, status: data.status, updated_at: new Date().toISOString() }
            : conv
        );
      });
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
      return { id, owner };
    },
    onSuccess: (data) => {
      // Atualiza cache localmente ao invés de invalidar tudo
      queryClient.setQueryData<Conversation[]>(['conversations'], (old) => {
        if (!old) return old;
        return old.map(conv => 
          conv.id === data.id 
            ? { ...conv, owner_conversation: data.owner, updated_at: new Date().toISOString() }
            : conv
        );
      });
      
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
      // Insert message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'system',
          content,
          message_type: 'text',
        });

      if (messageError) throw messageError;

      // Update conversation last_message_at and owner to human
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          owner_conversation: 'human',
          updated_at: new Date().toISOString() 
        })
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      // Send message via WhatsApp API
      const { error: apiError } = await supabase.functions.invoke('whatsapp-send-message', {
        body: { conversationId, content }
      });

      if (apiError) {
        console.error('Error sending WhatsApp message:', apiError);
        throw new Error('Falha ao enviar mensagem via WhatsApp');
      }
    },
    onSuccess: (_, variables) => {
      // Atualiza apenas a conversa específica no cache
      queryClient.setQueryData<Conversation[]>(['conversations'], (old) => {
        if (!old) return old;
        return old.map(conv => 
          conv.id === variables.conversationId 
            ? { ...conv, last_message_at: new Date().toISOString(), owner_conversation: 'human' as const }
            : conv
        ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      });
      
      // Invalida apenas as mensagens dessa conversa
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      
      // Toast removido - mensagem aparece automaticamente na interface
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
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
  };
};

export const useMessages = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      // Buscar as últimas 100 mensagens (mais recentes)
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_type, sender_id, content, message_type, timestamp, whatsapp_message_id')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: false }) // Ordem decrescente para pegar as mais recentes
        .limit(100);

      if (error) throw error;
      
      // Inverter a ordem para exibir cronologicamente (mais antigas primeiro)
      return (data as Message[]).reverse();
    },
    enabled: !!conversationId,
    staleTime: 10000, // Cache de 10 segundos
    gcTime: 2 * 60 * 1000, // Manter em cache por 2 minutos
    refetchOnWindowFocus: false, // Não re-fetch ao trocar de aba
  });

  // Setup realtime subscriptions for messages
  useEffect(() => {
    if (!conversationId) return;

    const handleRealtimeMessage = (payload: any) => {
      const newMessage = payload.new as Message;

      queryClient.setQueryData<Message[]>(['messages', conversationId], (oldData) => {
        if (!oldData) return [newMessage];

        // Evita adicionar mensagens duplicadas
        if (oldData.some(msg => msg.id === newMessage.id)) {
          return oldData;
        }

        return [...oldData, newMessage];
      });
    };

    const messagesChannel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        handleRealtimeMessage
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
