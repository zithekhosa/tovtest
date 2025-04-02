import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default: number;
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
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = "gap-6",
}: ResponsiveGridProps) {
  const gridCols = `grid-cols-${cols.default}`;
  const smCols = cols.sm ? `sm:grid-cols-${cols.sm}` : "";
  const mdCols = cols.md ? `md:grid-cols-${cols.md}` : "";
  const lgCols = cols.lg ? `lg:grid-cols-${cols.lg}` : "";
  const xlCols = cols.xl ? `xl:grid-cols-${cols.xl}` : "";

  return (
    <div className={cn(
      "grid",
      gridCols,
      smCols,
      mdCols,
      lgCols,
      xlCols,
      gap,
      className
    )}>
      {children}
    </div>
  );
}

interface ScrollableGridProps {
  children: React.ReactNode;
  className?: string;
  itemWidth?: string;
  gap?: string;
}

export function ScrollableGrid({
  children,
  className,
  itemWidth = "min-w-[280px]",
  gap = "gap-4",
}: ScrollableGridProps) {
  return (
    <div className={cn(
      "flex overflow-x-auto pb-3 tov-hide-scrollbar",
      gap,
      className
    )}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div key={index} className={cn("shrink-0", itemWidth)}>
              {child}
            </div>
          ))
        : <div className={cn("shrink-0", itemWidth)}>{children}</div>
      }
    </div>
  );
}

export function SocialFeed({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-[600px] mx-auto", className)}>
      {children}
    </div>
  );
}

export function SectionHeader({ 
  title, 
  subtitle, 
  action,
  className
}: { 
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6", className)}>
      <div>
        <h2 className="text-xl font-semibold leading-none tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
      {action && <div className="sm:ml-auto">{action}</div>}
    </div>
  );
}