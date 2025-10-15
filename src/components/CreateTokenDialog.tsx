import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useApiTokens } from '@/hooks/useApiTokens';
import { toast } from 'sonner';

const AVAILABLE_SCOPES = [
  { value: 'read:appointments', label: 'Ler Agendamentos' },
  { value: 'write:appointments', label: 'Criar/Editar Agendamentos' },
  { value: 'read:clients', label: 'Ler Clientes' },
  { value: 'write:clients', label: 'Criar/Editar Clientes' },
  { value: 'read:products', label: 'Ler Produtos' },
  { value: 'write:products', label: 'Criar/Editar Produtos' },
  { value: 'read:agendas', label: 'Ler Agendas' },
  { value: 'admin:all', label: 'Acesso Total (Admin)' },
];

interface CreateTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTokenDialog({ open, onOpenChange }: CreateTokenDialogProps) {
  const { createToken } = useApiTokens();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scopes: [] as string[],
    rate_limit_per_minute: 60,
  });

  const handleSubmit = async () => {
    if (!formData.name || formData.scopes.length === 0) {
      toast.error('Preencha o nome e selecione pelo menos um escopo');
      return;
    }

    try {
      await createToken.mutateAsync(formData);
      toast.success('Token criado com sucesso!');
      onOpenChange(false);
      setFormData({ name: '', description: '', scopes: [], rate_limit_per_minute: 60 });
    } catch (error) {
      toast.error('Erro ao criar token');
      console.error(error);
    }
  };

  const toggleScope = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Token de API</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nome do Token*</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Bot WhatsApp"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Para que será usado este token?"
            />
          </div>

          <div>
            <Label>Permissões*</Label>
            <div className="space-y-2 mt-2">
              {AVAILABLE_SCOPES.map((scope) => (
                <div key={scope.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.scopes.includes(scope.value)}
                    onCheckedChange={() => toggleScope(scope.value)}
                  />
                  <label className="text-sm cursor-pointer" onClick={() => toggleScope(scope.value)}>
                    {scope.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Rate Limit (req/min)</Label>
            <Input
              type="number"
              value={formData.rate_limit_per_minute}
              onChange={(e) => setFormData(prev => ({ ...prev, rate_limit_per_minute: parseInt(e.target.value) }))}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={createToken.isPending}>
            {createToken.isPending ? 'Criando...' : 'Criar Token'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
