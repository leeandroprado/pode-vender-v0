import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Appointment, CreateAppointmentInput, UpdateAppointmentInput, AppointmentFilters } from '@/types/appointments';

export function useAppointments(filters?: AppointmentFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients (
            id,
            name,
            phone,
            email
          )
        `)
        .not('agenda_id', 'is', null)
        .order('start_time', { ascending: true });

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      if (filters?.appointment_type) {
        query = query.eq('appointment_type', filters.appointment_type);
      }

      if (filters?.start_date) {
        query = query.gte('start_time', filters.start_date.toISOString());
      }

      if (filters?.end_date) {
        query = query.lte('start_time', filters.end_date.toISOString());
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.agendaId) {
        query = query.eq('agenda_id', filters.agendaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
  });

  const createAppointment = useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      if (!user) throw new Error('User not authenticated');

      // Check for conflicts
      const hasConflict = await checkConflict(
        new Date(input.start_time),
        new Date(input.end_time)
      );

      if (hasConflict) {
        throw new Error('Existe um conflito de horário com outro agendamento');
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar agendamento');
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...input }: UpdateAppointmentInput) => {
      if (!user) throw new Error('User not authenticated');

      // Check for conflicts if time is being updated
      if (input.start_time || input.end_time) {
        const appointment = appointments.find(a => a.id === id);
        if (appointment) {
          const newStart = input.start_time ? new Date(input.start_time) : new Date(appointment.start_time);
          const newEnd = input.end_time ? new Date(input.end_time) : new Date(appointment.end_time);
          
          const hasConflict = await checkConflict(newStart, newEnd, id);
          if (hasConflict) {
            throw new Error('Existe um conflito de horário com outro agendamento');
          }
        }
      }

      const { data, error } = await supabase
        .from('appointments')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar agendamento');
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento excluído com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir agendamento');
    },
  });

  const checkConflict = async (
    start: Date,
    end: Date,
    excludeId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    let query = supabase
      .from('appointments')
      .select('id, start_time, end_time')
      .eq('user_id', user.id)
      .neq('status', 'cancelled');

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query;

    if (!data) return false;

    return data.some(apt => {
      const aptStart = new Date(apt.start_time);
      const aptEnd = new Date(apt.end_time);

      return (
        (start >= aptStart && start < aptEnd) ||
        (end > aptStart && end <= aptEnd) ||
        (start <= aptStart && end >= aptEnd)
      );
    });
  };

  const getAppointmentsByDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return appointments.filter(apt => {
      const aptStart = new Date(apt.start_time);
      return aptStart >= startOfDay && aptStart <= endOfDay;
    });
  };

  return {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    checkConflict,
    getAppointmentsByDate,
  };
}
