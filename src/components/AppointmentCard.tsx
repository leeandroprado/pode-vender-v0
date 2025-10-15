import { Card } from "@/components/ui/card";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, CheckCircle, XCircle, UserX } from "lucide-react";
import type { Appointment } from "@/types/appointments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Appointment['status']) => void;
}

export function AppointmentCard({ appointment, onEdit, onDelete, onStatusChange }: AppointmentCardProps) {
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground truncate">{appointment.title}</h3>
            <AppointmentStatusBadge status={appointment.status} />
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="font-medium">
                {format(startTime, "d 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
              <span>•</span>
              <span>
                {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
              </span>
            </p>

            {appointment.clients && (
              <p className="text-primary">
                Cliente: {appointment.clients.name}
              </p>
            )}

            {appointment.appointment_type && (
              <p>Tipo: {appointment.appointment_type}</p>
            )}

            {appointment.location && (
              <p>Local: {appointment.location}</p>
            )}

            {appointment.description && (
              <p className="text-foreground/80 mt-2">{appointment.description}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>

            {appointment.status !== 'confirmed' && appointment.status !== 'cancelled' && (
              <DropdownMenuItem onClick={() => onStatusChange('confirmed')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar
              </DropdownMenuItem>
            )}

            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluir
              </DropdownMenuItem>
            )}

            {appointment.status !== 'no_show' && appointment.status !== 'cancelled' && (
              <DropdownMenuItem onClick={() => onStatusChange('no_show')}>
                <UserX className="w-4 h-4 mr-2" />
                Marcar como Falta
              </DropdownMenuItem>
            )}

            {appointment.status !== 'cancelled' && (
              <DropdownMenuItem onClick={() => onStatusChange('cancelled')}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
