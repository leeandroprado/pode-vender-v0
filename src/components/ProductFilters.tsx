import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  filters: {
    category: string;
    status: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  };
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

const categories = [
  "Eletrônicos",
  "Acessórios",
  "Áudio",
  "Computadores",
  "Periféricos",
  "Outros",
];

const statuses = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "baixo_estoque", label: "Baixo Estoque" },
  { value: "esgotado", label: "Esgotado" },
];

export function ProductFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const hasActiveFilters =
    filters.category ||
    filters.status ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category Filter */}
      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange("category", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value=" ">Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange("status", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value=" ">Todos os status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <Badge
                variant="outline"
                className={cn(
                  "mr-2",
                  status.value === "ativo" && "bg-success/10 text-success border-success/20",
                  status.value === "baixo_estoque" && "bg-warning/10 text-warning border-warning/20",
                  status.value === "esgotado" && "bg-destructive/10 text-destructive border-destructive/20",
                  status.value === "inativo" && "bg-muted text-muted-foreground"
                )}
              >
                {status.label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Start Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !filters.startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.startDate ? (
              format(filters.startDate, "PPP", { locale: ptBR })
            ) : (
              <span>Data inicial</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.startDate}
            onSelect={(date) => onFilterChange("startDate", date)}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* End Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !filters.endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.endDate ? (
              format(filters.endDate, "PPP", { locale: ptBR })
            ) : (
              <span>Data final</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.endDate}
            onSelect={(date) => onFilterChange("endDate", date)}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={onClearFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
