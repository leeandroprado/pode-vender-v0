import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar } from 'lucide-react';
import { useAgendas } from '@/hooks/useAgendas';
import { CreateAgendaDialog } from './CreateAgendaDialog';

interface AgendaSelectorProps {
  selectedAgendaId?: string;
  onSelectAgenda: (agendaId: string | undefined) => void;
}

export const AgendaSelector = ({ selectedAgendaId, onSelectAgenda }: AgendaSelectorProps) => {
  const { agendas, isLoading } = useAgendas();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="h-10 bg-muted animate-pulse rounded-md" />;
  }

  if (agendas.length === 0) {
    return (
      <>
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          <div className="flex-1">
            <h3 className="font-medium">Nenhuma agenda configurada</h3>
            <p className="text-sm text-muted-foreground">
              Crie sua primeira agenda para começar a gerenciar agendamentos
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Agenda
          </Button>
        </div>
        <CreateAgendaDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
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
                  {agenda.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Agenda
        </Button>
      </div>
      <CreateAgendaDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  );
};
