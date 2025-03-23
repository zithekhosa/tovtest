import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  icon: LucideIcon;
  actionLink?: string;
  actionText?: string;
}

interface AlertCardProps {
  title: string;
  alerts: Alert[];
  viewAllLink?: string;
  className?: string;
}

export function AlertCard({ title, alerts, viewAllLink, className }: AlertCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200 p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-primary text-sm font-medium hover:underline">
            View All
          </a>
        )}
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => {
          // Determine styling based on alert severity
          const severityStyles = {
            error: {
              bg: "bg-red-50",
              border: "border-red-100",
              textColor: "text-red-600",
              actionColor: "text-red-600",
            },
            warning: {
              bg: "bg-yellow-50",
              border: "border-yellow-100",
              textColor: "text-yellow-600",
              actionColor: "text-yellow-600",
            },
            info: {
              bg: "bg-primary-50",
              border: "border-primary-100",
              textColor: "text-primary-600",
              actionColor: "text-primary-600",
            },
          };
          
          const style = severityStyles[alert.severity];
          
          return (
            <div key={alert.id} className={cn("p-3 border rounded-md", style.bg, style.border)}>
              <div className="flex items-start space-x-3">
                <div className={style.textColor}>
                  <alert.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                  {alert.actionLink && alert.actionText && (
                    <a 
                      href={alert.actionLink} 
                      className={cn("text-xs font-medium mt-2 inline-block hover:underline", style.actionColor)}
                    >
                      {alert.actionText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {alerts.length === 0 && (
          <div className="text-center py-3 bg-gray-50 border border-gray-100 rounded-md">
            <p className="text-gray-500 text-sm">No alerts at this time</p>
          </div>
        )}
      </div>
    </div>
  );
}
