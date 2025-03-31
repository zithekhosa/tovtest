import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardMetricCardProps {
  icon?: React.ReactNode;
  iconBgColor?: string;
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    text?: string;
  };
  progress?: {
    value: number;
    max: number;
  };
  className?: string;
  compact?: boolean;
}

export function DashboardMetricCard({ 
  title, 
  value, 
  description, 
  trend, 
  progress,
  icon,
  iconBgColor = "bg-primary/10",
  className,
  compact = false
}: DashboardMetricCardProps) {
  return (
    <Card 
      className={cn(
        "p-4 flex flex-col shadow-sm border",
        compact ? "h-[110px]" : "h-[130px] sm:h-[120px]",
        icon ? "items-start text-left" : "items-center text-center justify-center",
        className
      )}
    >
      {icon && (
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-2", iconBgColor)}>
          {icon}
        </div>
      )}
      
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className={cn("font-bold", compact ? "text-lg mt-1" : "text-xl my-2")}>{value}</div>
      
      {description && (
        <p className="text-xs text-muted-foreground truncate max-w-full">{description}</p>
      )}
      
      {trend && (
        <div className="flex items-center text-xs mt-1">
          {trend.isPositive ? (
            <TrendingUp className="mr-1 h-3 w-3 text-green-500 shrink-0" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3 text-red-500 shrink-0" />
          )}
          <span className={trend.isPositive ? "text-green-500" : "text-red-500"}>
            {trend.value}% {trend.text || ""}
          </span>
        </div>
      )}
      
      {progress && (
        <div className="mt-1 w-full max-w-[120px]">
          <Progress value={(progress.value / progress.max) * 100} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1">
            {progress.value} of {progress.max}
          </p>
        </div>
      )}
    </Card>
  );
}