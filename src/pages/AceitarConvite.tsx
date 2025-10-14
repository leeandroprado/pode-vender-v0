import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function AceitarConvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast({
        title: "Link inválido",
        description: "Token de convite não encontrado.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    try {
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (error || !data) {
        toast({
          title: "Convite inválido",
          description: "Este convite não existe ou já foi utilizado.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Verificar expiração
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        toast({
          title: "Convite expirado",
          description: "Este convite expirou. Solicite um novo convite.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      setInviteData(data);
      setLoading(false);
    } catch (error: any) {
      console.error("Erro ao validar convite:", error);
      toast({
        title: "Erro",
        description: "Erro ao validar convite.",
        variant: "destructive",
      });
      navigate("/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Criar conta
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: inviteData.email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // Atualizar role do usuário (usando service role via edge function)
      const { error: roleError } = await supabase.functions.invoke('update-role-from-invite', {
        body: { token, userId: signUpData.user.id },
      });

      if (roleError) {
        console.error('Erro ao atualizar role:', roleError);
        // Não lançar erro aqui, pois a conta já foi criada
      }

      // Aguardar um momento para o processo completar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Atualizar convite para aceito (já feito pela edge function, mas garantir)
      const { error: updateError } = await supabase
        .from("invites")
        .update({ 
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("token", token);

      if (updateError) {
        console.error("Erro ao atualizar convite:", updateError);
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado para fazer login.",
      });

      // Redirecionar para login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao aceitar convite:", error);
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    user: "Usuário",
    vendedor: "Vendedor",
    moderator: "Moderador",
    admin: "Administrador",
    super_admin: "Super Administrador",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <CardTitle>Aceitar Convite</CardTitle>
          </div>
          <CardDescription>
            Você foi convidado para fazer parte da equipe como{" "}
            <strong>{roleLabels[inviteData.role] || inviteData.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={inviteData.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Aceitar Convite e Criar Conta"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
