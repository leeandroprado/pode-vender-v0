import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SafeChart } from "@/components/SafeChart";

const attendanceData = [
  { name: "Seg", ativos: 12, finalizados: 45 },
  { name: "Ter", ativos: 19, finalizados: 52 },
  { name: "Qua", ativos: 15, finalizados: 48 },
  { name: "Qui", ativos: 22, finalizados: 61 },
  { name: "Sex", ativos: 18, finalizados: 55 },
  { name: "Sáb", ativos: 8, finalizados: 32 },
  { name: "Dom", ativos: 5, finalizados: 28 },
];

export default function DailyAttendanceChart() {
  return (
    <SafeChart>
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
    </SafeChart>
  );
}
