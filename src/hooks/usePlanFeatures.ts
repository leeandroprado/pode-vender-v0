import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PlanFeature {
  id: string;
  feature_key: string;
  name: string;
  description: string | null;
  category: 'core' | 'limits' | 'integrations' | 'support';
  feature_type: 'boolean' | 'numeric' | 'text';
  default_value: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanFeatureValue {
  id: string;
  plan_id: string;
  feature_id: string;
  value: string;
  created_at: string;
  updated_at: string;
  feature?: PlanFeature;
}

export const usePlanFeatures = () => {
  return useQuery({
    queryKey: ['plan-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_features')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as PlanFeature[];
    },
  });
};

export const usePlanFeatureValues = (planId?: string) => {
  return useQuery({
    queryKey: ['plan-feature-values', planId],
    queryFn: async () => {
      if (!planId) return [];
      
      const { data, error } = await supabase
        .from('plan_feature_values')
        .select('*, feature:plan_features(*)')
        .eq('plan_id', planId);

      if (error) throw error;
      return data as PlanFeatureValue[];
    },
    enabled: !!planId,
  });
};

export const usePlanWithFeatures = (planId?: string) => {
  return useQuery({
    queryKey: ['plan-with-features', planId],
    queryFn: async () => {
      if (!planId) return null;

      const { data, error } = await supabase
        .from('subscription_plans')
        .select(`
          *,
          feature_values:plan_feature_values(
            id,
            value,
            feature:plan_features(*)
          )
        `)
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (feature: Omit<PlanFeature, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('plan_features')
        .insert(feature)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-features'] });
      toast({
        title: "Funcionalidade criada",
        description: "A funcionalidade foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar funcionalidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlanFeature> & { id: string }) => {
      const { data, error } = await supabase
        .from('plan_features')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-features'] });
      toast({
        title: "Funcionalidade atualizada",
        description: "A funcionalidade foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar funcionalidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSetFeatureValue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ planId, featureId, value }: { planId: string; featureId: string; value: string }) => {
    const { data, error } = await supabase
      .from('plan_feature_values')
      .upsert(
        {
          plan_id: planId,
          feature_id: featureId,
          value,
        },
        {
          onConflict: 'plan_id,feature_id'
        }
      )
      .select()
      .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan-feature-values', variables.planId] });
      queryClient.invalidateQueries({ queryKey: ['plan-with-features', variables.planId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar valor",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
