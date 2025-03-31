import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface MobileOptimizedCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  onClick?: () => void;
}

export function MobileOptimizedCard({
  title,
  description,
  icon,
  footer,
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  onClick,
}: MobileOptimizedCardProps) {
  return (
    <Card 
      className={cn(
        "shadow-sm h-full transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/20",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn("pb-3 pt-6", headerClassName)}>
        <div className="flex items-center space-x-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div>
            <CardTitle className="text-xl font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1 text-base">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("px-6", contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={cn("pt-2 pb-6 px-6", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

// Card with horizontal layout for list items on mobile
export function HorizontalCard({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm",
      className
    )}>
      <div className="flex-shrink-0 mr-4">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{description}</p>
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

// Compact card for mobile with reduced padding
export function CompactCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && <CardDescription className="text-sm mt-1">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4 py-2">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="pt-2 pb-3 px-4 border-t border-gray-100 dark:border-gray-800">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}