import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, addDays, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { Appointment, CreateAppointmentInput, AppointmentStatus } from "@/types/appointments";
import { useClients } from "@/hooks/useClients";
import type { Agenda, WorkingHours } from "@/hooks/useAgendas";
import { toast } from "sonner";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  agendaId?: string;
  agenda?: Agenda;
  onSubmit: (data: CreateAppointmentInput) => void;
  defaultDate?: Date;
}

// Função para gerar opções de duração baseadas no slot_duration da agenda
const generateDurationOptions = (slotDuration: number) => {
  const options = [];
  for (let i = slotDuration; i <= 240; i += slotDuration) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    let label = '';
    if (hours > 0) label += `${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) label += `${label ? ' e ' : ''}${minutes} minutos`;
    options.push({ value: i.toString(), label });
  }
  return options;
};

// Função para verificar se um horário está dentro do working_hours
const isTimeWithinWorkingHours = (date: Date, time: string, agenda?: Agenda) => {
  if (!agenda) return true;
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()] as keyof WorkingHours;
  const dayConfig = agenda.working_hours[dayName];
  
  if (!dayConfig.enabled) return false;
  
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  
  const [startHours, startMinutes] = dayConfig.start.split(':').map(Number);
  const startTimeInMinutes = startHours * 60 + startMinutes;
  
  const [endHours, endMinutes] = dayConfig.end.split(':').map(Number);
  const endTimeInMinutes = endHours * 60 + endMinutes;
  
  return timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes;
};

// Função para verificar se horário está em um break
const isTimeInBreak = (date: Date, time: string, duration: number, agenda?: Agenda) => {
  if (!agenda || !agenda.breaks || agenda.breaks.length === 0) return false;
  
  const dayOfWeek = date.getDay();
  const [hours, minutes] = time.split(':').map(Number);
  const startTimeInMinutes = hours * 60 + minutes;
  const endTimeInMinutes = startTimeInMinutes + duration;
  
  return agenda.breaks.some((breakPeriod: any) => {
    if (!breakPeriod.days.includes(dayOfWeek)) return false;
    
    const [breakStartHours, breakStartMinutes] = breakPeriod.start.split(':').map(Number);
    const breakStartInMinutes = breakStartHours * 60 + breakStartMinutes;
    
    const [breakEndHours, breakEndMinutes] = breakPeriod.end.split(':').map(Number);
    const breakEndInMinutes = breakEndHours * 60 + breakEndMinutes;
    
    return (
      (startTimeInMinutes >= breakStartInMinutes && startTimeInMinutes < breakEndInMinutes) ||
      (endTimeInMinutes > breakStartInMinutes && endTimeInMinutes <= breakEndInMinutes) ||
      (startTimeInMinutes <= breakStartInMinutes && endTimeInMinutes >= breakEndInMinutes)
    );
  });
};

const appointmentTypes = [
  'Consulta',
  'Consultoria',
  'Reunião',
  'Avaliação',
  'Retorno',
  'Outro',
];

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  agendaId,
  agenda,
  onSubmit,
  defaultDate,
}: AppointmentDialogProps) {
  const { clients } = useClients();
  
  const durationOptions = agenda 
    ? generateDurationOptions(agenda.slot_duration)
    : generateDurationOptions(30);
  
  const defaultDuration = agenda ? agenda.slot_duration.toString() : '60';
  const [formData, setFormData] = useState<CreateAppointmentInput>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    client_id: null,
    status: 'scheduled',
    appointment_type: '',
    location: '',
    internal_notes: '',
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(defaultDuration);

  useEffect(() => {
    if (appointment) {
      const start = new Date(appointment.start_time);
      const end = new Date(appointment.end_time);
      const durationMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);

      setFormData({
        title: appointment.title,
        description: appointment.description || '',
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        client_id: appointment.client_id,
        status: appointment.status,
        appointment_type: appointment.appointment_type || '',
        location: appointment.location || '',
        internal_notes: appointment.internal_notes || '',
      });

      setSelectedDate(start);
      setStartTime(format(start, 'HH:mm'));
      setDuration(durationMinutes.toString());
    } else if (defaultDate) {
      setSelectedDate(defaultDate);
    }
  }, [appointment, defaultDate]);

  useEffect(() => {
    if (agenda && !appointment) {
      setDuration(agenda.slot_duration.toString());
    }
  }, [agenda, appointment]);

  const calculateEndTime = (date: Date, time: string, durationMinutes: number) => {
    const [hours, minutes] = time.split(':').map(Number);
    const start = new Date(date);
    start.setHours(hours, minutes, 0, 0);
    
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);
    
    return { start, end };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error('Selecione uma data');
      return;
    }

    if (agenda && !isTimeWithinWorkingHours(selectedDate, startTime, agenda)) {
      toast.error('Horário fora do expediente configurado para este dia');
      return;
    }

    if (agenda && isTimeInBreak(selectedDate, startTime, parseInt(duration), agenda)) {
      toast.error('Horário conflita com um intervalo configurado');
      return;
    }

    const { start, end } = calculateEndTime(selectedDate, startTime, parseInt(duration));

    onSubmit({
      ...formData,
      agenda_id: agendaId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      client_id: null,
      status: 'scheduled',
      appointment_type: '',
      location: '',
      internal_notes: '',
    });
    setSelectedDate(undefined);
    setStartTime('09:00');
    setDuration(defaultDuration);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Consulta com cliente"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes do agendamento..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => {
                      if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                      
                      if (agenda) {
                        const minDate = addHours(new Date(), agenda.min_advance_hours);
                        if (date < minDate) return true;
                        
                        const maxDate = addDays(new Date(), agenda.max_advance_days);
                        if (date > maxDate) return true;
                        
                        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                        const dayName = dayNames[date.getDay()] as keyof WorkingHours;
                        if (!agenda.working_hours[dayName].enabled) return true;
                      }
                      
                      return false;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="start_time">Horário *</Label>
              <Input
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duration">
              Duração (minutos) *
              {agenda && (
                <span className="text-xs text-muted-foreground ml-2">
                  Baseado em slots de {agenda.slot_duration} min
                </span>
              )}
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {agenda && selectedDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {(() => {
                  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  const dayName = dayNames[selectedDate.getDay()] as keyof WorkingHours;
                  const dayConfig = agenda.working_hours[dayName];
                  return dayConfig.enabled 
                    ? `📅 Expediente: ${dayConfig.start} - ${dayConfig.end}${agenda.breaks.length > 0 ? ' | ⏸️ Intervalos configurados' : ''}`
                    : '🚫 Dia sem expediente';
                })()}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client">Cliente</Label>
            <Select
              value={formData.client_id || 'none'}
              onValueChange={(value) => 
                setFormData({ ...formData, client_id: value === 'none' ? null : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem cliente</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="appointment_type">Tipo de Agendamento</Label>
            <Select
              value={formData.appointment_type || 'none'}
              onValueChange={(value) => 
                setFormData({ ...formData, appointment_type: value === 'none' ? '' : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não especificado</SelectItem>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Consultório 1, Online, etc."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => 
                setFormData({ ...formData, status: value as AppointmentStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="no_show">Faltou</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="internal_notes">Notas Internas</Label>
            <Textarea
              id="internal_notes"
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              placeholder="Anotações privadas sobre este agendamento..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {appointment ? 'Atualizar' : 'Criar'} Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
