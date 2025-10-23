import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FeatureGuard } from '@/components/FeatureGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Trash2, Eye, EyeOff, Calendar, Clock } from 'lucide-react';
import { useApiTokens } from '@/hooks/useApiTokens';
import { CreateTokenDialog } from '@/components/CreateTokenDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ApiTokens() {
  return (
    <DashboardLayout>
      <FeatureGuard feature="api_access">
        <ApiTokensContent />
      </FeatureGuard>
    </DashboardLayout>
  );
}

function ApiTokensContent() {
  const { tokens, isLoading, deleteToken } = useApiTokens();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());

  const toggleTokenVisibility = (tokenId: string) => {
    setRevealedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId);
      } else {
        newSet.add(tokenId);
      }
      return newSet;
    });
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Token copiado!');
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja revogar o token "${name}"?`)) {
      await deleteToken.mutateAsync(id);
      toast.success('Token revogado com sucesso');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Tokens</h1>
          <p className="text-muted-foreground">
            Gerencie tokens de acesso para integrações externas
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Token
        </Button>
      </div>

      <div className="grid gap-4">
        {tokens?.map((token) => (
          <Card key={token.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {token.name}
                    {token.is_active ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{token.description}</CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(token.id, token.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token */}
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  {revealedTokens.has(token.id)
                    ? token.token
                    : '•'.repeat(40)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTokenVisibility(token.id)}
                >
                  {revealedTokens.has(token.id) ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToken(token.token)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Scopes */}
              <div className="flex flex-wrap gap-2">
                {token.scopes.map((scope) => (
                  <Badge key={scope} variant="outline">
                    {scope}
                  </Badge>
                ))}
              </div>

              {/* Metadados */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Criado {format(new Date(token.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
                {token.last_used_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Último uso {format(new Date(token.last_used_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {tokens?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum token criado ainda. Crie seu primeiro token para começar a usar a API.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateTokenDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
