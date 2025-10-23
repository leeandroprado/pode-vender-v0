import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Clock } from "lucide-react";

export const TrialBanner = () => {
  const { isInTrial, trialDaysLeft } = useSubscription();
  const navigate = useNavigate();

  if (!isInTrial) return null;

  return (
    <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-4">
      <Clock className="h-4 w-4 text-amber-600" />
      <AlertTitle>Período de Teste</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          Você tem {trialDaysLeft} dia{trialDaysLeft !== 1 ? 's' : ''} restante{trialDaysLeft !== 1 ? 's' : ''} no seu trial gratuito.
        </span>
        <Button 
          variant="link" 
          size="sm"
          className="p-0 h-auto text-amber-600 hover:text-amber-700" 
          onClick={() => navigate('/planos')}
        >
          Ver planos →
        </Button>
      </AlertDescription>
    </Alert>
  );
};
