import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Carregando...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16", className)}>
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
