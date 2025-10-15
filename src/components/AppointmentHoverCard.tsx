import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin, User } from "lucide-react";
import type { Appointment } from "@/types/appointments";

interface AppointmentHoverCardProps {
  appointment: Appointment;
  children: React.ReactNode;
}

export function AppointmentHoverCard({ appointment, children }: AppointmentHoverCardProps) {
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{appointment.title}</h4>
            <AppointmentStatusBadge status={appointment.status} />
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
              </span>
            </div>

            {appointment.clients && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{appointment.clients.name}</span>
              </div>
            )}

            {appointment.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{appointment.location}</span>
              </div>
            )}
          </div>

          {appointment.description && (
            <p className="text-sm text-foreground/80 border-t pt-2">
              {appointment.description}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
