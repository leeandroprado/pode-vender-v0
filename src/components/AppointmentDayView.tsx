import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/types/appointments";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";

interface AppointmentDayViewProps {
  appointments: Appointment[];
  selectedDate: Date;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

export function AppointmentDayView({ appointments, selectedDate }: AppointmentDayViewProps) {
  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter(apt => {
      const aptStart = new Date(apt.start_time);
      const aptHour = aptStart.getHours();
      
      return aptHour === hour;
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {format(selectedDate, "EEEE", { locale: ptBR })}
        </h2>
        <p className="text-muted-foreground">
          {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
        </p>
      </div>

      <div className="space-y-2">
        {timeSlots.map((hour) => {
          const hourAppointments = getAppointmentsForHour(hour);
          
          return (
            <div key={hour} className="grid grid-cols-[80px_1fr] gap-4">
              <div className="text-sm font-medium text-muted-foreground text-right pt-2">
                {hour}:00
              </div>
              
              <div className="space-y-2 min-h-[60px] border-l-2 border-border pl-4">
                {hourAppointments.length === 0 ? (
                  <div className="h-full flex items-center">
                    <p className="text-sm text-muted-foreground">Sem agendamentos</p>
                  </div>
                ) : (
                  hourAppointments.map((apt) => {
                    const startTime = new Date(apt.start_time);
                    const endTime = new Date(apt.end_time);
                    
                    return (
                      <Card key={apt.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="space-y-2">
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

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                            </Badge>

                            {apt.clients && (
                              <>
                                <span>•</span>
                                <span className="text-primary">{apt.clients.name}</span>
                              </>
                            )}

                            {apt.appointment_type && (
                              <>
                                <span>•</span>
                                <span>{apt.appointment_type}</span>
                              </>
                            )}

                            {apt.location && (
                              <>
                                <span>•</span>
                                <span>{apt.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
