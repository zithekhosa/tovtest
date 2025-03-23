import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaintenanceRequest } from "@shared/schema";
import { formatDateTime } from "@/lib/utils";

interface StatusColors {
  [key: string]: {
    bg: string;
    text: string;
  };
}

const statusColors: StatusColors = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  "in progress": {
    bg: "bg-blue-100",
    text: "text-blue-800",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-800",
  },
  cancelled: {
    bg: "bg-gray-100",
    text: "text-gray-800",
  },
};

const priorityColors: StatusColors = {
  low: {
    bg: "bg-gray-100",
    text: "text-gray-800",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  high: {
    bg: "bg-red-100",
    text: "text-red-800",
  },
};

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
  onClick?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  showFooter?: boolean;
}

export default function MaintenanceRequestCard({
  request,
  onClick,
  actionLabel,
  onAction,
  showFooter = true,
}: MaintenanceRequestCardProps) {
  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) onAction();
  };

  const statusStyle = statusColors[request.status] || statusColors.pending;
  const priorityStyle = priorityColors[request.priority] || priorityColors.medium;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
          <Badge className={`${priorityStyle.bg} ${priorityStyle.text}`}>
            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{request.description}</p>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>Created: {formatDateTime(request.createdAt)}</span>
          {request.updatedAt && <span>Updated: {formatDateTime(request.updatedAt)}</span>}
        </div>
      </CardContent>

      {showFooter && (
        <CardFooter className="bg-gray-50 p-4 border-t">
          <Button 
            onClick={handleAction} 
            className="w-full"
            variant={request.status === "completed" ? "outline" : "default"}
          >
            {actionLabel || (request.status === "pending" ? "Update Request" : "View Details")}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
