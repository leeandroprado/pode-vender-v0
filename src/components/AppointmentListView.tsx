import { AppointmentCard } from "./AppointmentCard";
import { AppointmentDialog } from "./AppointmentDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import type { Appointment } from "@/types/appointments";
import { useAppointments } from "@/hooks/useAppointments";

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

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
        <p className="text-sm text-muted-foreground mt-1">
          Crie um novo agendamento para começar
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onEdit={() => handleEdit(appointment)}
            onDelete={() => handleDelete(appointment.id)}
            onStatusChange={(status) => handleStatusChange(appointment, status)}
          />
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
