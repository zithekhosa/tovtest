import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  action?: React.ReactNode;
  sticky?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  action,
  sticky = false,
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "flex justify-between items-start gap-4 mb-6 flex-wrap",
      sticky && "sticky top-0 z-10 bg-background pt-4 pb-2",
      className
    )}>
      <div className="space-y-1 min-w-0 flex-1">
        <h2 className={cn(
          "text-xl font-semibold tracking-tight sm:text-2xl truncate",
          titleClassName
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(
            "text-muted-foreground text-sm sm:text-base line-clamp-2",
            subtitleClassName
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 mt-0 flex items-center">
          {action}
        </div>
      )}
    </div>
  );
}

// Feed-style header with avatar (like Facebook)
export function FeedSectionHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-4 border-b",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className="shrink-0">{icon}</div>}
        <div className="min-w-0">
          <h2 className="font-medium text-base truncate">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Section divider with text (like "or" in forms)
export function SectionDivider({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center py-4", className)}>
      <div className="flex-grow border-t border-muted"></div>
      <span className="flex-shrink-0 mx-3 text-sm text-muted-foreground">{text}</span>
      <div className="flex-grow border-t border-muted"></div>
    </div>
  );
}