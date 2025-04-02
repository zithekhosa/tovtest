import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
  className
}: ResponsiveGridProps) {
  const getColumnClasses = () => {
    const { sm = 1, md = 2, lg = 3, xl = 4 } = columns;
    
    return cn(
      "grid",
      sm === 1 && "grid-cols-1",
      sm === 2 && "grid-cols-2",
      sm === 3 && "grid-cols-3",
      sm === 4 && "grid-cols-4",
      
      md === 1 && "md:grid-cols-1",
      md === 2 && "md:grid-cols-2",
      md === 3 && "md:grid-cols-3",
      md === 4 && "md:grid-cols-4",
      
      lg === 1 && "lg:grid-cols-1",
      lg === 2 && "lg:grid-cols-2",
      lg === 3 && "lg:grid-cols-3",
      lg === 4 && "lg:grid-cols-4",
      
      xl === 1 && "xl:grid-cols-1",
      xl === 2 && "xl:grid-cols-2",
      xl === 3 && "xl:grid-cols-3",
      xl === 4 && "xl:grid-cols-4",
      
      gap === "none" && "gap-0",
      gap === "sm" && "gap-2",
      gap === "md" && "gap-4",
      gap === "lg" && "gap-6"
    );
  };

  return (
    <div className={cn(getColumnClasses(), className)}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  gap?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveStack({
  children,
  gap = "md",
  className
}: ResponsiveStackProps) {
  const getGapClasses = () => {
    return cn(
      "flex flex-col",
      gap === "none" && "gap-0",
      gap === "sm" && "gap-2",
      gap === "md" && "gap-4",
      gap === "lg" && "gap-6"
    );
  };

  return (
    <div className={cn(getGapClasses(), className)}>
      {children}
    </div>
  );
}

interface DashboardContentPanelProps {
  children: ReactNode;
  className?: string;
}

export function DashboardContentPanel({ 
  children, 
  className 
}: DashboardContentPanelProps) {
  return (
    <section className={cn("py-4", className)}>
      {children}
    </section>
  );
}

interface SectionTitleProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({ 
  title, 
  description, 
  action,
  className 
}: SectionTitleProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2", className)}>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <div className="mt-2 sm:mt-0">{action}</div>
      )}
    </div>
  );
}

// ScrollableGrid for horizontal scrolling on mobile, grid on desktop
interface ScrollableGridProps {
  children: ReactNode;
  className?: string;
  itemWidth?: string; // e.g., '250px', '18rem'
  gap?: "none" | "sm" | "md" | "lg";
  columns?: {
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function ScrollableGrid({
  children,
  className,
  itemWidth = "250px",
  gap = "md",
  columns = { md: 2, lg: 3, xl: 3 },
}: ScrollableGridProps) {
  const { md = 2, lg = 3, xl = 3 } = columns;
  
  const getGapClasses = () => {
    return cn(
      gap === "none" && "gap-0",
      gap === "sm" && "gap-2",
      gap === "md" && "gap-4",
      gap === "lg" && "gap-6"
    );
  };

  return (
    <div className={cn(className)}>
      {/* Mobile: Horizontal scrolling */}
      <div className={cn(
        "flex overflow-x-auto pb-4 -mx-4 px-4 md:hidden",
        getGapClasses()
      )}>
        {Array.isArray(children) ? 
          children.map((child, index) => (
            <div 
              key={index} 
              className="flex-none" 
              style={{ width: itemWidth }}
            >
              {child}
            </div>
          )) : 
          <div className="flex-none" style={{ width: itemWidth }}>
            {children}
          </div>
        }
      </div>

      {/* Desktop: Responsive grid */}
      <div className={cn(
        "hidden md:grid",
        getGapClasses(),
        md === 1 && "md:grid-cols-1",
        md === 2 && "md:grid-cols-2",
        md === 3 && "md:grid-cols-3",
        md === 4 && "md:grid-cols-4",
        
        lg === 1 && "lg:grid-cols-1",
        lg === 2 && "lg:grid-cols-2",
        lg === 3 && "lg:grid-cols-3",
        lg === 4 && "lg:grid-cols-4",
        
        xl === 1 && "xl:grid-cols-1",
        xl === 2 && "xl:grid-cols-2",
        xl === 3 && "xl:grid-cols-3",
        xl === 4 && "xl:grid-cols-4",
      )}>
        {children}
      </div>
    </div>
  );
}

// Social feed container for facebook-style feeds
interface SocialFeedProps {
  children: ReactNode;
  className?: string;
}

export function SocialFeed({ children, className }: SocialFeedProps) {
  return (
    <div className={cn("flex flex-col mx-auto max-w-[600px] px-4 space-y-4", className)}>
      {children}
    </div>
  );
}