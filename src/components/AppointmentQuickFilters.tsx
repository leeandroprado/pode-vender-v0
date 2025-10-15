import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, Calendar, UserX } from "lucide-react";
import type { AppointmentFilters, AppointmentStatus } from "@/types/appointments";
import { cn } from "@/lib/utils";

interface AppointmentQuickFiltersProps {
  filters: AppointmentFilters;
  onFilterChange: (filters: AppointmentFilters) => void;
}

export function AppointmentQuickFilters({ filters, onFilterChange }: AppointmentQuickFiltersProps) {
  const quickFilters: Array<{ 
    status: AppointmentStatus; 
    label: string; 
    icon: any;
    color: string;
  }> = [
    { 
      status: 'scheduled', 
      label: 'Agendados', 
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-500'
    },
    { 
      status: 'confirmed', 
      label: 'Confirmados', 
      icon: CheckCircle,
      color: 'text-blue-600 dark:text-blue-500'
    },
    { 
      status: 'completed', 
      label: 'Concluídos', 
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-500'
    },
    { 
      status: 'cancelled', 
      label: 'Cancelados', 
      icon: XCircle,
      color: 'text-red-600 dark:text-red-500'
    },
    { 
      status: 'no_show', 
      label: 'Faltas', 
      icon: UserX,
      color: 'text-gray-600 dark:text-gray-500'
    },
  ];

  const handleQuickFilter = (status: AppointmentStatus) => {
    const currentStatus = filters.status?.[0];
    if (currentStatus === status) {
      // Remove filter if already active
      onFilterChange({ ...filters, status: undefined });
    } else {
      onFilterChange({ ...filters, status: [status] });
    }
  };

  const currentStatus = filters.status?.[0];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant={!currentStatus ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange({ ...filters, status: undefined })}
        className="gap-2"
      >
        <Calendar className="w-4 h-4" />
        Todos
      </Button>
      {quickFilters.map((filter) => {
        const Icon = filter.icon;
        const isActive = currentStatus === filter.status;
        
        return (
          <Button
            key={filter.status}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickFilter(filter.status)}
            className={cn("gap-2", !isActive && filter.color)}
          >
            <Icon className="w-4 h-4" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
