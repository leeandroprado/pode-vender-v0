import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ApiToken {
  id: string;
  organization_id: string;
  token: string;
  name: string;
  description?: string;
  scopes: string[];
  is_active: boolean;
  allowed_ips?: string[];
  rate_limit_per_minute: number;
  expires_at?: string;
  last_used_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTokenInput {
  name: string;
  description?: string;
  scopes: string[];
  allowed_ips?: string[];
  rate_limit_per_minute?: number;
  expires_at?: string;
}

export function useApiTokens() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tokens, isLoading } = useQuery({
    queryKey: ['api-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApiToken[];
    },
    enabled: !!user,
  });

  const createToken = useMutation({
    mutationFn: async (input: CreateTokenInput) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user!.id)
        .single();

      const { data, error } = await supabase
        .from('api_tokens')
        .insert({
          name: input.name,
          description: input.description,
          scopes: input.scopes as any,
          allowed_ips: input.allowed_ips,
          rate_limit_per_minute: input.rate_limit_per_minute,
          expires_at: input.expires_at,
          created_by: user!.id,
          organization_id: profile!.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
    },
  });

  const deleteToken = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_tokens')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
    },
  });

  const updateToken = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ApiToken> & { id: string }) => {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.scopes) updateData.scopes = updates.scopes;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      
      const { data, error } = await supabase
        .from('api_tokens')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
    },
  });

  return {
    tokens,
    isLoading,
    createToken,
    deleteToken,
    updateToken,
  };
}
