import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/types/appointments";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { cn } from "@/lib/utils";

interface AppointmentWeekViewProps {
  appointments: Appointment[];
  currentDate: Date;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

export function AppointmentWeekView({ appointments, currentDate }: AppointmentWeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDateTime = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptStart = new Date(apt.start_time);
      const aptHour = aptStart.getHours();
      
      return isSameDay(aptStart, date) && aptHour === hour;
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-card p-2"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="bg-card p-2 text-center">
              <div className="font-semibold text-sm">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div className={cn(
                "text-lg font-bold mt-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto",
                isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((hour) => (
            <>
              <div key={`time-${hour}`} className="bg-card p-2 text-sm text-muted-foreground text-right">
                {hour}:00
              </div>
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDateTime(day, hour);
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="bg-card p-1 min-h-[60px] hover:bg-accent/50 transition-colors"
                  >
                    {dayAppointments.map((apt) => {
                      const startTime = new Date(apt.start_time);
                      const endTime = new Date(apt.end_time);
                      
                      return (
                        <Card key={apt.id} className="p-2 mb-1 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="space-y-1">
                            <p className="text-xs font-medium truncate">{apt.title}</p>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                              </Badge>
                            </div>
                            {apt.clients && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                {apt.clients.name}
                              </p>
                            )}
                          </div>
                        </Card>
                      );
                    })}
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
