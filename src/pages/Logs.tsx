import { useActivityLogs } from "@/hooks/useActivityLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const getLevelClass = (level: string) => {
  switch (level) {
    case 'info': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'warning': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'error': return 'bg-red-500/10 text-red-600 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
};

const LogsPage = () => {
  const { data: logs, isLoading, error } = useActivityLogs();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Logs de Atividade</h1>
      <Card>
        <CardHeader>
          <CardTitle>Últimas atividades registradas na sua organização</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Carregando logs...</p>}
          {error && <p className="text-destructive">Erro ao carregar logs: {error.message}</p>}
          <div className="space-y-4">
            {logs?.map(log => (
              <div key={log.id} className="flex items-start gap-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Badge className={getLevelClass(log.level)}>{log.level.toUpperCase()}</Badge>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{log.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                  </p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <pre className="mt-2 p-2 bg-muted/50 rounded-md text-xs overflow-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsPage;
