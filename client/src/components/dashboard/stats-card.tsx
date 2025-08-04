import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  changeValue?: number;
  changeText?: string;
  changeDirection?: 'up' | 'down' | null;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  changeValue,
  changeText,
  changeDirection,
  className,
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-heading-2 text-gray-900 mt-1">{value}</p>
        </div>
        <span className={cn(
          "p-2 rounded-md",
          iconBgColor
        )}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </span>
      </div>
      
      {(changeValue !== undefined || changeText) && (
        <div className="flex items-center mt-4 text-sm">
          {changeDirection && (
            <span className={cn(
              "flex items-center",
              changeDirection === "up" ? "text-success-foreground" : "text-destructive-foreground"
            )}>
              {changeDirection === "up" ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              <span>{changeValue}</span>
            </span>
          )}
          {changeText && (
            <span className="text-gray-500 ml-2">{changeText}</span>
          )}
        </div>
      )}
    </div>
  );
}
