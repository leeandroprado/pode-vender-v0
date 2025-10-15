import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiDocsNavigation } from "@/components/api-docs/ApiDocsNavigation";
import { ApiEndpointCard } from "@/components/api-docs/ApiEndpointCard";
import { ApiParameterTable } from "@/components/api-docs/ApiParameterTable";
import { ApiResponseExample } from "@/components/api-docs/ApiResponseExample";
import { CodeBlock } from "@/components/api-docs/CodeBlock";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const BASE_URL = "https://tefidquitahjjxpeowzt.supabase.co/functions/v1";

const navSections = [
  { id: "introduction", title: "Introdução" },
  { id: "authentication", title: "Autenticação" },
  {
    id: "appointments",
    title: "Agendamentos",
    items: [
      { id: "available-slots", title: "Consultar Horários" },
      { id: "create-appointment", title: "Criar Agendamento" },
    ],
  },
];

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState("introduction");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-card p-6 hidden lg:block">
        <h2 className="text-lg font-semibold mb-4">API Documentation</h2>
        <ApiDocsNavigation
          sections={navSections}
          activeSection={activeSection}
          onNavigate={scrollToSection}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 max-w-4xl">
        {/* Introduction */}
        <section id="introduction" className="mb-12">
          <h1 className="text-4xl font-bold mb-4">API Pode Vender</h1>
          <p className="text-lg text-muted-foreground mb-6">
            API RESTful para integração com o sistema de agendamentos Pode Vender. Permite consultar
            horários disponíveis e criar agendamentos programaticamente.
          </p>

          <div className="grid gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Base URL</h3>
              <code className="block bg-muted p-3 rounded-md text-sm">{BASE_URL}</code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Versão</h3>
              <Badge>v1</Badge>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Todos os endpoints requerem autenticação via Bearer Token. Você pode gerar tokens na página{" "}
              <a href="/api-tokens" className="underline">
                API Tokens
              </a>
              .
            </AlertDescription>
          </Alert>
        </section>

        {/* Authentication */}
        <section id="authentication" className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Autenticação</h2>
          <p className="text-muted-foreground mb-6">
            A API utiliza Bearer Token para autenticação. Inclua o token no header Authorization de
            todas as requisições.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Formato do Header</h3>
              <CodeBlock
                code="Authorization: Bearer YOUR_API_TOKEN_HERE"
                language="bash"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Escopos Disponíveis</h3>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">read:appointments</Badge>
                  <span className="text-sm text-muted-foreground">
                    Permite consultar horários disponíveis
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">write:appointments</Badge>
                  <span className="text-sm text-muted-foreground">
                    Permite criar agendamentos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">admin:all</Badge>
                  <span className="text-sm text-muted-foreground">Acesso completo à API</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Appointments Section */}
        <section id="appointments" className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Agendamentos</h2>

          {/* Available Slots Endpoint */}
          <div id="available-slots" className="mb-12">
            <ApiEndpointCard
              method="GET"
              path="/public-api-available-slots"
              title="Consultar Horários Disponíveis"
              description="Retorna uma lista de horários disponíveis para uma agenda específica em uma data."
            >
              <div className="space-y-6">
                <ApiParameterTable
                  title="Query Parameters"
                  parameters={[
                    {
                      name: "agenda_id",
                      type: "string",
                      required: true,
                      description: "ID da agenda para consultar horários",
                    },
                    {
                      name: "date",
                      type: "string",
                      required: true,
                      description: "Data no formato YYYY-MM-DD (ex: 2025-10-20)",
                    },
                    {
                      name: "duration",
                      type: "number",
                      required: false,
                      description: "Duração do agendamento em minutos",
                      default: "30",
                    },
                  ]}
                />

                <div>
                  <h4 className="font-semibold text-sm mb-3">Exemplos de Requisição</h4>
                  <Tabs defaultValue="curl">
                    <TabsList>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                    </TabsList>
                    <TabsContent value="curl">
                      <CodeBlock
                        language="bash"
                        code={`curl -X GET "${BASE_URL}/public-api-available-slots?agenda_id=123&date=2025-10-20&duration=30" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"`}
                      />
                    </TabsContent>
                    <TabsContent value="javascript">
                      <CodeBlock
                        language="javascript"
                        code={`const response = await fetch(
  '${BASE_URL}/public-api-available-slots?agenda_id=123&date=2025-10-20&duration=30',
  {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }
  }
);
const data = await response.json();
console.log(data);`}
                      />
                    </TabsContent>
                    <TabsContent value="python">
                      <CodeBlock
                        language="python"
                        code={`import requests

response = requests.get(
    '${BASE_URL}/public-api-available-slots',
    params={
        'agenda_id': '123',
        'date': '2025-10-20',
        'duration': 30
    },
    headers={
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }
)
data = response.json()
print(data)`}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <ApiResponseExample
                  examples={[
                    {
                      status: 200,
                      description: "Success",
                      body: JSON.stringify(
                        {
                          slots: [
                            {
                              start: "2025-10-20T09:00:00.000Z",
                              end: "2025-10-20T09:30:00.000Z",
                            },
                            {
                              start: "2025-10-20T09:30:00.000Z",
                              end: "2025-10-20T10:00:00.000Z",
                            },
                          ],
                        },
                        null,
                        2
                      ),
                    },
                    {
                      status: 404,
                      description: "Not Found",
                      body: JSON.stringify(
                        {
                          error: "Agenda não encontrada ou inativa",
                        },
                        null,
                        2
                      ),
                    },
                  ]}
                />
              </div>
            </ApiEndpointCard>
          </div>

          {/* Create Appointment Endpoint */}
          <div id="create-appointment" className="mb-12">
            <ApiEndpointCard
              method="POST"
              path="/public-api-create-appointment"
              title="Criar Agendamento"
              description="Cria um novo agendamento para um cliente em um horário específico."
            >
              <div className="space-y-6">
                <ApiParameterTable
                  title="Request Body"
                  parameters={[
                    {
                      name: "agenda_id",
                      type: "string",
                      required: true,
                      description: "ID da agenda",
                    },
                    {
                      name: "start_time",
                      type: "string",
                      required: true,
                      description: "Horário de início no formato ISO 8601",
                    },
                    {
                      name: "end_time",
                      type: "string",
                      required: true,
                      description: "Horário de término no formato ISO 8601",
                    },
                    {
                      name: "client_phone",
                      type: "string",
                      required: true,
                      description: "Telefone do cliente (será usado para buscar/criar cliente)",
                    },
                    {
                      name: "client_name",
                      type: "string",
                      required: false,
                      description: "Nome do cliente (obrigatório se cliente não existir)",
                    },
                    {
                      name: "client_email",
                      type: "string",
                      required: false,
                      description: "Email do cliente",
                    },
                    {
                      name: "title",
                      type: "string",
                      required: false,
                      description: "Título do agendamento",
                    },
                    {
                      name: "description",
                      type: "string",
                      required: false,
                      description: "Descrição/observações do agendamento",
                    },
                  ]}
                />

                <div>
                  <h4 className="font-semibold text-sm mb-3">Exemplos de Requisição</h4>
                  <Tabs defaultValue="curl">
                    <TabsList>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                    </TabsList>
                    <TabsContent value="curl">
                      <CodeBlock
                        language="bash"
                        code={`curl -X POST "${BASE_URL}/public-api-create-appointment" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agenda_id": "123",
    "start_time": "2025-10-20T09:00:00.000Z",
    "end_time": "2025-10-20T09:30:00.000Z",
    "client_phone": "+5511999999999",
    "client_name": "João Silva",
    "client_email": "joao@example.com",
    "title": "Consulta Inicial",
    "description": "Primeira consulta do cliente"
  }'`}
                      />
                    </TabsContent>
                    <TabsContent value="javascript">
                      <CodeBlock
                        language="javascript"
                        code={`const response = await fetch('${BASE_URL}/public-api-create-appointment', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agenda_id: '123',
    start_time: '2025-10-20T09:00:00.000Z',
    end_time: '2025-10-20T09:30:00.000Z',
    client_phone: '+5511999999999',
    client_name: 'João Silva',
    client_email: 'joao@example.com',
    title: 'Consulta Inicial',
    description: 'Primeira consulta do cliente'
  })
});
const data = await response.json();
console.log(data);`}
                      />
                    </TabsContent>
                    <TabsContent value="python">
                      <CodeBlock
                        language="python"
                        code={`import requests

response = requests.post(
    '${BASE_URL}/public-api-create-appointment',
    headers={
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
    },
    json={
        'agenda_id': '123',
        'start_time': '2025-10-20T09:00:00.000Z',
        'end_time': '2025-10-20T09:30:00.000Z',
        'client_phone': '+5511999999999',
        'client_name': 'João Silva',
        'client_email': 'joao@example.com',
        'title': 'Consulta Inicial',
        'description': 'Primeira consulta do cliente'
    }
)
data = response.json()
print(data)`}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <ApiResponseExample
                  examples={[
                    {
                      status: 201,
                      description: "Created",
                      body: JSON.stringify(
                        {
                          id: "550e8400-e29b-41d4-a716-446655440000",
                          agenda_id: "123",
                          client_id: "550e8400-e29b-41d4-a716-446655440001",
                          start_time: "2025-10-20T09:00:00.000Z",
                          end_time: "2025-10-20T09:30:00.000Z",
                          status: "scheduled",
                          title: "Consulta Inicial",
                          description: "Primeira consulta do cliente",
                        },
                        null,
                        2
                      ),
                    },
                    {
                      status: 400,
                      description: "Bad Request",
                      body: JSON.stringify(
                        {
                          error: "Horário já está ocupado",
                        },
                        null,
                        2
                      ),
                    },
                  ]}
                />

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Comportamento com Clientes:</strong> Se um cliente com o telefone
                    fornecido já existir, ele será reutilizado. Caso contrário, um novo cliente será
                    criado automaticamente.
                  </AlertDescription>
                </Alert>
              </div>
            </ApiEndpointCard>
          </div>
        </section>

        {/* Status Codes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Códigos de Status HTTP</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold">Código</th>
                  <th className="text-left p-3 font-semibold">Descrição</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3">
                    <Badge className="bg-green-500">200</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">Requisição bem-sucedida</td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Badge className="bg-green-500">201</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">Recurso criado com sucesso</td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Badge className="bg-yellow-500">400</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    Requisição inválida (parâmetros faltando ou incorretos)
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Badge className="bg-yellow-500">401</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    Não autenticado (token inválido ou ausente)
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Badge className="bg-yellow-500">403</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    Sem permissão (escopo insuficiente)
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Badge className="bg-yellow-500">404</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">Recurso não encontrado</td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Badge className="bg-red-500">500</Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">Erro interno do servidor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
