import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProviderProps {
  children: React.ReactNode;
}

interface TimelineProviderValue {
  isVertical: boolean;
  isFilled: boolean;
}

const TimelineContext = React.createContext<TimelineProviderValue | null>(null);

export function TimelineProvider({
  children,
}: TimelineProviderProps) {
  const value = React.useMemo<TimelineProviderValue>(
    () => ({
      isVertical: true,
      isFilled: true,
    }),
    []
  );

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimelineContext() {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimelineContext must be used within a TimelineProvider");
  }
  return context;
}

export interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  const { isVertical } = useTimelineContext();

  return (
    <div
      className={cn(
        "relative",
        isVertical ? "flex flex-col space-y-6" : "flex flex-row space-x-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TimelineItemContextValue {
  isActive: boolean;
}

const TimelineItemContext = React.createContext<TimelineItemContextValue | null>(
  null
);

function useTimelineItemContext() {
  const context = React.useContext(TimelineItemContext);
  if (!context) {
    throw new Error(
      "useTimelineItemContext must be used within a TimelineItem"
    );
  }
  return context;
}

interface TimelineItemProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ children, className, active = false, ...props }, ref) => {
    const { isVertical } = useTimelineContext();
    const value = React.useMemo<TimelineItemContextValue>(
      () => ({
        isActive: active,
      }),
      [active]
    );

    return (
      <TimelineItemContext.Provider value={value}>
        <div
          ref={ref}
          className={cn(
            "relative",
            isVertical ? "pl-8" : "pt-8",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TimelineItemContext.Provider>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

interface TimelineItemIndicatorProps {
  children?: React.ReactNode;
  className?: string;
}

const TimelineItemIndicator = React.forwardRef<
  HTMLDivElement,
  TimelineItemIndicatorProps
>(({ children, className, ...props }, ref) => {
  const { isVertical } = useTimelineContext();
  const { isActive } = useTimelineItemContext();

  return (
    <div
      ref={ref}
      className={cn(
        "absolute flex items-center justify-center rounded-full border-2 bg-background text-foreground",
        isActive ? "border-primary" : "border-border",
        isVertical ? "-left-[13px] top-1 h-6 w-6" : "-top-[13px] left-1 h-6 w-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TimelineItemIndicator.displayName = "TimelineItemIndicator";

interface TimelineItemContentProps {
  children?: React.ReactNode;
  className?: string;
}

const TimelineItemContent = React.forwardRef<
  HTMLDivElement,
  TimelineItemContentProps
>(({ children, className, ...props }, ref) => {
  const { isVertical } = useTimelineContext();
  const { isActive } = useTimelineItemContext();

  return (
    <div
      ref={ref}
      className={cn(
        "relative",
        isVertical
          ? "before:absolute before:bottom-0 before:left-[-27px] before:top-2 before:w-0.5 before:bg-border"
          : "before:absolute before:bottom-[-27px] before:left-0 before:right-2 before:h-0.5 before:bg-border",
        isActive && "before:bg-primary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TimelineItemContent.displayName = "TimelineItemContent";

// Add these components as properties to TimelineItem
TimelineItem.Indicator = TimelineItemIndicator;
TimelineItem.Content = TimelineItemContent;