import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  city?: string;
  created_at: string;
  updated_at: string;
}

export const useClients = () => {
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Client[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (newClient: Omit<Client, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("clients")
        .insert({
          ...newClient,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente cadastrado com sucesso!");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("Já existe um cliente com este telefone");
      } else {
        toast.error("Erro ao cadastrar cliente");
      }
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar cliente");
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente removido com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover cliente");
    },
  });

  const linkClientToConversation = useMutation({
    mutationFn: async ({ conversationId, clientId }: { conversationId: string; clientId: string }) => {
      const { data, error } = await supabase
        .from("conversations")
        .update({ client_id: clientId })
        .eq("id", conversationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Cliente vinculado à conversa!");
    },
    onError: () => {
      toast.error("Erro ao vincular cliente");
    },
  });

  return {
    clients,
    isLoading,
    createClient,
    updateClient,
    deleteClient,
    linkClientToConversation,
  };
};
