import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ProductStatCardProps {
  title: string;
  value: string | number;
  percentage: number;
  data: Array<{ name: string; value: number; color: string }>;
}

export function ProductStatCard({ title, value, percentage, data }: ProductStatCardProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold tracking-tight">{value}</p>
              <p className="mt-2 text-sm font-medium text-success">
                ↑ {percentage}% vs mês anterior
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-3xl md:text-4xl font-bold tracking-tight">{value}</p>
            <p className="mt-2 text-xs md:text-sm font-medium text-success">
              ↑ {percentage}% vs mês anterior
            </p>
          </div>
          <div style={{ width: '96px', height: '96px', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
