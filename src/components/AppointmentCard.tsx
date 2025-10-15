import { Card } from "@/components/ui/card";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, CheckCircle, XCircle, UserX, Clock, MapPin } from "lucide-react";
import type { Appointment } from "@/types/appointments";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Appointment['status']) => void;
}

export function AppointmentCard({ appointment, onEdit, onDelete, onStatusChange }: AppointmentCardProps) {
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  const now = new Date();
  
  // Status indicators
  const statusColors = {
    pending: "border-l-yellow-500",
    confirmed: "border-l-blue-500",
    completed: "border-l-green-500",
    cancelled: "border-l-red-500",
    no_show: "border-l-gray-500",
  };

  // Time indicators
  const getTimeIndicator = () => {
    if (isPast(endTime)) return null;
    if (isFuture(startTime)) {
      const distance = formatDistanceToNow(startTime, { locale: ptBR, addSuffix: true });
      return <Badge variant="outline" className="text-xs">{distance}</Badge>;
    }
    return <Badge className="text-xs bg-green-500">Em andamento</Badge>;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={cn(
      "p-4 hover:shadow-md transition-all border-l-4",
      statusColors[appointment.status]
    )}>
      <div className="flex items-start gap-4">
        {/* Client Avatar */}
        {appointment.clients && (
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(appointment.clients.name)}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Title and Status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate mb-1">
                {appointment.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <AppointmentStatusBadge status={appointment.status} />
                {getTimeIndicator()}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">
                {format(startTime, "d 'de' MMM, yyyy", { locale: ptBR })}
              </span>
              <span>•</span>
              <span>
                {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
              </span>
            </div>

            {appointment.clients && (
              <p className="text-primary font-medium">
                {appointment.clients.name}
              </p>
            )}

            {appointment.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{appointment.location}</span>
              </div>
            )}

            {appointment.appointment_type && (
              <Badge variant="secondary" className="text-xs">
                {appointment.appointment_type}
              </Badge>
            )}
          </div>

          {appointment.description && (
            <p className="text-sm text-foreground/80 line-clamp-2">
              {appointment.description}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <TooltipProvider>
            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onStatusChange('completed')}
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Concluir</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onEdit}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>

            {appointment.status !== 'cancelled' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onStatusChange('cancelled')}
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cancelar</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
}
