import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppointmentHoverCard } from "./AppointmentHoverCard";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { format, addDays, startOfWeek, isSameDay, isToday, getHours, getMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/types/appointments";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface AppointmentWeekViewProps {
  appointments: Appointment[];
  currentDate: Date;
  onCreateAppointment?: (date: Date) => void;
  onEditAppointment?: (appointment: Appointment) => void;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

export function AppointmentWeekView({ appointments, currentDate, onCreateAppointment, onEditAppointment }: AppointmentWeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getAppointmentsForDateTime = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptStart = new Date(apt.start_time);
      const aptHour = aptStart.getHours();
      
      return isSameDay(aptStart, date) && aptHour === hour;
    });
  };

  // Get time slot background gradient
  const getTimeSlotGradient = (hour: number) => {
    if (hour >= 7 && hour < 12) return "bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-950/10";
    if (hour >= 12 && hour < 18) return "bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-950/10";
    return "bg-gradient-to-b from-purple-50/30 to-transparent dark:from-purple-950/10";
  };

  const handleSlotClick = (day: Date, hour: number) => {
    if (onCreateAppointment) {
      const dateTime = new Date(day);
      dateTime.setHours(hour, 0, 0, 0);
      onCreateAppointment(dateTime);
    }
  };

  // Check if we should show the "now" indicator
  const showNowIndicator = (day: Date, hour: number) => {
    if (!isToday(day)) return false;
    const currentHour = getHours(currentTime);
    return currentHour === hour;
  };

  const getNowIndicatorPosition = () => {
    const minutes = getMinutes(currentTime);
    return (minutes / 60) * 100; // percentage within the hour
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-card p-3"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="bg-card p-3 text-center">
              <div className="font-semibold text-sm capitalize">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div className={cn(
                "text-lg font-bold mt-1 rounded-full w-9 h-9 flex items-center justify-center mx-auto transition-colors",
                isToday(day) && "bg-primary text-primary-foreground"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((hour) => (
            <>
              <div key={`time-${hour}`} className="bg-card p-3 text-sm text-muted-foreground text-right font-medium">
                {hour}:00
              </div>
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDateTime(day, hour);
                const hasNowIndicator = showNowIndicator(day, hour);
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={cn(
                      "relative p-2 min-h-[80px] transition-colors group",
                      getTimeSlotGradient(hour),
                      dayAppointments.length === 0 && "hover:bg-accent/30 cursor-pointer"
                    )}
                    onClick={() => dayAppointments.length === 0 && handleSlotClick(day, hour)}
                  >
                    {/* Now indicator line */}
                    {hasNowIndicator && (
                      <div 
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-10 animate-pulse"
                        style={{ top: `${getNowIndicatorPosition()}%` }}
                      >
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                      </div>
                    )}

                    {/* Empty slot hover */}
                    {dayAppointments.length === 0 && onCreateAppointment && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Appointments */}
                    <div className="space-y-1 relative z-20">
                      {dayAppointments.map((apt) => {
                        const startTime = new Date(apt.start_time);
                        const endTime = new Date(apt.end_time);
                        
                        return (
                          <AppointmentHoverCard key={apt.id} appointment={apt}>
                            <Card 
                              className="p-2 cursor-pointer hover:shadow-lg transition-all border-l-2"
                              onClick={() => onEditAppointment?.(apt)}
                              style={{ 
                                borderLeftColor: apt.status === 'completed' ? '#22c55e' : 
                                                apt.status === 'cancelled' ? '#ef4444' :
                                                apt.status === 'confirmed' ? '#3b82f6' : '#eab308'
                              }}>
                              <div className="space-y-1">
                                <p className="text-xs font-semibold truncate leading-tight">{apt.title}</p>
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                  {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                                </Badge>
                                {apt.clients && (
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {apt.clients.name}
                                  </p>
                                )}
                              </div>
                            </Card>
                          </AppointmentHoverCard>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
