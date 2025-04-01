import React from "react";
import { cn } from "@/lib/utils";

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
  centerContent?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
}

export function ContentContainer({
  children,
  className,
  fullWidth = false,
  noPadding = false,
  centerContent = false,
  maxWidth = "7xl",
}: ContentContainerProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
    "full": "max-w-none",
  }[maxWidth] || "max-w-7xl";

  return (
    <div
      className={cn(
        "w-full",
        !noPadding && "px-3 sm:px-4 md:px-6 lg:px-8",
        fullWidth ? "max-w-none" : `${maxWidthClass} mx-auto`,
        centerContent && "flex flex-col items-center",
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
  centerContent = false,
  maxWidth,
}: ContentContainerProps) {
  return (
    <section className="py-4 sm:py-6 md:py-8">
      <ContentContainer 
        className={className} 
        fullWidth={fullWidth}
        noPadding={noPadding}
        centerContent={centerContent}
        maxWidth={maxWidth}
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
    <div className={cn("mb-6 sm:mb-8", className)}>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl truncate">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl line-clamp-2">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="shrink-0">
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
    <div className={cn("relative my-6", className)}>
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

// Facebook-style content feed container
export function FeedContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "max-w-[600px] mx-auto w-full px-1 sm:px-2",
      className
    )}>
      {children}
    </div>
  );
}

// A container with proper spacing for mobile forms
export function MobileFormContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "max-w-md mx-auto w-full px-4 py-4 space-y-4",
      className
    )}>
      {children}
    </div>
  );
}