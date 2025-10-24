import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'owner' | 'super_admin' | 'admin' | 'user';

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
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default role
        } else {
          setRole((data?.role as UserRole) || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user'); // Default role
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return {
    role,
    loading,
    isOwner: role === 'owner',
    isSuperAdmin: role === 'super_admin' || role === 'owner',
    isAdmin: role === 'admin' || role === 'super_admin' || role === 'owner',
  };
}
