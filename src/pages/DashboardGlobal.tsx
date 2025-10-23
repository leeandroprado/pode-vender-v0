import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GlobalStatsCard } from "@/components/GlobalStatsCard";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Building2, Users, TrendingUp, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardGlobal() {
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    churnRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      // Total de organizações (profiles com organization_id = id)
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, organization_id');

      const totalOrgs = allProfiles?.filter(p => p.id === p.organization_id).length || 0;

      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Assinaturas ativas
      const { count: activeSubscriptions } = await supabase
        .from('organization_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Assinaturas em trial
      const { count: trialSubscriptions } = await supabase
        .from('organization_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'trial');

      // Receita mensal (soma dos planos ativos)
      const { data: activeSubs } = await supabase
        .from('organization_subscriptions')
        .select(`
          plan:subscription_plans(price, billing_cycle)
        `)
        .eq('status', 'active');

      const monthlyRevenue = activeSubs?.reduce((sum, sub: any) => {
        const price = sub.plan?.price || 0;
        const cycle = sub.plan?.billing_cycle || 'MONTHLY';
        return sum + (cycle === 'MONTHLY' ? price : price / 12);
      }, 0) || 0;

      // Taxa de conversão (active / (active + trial))
      const totalConversions = (activeSubscriptions || 0) + (trialSubscriptions || 0);
      const conversionRate = totalConversions > 0 
        ? ((activeSubscriptions || 0) / totalConversions) * 100 
        : 0;

      setStats({
        totalOrgs,
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        trialSubscriptions: trialSubscriptions || 0,
        monthlyRevenue,
        conversionRate,
        churnRate: 0, // Calcular com dados históricos
      });
    } catch (error) {
      console.error('Error fetching global stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">
          Carregando estatísticas...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Dashboard Global
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão geral de todo o sistema
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <GlobalStatsCard
            title="Organizações"
            value={stats.totalOrgs}
            description="Total de organizações"
            icon={Building2}
          />
          <GlobalStatsCard
            title="Usuários"
            value={stats.totalUsers}
            description="Total de usuários"
            icon={Users}
          />
          <GlobalStatsCard
            title="Assinaturas Ativas"
            value={stats.activeSubscriptions}
            description="Planos pagos ativos"
            icon={TrendingUp}
          />
          <GlobalStatsCard
            title="Em Trial"
            value={stats.trialSubscriptions}
            description="Períodos de teste"
            icon={Calendar}
          />
        </div>

        {/* Revenue & Conversion */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Receita Mensal Recorrente
              </CardTitle>
              <CardDescription>
                Soma de todas as assinaturas ativas (convertidas para mensal)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                R$ {stats.monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                MRR (Monthly Recurring Revenue)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Taxa de Conversão
              </CardTitle>
              <CardDescription>
                Trial → Pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {stats.conversionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                De trials convertidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas movimentações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Funcionalidade em desenvolvimento
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
