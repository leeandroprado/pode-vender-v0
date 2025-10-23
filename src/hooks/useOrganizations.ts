import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Organization {
  id: string;
  email: string;
  full_name: string | null;
  organization_id: string | null;
  created_at: string;
  subscription?: {
    id: string;
    status: string;
    plan_id: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
    current_usage: any;
    plan: {
      name: string;
      price: number;
      billing_cycle: string;
    };
  };
  user_count?: number;
}

export const useOrganizations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['all-organizations'],
    queryFn: async () => {
      // Buscar todos os perfis que são donos de organização (organization_id = id)
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          organization_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Filtrar apenas profiles onde id = organization_id
      const profiles = allProfiles?.filter(p => p.id === p.organization_id) || [];

      // Buscar assinaturas para cada organização
      const orgsWithSubscriptions = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: subscription } = await supabase
            .from('organization_subscriptions')
            .select(`
              id,
              status,
              plan_id,
              trial_ends_at,
              current_period_end,
              current_usage,
              plan:subscription_plans(
                name,
                price,
                billing_cycle
              )
            `)
            .eq('organization_id', profile.id)
            .single();

          // Contar usuários da organização
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', profile.id);

          return {
            ...profile,
            subscription,
            user_count: count || 0,
          } as Organization;
        })
      );

      return orgsWithSubscriptions;
    },
  });

  const getOrganizationDetails = async (orgId: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', orgId)
      .single();

    if (profileError) throw profileError;

    const { data: subscription } = await supabase
      .from('organization_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('organization_id', orgId)
      .single();

    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('organization_id', orgId);

    return {
      profile,
      subscription,
      users: users || [],
    };
  };

  const updateOrganizationStatus = useMutation({
    mutationFn: async ({ orgId, status }: { orgId: string; status: string }) => {
      const { error } = await supabase
        .from('organization_subscriptions')
        .update({ status })
        .eq('organization_id', orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-organizations'] });
      toast({
        title: "Status atualizado",
        description: "O status da organização foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    organizations,
    isLoading,
    getOrganizationDetails,
    updateOrganizationStatus,
  };
};
