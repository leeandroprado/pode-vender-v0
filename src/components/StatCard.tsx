import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  size?: "default" | "large";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  size = "default",
  className 
}: StatCardProps) {
  const isLarge = size === "large";
  
  return (
    <Card className={cn(
      "transition-all hover:shadow-lg border-border/50",
      isLarge && "row-span-2",
      className
    )}>
      <CardContent className={cn("p-6", isLarge && "p-8")}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className={cn(
                "font-bold tracking-tight",
                isLarge ? "text-5xl" : "text-3xl"
              )}>{value}</p>
              {trend && (
                <p
                  className={cn(
                    "text-sm font-medium flex items-center gap-1",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </p>
              )}
            </div>
            <div className={cn(
              "rounded-lg bg-primary/10 p-3 transition-all",
              isLarge && "p-4"
            )}>
              <Icon className={cn(
                "text-primary",
                isLarge ? "h-8 w-8" : "h-6 w-6"
              )} />
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
