import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Profile {
  organization_id: string | null;
  role: 'admin' | 'member';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Fetch initial session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 2. Fetch profile for the initial user
      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id, role')
          .eq('id', currentUser.id)
          .single();
        if (profileError) {
          console.error('Initial profile fetch error:', profileError);
        } else {
          setProfile(profileData as Profile);
        }
      }
      setLoading(false);

      // 3. Set up listener for future auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);
        const newCurrentUser = newSession?.user ?? null;
        setUser(newCurrentUser);

        if (newCurrentUser) {
          const { data: newProfileData, error: newProfileError } = await supabase
            .from('profiles')
            .select('organization_id, role')
            .eq('id', newCurrentUser.id)
            .single();
          if (newProfileError) {
            console.error('Auth change profile fetch error:', newProfileError);
            setProfile(null);
          } else {
            setProfile(newProfileData as Profile);
          }
        } else {
          setProfile(null);
        }
        setLoading(false); // Ensure loading is false after changes
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Login realizado com sucesso!');
      // A navegação é tratada pelo onAuthStateChange
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast.success('Conta criada! Verifique seu email para confirmar.');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Logout realizado com sucesso!');
      // A navegação é tratada pelo onAuthStateChange
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
