import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemSetting {
  id: string;
  setting_category: string;
  setting_key: string;
  setting_value: string | null;
  description: string | null;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
}

export function useSystemSettings(category?: string) {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (category) {
        query = query.eq('setting_category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, value: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Configuração atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      await fetchSettings();
      return true;
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const getSetting = (key: string): string | null => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value || null;
  };

  useEffect(() => {
    fetchSettings();
  }, [category]);

  return {
    settings,
    loading,
    updateSetting,
    getSetting,
    refreshSettings: fetchSettings,
  };
}
