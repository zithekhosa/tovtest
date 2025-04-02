import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

interface MobileOptimizedCardProps {
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  status?: string;
  className?: string;
}

export function MobileOptimizedCard({
  title,
  icon,
  content,
  footer,
  status,
  className,
}: MobileOptimizedCardProps) {
  return (
    <Card className={cn("overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        {icon && (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate">{title}</h3>
          {status && (
            <Badge variant={status === "pending" ? "destructive" : status === "in progress" ? "outline" : "default"} className="mt-1">
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-2">
        {content}
      </CardContent>
      {footer && (
        <CardFooter className="flex justify-between p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

interface HorizontalCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function HorizontalCard({
  title,
  subtitle,
  icon,
  action,
  className,
}: HorizontalCardProps) {
  return (
    <div className={cn("flex items-center p-4 border rounded-lg bg-white dark:bg-gray-800", className)}>
      {icon && (
        <div className="flex-shrink-0 mr-4">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium truncate">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

interface CompactCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export function CompactCard({
  title,
  value,
  icon,
  bgColor = "bg-primary/10",
  textColor = "text-primary",
  trend,
  className,
}: CompactCardProps) {
  return (
    <div className={cn("p-4 rounded-lg border bg-white dark:bg-gray-800", className)}>
      <div className="flex items-center mb-2">
        {icon && (
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mr-3", bgColor)}>
            <div className={textColor}>{icon}</div>
          </div>
        )}
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
      </div>
      <div className="flex items-end">
        <div className="text-2xl font-semibold">{value}</div>
        {trend && (
          <div className={cn(
            "ml-2 text-xs font-medium",
            trend.isUp ? "text-green-600" : "text-red-600"
          )}>
            {trend.isUp ? "↑" : "↓"} {trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}