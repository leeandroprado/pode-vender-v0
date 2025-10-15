import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Settings } from 'lucide-react';
import { useAgendas, Agenda } from '@/hooks/useAgendas';
import { AgendaDialog } from './AgendaDialog';

interface AgendaSelectorProps {
  selectedAgendaId?: string;
  onSelectAgenda: (agendaId: string | undefined) => void;
}

export const AgendaSelector = ({ selectedAgendaId, onSelectAgenda }: AgendaSelectorProps) => {
  const { agendas, isLoading } = useAgendas();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | undefined>();

  const selectedAgenda = agendas.find(a => a.id === selectedAgendaId);

  if (isLoading) {
    return <div className="h-10 bg-muted animate-pulse rounded-md" />;
  }

  if (agendas.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center gap-4 p-8 rounded-lg border-2 border-dashed bg-muted/20">
          <div className="rounded-full bg-primary/10 p-4">
            <Calendar className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-xl">Nenhuma agenda configurada</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Crie sua primeira agenda para começar a gerenciar agendamentos, definir horários de trabalho e muito mais.
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Agenda
          </Button>
        </div>
        <AgendaDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <Select value={selectedAgendaId || 'all'} onValueChange={(value) => onSelectAgenda(value === 'all' ? undefined : value)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Selecione uma agenda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Agendas</SelectItem>
            {agendas.map((agenda) => (
              <SelectItem key={agenda.id} value={agenda.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: agenda.color }}
                  />
                  #{agenda.id.slice(0, 8)} {agenda.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedAgendaId && selectedAgenda && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setEditingAgenda(selectedAgenda)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Agenda
        </Button>
      </div>
      <AgendaDialog 
        open={createDialogOpen || !!editingAgenda} 
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingAgenda(undefined);
        }}
        agenda={editingAgenda}
      />
    </>
  );
};
