import { AppointmentCard } from "./AppointmentCard";
import { AppointmentDialog } from "./AppointmentDialog";
import { AppointmentEmptyState } from "./AppointmentEmptyState";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import type { Appointment } from "@/types/appointments";
import { useAppointments } from "@/hooks/useAppointments";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentListViewProps {
  appointments: Appointment[];
}

export function AppointmentListView({ appointments }: AppointmentListViewProps) {
  const { updateAppointment, deleteAppointment } = useAppointments();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStatusChange = (appointment: Appointment, status: Appointment['status']) => {
    updateAppointment.mutate({
      id: appointment.id,
      status,
    });
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteAppointment.mutate(deletingId);
      setDeletingId(null);
    }
  };

  // Group appointments by date
  const groupAppointmentsByDate = () => {
    const groups: { [key: string]: { label: string; appointments: Appointment[] } } = {};
    
    appointments.forEach(apt => {
      const date = new Date(apt.start_time);
      let groupKey: string;
      let groupLabel: string;
      
      if (isToday(date)) {
        groupKey = 'today';
        groupLabel = 'Hoje';
      } else if (isTomorrow(date)) {
        groupKey = 'tomorrow';
        groupLabel = 'Amanhã';
      } else if (isThisWeek(date)) {
        groupKey = 'this-week';
        groupLabel = 'Esta Semana';
      } else {
        groupKey = format(date, 'yyyy-MM-dd');
        groupLabel = format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = { label: groupLabel, appointments: [] };
      }
      groups[groupKey].appointments.push(apt);
    });
    
    return Object.values(groups);
  };

  if (appointments.length === 0) {
    return <AppointmentEmptyState />;
  }

  const groupedAppointments = groupAppointmentsByDate();

  return (
    <>
      <div className="space-y-6">
        {groupedAppointments.map((group, index) => (
          <div key={index} className="space-y-3">
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 border-b">
              <h3 className="font-semibold text-lg">{group.label}</h3>
              <p className="text-sm text-muted-foreground">
                {group.appointments.length} agendamento{group.appointments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="space-y-3">
              {group.appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={() => handleEdit(appointment)}
                  onDelete={() => handleDelete(appointment.id)}
                  onStatusChange={(status) => handleStatusChange(appointment, status)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <AppointmentDialog
        open={!!editingAppointment}
        onOpenChange={(open) => !open && setEditingAppointment(undefined)}
        appointment={editingAppointment}
        onSubmit={(data) => {
          if (editingAppointment) {
            updateAppointment.mutate({ id: editingAppointment.id, ...data });
          }
        }}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
