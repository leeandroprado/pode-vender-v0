import { useState } from "react";
import { usePlanFeatures, useCreateFeature, useUpdateFeature, PlanFeature } from "@/hooks/usePlanFeatures";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Settings2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";

const categoryLabels = {
  core: 'Funcionalidade Principal',
  limits: 'Limite',
  integrations: 'Integração',
  support: 'Suporte',
};

const typeLabels = {
  boolean: 'Sim/Não',
  numeric: 'Número',
  text: 'Texto',
};

export default function GerenciarFuncionalidades() {
  const navigate = useNavigate();
  const { data: features, isLoading } = usePlanFeatures();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<PlanFeature | null>(null);

  const createFeature = useCreateFeature();
  const updateFeature = useUpdateFeature();

  const { register, handleSubmit, reset, setValue, watch } = useForm<{
    feature_key: string;
    name: string;
    description: string;
    category: 'core' | 'limits' | 'integrations' | 'support';
    feature_type: 'boolean' | 'numeric' | 'text';
    default_value: string;
    display_order: number;
    is_active: boolean;
  }>({
    defaultValues: {
      feature_key: '',
      name: '',
      description: '',
      category: 'core',
      feature_type: 'boolean',
      default_value: '',
      display_order: 0,
      is_active: true,
    },
  });

  const handleCreateFeature = () => {
    setSelectedFeature(null);
    reset({
      feature_key: '',
      name: '',
      description: '',
      category: 'core',
      feature_type: 'boolean',
      default_value: '',
      display_order: 0,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleEditFeature = (feature: PlanFeature) => {
    setSelectedFeature(feature);
    reset({
      feature_key: feature.feature_key,
      name: feature.name,
      description: feature.description || '',
      category: feature.category,
      feature_type: feature.feature_type,
      default_value: feature.default_value || '',
      display_order: feature.display_order,
      is_active: feature.is_active,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    if (selectedFeature) {
      await updateFeature.mutateAsync({ id: selectedFeature.id, ...data });
    } else {
      await createFeature.mutateAsync(data);
    }
    setDialogOpen(false);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'core':
        return 'bg-blue-500/10 text-blue-500';
      case 'limits':
        return 'bg-orange-500/10 text-orange-500';
      case 'integrations':
        return 'bg-purple-500/10 text-purple-500';
      case 'support':
        return 'bg-green-500/10 text-green-500';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/gerenciar-planos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Funcionalidades</h1>
            <p className="text-muted-foreground">Catálogo de funcionalidades disponíveis para os planos</p>
          </div>
        </div>
        <Button onClick={handleCreateFeature}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Funcionalidade
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : features && features.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {feature.feature_key}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditFeature(feature)}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className={getCategoryBadgeColor(feature.category)}>
                    {categoryLabels[feature.category]}
                  </Badge>
                  <Badge variant="outline">
                    {typeLabels[feature.feature_type]}
                  </Badge>
                </div>
              </CardHeader>
              {feature.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma funcionalidade cadastrada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando a primeira funcionalidade
            </p>
            <Button onClick={handleCreateFeature}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Funcionalidade
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {selectedFeature ? 'Editar Funcionalidade' : 'Nova Funcionalidade'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes da funcionalidade que será atribuída aos planos
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feature_key">Chave (Identificador)</Label>
                  <Input
                    id="feature_key"
                    placeholder="ex: max_products"
                    {...register('feature_key', { required: true })}
                    disabled={!!selectedFeature}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="ex: Máximo de Produtos"
                    {...register('name', { required: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que esta funcionalidade faz"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={watch('category')}
                    onValueChange={(value: any) => setValue('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="core">Funcionalidade Principal</SelectItem>
                      <SelectItem value="limits">Limite</SelectItem>
                      <SelectItem value="integrations">Integração</SelectItem>
                      <SelectItem value="support">Suporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feature_type">Tipo</Label>
                  <Select
                    value={watch('feature_type')}
                    onValueChange={(value: any) => setValue('feature_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean">Sim/Não</SelectItem>
                      <SelectItem value="numeric">Número</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_value">Valor Padrão</Label>
                  <Input
                    id="default_value"
                    placeholder="ex: 0, false, -1"
                    {...register('default_value')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Ordem de Exibição</Label>
                  <Input
                    id="display_order"
                    type="number"
                    {...register('display_order', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <Label htmlFor="is_active">Funcionalidade ativa</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createFeature.isPending || updateFeature.isPending}>
                {selectedFeature ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
