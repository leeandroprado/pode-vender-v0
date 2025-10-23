import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";

interface FeatureGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export const FeatureGuard = ({ 
  feature, 
  children, 
  fallback,
  showUpgrade = true 
}: FeatureGuardProps) => {
  const { hasFeature } = useSubscription();
  const navigate = useNavigate();

  if (!hasFeature(feature)) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="p-4 border border-dashed rounded-lg bg-muted/50 text-center">
        <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Esta funcionalidade não está disponível no seu plano atual.
        </p>
        {showUpgrade && (
          <Button 
            variant="link" 
            size="sm"
            onClick={() => navigate('/planos')}
          >
            Fazer upgrade →
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
