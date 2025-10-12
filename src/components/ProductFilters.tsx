import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCategories } from "@/hooks/useCategories";
import { useState } from "react";

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
  const isMobile = useIsMobile();
  const { categories } = useCategories();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  const hasActiveFilters =
    filters.category || filters.status || filters.startDate || filters.endDate;

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      <Select
        value={filters.category || "all"}
        onValueChange={(value) => onFilterChange("category", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status || "all"}
        onValueChange={(value) => onFilterChange("status", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    status.value === "ativo" && "bg-success/10 text-success border-success/20",
                    status.value === "baixo_estoque" && "bg-warning/10 text-warning border-warning/20",
                    status.value === "esgotado" && "bg-destructive/10 text-destructive border-destructive/20",
                    status.value === "inativo" && "bg-muted text-muted-foreground"
                  )}
                >
                  {status.label}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Data Inicial */}
      <Popover open={startDateOpen} onOpenChange={setStartDateOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              isMobile ? "w-full" : "w-[260px]",
              "justify-start text-left font-normal",
              !filters.startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.startDate ? (
              format(filters.startDate, "dd/MM/yyyy")
            ) : (
              <span>Data inicial</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          <Calendar
            mode="single"
            selected={filters.startDate}
            onSelect={(date) => {
              onFilterChange("startDate", date);
              setStartDateOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Data Final */}
      <Popover open={endDateOpen} onOpenChange={setEndDateOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              isMobile ? "w-full" : "w-[260px]",
              "justify-start text-left font-normal",
              !filters.endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.endDate ? (
              format(filters.endDate, "dd/MM/yyyy")
            ) : (
              <span>Data final</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          <Calendar
            mode="single"
            selected={filters.endDate}
            onSelect={(date) => {
              onFilterChange("endDate", date);
              setEndDateOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-10 gap-2 w-full sm:w-auto"
        >
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
