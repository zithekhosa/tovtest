import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface SocialCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export function SocialCard({
  title,
  subtitle,
  icon,
  content,
  actions,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
}: SocialCardProps) {
  return (
    <Card className={cn("overflow-hidden mb-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm", className)}>
      <CardHeader className={cn("flex flex-row items-center gap-3 px-4 py-3", headerClassName)}>
        {icon}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-none tracking-tight truncate">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>}
        </div>
      </CardHeader>
      <CardContent className={cn("px-4 py-3", contentClassName)}>
        {content}
      </CardContent>
      {actions && (
        <CardFooter className={cn("border-t border-gray-200 dark:border-gray-700 px-4 py-2", footerClassName)}>
          {actions}
        </CardFooter>
      )}
    </Card>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ActionCard({ icon, title, description, action, className }: ActionCardProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
        className
      )}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-base truncate">{title}</h3>
        {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-2">
          {action}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {trend && (
        <div className={cn(
          "text-xs font-medium mt-1",
          trend.isPositive ? "text-green-600" : "text-red-600"
        )}>
          {trend.isPositive ? "↑" : "↓"} {trend.value}%
        </div>
      )}
    </div>
  );
}