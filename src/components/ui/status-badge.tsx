import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-primary/10 text-primary border-primary/20",
  neutral: "bg-muted text-muted-foreground border-muted",
};

export const StatusBadge = ({ variant, children, className }: StatusBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(variantStyles[variant], className)}
    >
      {children}
    </Badge>
  );
};

// Helper para mapear status de conversas
export const getConversationStatusVariant = (status: string): StatusVariant => {
  switch (status) {
    case "open":
      return "success";
    case "waiting":
      return "warning";
    case "closed":
      return "neutral";
    default:
      return "neutral";
  }
};

// Helper para mapear status de produtos
export const getProductStatusVariant = (status: string): StatusVariant => {
  switch (status) {
    case "ativo":
      return "success";
    case "baixo_estoque":
      return "warning";
    case "esgotado":
      return "error";
    case "inativo":
      return "neutral";
    default:
      return "neutral";
  }
};

// Helper para mapear status de agentes
export const getAgentStatusVariant = (status: string): StatusVariant => {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "neutral";
    case "training":
      return "warning";
    default:
      return "neutral";
  }
};

// Helper para mapear status de WhatsApp
export const getWhatsAppStatusVariant = (status: string): StatusVariant => {
  switch (status) {
    case "connected":
    case "open":
      return "success";
    case "connecting":
      return "warning";
    case "disconnected":
    case "error":
      return "error";
    default:
      return "neutral";
  }
};
