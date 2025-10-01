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
  prompt_system: string;
};

type UpdateAgentInput = {
  id: string;
  name?: string;
  description?: string;
  model?: Agent["model"];
  prompt_system?: string;
  status?: Agent["status"];
  whatsapp_phone?: string;
  whatsapp_connected?: boolean;
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Agent[];
    },
  });

  const { data: whatsappInstances, refetch: fetchWhatsappInstances } = useQuery({
    queryKey: ["whatsapp_instances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*");

      if (error) throw error;
      return data as WhatsappInstance[];
    },
    initialData: [],
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
      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({
        title: "Agente excluído",
        description: "O agente foi removido com sucesso.",
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

  return {
    agents: agents || [],
    isLoading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    whatsappInstances: whatsappInstances || [],
    fetchWhatsappInstances,
  };
};
