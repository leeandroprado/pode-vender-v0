import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Agent = Tables<"agents">;
type WhatsappInstance = Tables<"whatsapp_instances">;

type CreateAgentInput = {
  name: string;
  description?: string;
  model: Agent["model"];
  system_prompt: string;
};

type UpdateAgentInput = {
  id: string;
  name?: string;
  description?: string;
  model?: Agent["model"];
  system_prompt?: string;
  status?: Agent["status"];
};

export const useAgents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Agent[];
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const { data: whatsappInstances, refetch: fetchWhatsappInstances } = useQuery({
    queryKey: ["whatsapp_instances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .limit(50);

      if (error) throw error;
      return data as WhatsappInstance[];
    },
    initialData: [],
    staleTime: 20000, // Cache for 20 seconds
    gcTime: 3 * 60 * 1000, // Keep in cache for 3 minutes
  });

  const createAgent = useMutation({
    mutationFn: async (newAgent: CreateAgentInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("agents")
        .insert([{ ...newAgent, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({
        title: "Agente criado com sucesso!",
        description: "Seu novo agente já está pronto para uso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar agente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAgent = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateAgentInput) => {
      const { data, error } = await supabase
        .from("agents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({
        title: "Agente atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar agente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke(
        "whatsapp-delete-agent",
        {
          body: { agentId: id },
        }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp_instances"] });
      toast({
        title: "Agente excluído",
        description: "O agente e sua instância WhatsApp foram removidos com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir agente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectWhatsApp = useMutation({
    mutationFn: async (agentId: string) => {
      const { data, error } = await supabase.functions.invoke(
        "whatsapp-disconnect-instance",
        {
          body: { agentId },
        }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp_instances"] });
      toast({
        title: "WhatsApp desconectado",
        description: "O WhatsApp foi desconectado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao desconectar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    agents: agents || [],
    isLoading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    disconnectWhatsApp,
    whatsappInstances: whatsappInstances || [],
    fetchWhatsappInstances,
  };
};
