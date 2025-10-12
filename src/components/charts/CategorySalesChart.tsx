import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SafeChart } from "@/components/SafeChart";

const cartStatusData = [
  { name: "Eletrônicos", value: 156, color: "hsl(var(--chart-1))" },
  { name: "Moda", value: 89, color: "hsl(var(--chart-2))" },
  { name: "Casa", value: 43, color: "hsl(var(--chart-3))" },
  { name: "Outros", value: 28, color: "hsl(var(--chart-4))" },
];

export default function CategorySalesChart() {
  return (
    <SafeChart>
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
    </SafeChart>
  );
}
