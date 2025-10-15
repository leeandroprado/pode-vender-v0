import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentEmptyStateProps {
  title?: string;
  description?: string;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
}

export function AppointmentEmptyState({
  title = "Nenhum agendamento encontrado",
  description = "Comece criando seu primeiro agendamento ou ajuste os filtros.",
  onCreateClick,
  showCreateButton = true,
}: AppointmentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Calendar className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {showCreateButton && onCreateClick && (
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Agendamento
        </Button>
      )}
    </div>
  );
}
