import { LucideIcon } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface ActivityItemProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
  timestamp: Date | string;
}

export default function ActivityItem({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  description,
  timestamp,
}: ActivityItemProps) {
  return (
    <div className="flex items-start">
      <div className="mr-4">
        <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{formatDateTime(timestamp)}</p>
      </div>
    </div>
  );
}
