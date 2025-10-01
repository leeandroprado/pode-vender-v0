import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle2, ShoppingCart, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const attendanceData = [
  { name: "Seg", ativos: 12, finalizados: 45 },
  { name: "Ter", ativos: 19, finalizados: 52 },
  { name: "Qua", ativos: 15, finalizados: 48 },
  { name: "Qui", ativos: 22, finalizados: 61 },
  { name: "Sex", ativos: 18, finalizados: 55 },
  { name: "Sáb", ativos: 8, finalizados: 32 },
  { name: "Dom", ativos: 5, finalizados: 28 },
];

const cartStatusData = [
  { name: "Finalizados", value: 156, color: "hsl(var(--success))" },
  { name: "Em Aberto", value: 43, color: "hsl(var(--warning))" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Visão geral do desempenho dos seus agentes de IA
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Atendimentos em Aberto"
          value={24}
          icon={MessageSquare}
          trend={{ value: "+12%", isPositive: true }}
        />
        <StatCard
          title="Atendimentos Finalizados"
          value={321}
          icon={CheckCircle2}
          trend={{ value: "+8%", isPositive: true }}
        />
        <StatCard
          title="Carrinhos em Aberto"
          value={43}
          icon={ShoppingCart}
          trend={{ value: "-5%", isPositive: false }}
        />
        <StatCard
          title="Carrinhos Finalizados"
          value={156}
          icon={TrendingUp}
          trend={{ value: "+23%", isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atendimentos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Bar dataKey="ativos" fill="hsl(var(--chart-3))" name="Em Aberto" radius={[4, 4, 0, 0]} />
                <Bar dataKey="finalizados" fill="hsl(var(--chart-1))" name="Finalizados" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Carrinhos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cartStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cartStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Cliente consultou produto: Notebook Dell", time: "2 minutos atrás", type: "info" },
              { action: "Carrinho finalizado - R$ 2.450,00", time: "15 minutos atrás", type: "success" },
              { action: "Item adicionado ao carrinho: Mouse Gamer", time: "32 minutos atrás", type: "info" },
              { action: "Cliente cadastrado: João Silva", time: "1 hora atrás", type: "success" },
              { action: "Atendimento encaminhado para humano", time: "2 horas atrás", type: "warning" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                <div
                  className={`h-2 w-2 rounded-full mt-2 ${
                    activity.type === "success"
                      ? "bg-success"
                      : activity.type === "warning"
                      ? "bg-warning"
                      : "bg-primary"
                  }`}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
