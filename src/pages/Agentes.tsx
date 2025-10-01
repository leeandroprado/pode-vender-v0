import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, QrCode, Settings } from "lucide-react";

export default function Agentes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Agentes</h1>
          <p className="mt-2 text-muted-foreground">
            Configure e gerencie seus agentes de IA
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agente
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "Agente de Vendas",
            status: "Ativo",
            model: "GPT-4",
            conversations: 145,
            whatsapp: "Conectado",
          },
          {
            name: "Suporte Técnico",
            status: "Ativo",
            model: "GPT-3.5",
            conversations: 87,
            whatsapp: "Conectado",
          },
        ].map((agent, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.model}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WhatsApp</span>
                  <span className="font-medium">{agent.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conversas</span>
                  <span className="font-medium">{agent.conversations}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Settings className="h-4 w-4" />
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed transition-all hover:shadow-md hover:border-primary/50">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] gap-4">
            <div className="rounded-full bg-muted p-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Criar Novo Agente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure um novo agente de IA
              </p>
            </div>
            <Button variant="outline">Começar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
