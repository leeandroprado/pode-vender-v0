import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Plan {
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
  created_at: string;
  updated_at: string;
}

export const usePlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Plan[];
    },
  });
};
