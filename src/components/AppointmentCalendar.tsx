import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/types/appointments";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function AppointmentCalendar({ appointments, selectedDate, onSelectDate }: AppointmentCalendarProps) {
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.start_time), date)
    );
  };

  const modifiers = {
    hasAppointments: (date: Date) => getAppointmentsForDate(date).length > 0,
  };

  const modifiersClassNames = {
    hasAppointments: "bg-primary/10 font-bold",
  };

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-6">
      <Card className="p-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onSelectDate(date)}
          locale={ptBR}
          className="pointer-events-auto mx-auto"
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
        />
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
        </h3>

        <div className="space-y-2">
          {getAppointmentsForDate(selectedDate).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento neste dia
            </p>
          ) : (
            getAppointmentsForDate(selectedDate).map((apt) => {
              const startTime = new Date(apt.start_time);
              const endTime = new Date(apt.end_time);
              
              return (
                <Card key={apt.id} className="p-3">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{apt.title}</p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                      </Badge>
                    </div>
                    {apt.clients && (
                      <p className="text-xs text-muted-foreground">
                        {apt.clients.name}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
