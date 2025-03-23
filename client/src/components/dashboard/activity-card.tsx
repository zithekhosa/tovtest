import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

interface ActivityCardProps {
  title: string;
  activities: Activity[];
  viewAllLink?: string;
  className?: string;
}

export function ActivityCard({ title, activities, viewAllLink, className }: ActivityCardProps) {
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
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100">
            <div className={cn("p-2 rounded-md", activity.iconBgColor)}>
              <activity.icon className={cn("h-5 w-5", activity.iconColor)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No recent activities</p>
          </div>
        )}
      </div>
    </div>
  );
}
