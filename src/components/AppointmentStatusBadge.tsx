import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/types/appointments";
import { Calendar, CheckCircle, XCircle, Clock, UserX } from "lucide-react";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<AppointmentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; className: string }> = {
  scheduled: {
    label: 'Agendado',
    variant: 'outline',
    icon: Calendar,
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  confirmed: {
    label: 'Confirmado',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  },
  cancelled: {
    label: 'Cancelado',
    variant: 'destructive',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  },
  completed: {
    label: 'Concluído',
    variant: 'secondary',
    icon: Clock,
    className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
  },
  no_show: {
    label: 'Faltou',
    variant: 'outline',
    icon: UserX,
    className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  },
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
