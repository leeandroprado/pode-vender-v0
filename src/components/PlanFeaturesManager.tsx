import { useState } from "react";
import { usePlanFeatures, useSetFeatureValue, usePlanFeatureValues } from "@/hooks/usePlanFeatures";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlanFeaturesManagerProps {
  planId: string;
  planName: string;
}

export const PlanFeaturesManager = ({ planId, planName }: PlanFeaturesManagerProps) => {
  const { data: features, isLoading: featuresLoading } = usePlanFeatures();
  const { data: featureValues, isLoading: valuesLoading } = usePlanFeatureValues(planId);
  const setFeatureValue = useSetFeatureValue();
  const { toast } = useToast();

  const [values, setValues] = useState<Record<string, string>>({});

  const getValue = (featureId: string): string => {
    if (values[featureId] !== undefined) {
      return values[featureId];
    }
    
    const existingValue = featureValues?.find(v => v.feature_id === featureId);
    return existingValue?.value || '';
  };

  const handleValueChange = (featureId: string, value: string) => {
    setValues(prev => ({ ...prev, [featureId]: value }));
  };

  const handleSave = async (featureId: string) => {
    const value = values[featureId];
    if (value === undefined) return;

    await setFeatureValue.mutateAsync({
      planId,
      featureId,
      value,
    });

    toast({
      title: "Valor atualizado",
      description: "O valor da funcionalidade foi atualizado com sucesso.",
    });

    // Limpar do estado local após salvar
    setValues(prev => {
      const newValues = { ...prev };
      delete newValues[featureId];
      return newValues;
    });
  };

  const categoryLabels = {
    core: 'Funcionalidades Principais',
    limits: 'Limites',
    integrations: 'Integrações',
    support: 'Suporte',
  };

  const groupedFeatures = features?.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof features>);

  if (featuresLoading || valuesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedFeatures || {}).map(([category, categoryFeatures]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{categoryLabels[category as keyof typeof categoryLabels]}</CardTitle>
            <CardDescription>
              Configure os valores para o plano {planName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoryFeatures.map((feature) => {
                const currentValue = getValue(feature.id);
                const hasChanges = values[feature.id] !== undefined;

                return (
                  <div key={feature.id} className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-medium">{feature.name}</Label>
                        <Badge variant="outline" className="text-xs">
                          {feature.feature_key}
                        </Badge>
                      </div>
                      {feature.description && (
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {feature.feature_type === 'boolean' ? (
                        <Switch
                          checked={currentValue === 'true'}
                          onCheckedChange={(checked) => {
                            const newValue = checked ? 'true' : 'false';
                            handleValueChange(feature.id, newValue);
                            // Auto-save para booleans
                            setFeatureValue.mutate({
                              planId,
                              featureId: feature.id,
                              value: newValue,
                            });
                          }}
                        />
                      ) : feature.feature_type === 'numeric' ? (
                        <>
                          <Input
                            type="number"
                            value={currentValue}
                            onChange={(e) => handleValueChange(feature.id, e.target.value)}
                            placeholder="Ex: -1 (ilimitado)"
                            className="w-32"
                          />
                          {hasChanges && (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleSave(feature.id)}
                              disabled={setFeatureValue.isPending}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <Input
                            value={currentValue}
                            onChange={(e) => handleValueChange(feature.id, e.target.value)}
                            placeholder="Valor"
                            className="w-48"
                          />
                          {hasChanges && (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleSave(feature.id)}
                              disabled={setFeatureValue.isPending}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
