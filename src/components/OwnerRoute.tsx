import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "./ui/skeleton";

interface OwnerRouteProps {
  children: ReactNode;
}

export function OwnerRoute({ children }: OwnerRouteProps) {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="container mx-auto p-8 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
