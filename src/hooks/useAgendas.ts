import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkingHours {
  monday: { start: string; end: string; enabled: boolean };
  tuesday: { start: string; end: string; enabled: boolean };
  wednesday: { start: string; end: string; enabled: boolean };
  thursday: { start: string; end: string; enabled: boolean };
  friday: { start: string; end: string; enabled: boolean };
  saturday: { start: string; end: string; enabled: boolean };
  sunday: { start: string; end: string; enabled: boolean };
}

export interface Break {
  start: string;
  end: string;
  days: number[];
}

export interface Agenda {
  id: string;
  organization_id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  working_hours: WorkingHours;
  slot_duration: number;
  breaks: Break[];
  min_advance_hours: number;
  max_advance_days: number;
  buffer_time: number;
  reminder_hours_before: number;
  send_confirmation: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useAgendas = () => {
  const queryClient = useQueryClient();

  const { data: agendas = [], isLoading } = useQuery({
    queryKey: ['agendas'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('agendas')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        working_hours: item.working_hours as unknown as WorkingHours,
        breaks: item.breaks as unknown as Break[],
      })) as Agenda[];
    },
  });

  const createAgenda = useMutation({
    mutationFn: async (agenda: Partial<Agenda>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('agendas')
        .insert([agenda as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      toast.success('Agenda criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar agenda: ' + error.message);
    },
  });

  const updateAgenda = useMutation({
    mutationFn: async ({ id, ...agenda }: Partial<Agenda> & { id: string }) => {
      const updateData: any = { ...agenda };
      if (agenda.working_hours) {
        updateData.working_hours = agenda.working_hours as any;
      }
      if (agenda.breaks) {
        updateData.breaks = agenda.breaks as any;
      }
      
      const { data, error } = await supabase
        .from('agendas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      toast.success('Agenda atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar agenda: ' + error.message);
    },
  });

  const deleteAgenda = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendas')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      toast.success('Agenda desativada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao desativar agenda: ' + error.message);
    },
  });

  return {
    agendas,
    isLoading,
    createAgenda,
    updateAgenda,
    deleteAgenda,
  };
};
