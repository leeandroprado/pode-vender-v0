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

export type PendingInvite = {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  expires_at: string;
  token: string;
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

  const { data: pendingInvites, isLoading: isLoadingInvites } = useQuery({
    queryKey: ['pending-invites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invites')
        .select('id, email, phone, role, created_at, expires_at, token')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PendingInvite[];
    },
    staleTime: 30000,
  });

  const inviteUser = useMutation({
    mutationFn: async ({ email, phone, role }: { email: string; phone: string; role: UserRole }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const token = crypto.randomUUID();
      
      const { error } = await supabase
        .from('invites')
        .insert({
          email,
          phone,
          role,
          token,
          invited_by: user.id,
        });

      if (error) throw error;
      
      // Chamar edge function para enviar WhatsApp
      const { error: sendError } = await supabase.functions.invoke('send-invite-whatsapp', {
        body: { email, phone, role, token },
      });

      if (sendError) {
        console.error('Erro ao enviar WhatsApp:', sendError);
        throw new Error('Convite criado, mas falha ao enviar WhatsApp: ' + sendError.message);
      }
      
      return { email, phone, token };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
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
      const { data, error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Não foi possível atualizar o role. Verifique suas permissões.');
      }
      
      return data;
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

  const cancelInvite = useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('invites')
        .update({ status: 'expired' })
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendInvite = useMutation({
    mutationFn: async (invite: PendingInvite) => {
      const { error } = await supabase.functions.invoke('send-invite-whatsapp', {
        body: { 
          email: invite.email, 
          phone: invite.phone, 
          role: invite.role, 
          token: invite.token 
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Convite reenviado",
        description: "O convite foi reenviado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    members: members || [],
    pendingInvites: pendingInvites || [],
    isLoading: isLoading || isLoadingInvites,
    inviteUser: inviteUser.mutate,
    updateUserRole: updateUserRole.mutate,
    cancelInvite: cancelInvite.mutate,
    resendInvite: resendInvite.mutate,
    isInviting: inviteUser.isPending,
    isUpdating: updateUserRole.isPending,
    isCanceling: cancelInvite.isPending,
    isResending: resendInvite.isPending,
  };
};
