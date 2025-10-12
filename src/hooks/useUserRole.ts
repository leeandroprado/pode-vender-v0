import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'moderator' | 'user' | 'super_admin';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle(); // Usar maybeSingle ao invés de single para evitar erro 406

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Fallback para 'user' se houver erro
        } else if (data) {
          setRole(data.role as UserRole);
        } else {
          // Usuário não tem role cadastrada, usar 'user' como padrão
          setRole('user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user'); // Fallback para 'user'
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return {
    role,
    loading,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'admin' || role === 'super_admin',
  };
}
