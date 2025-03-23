import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  subtitle: string;
  value: string;
  valueSubtext?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export default function SummaryCard({
  title,
  subtitle,
  value,
  valueSubtext,
  icon: Icon,
  iconBgColor = "bg-primary-50",
  iconColor = "text-primary",
  actionLabel,
  onAction,
  children,
}: SummaryCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-gray-500 text-sm">{subtitle}</p>
            <p className="text-xl font-bold mt-2">{value}</p>
            {valueSubtext && (
              <p className="text-sm text-gray-500">{valueSubtext}</p>
            )}
          </div>
          <div className={`${iconBgColor} p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        
        {children}
        
        {actionLabel && onAction && (
          <div className="mt-4">
            <Button 
              onClick={onAction} 
              className="w-full"
              variant={title === "Rent Payment" ? "default" : "outline"}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
