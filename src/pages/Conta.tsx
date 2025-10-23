import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CreditCard, Loader2, AlertCircle, Calendar } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Conta() {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { subscription, isLoading: subscriptionLoading, isInTrial, trialDaysLeft } = useSubscription();
  
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Atualizar nome quando profile carregar
  useState(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await updateProfile.mutateAsync({ full_name: fullName });
    setIsSaving(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "trial":
        return "secondary";
      case "expired":
      case "blocked":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "trial":
        return "Trial";
      case "expired":
        return "Expirado";
      case "blocked":
        return "Bloqueado";
      case "canceled":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (profileLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie suas informações e configurações
        </p>
      </div>

      {isInTrial && trialDaysLeft <= 3 && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            Seu período de teste expira em {trialDaysLeft} dia{trialDaysLeft !== 1 ? 's' : ''}. 
            <Button variant="link" className="p-0 h-auto ml-1 text-amber-600" onClick={() => navigate('/planos')}>
              Escolha um plano →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize seus dados de perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {getInitials(profile?.full_name || null)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Upload de avatar em breve</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  value={fullName || profile?.full_name || ""} 
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile?.email || ""} 
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Para alterar o email, entre em contato com o suporte
                </p>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Senha</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold">{subscription.plan.name}</p>
                      <Badge variant={getStatusBadgeVariant(subscription.status)} className="mt-1">
                        {getStatusLabel(subscription.status)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        R$ {subscription.plan.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{subscription.plan.billing_cycle === 'MONTHLY' ? 'mês' : 'ano'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {isInTrial && subscription.trial_ends_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Trial expira em {format(new Date(subscription.trial_ends_at), "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}

                  {!isInTrial && subscription.current_period_end && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Renova em {format(new Date(subscription.current_period_end), "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2 text-sm">
                    {subscription.plan.features.max_agents && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agentes</span>
                        <span className="font-medium">
                          {subscription.plan.features.max_agents === -1 
                            ? 'Ilimitado' 
                            : subscription.plan.features.max_agents}
                        </span>
                      </div>
                    )}
                    {subscription.plan.features.max_conversations_month && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversas/mês</span>
                        <span className="font-medium">
                          {subscription.plan.features.max_conversations_month === -1 
                            ? 'Ilimitado' 
                            : subscription.plan.features.max_conversations_month.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                    {subscription.plan.features.max_messages_month && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mensagens/mês</span>
                        <span className="font-medium">
                          {subscription.plan.features.max_messages_month === -1 
                            ? 'Ilimitado' 
                            : subscription.plan.features.max_messages_month.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/planos')}
                  >
                    Gerenciar Plano
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Nenhuma assinatura ativa
                  </p>
                  <Button size="sm" onClick={() => navigate('/planos')}>
                    Ver Planos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ChangePasswordDialog 
        open={passwordDialogOpen} 
        onOpenChange={setPasswordDialogOpen} 
      />
    </div>
  );
}
