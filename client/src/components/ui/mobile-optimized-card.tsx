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
        "shadow-sm h-full transition-all overflow-hidden",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/20",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn("pb-3 pt-6", headerClassName)}>
        <div className="flex items-center space-x-3">
          {icon && <div className="shrink-0">{icon}</div>}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl font-medium truncate">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1 text-base line-clamp-2 overflow-hidden">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("px-6 overflow-hidden", contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={cn("pt-2 pb-6 px-6 overflow-hidden", footerClassName)}>
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
      "flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden",
      className
    )}>
      <div className="shrink-0 mr-4">
        {icon}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 overflow-hidden">{description}</p>
      </div>
      {action && (
        <div className="shrink-0 ml-4">
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
    <Card className={cn("shadow-sm overflow-hidden", className)}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-medium truncate">{title}</CardTitle>
        {description && <CardDescription className="text-sm mt-1 line-clamp-2 overflow-hidden">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4 py-2 overflow-hidden">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="pt-2 pb-3 px-4 border-t border-gray-100 dark:border-gray-800 overflow-hidden">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

// Card that creates a fluid mobile experience similar to social media platforms
export function SocialCard({
  title,
  subtitle,
  icon,
  content,
  media,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  media?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-3",
      className
    )}>
      {/* Header with profile info */}
      <div className="p-4 flex items-center space-x-3">
        {icon && <div className="shrink-0">{icon}</div>}
        <div className="min-w-0">
          <h3 className="font-medium truncate">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
      
      {/* Content area with proper text formatting */}
      <div className="px-4 pb-3">
        <div className="text-sm">
          {typeof content === 'string' ? (
            <p className="whitespace-pre-line break-words">{content}</p>
          ) : (
            content
          )}
        </div>
      </div>
      
      {/* Media section for images or other content */}
      {media && (
        <div className="w-full">
          {media}
        </div>
      )}
      
      {/* Action buttons */}
      {actions && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          {actions}
        </div>
      )}
    </div>
  );
}