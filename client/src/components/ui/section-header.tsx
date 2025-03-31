import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  action,
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "flex justify-between items-start gap-4 mb-6 flex-wrap",
      className
    )}>
      <div className="space-y-2">
        <h2 className={cn(
          "text-2xl font-semibold tracking-tight",
          titleClassName
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(
            "text-muted-foreground",
            subtitleClassName
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 mt-1">
          {action}
        </div>
      )}
    </div>
  );
}