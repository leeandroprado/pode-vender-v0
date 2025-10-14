import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/hooks/useUserRole";

export type TeamMember = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
};

export const useTeamMembers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at');

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Get roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      return profiles.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: (userRole?.role as UserRole) || 'user',
        };
      }) as TeamMember[];
    },
    staleTime: 30000,
  });

  const inviteUser = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: UserRole }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const token = crypto.randomUUID();
      
      const { error } = await supabase
        .from('invites')
        .insert({
          email,
          role,
          token,
          invited_by: user.id,
        });

      if (error) throw error;
      
      return { email, token };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Convite enviado",
        description: "O usuário foi convidado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Função atualizada",
        description: "A função do usuário foi alterada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar função",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    members: members || [],
    isLoading,
    inviteUser: inviteUser.mutate,
    updateUserRole: updateUserRole.mutate,
    isInviting: inviteUser.isPending,
    isUpdating: updateUserRole.isPending,
  };
};
