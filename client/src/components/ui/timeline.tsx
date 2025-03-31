import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  isActive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  children?: ReactNode;
}

export function TimelineItem({
  title,
  description,
  icon,
  isActive = false,
  isFirst = false,
  isLast = false,
  children,
}: TimelineItemProps) {
  return (
    <div className="relative pb-8">
      {!isLast && (
        <div
          className={cn(
            "absolute left-4 top-5 -ml-px h-full w-0.5 -translate-x-1/2",
            isActive ? "bg-primary" : "bg-gray-200"
          )}
          aria-hidden="true"
        />
      )}
      <div className="relative flex items-start space-x-3">
        <div>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-500"
            )}
          >
            {icon || (
              <div className="h-2.5 w-2.5 rounded-full bg-current" />
            )}
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className={cn("font-medium", isActive && "text-primary")}>
              {title}
            </h3>
            {isActive && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                Active
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}

interface TimelineProps {
  children: ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {children}
    </div>
  );
}