import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface CategoryItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface CategoryStatsCardProps {
  title: string;
  items: CategoryItem[];
}

export function CategoryStatsCard({ title, items }: CategoryStatsCardProps) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">{item.value}</span>
                <span className="flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="h-3 w-3" />
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
