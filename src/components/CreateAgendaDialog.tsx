import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkingHoursEditor } from './WorkingHoursEditor';
import { BreaksEditor } from './BreaksEditor';
import { useAgendas, WorkingHours, Break } from '@/hooks/useAgendas';

interface CreateAgendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export const CreateAgendaDialog = ({ open, onOpenChange }: CreateAgendaDialogProps) => {
  const { createAgenda } = useAgendas();
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

  const handleSubmit = () => {
    createAgenda.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          name: '',
          description: '',
          color: '#3b82f6',
          working_hours: defaultWorkingHours,
          slot_duration: 30,
          breaks: [],
          min_advance_hours: 2,
          max_advance_days: 90,
          buffer_time: 0,
          reminder_hours_before: 24,
          send_confirmation: true,
        });
        setCurrentTab('basic');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Agenda</DialogTitle>
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
            disabled={!formData.name || createAgenda.isPending}
          >
            {createAgenda.isPending ? 'Criando...' : 'Criar Agenda'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
