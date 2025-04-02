import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "wouter";

// Basic metric card for simple data display
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  iconColor?: string;
  iconBackground?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  footer?: ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  iconColor = "text-primary",
  iconBackground = "bg-primary/10",
  trend,
  footer,
  className
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden h-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="text-2xl font-bold">{value}</div>
          </div>
          {icon && (
            <div className={cn("p-2 rounded-full", iconBackground)}>
              <div className={iconColor}>{icon}</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {trend && (
          <div className={cn(
            "mt-1 text-xs font-medium flex items-center",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </div>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="pt-0 pb-3">{footer}</CardFooter>
      )}
    </Card>
  );
}

// Action card with a clear call-to-action
interface ActionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconColor?: string;
  iconBackground?: string;
  actionLabel: string;
  actionHref: string;
  status?: {
    label: string;
    variant: "default" | "destructive" | "outline" | "secondary";
  };
  className?: string;
}

export function ActionCard({
  title,
  description,
  icon,
  iconColor = "text-primary",
  iconBackground = "bg-primary/10",
  actionLabel,
  actionHref,
  status,
  className
}: ActionCardProps) {
  return (
    <Card className={cn("overflow-hidden h-full", className)}>
      <CardHeader>
        <div className="flex items-start gap-4">
          {icon && (
            <div className={cn("p-2 rounded-full shrink-0", iconBackground)}>
              <div className={iconColor}>{icon}</div>
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base line-clamp-1">{title}</CardTitle>
              {status && (
                <Badge variant={status.variant} className="ml-auto whitespace-nowrap">
                  {status.label}
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription className="line-clamp-2">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-primary hover:text-primary hover:bg-primary/5 border-primary/20"
          asChild
        >
          <Link href={actionHref}>
            <span className="flex-1">{actionLabel}</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Content card for longer text or rich content display
interface ContentCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  iconColor?: string;
  iconBackground?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function ContentCard({
  title,
  children,
  icon,
  iconColor = "text-primary",
  iconBackground = "bg-primary/10",
  action,
  className
}: ContentCardProps) {
  return (
    <Card className={cn("overflow-hidden h-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={cn("p-2 rounded-full", iconBackground)}>
                <div className={iconColor}>{icon}</div>
              </div>
            )}
            <CardTitle>{title}</CardTitle>
          </div>
          {action && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={action.href}>
                {action.label}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {children}
      </CardContent>
    </Card>
  );
}

// Resource link card for external resources
interface ResourceCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  iconColor?: string;
  iconBackground?: string;
  href: string;
  isExternal?: boolean;
  className?: string;
}

export function ResourceCard({
  title,
  description,
  icon,
  iconColor = "text-primary",
  iconBackground = "bg-primary/10",
  href,
  isExternal,
  className
}: ResourceCardProps) {
  const LinkComponent = isExternal ? 'a' : Link;
  const linkProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
  
  return (
    <Card className={cn("overflow-hidden h-full transition-all hover:border-primary/30 hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          {icon && (
            <div className={cn("p-2 rounded-full", iconBackground)}>
              <div className={iconColor}>{icon}</div>
            </div>
          )}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-1">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter>
        <LinkComponent 
          href={href}
          className="text-sm font-medium text-primary flex items-center hover:underline w-full"
          {...linkProps}
        >
          View resource
          {isExternal ? (
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          )}
        </LinkComponent>
      </CardFooter>
    </Card>
  );
}

// Data grid card for tabular data
interface DataGridCardProps {
  title: string;
  action?: {
    label: string;
    href: string;
  };
  children: ReactNode;
  className?: string;
}

export function DataGridCard({
  title,
  action,
  children,
  className
}: DataGridCardProps) {
  return (
    <Card className={cn("overflow-hidden h-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {action && (
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href={action.href}>
                {action.label}
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}