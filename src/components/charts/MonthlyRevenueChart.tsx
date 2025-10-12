import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SafeChart } from "@/components/SafeChart";

const revenueData = [
  { name: "Jan", valor: 4200 },
  { name: "Fev", valor: 5100 },
  { name: "Mar", valor: 4800 },
  { name: "Abr", valor: 6200 },
  { name: "Mai", valor: 7100 },
  { name: "Jun", valor: 6800 },
  { name: "Jul", valor: 8500 },
];

export default function MonthlyRevenueChart() {
  return (
    <SafeChart>
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
    </SafeChart>
  );
}
