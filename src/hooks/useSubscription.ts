import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  billing_cycle: string;
  features: Record<string, any>;
  limits: Record<string, any>;
  trial_days: number;
  is_active: boolean;
  is_custom: boolean;
  display_order: number;
}

interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: string;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  asaas_customer_id: string | null;
  asaas_subscription_id: string | null;
  asaas_next_due_date: string | null;
  current_usage: Record<string, any>;
  plan: SubscriptionPlan;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['organization-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from('organization_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('organization_id', profile.organization_id)
        .maybeSingle();

      if (error) throw error;
      return data as OrganizationSubscription | null;
    },
    enabled: !!user,
  });

  // Verificar se está em trial
  const isInTrial = subscription?.status === 'trial' && 
    subscription.trial_ends_at && 
    new Date(subscription.trial_ends_at) > new Date();

  // Verificar se trial expirou
  const trialExpired = subscription?.status === 'trial' && 
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) <= new Date();

  // Verificar se assinatura está ativa
  const isActive = subscription?.status === 'active';

  // Verificar se está bloqueado
  const isBlocked = subscription?.status === 'blocked' || 
    subscription?.status === 'expired' || 
    trialExpired;

  // Função para checar se tem acesso a funcionalidade
  const hasFeature = (feature: string): boolean => {
    if (!subscription?.plan) return false;
    return subscription.plan.features[feature] === true;
  };

  // Função para checar limite
  const checkLimit = (limitKey: string, currentValue: number): boolean => {
    if (!subscription?.plan) return false;
    const limit = subscription.plan.features[limitKey];
    if (limit === -1) return true; // ilimitado
    if (limit === undefined) return true; // sem limite definido
    return currentValue < limit;
  };

  // Obter limite
  const getLimit = (limitKey: string): number | null => {
    if (!subscription?.plan) return null;
    const limit = subscription.plan.features[limitKey];
    return limit ?? null;
  };

  // Calcular dias restantes de trial
  const trialDaysLeft = subscription?.trial_ends_at 
    ? Math.ceil((new Date(subscription.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    subscription,
    isLoading,
    isInTrial,
    trialExpired,
    trialDaysLeft,
    isActive,
    isBlocked,
    hasFeature,
    checkLimit,
    getLimit,
    plan: subscription?.plan,
  };
};
