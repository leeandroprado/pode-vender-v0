import { StatCard } from "@/components/StatCard";
import { ProductStatCard } from "@/components/ProductStatCard";
import { CategoryStatsCard } from "@/components/CategoryStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle2, ShoppingCart, TrendingUp, Calendar, Filter } from "lucide-react";
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
  LineChart,
  Line,
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

const revenueData = [
  { name: "Jan", valor: 4200 },
  { name: "Fev", valor: 5100 },
  { name: "Mar", valor: 4800 },
  { name: "Abr", valor: 6200 },
  { name: "Mai", valor: 7100 },
  { name: "Jun", valor: 6800 },
  { name: "Jul", valor: 8500 },
];

const cartStatusData = [
  { name: "Eletrônicos", value: 156, color: "hsl(var(--chart-1))" },
  { name: "Moda", value: 89, color: "hsl(var(--chart-2))" },
  { name: "Casa", value: 43, color: "hsl(var(--chart-3))" },
  { name: "Outros", value: 28, color: "hsl(var(--chart-4))" },
];

const productDonutData = [
  { name: "Produtos A", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Produtos B", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Produtos C", value: 25, color: "hsl(var(--chart-3))" },
];

const categoryItems = [
  { name: "Notebooks", value: 234, percentage: 12, color: "hsl(var(--chart-1))" },
  { name: "Smartphones", value: 189, percentage: 8, color: "hsl(var(--chart-2))" },
  { name: "Acessórios", value: 156, percentage: 15, color: "hsl(var(--chart-3))" },
  { name: "Tablets", value: 98, percentage: 5, color: "hsl(var(--chart-4))" },
];

const miniChartData = [
  { value: 20 }, { value: 35 }, { value: 28 }, { value: 42 }, 
  { value: 38 }, { value: 52 }, { value: 48 }, { value: 61 },
];

export default function Dashboard() {
  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground capitalize">
            {today}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Calendar className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filtrar período</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Conversas Ativas"
          value={24}
          icon={MessageSquare}
          trend={{ value: "+12%", isPositive: true }}
          miniChart={miniChartData}
          miniChartColor="hsl(var(--chart-1))"
        />
        <StatCard
          title="Taxa de Conversão"
          value="68%"
          icon={TrendingUp}
          trend={{ value: "+8%", isPositive: true }}
          miniChart={miniChartData}
          miniChartColor="hsl(var(--chart-2))"
        />
        <StatCard
          title="Carrinhos em Aberto"
          value={43}
          icon={ShoppingCart}
          trend={{ value: "-5%", isPositive: false }}
          miniChart={miniChartData}
          miniChartColor="hsl(var(--chart-3))"
        />
        <StatCard
          title="Ticket Médio"
          value="R$ 487"
          icon={CheckCircle2}
          trend={{ value: "+23%", isPositive: true }}
          miniChart={miniChartData}
          miniChartColor="hsl(var(--success))"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <ProductStatCard
          title="Produtos Vendidos"
          value={2847}
          percentage={18}
          data={productDonutData}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Atendimentos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
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

        <CategoryStatsCard
          title="Top Categorias"
          items={categoryItems}
        />

        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={cartStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
          <CardTitle className="text-lg md:text-xl">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Cliente consultou produto: Notebook Dell", time: "2 minutos atrás", type: "info" },
              { action: "Carrinho finalizado - R$ 2.450,00", time: "15 minutos atrás", type: "success" },
              { action: "Item adicionado ao carrinho: Mouse Gamer", time: "32 minutos atrás", type: "info" },
              { action: "Cliente cadastrado: João Silva", time: "1 hora atrás", type: "success" },
              { action: "Atendimento encaminhado para humano", time: "2 horas atrás", type: "warning" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                <div
                  className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === "success"
                      ? "bg-success"
                      : activity.type === "warning"
                      ? "bg-warning"
                      : "bg-primary"
                  }`}
                />
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{activity.action}</p>
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
