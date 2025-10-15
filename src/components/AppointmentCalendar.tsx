import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppointmentHoverCard } from "./AppointmentHoverCard";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/types/appointments";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onCreateAppointment?: (date: Date) => void;
  onEditAppointment?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({ 
  appointments, 
  selectedDate, 
  onSelectDate,
  onCreateAppointment,
  onEditAppointment 
}: AppointmentCalendarProps) {
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.start_time), date)
    );
  };

  // Get status color for dots
  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
      no_show: "bg-gray-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const modifiers = {
    hasAppointments: (date: Date) => getAppointmentsForDate(date).length > 0,
  };

  const modifiersClassNames = {
    hasAppointments: "font-bold relative",
  };

  // Custom day component with dots and count
  const DayContent = (date: Date) => {
    const dayAppointments = getAppointmentsForDate(date);
    const count = dayAppointments.length;
    
    if (count === 0) return null;

    // Get unique statuses
    const statuses = [...new Set(dayAppointments.map(apt => apt.status))];

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex gap-0.5 mb-1">
          {statuses.slice(0, 3).map((status, i) => (
            <div key={i} className={cn("w-1 h-1 rounded-full", getStatusColor(status))} />
          ))}
        </div>
        {count > 0 && (
          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
            {count}
          </Badge>
        )}
      </div>
    );
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="grid md:grid-cols-[1fr_350px] gap-6 animate-fade-in">
      <Card className="p-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onSelectDate(date)}
          locale={ptBR}
          className="pointer-events-auto mx-auto"
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          components={{
            DayContent: ({ date }) => (
              <div className="relative w-full h-full flex items-center justify-center">
                <span>{date.getDate()}</span>
                {DayContent(date)}
              </div>
            ),
          }}
        />
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDateAppointments.length} agendamento{selectedDateAppointments.length !== 1 ? 's' : ''}
            </p>
          </div>
          {onCreateAppointment && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCreateAppointment(selectedDate)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Novo
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {selectedDateAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">
                  Nenhum agendamento neste dia
                </p>
                {onCreateAppointment && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onCreateAppointment(selectedDate)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Agendamento
                  </Button>
                )}
              </div>
            ) : (
              selectedDateAppointments
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((apt) => {
                  const startTime = new Date(apt.start_time);
                  const endTime = new Date(apt.end_time);
                  
                  return (
                    <AppointmentHoverCard key={apt.id} appointment={apt}>
                      <Card 
                        className="p-3 cursor-pointer hover:shadow-md transition-all border-l-4" 
                        onClick={() => onEditAppointment?.(apt)}
                        style={{ borderLeftColor: `var(--${apt.status})` }}>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{apt.title}</p>
                              <AppointmentStatusBadge status={apt.status} />
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                            </Badge>
                          </div>
                          {apt.clients && (
                            <p className="text-xs text-primary font-medium">
                              {apt.clients.name}
                            </p>
                          )}
                          {apt.appointment_type && (
                            <Badge variant="secondary" className="text-xs">
                              {apt.appointment_type}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    </AppointmentHoverCard>
                  );
                })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
