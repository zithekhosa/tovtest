import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
}

export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = "gap-4"
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const gridClasses = [];
    
    if (cols.xs) gridClasses.push(`grid-cols-${cols.xs}`);
    if (cols.sm) gridClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) gridClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) gridClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) gridClasses.push(`xl:grid-cols-${cols.xl}`);
    
    return gridClasses.join(' ');
  };

  return (
    <div className={cn(
      "grid",
      getGridCols(),
      gap,
      className
    )}>
      {children}
    </div>
  );
}

// For horizontal scrolling grid on mobile
export function ScrollableGrid({
  children,
  className,
  itemWidth = "min-w-[270px]",
  gap = "gap-4"
}: {
  children: React.ReactNode;
  className?: string;
  itemWidth?: string;
  gap?: string;
}) {
  return (
    <div className={cn(
      "flex overflow-x-auto pb-4 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      gap,
      className
    )}>
      {React.Children.map(children, (child) => (
        <div className={cn("flex-shrink-0", itemWidth, "md:w-full")}>
          {child}
        </div>
      ))}
    </div>
  );
}