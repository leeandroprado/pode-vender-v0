import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { memo } from "react";

interface MiniAreaChartProps {
  data: Array<{ value: number }>;
  color: string;
}

export const MiniAreaChart = memo(function MiniAreaChart({ data, color }: MiniAreaChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  try {
    return (
      <div style={{ width: '100%', height: '60px' }}>
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error('Error rendering MiniAreaChart:', error);
    return null;
  }
});
