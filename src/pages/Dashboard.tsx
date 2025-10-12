import { StatCard } from "@/components/StatCard";
import { ProductStatCard } from "@/components/ProductStatCard";
import { CategoryStatsCard } from "@/components/CategoryStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle2, ShoppingCart, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const MonthlyRevenueChart = lazy(() => import("@/components/charts/MonthlyRevenueChart"));
const DailyAttendanceChart = lazy(() => import("@/components/charts/DailyAttendanceChart"));
const CategorySalesChart = lazy(() => import("@/components/charts/CategorySalesChart"));

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
  const { user } = useAuth();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Olá, {user?.user_metadata.full_name || "Usuário"}!</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground">
            Aqui estão as métricas mais recentes do seu negócio.
          </p>
        </div>
        <DateRangePicker date={date} setDate={setDate} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Conversas Ativas"
          value={24}
          icon={MessageSquare}
          trend={{ value: "+12%", isPositive: true }}
        />
        <StatCard
          title="Taxa de Conversão"
          value="68%"
          icon={TrendingUp}
          trend={{ value: "+8%", isPositive: true }}
        />
        <StatCard
          title="Carrinhos em Aberto"
          value={43}
          icon={ShoppingCart}
          trend={{ value: "-5%", isPositive: false }}
        />
        <StatCard
          title="Ticket Médio"
          value="R$ 487"
          icon={CheckCircle2}
          trend={{ value: "+23%", isPositive: true }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
                <MonthlyRevenueChart />
              </Suspense>
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
            <Suspense fallback={<Skeleton className="h-[280px] w-full" />}>
              <DailyAttendanceChart />
            </Suspense>
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
            <Suspense fallback={<Skeleton className="h-[280px] w-full" />}>
              <CategorySalesChart />
            </Suspense>
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
            ].map((activity, index) => {
              const Icon = activity.type === "success" ? CheckCircle2 : activity.type === "warning" ? AlertTriangle : Info;
              const iconColor = activity.type === "success" ? "text-success" : activity.type === "warning" ? "text-warning" : "text-primary";

              return (
                <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
