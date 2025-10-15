import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Clock } from "lucide-react";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import { AppointmentFilters } from "@/components/AppointmentFilters";
import { AppointmentListView } from "@/components/AppointmentListView";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { AppointmentWeekView } from "@/components/AppointmentWeekView";
import { AppointmentDayView } from "@/components/AppointmentDayView";
import { AppointmentDashboard } from "@/components/AppointmentDashboard";
import { useAppointments } from "@/hooks/useAppointments";
import type { AppointmentFilters as Filters } from "@/types/appointments";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Agenda() {
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState<Filters>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>();

  // Calculate date range based on view
  const getDateRange = () => {
    if (view === 'month') {
      return {
        start_date: startOfMonth(currentDate),
        end_date: endOfMonth(currentDate),
      };
    } else if (view === 'week') {
      return {
        start_date: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end_date: endOfWeek(currentDate, { weekStartsOn: 0 }),
      };
    } else if (view === 'day') {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      return { start_date: start, end_date: end };
    }
    return {};
  };

  const { appointments, isLoading, createAppointment, updateAppointment } = useAppointments({
    ...filters,
    ...getDateRange(),
  });

  const navigatePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === 'day') {
      setSelectedDate(subDays(selectedDate, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === 'day') {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getDateLabel = () => {
    if (view === 'month') {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, "d 'de' MMM", { locale: ptBR })} - ${format(weekEnd, "d 'de' MMM, yyyy", { locale: ptBR })}`;
    } else if (view === 'day') {
      return format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR });
    }
    return '';
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos e consultas
          </p>
        </div>

        {/* Mobile FAB and Desktop Button */}
        <Button 
          onClick={() => setDialogOpen(true)} 
          className="hidden md:flex shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Dashboard */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <AppointmentDashboard appointments={appointments} />
      )}

      {/* Filters */}
      <AppointmentFilters filters={filters} onFiltersChange={setFilters} />

      {/* Navigation and View Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="ml-4 font-semibold capitalize">
            {getDateLabel()}
          </span>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="month" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Mês</span>
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Semana</span>
            </TabsTrigger>
            <TabsTrigger value="day" className="gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Dia</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="animate-fade-in">
          {view === 'month' && (
            <AppointmentCalendar
              appointments={appointments}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onCreateAppointment={(date) => {
                setEditingAppointment(undefined);
                setSelectedDate(date);
                setDialogOpen(true);
              }}
              onEditAppointment={handleEditAppointment}
            />
          )}

          {view === 'week' && (
            <AppointmentWeekView
              appointments={appointments}
              currentDate={currentDate}
              onCreateAppointment={(date) => {
                setEditingAppointment(undefined);
                setSelectedDate(date);
                setDialogOpen(true);
              }}
              onEditAppointment={handleEditAppointment}
            />
          )}

          {view === 'day' && (
            <AppointmentDayView
              appointments={appointments}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onCreateAppointment={(date) => {
                setEditingAppointment(undefined);
                setSelectedDate(date);
                setDialogOpen(true);
              }}
              onEditAppointment={handleEditAppointment}
            />
          )}

          {view === 'list' && (
            <AppointmentListView appointments={appointments} />
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingAppointment(undefined);
        }}
        appointment={editingAppointment}
        onSubmit={(data) => {
          if (editingAppointment) {
            updateAppointment.mutate({ id: editingAppointment.id, ...data });
          } else {
            createAppointment.mutate(data);
          }
        }}
        defaultDate={selectedDate}
      />

      {/* Mobile FAB */}
      <Button
        onClick={() => setDialogOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 md:hidden h-14 w-14 rounded-full shadow-lg z-50"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
