import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { SystemSettingField } from '@/components/SystemSettingField';
import { Loader2, Settings2, Webhook, Link2 } from 'lucide-react';

export default function SystemSettings() {
  const { settings, loading, updateSetting } = useSystemSettings('apizap');

  const endpointSettings = settings.filter(s => 
    s.setting_key.includes('url') || s.setting_key.includes('endpoint') || s.setting_key === 'api_timeout'
  );

  const instanceSettings = settings.filter(s => 
    !s.setting_key.includes('webhook') && 
    !s.setting_key.includes('url') && 
    !s.setting_key.includes('endpoint') &&
    s.setting_key !== 'api_timeout'
  );

  const webhookSettings = settings.filter(s => s.setting_key.includes('webhook'));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações globais do sistema e integrações
          </p>
        </div>

        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList>
            <TabsTrigger value="endpoints" className="gap-2">
              <Link2 className="h-4 w-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="instance" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Instâncias
            </TabsTrigger>
            <TabsTrigger value="webhook" className="gap-2">
              <Webhook className="h-4 w-4" />
              Webhook
            </TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Endpoints ApiZap</CardTitle>
                <CardDescription>
                  Configure as URLs base e endpoints da API ApiZap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {endpointSettings.map((setting) => (
                  <SystemSettingField
                    key={setting.id}
                    setting={setting}
                    onUpdate={updateSetting}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Padrão de Instâncias</CardTitle>
                <CardDescription>
                  Configure os valores padrão para novas instâncias do WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {instanceSettings.map((setting) => (
                  <SystemSettingField
                    key={setting.id}
                    setting={setting}
                    onUpdate={updateSetting}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Webhook</CardTitle>
                <CardDescription>
                  Configure o webhook para integração com n8n e outros serviços
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhookSettings.map((setting) => (
                  <SystemSettingField
                    key={setting.id}
                    setting={setting}
                    onUpdate={updateSetting}
                  />
                ))}
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Exemplo de Payload Webhook</h4>
                  <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`{
  "event": "message.received",
  "instanceId": "uuid",
  "data": {
    "from": "5515999999999",
    "message": "Olá!",
    "timestamp": "2025-01-01T00:00:00Z"
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
