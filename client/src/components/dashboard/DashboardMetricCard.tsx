import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DashboardMetricCardProps {
  icon?: React.ReactNode; // Made optional
  iconBgColor?: string; // Made optional
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
}

export function DashboardMetricCard({ 
  title, 
  value, 
  description, 
  trend, 
  progress 
}: DashboardMetricCardProps) {
  return (
    <Card className="p-4 flex flex-col items-center justify-center text-center shadow-sm h-[120px]">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="text-xl font-bold my-2">{value}</div>
      
      {description && (
        <p className="text-xs text-muted-foreground truncate max-w-full">{description}</p>
      )}
      
      {trend && (
        <div className="flex items-center text-xs mt-1 justify-center">
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
        <div className="mt-1 w-full max-w-[100px]">
          <Progress value={(progress.value / progress.max) * 100} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1">
            {progress.value} of {progress.max}
          </p>
        </div>
      )}
    </Card>
  );
}