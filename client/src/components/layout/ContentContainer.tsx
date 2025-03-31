import React from "react";
import { cn } from "@/lib/utils";

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

export function ContentContainer({
  children,
  className,
  fullWidth = false,
  noPadding = false,
}: ContentContainerProps) {
  return (
    <div
      className={cn(
        "w-full",
        !noPadding && "px-4 sm:px-6 md:px-8",
        fullWidth ? "max-w-none" : "max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageSection({
  children,
  className,
  fullWidth = false,
  noPadding = false,
}: ContentContainerProps) {
  return (
    <section className="py-6 md:py-8">
      <ContentContainer 
        className={className} 
        fullWidth={fullWidth}
        noPadding={noPadding}
      >
        {children}
      </ContentContainer>
    </section>
  );
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-base text-muted-foreground max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export function DividerWithLabel({ 
  label,
  className 
}: { 
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200 dark:border-gray-800" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-sm text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}