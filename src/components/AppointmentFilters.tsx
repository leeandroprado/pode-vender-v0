import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X, Search } from "lucide-react";
import { AppointmentQuickFilters } from "./AppointmentQuickFilters";
import { AppointmentFilterChips } from "./AppointmentFilterChips";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { AppointmentFilters as Filters, AppointmentStatus } from "@/types/appointments";
import { useClients } from "@/hooks/useClients";
import { useState } from "react";

interface AppointmentFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Agendado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'no_show', label: 'Faltou' },
];

export function AppointmentFilters({ filters, onFiltersChange }: AppointmentFiltersProps) {
  const { clients } = useClients();
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.status?.length || filters.client_id || filters.start_date || filters.end_date || filters.search;

  const clearFilters = () => {
    onFiltersChange({});
  };

  const removeFilter = (key: keyof Filters) => {
    onFiltersChange({ ...filters, [key]: undefined });
  };

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <AppointmentQuickFilters filters={filters} onFilterChange={onFiltersChange} />

      {/* Active Filter Chips */}
      <AppointmentFilterChips
        filters={filters}
        onRemoveFilter={removeFilter}
        onClearAll={clearFilters}
      />

      {/* Search and Advanced Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, cliente..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Mais Filtros
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {[filters.status?.length, filters.client_id, filters.start_date, filters.end_date].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="grid gap-4 p-4 border rounded-lg bg-card">
          <div className="grid gap-2">
            <Label>Buscar</Label>
            <Input
              placeholder="Buscar por título ou descrição..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  status: value === 'all' ? undefined : [value as AppointmentStatus] 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Cliente</Label>
            <Select
              value={filters.client_id || 'all'}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, client_id: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.start_date ? format(filters.start_date, "PPP", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.start_date}
                    onSelect={(date) => onFiltersChange({ ...filters, start_date: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.end_date ? format(filters.end_date, "PPP", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.end_date}
                    onSelect={(date) => onFiltersChange({ ...filters, end_date: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
