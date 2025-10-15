import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TeamMember } from "@/hooks/useTeamMembers";

interface DeleteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  onDelete: (userId: string) => void;
  isDeleting: boolean;
}

export function DeleteTeamMemberDialog({
  open,
  onOpenChange,
  member,
  onDelete,
  isDeleting,
}: DeleteTeamMemberDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar Usuário?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é irreversível. Todas as conversas, dados e configurações de{" "}
            <strong>{member.full_name || member.email}</strong> serão permanentemente
            removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(member.id)}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deletando..." : "Deletar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
