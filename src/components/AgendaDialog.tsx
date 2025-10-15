import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkingHoursEditor } from './WorkingHoursEditor';
import { BreaksEditor } from './BreaksEditor';
import { useAgendas, WorkingHours, Break, Agenda } from '@/hooks/useAgendas';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface AgendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agenda?: Agenda;
}

const defaultWorkingHours: WorkingHours = {
  monday: { start: '08:00', end: '18:00', enabled: true },
  tuesday: { start: '08:00', end: '18:00', enabled: true },
  wednesday: { start: '08:00', end: '18:00', enabled: true },
  thursday: { start: '08:00', end: '18:00', enabled: true },
  friday: { start: '08:00', end: '18:00', enabled: true },
  saturday: { start: '08:00', end: '12:00', enabled: false },
  sunday: { start: '08:00', end: '12:00', enabled: false },
};

const defaultFormData = {
  name: '',
  description: '',
  color: '#3b82f6',
  working_hours: defaultWorkingHours,
  slot_duration: 30,
  breaks: [] as Break[],
  min_advance_hours: 2,
  max_advance_days: 90,
  buffer_time: 0,
  reminder_hours_before: 24,
  send_confirmation: true,
};

export const AgendaDialog = ({ open, onOpenChange, agenda }: AgendaDialogProps) => {
  const { createAgenda, updateAgenda } = useAgendas();
  const [currentTab, setCurrentTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    working_hours: defaultWorkingHours,
    slot_duration: 30,
    breaks: [] as Break[],
    min_advance_hours: 2,
    max_advance_days: 90,
    buffer_time: 0,
    reminder_hours_before: 24,
    send_confirmation: true,
  });

  useEffect(() => {
    if (agenda) {
      setFormData({
        name: agenda.name,
        description: agenda.description || '',
        color: agenda.color,
        working_hours: agenda.working_hours,
        slot_duration: agenda.slot_duration,
        breaks: agenda.breaks,
        min_advance_hours: agenda.min_advance_hours,
        max_advance_days: agenda.max_advance_days,
        buffer_time: agenda.buffer_time,
        reminder_hours_before: agenda.reminder_hours_before,
        send_confirmation: agenda.send_confirmation,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [agenda, open]);

  const handleSubmit = () => {
    if (agenda) {
      updateAgenda.mutate({ id: agenda.id, ...formData }, {
        onSuccess: () => {
          onOpenChange(false);
          setFormData(defaultFormData);
          setCurrentTab('basic');
        },
      });
    } else {
      createAgenda.mutate(formData, {
        onSuccess: () => {
          onOpenChange(false);
          setFormData(defaultFormData);
          setCurrentTab('basic');
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agenda ? 'Editar Agenda' : 'Criar Nova Agenda'}</DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="hours">Horários</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="breaks">Intervalos</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {agenda && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
                <Label htmlFor="agenda-id">ID da Agenda (para API)</Label>
                <div className="flex gap-2">
                  <Input
                    id="agenda-id"
                    value={agenda.id}
                    readOnly
                    className="font-mono text-xs bg-background"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(agenda.id);
                      toast.success('ID copiado para área de transferência!');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use este ID nas requisições da API pública de agendamentos
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Agenda *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Dr. João - Ortodontia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o propósito desta agenda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor da Agenda</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <WorkingHoursEditor
              workingHours={formData.working_hours}
              onChange={(working_hours) => setFormData({ ...formData, working_hours })}
            />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slot_duration">Duração padrão do atendimento (minutos)</Label>
              <Input
                id="slot_duration"
                type="number"
                value={formData.slot_duration}
                onChange={(e) => setFormData({ ...formData, slot_duration: Number(e.target.value) })}
                min="5"
                max="1440"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buffer_time">Tempo entre atendimentos (minutos)</Label>
              <Input
                id="buffer_time"
                type="number"
                value={formData.buffer_time}
                onChange={(e) => setFormData({ ...formData, buffer_time: Number(e.target.value) })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_advance_hours">Antecedência mínima para agendar (horas)</Label>
              <Input
                id="min_advance_hours"
                type="number"
                value={formData.min_advance_hours}
                onChange={(e) => setFormData({ ...formData, min_advance_hours: Number(e.target.value) })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_advance_days">Agendamento até (dias no futuro)</Label>
              <Input
                id="max_advance_days"
                type="number"
                value={formData.max_advance_days}
                onChange={(e) => setFormData({ ...formData, max_advance_days: Number(e.target.value) })}
                min="1"
              />
            </div>
          </TabsContent>

          <TabsContent value="breaks" className="space-y-4">
            <BreaksEditor
              breaks={formData.breaks}
              onChange={(breaks) => setFormData({ ...formData, breaks })}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder_hours_before">Enviar lembrete (horas antes)</Label>
              <Input
                id="reminder_hours_before"
                type="number"
                value={formData.reminder_hours_before}
                onChange={(e) => setFormData({ ...formData, reminder_hours_before: Number(e.target.value) })}
                min="0"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name || createAgenda.isPending || updateAgenda.isPending}
          >
            {agenda 
              ? (updateAgenda.isPending ? 'Salvando...' : 'Salvar Alterações')
              : (createAgenda.isPending ? 'Criando...' : 'Criar Agenda')
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
