import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { AppointmentFilters } from "@/types/appointments";

interface AppointmentFilterChipsProps {
  filters: AppointmentFilters;
  onRemoveFilter: (key: keyof AppointmentFilters) => void;
  onClearAll: () => void;
}

export function AppointmentFilterChips({ filters, onRemoveFilter, onClearAll }: AppointmentFilterChipsProps) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '');
  
  if (activeFilters.length === 0) return null;

  const getFilterLabel = (key: string, value: any) => {
    const labels: Record<string, string> = {
      status: `Status: ${value}`,
      client_id: `Cliente`,
      appointment_type: `Tipo: ${value}`,
      search: `Busca: ${value}`,
    };
    return labels[key] || `${key}: ${value}`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap animate-fade-in">
      <span className="text-sm text-muted-foreground">Filtros ativos:</span>
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="gap-1 pr-1">
          {getFilterLabel(key, value)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter(key as keyof AppointmentFilters)}
          >
            <X className="w-3 h-3" />
          </Button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs"
        onClick={onClearAll}
      >
        Limpar todos
      </Button>
    </div>
  );
}
