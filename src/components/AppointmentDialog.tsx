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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { Appointment, CreateAppointmentInput, AppointmentStatus } from "@/types/appointments";
import { useClients } from "@/hooks/useClients";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  onSubmit: (data: CreateAppointmentInput) => void;
  defaultDate?: Date;
}

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
  onSubmit,
  defaultDate,
}: AppointmentDialogProps) {
  const { clients } = useClients();
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
  const [duration, setDuration] = useState('60');

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

    if (!selectedDate) return;

    const { start, end } = calculateEndTime(selectedDate, startTime, parseInt(duration));

    onSubmit({
      ...formData,
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
    setDuration('60');
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
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
            <Label htmlFor="duration">Duração (minutos) *</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
                <SelectItem value="180">3 horas</SelectItem>
                <SelectItem value="240">4 horas</SelectItem>
              </SelectContent>
            </Select>
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
