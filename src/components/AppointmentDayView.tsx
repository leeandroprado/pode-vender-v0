import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AppointmentHoverCard } from "./AppointmentHoverCard";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { format, isSameDay, isToday, getHours, getMinutes, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/types/appointments";
import { cn } from "@/lib/utils";
import { Plus, CalendarDays, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface AppointmentDayViewProps {
  appointments: Appointment[];
  selectedDate: Date;
  onSelectDate?: (date: Date) => void;
  onCreateAppointment?: (date: Date) => void;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

export function AppointmentDayView({ 
  appointments, 
  selectedDate,
  onSelectDate,
  onCreateAppointment 
}: AppointmentDayViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter(apt => {
      const aptStart = new Date(apt.start_time);
      const aptHour = aptStart.getHours();
      
      return aptHour === hour;
    });
  };

  // Check for overlapping appointments
  const hasConflict = (apt1: Appointment, apt2: Appointment) => {
    const start1 = new Date(apt1.start_time).getTime();
    const end1 = new Date(apt1.end_time).getTime();
    const start2 = new Date(apt2.start_time).getTime();
    const end2 = new Date(apt2.end_time).getTime();
    
    return (start1 < end2 && end1 > start2);
  };

  const getAppointmentTypeColor = (type: string | null) => {
    if (!type) return "from-blue-500/10 to-blue-500/5";
    const colors: Record<string, string> = {
      'consulta': 'from-blue-500/10 to-blue-500/5',
      'retorno': 'from-green-500/10 to-green-500/5',
      'exame': 'from-purple-500/10 to-purple-500/5',
      'procedimento': 'from-orange-500/10 to-orange-500/5',
    };
    return colors[type.toLowerCase()] || "from-blue-500/10 to-blue-500/5";
  };

  const handleSlotClick = (hour: number) => {
    if (onCreateAppointment) {
      const dateTime = new Date(selectedDate);
      dateTime.setHours(hour, 0, 0, 0);
      onCreateAppointment(dateTime);
    }
  };

  const showNowIndicator = (hour: number) => {
    if (!isToday(selectedDate)) return false;
    const currentHour = getHours(currentTime);
    return currentHour === hour;
  };

  const getNowIndicatorPosition = () => {
    const minutes = getMinutes(currentTime);
    return (minutes / 60) * 100;
  };

  const goToToday = () => {
    if (onSelectDate) {
      onSelectDate(new Date());
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6 animate-fade-in">
      {/* Main timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold capitalize">
              {format(selectedDate, "EEEE", { locale: ptBR })}
            </h2>
            <p className="text-muted-foreground">
              {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          </div>
          
          {!isToday(selectedDate) && onSelectDate && (
            <Button variant="outline" size="sm" onClick={goToToday}>
              <CalendarDays className="w-4 h-4 mr-2" />
              Voltar para Hoje
            </Button>
          )}
        </div>

        <div className="space-y-1">
          {timeSlots.map((hour) => {
            const hourAppointments = getAppointmentsForHour(hour);
            const hasNow = showNowIndicator(hour);
            
            return (
              <div key={hour} className="grid grid-cols-[100px_1fr] gap-4 group">
                <div className="text-sm font-semibold text-muted-foreground text-right pt-3">
                  {hour}:00
                </div>
                
                <div className={cn(
                  "relative min-h-[80px] border-l-2 pl-4 py-2 transition-colors",
                  hourAppointments.length === 0 && "hover:bg-accent/30 cursor-pointer border-border",
                  hourAppointments.length > 0 && "border-primary/20"
                )}
                onClick={() => hourAppointments.length === 0 && handleSlotClick(hour)}>
                  
                  {/* Now indicator */}
                  {hasNow && (
                    <div 
                      className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 animate-pulse"
                      style={{ top: `${getNowIndicatorPosition()}%` }}
                    >
                      <div className="absolute -left-2 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                      <span className="absolute left-4 -top-3 text-xs font-medium text-red-500">
                        Agora
                      </span>
                    </div>
                  )}

                  {/* Empty slot */}
                  {hourAppointments.length === 0 && onCreateAppointment && (
                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar agendamento
                      </Button>
                    </div>
                  )}

                  {/* Appointments */}
                  <div className="space-y-2 relative z-10">
                    {hourAppointments.map((apt, index) => {
                      const startTime = new Date(apt.start_time);
                      const endTime = new Date(apt.end_time);
                      const durationMinutes = differenceInMinutes(endTime, startTime);
                      const heightPercent = Math.min((durationMinutes / 60) * 100, 100);
                      
                      // Check for conflicts with other appointments
                      const conflicts = hourAppointments.filter(other => 
                        other.id !== apt.id && hasConflict(apt, other)
                      );

                      return (
                        <AppointmentHoverCard key={apt.id} appointment={apt}>
                          <Card 
                            className={cn(
                              "p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 relative overflow-hidden",
                              conflicts.length > 0 && "ring-2 ring-red-500/50"
                            )}
                            style={{ 
                              borderLeftColor: apt.status === 'completed' ? '#22c55e' : 
                                              apt.status === 'cancelled' ? '#ef4444' :
                                              apt.status === 'confirmed' ? '#3b82f6' : '#eab308',
                              minHeight: `${Math.max(heightPercent, 60)}px`
                            }}
                          >
                            {/* Background gradient by type */}
                            <div className={cn(
                              "absolute inset-0 bg-gradient-to-br opacity-50",
                              getAppointmentTypeColor(apt.appointment_type)
                            )} />

                            <div className="relative space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">{apt.title}</h3>
                                  {apt.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {apt.description}
                                    </p>
                                  )}
                                </div>
                                <AppointmentStatusBadge status={apt.status} />
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="outline" className="font-medium">
                                  {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                                </Badge>

                                {apt.clients && (
                                  <Badge variant="secondary" className="text-xs">
                                    {apt.clients.name}
                                  </Badge>
                                )}

                                {apt.appointment_type && (
                                  <Badge className="text-xs">
                                    {apt.appointment_type}
                                  </Badge>
                                )}

                                {conflicts.length > 0 && (
                                  <Badge variant="destructive" className="text-xs gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Conflito
                                  </Badge>
                                )}
                              </div>

                              {apt.location && (
                                <p className="text-xs text-muted-foreground">
                                  📍 {apt.location}
                                </p>
                              )}
                            </div>
                          </Card>
                        </AppointmentHoverCard>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini calendar sidebar */}
      {onSelectDate && (
        <div className="hidden lg:block">
          <Card className="p-4 sticky top-4">
            <h3 className="font-semibold mb-4 text-sm">Navegação Rápida</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onSelectDate(date)}
              locale={ptBR}
              className="rounded-md"
            />
          </Card>
        </div>
      )}
    </div>
  );
}
