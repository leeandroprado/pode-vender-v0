import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Lock, CreditCard } from "lucide-react";

export default function Conta() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie suas informações e configurações
        </p>
      </div>

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
                  UD
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Alterar Foto</Button>
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou GIF. Máx 2MB</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue="Usuário Demo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="usuario@exemplo.com" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue="(11) 98765-4321" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" defaultValue="Meu Comércio Ltda" />
              </div>
            </div>

            <Button>Salvar Alterações</Button>
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
                <Button variant="outline" size="sm" className="w-full">
                  Alterar Senha
                </Button>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Autenticação em Dois Fatores</p>
                <Badge variant="outline" className="bg-muted">
                  Desativado
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Plano
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className="mb-2">Plano Profissional</Badge>
                <p className="text-2xl font-bold">R$ 99,00<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agentes</span>
                  <span className="font-medium">5 ativos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensagens/mês</span>
                  <span className="font-medium">10.000</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Gerenciar Plano
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
