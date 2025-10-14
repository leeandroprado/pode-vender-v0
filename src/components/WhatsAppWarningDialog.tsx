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
import { useNavigate } from "react-router-dom";

interface WhatsAppWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppWarningDialog({ open, onOpenChange }: WhatsAppWarningDialogProps) {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>WhatsApp não conectado</AlertDialogTitle>
          <AlertDialogDescription>
            Para enviar convites via WhatsApp, você precisa conectar um número primeiro.
            Deseja ir para a página de Agentes agora?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => navigate('/agentes')}>
            Ir para Agentes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
