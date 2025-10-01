import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  const hasActiveFilters =
    filters.category || filters.status || filters.startDate || filters.endDate;

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange("category", value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange("status", value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
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
      <Drawer open={startDateOpen} onOpenChange={setStartDateOpen}>
        <DrawerTrigger asChild>
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
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Selecione a data inicial</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 flex justify-center">
            <Calendar
              mode="single"
              selected={filters.startDate}
              onSelect={(date) => {
                onFilterChange("startDate", date);
                setStartDateOpen(false);
              }}
              className="pointer-events-auto"
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Data Final */}
      <Drawer open={endDateOpen} onOpenChange={setEndDateOpen}>
        <DrawerTrigger asChild>
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
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Selecione a data final</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 flex justify-center">
            <Calendar
              mode="single"
              selected={filters.endDate}
              onSelect={(date) => {
                onFilterChange("endDate", date);
                setEndDateOpen(false);
              }}
              className="pointer-events-auto"
            />
          </div>
        </DrawerContent>
      </Drawer>

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
