import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  cpf_cnpj: string | null;
  phone: string | null;
}

interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEmail = useMutation({
    mutationFn: async (newEmail: string) => {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Email atualizado",
        description: "Verifique seu novo email para confirmar a alteração.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    isLoading,
    updateProfile,
    updateEmail,
  };
};
