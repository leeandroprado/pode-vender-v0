import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Vendedor = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

export const useVendedores = () => {
  const { data: vendedores, isLoading } = useQuery({
    queryKey: ['vendedores'],
    queryFn: async () => {
      // First get vendedor user IDs
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'vendedor');

      if (rolesError) throw rolesError;
      if (!userRoles || userRoles.length === 0) return [];

      const vendedorIds = userRoles.map(r => r.user_id);

      // Then get profile data for those users
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', vendedorIds);

      if (error) throw error;
      
      return data as Vendedor[];
    },
    staleTime: 60000, // Cache for 1 minute
  });

  return {
    vendedores: vendedores || [],
    isLoading,
  };
};
