import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRoleType } from "@shared/schema";
import { BarChart, BarChart3, DollarSign, TrendingUp, TrendingDown, Users, Calendar, Building, HomeIcon, Wrench, Clock, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    text?: string;
  };
  progress?: {
    value: number;
    max: number;
  };
  className?: string;
}

export function MetricsCard({ title, value, description, icon, trend, progress, className }: MetricsCardProps) {
  // Determine icon background color based on the icon's text color class
  const iconClasses = (icon as React.ReactElement)?.props?.className || "";
  let bgColorClass = "bg-primary/10";
  
  if (iconClasses.includes("text-blue")) {
    bgColorClass = "bg-blue-100";
  } else if (iconClasses.includes("text-green")) {
    bgColorClass = "bg-green-100";
  } else if (iconClasses.includes("text-amber")) {
    bgColorClass = "bg-amber-100";
  } else if (iconClasses.includes("text-purple")) {
    bgColorClass = "bg-purple-100";
  }

  return (
    <div className={`tov-metrics-card bg-white border p-3 hover:bg-gray-50 transition-colors flex items-center ${className || ''}`}>
      <div className={`h-8 w-8 ${bgColorClass} flex items-center justify-center shrink-0 mr-3`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <h3 className="text-xs font-medium tov-truncate-text">{title}</h3>
        <div className="flex items-baseline gap-2">
          <div className="text-base font-bold">{value}</div>
          
          {trend && (
            <div className="flex items-center text-xs">
              {trend.isPositive ? (
                <TrendingUp className="mr-0.5 h-3 w-3 text-green-500 shrink-0" />
              ) : (
                <TrendingDown className="mr-0.5 h-3 w-3 text-red-500 shrink-0" />
              )}
              <span className={`${trend.isPositive ? "text-green-500" : "text-red-500"} tov-text-ellipsis`}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground truncate">
            {description}
          </p>
        )}
        
        {progress && (
          <div className="mt-1 w-full">
            <Progress value={(progress.value / progress.max) * 100} className="h-1" />
            <p className="text-xs text-muted-foreground mt-0.5">
              {progress.value} of {progress.max}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Chart data for different user roles
const propertyOccupancyData = [
  { month: "Jan", occupancy: 85 },
  { month: "Feb", occupancy: 83 },
  { month: "Mar", occupancy: 86 },
  { month: "Apr", occupancy: 89 },
  { month: "May", occupancy: 92 },
  { month: "Jun", occupancy: 94 },
  { month: "Jul", occupancy: 95 },
  { month: "Aug", occupancy: 93 },
  { month: "Sep", occupancy: 91 },
  { month: "Oct", occupancy: 93 },
  { month: "Nov", occupancy: 95 },
  { month: "Dec", occupancy: 97 },
];

const tenantRentData = [
  { month: "Jan", paid: true },
  { month: "Feb", paid: true },
  { month: "Mar", paid: true },
  { month: "Apr", paid: true },
  { month: "May", paid: true },
  { month: "Jun", paid: true },
  { month: "Jul", paid: true },
  { month: "Aug", paid: true },
  { month: "Sep", paid: true },
  { month: "Oct", paid: true },
  { month: "Nov", paid: true },
  { month: "Dec", paid: false },
];

// Metrics for different user roles
export function getTenantMetrics() {
  return [
    {
      title: "Rent Status",
      value: "Paid",
      description: "Last payment on November 1, 2023",
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      progress: {
        value: 11,
        max: 12
      }
    },
    {
      title: "Maintenance Requests",
      value: "2",
      description: "1 pending, 1 completed",
      icon: <Wrench className="h-4 w-4 text-primary" />
    },
    {
      title: "Rent Tokens Earned",
      value: formatCurrency(358),
      description: "Redeemable for next rent",
      icon: <ShieldCheck className="h-4 w-4 text-primary" />,
      trend: {
        value: 12,
        isPositive: true,
        text: "since last month"
      }
    },
    {
      title: "Lease Ends In",
      value: "128 days",
      description: "Renewal eligible on February 15, 2024",
      icon: <Calendar className="h-4 w-4 text-primary" />
    }
  ];
}

export function getLandlordMetrics(propertyCount = 5, vacancyCount = 1, monthlyIncome = 35800) {
  return [
    {
      title: "Properties",
      value: propertyCount,
      description: `${propertyCount - vacancyCount} occupied, ${vacancyCount} vacant`,
      icon: <Building className="h-5 w-5 text-blue-600" />,
      progress: {
        value: propertyCount - vacancyCount,
        max: propertyCount
      }
    },
    {
      title: "Monthly Income",
      value: formatCurrency(monthlyIncome),
      description: "Across all properties",
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      trend: {
        value: 9.5,
        isPositive: true
      }
    },
    {
      title: "Maintenance",
      value: "4",
      description: "2 pending, 2 in progress",
      icon: <Wrench className="h-5 w-5 text-amber-600" />
    },
    {
      title: "Leases Renewing",
      value: "2",
      description: "Within the next 60 days",
      icon: <Calendar className="h-5 w-5 text-purple-600" />
    }
  ];
}

export function getAgencyMetrics(listedProperties = 12, activeLeases = 8, potentialCommission = 25600) {
  return [
    {
      title: "Listed Properties",
      value: listedProperties,
      description: `${activeLeases} under management`,
      icon: <Building className="h-4 w-4 text-primary" />,
      trend: {
        value: 8.5,
        isPositive: true,
        text: "new listings this month"
      }
    },
    {
      title: "Potential Commission",
      value: formatCurrency(potentialCommission),
      description: "Annualized projection",
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      trend: {
        value: 5.2,
        isPositive: true
      }
    },
    {
      title: "Client Inquiries",
      value: "23",
      description: "7 new in the last week",
      icon: <Users className="h-4 w-4 text-primary" />,
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      title: "Average Time to Rent",
      value: "21 days",
      description: "3 days faster than market average",
      icon: <Clock className="h-4 w-4 text-primary" />,
      trend: {
        value: 15,
        isPositive: true,
        text: "faster than last quarter"
      }
    }
  ];
}

export function getMaintenanceMetrics(completedJobs = 37, pendingJobs = 5, avgRating = 4.8) {
  return [
    {
      title: "Completed Jobs",
      value: completedJobs,
      description: "This month",
      icon: <Wrench className="h-4 w-4 text-primary" />,
      trend: {
        value: 12,
        isPositive: true,
        text: "vs. last month"
      }
    },
    {
      title: "Available Jobs",
      value: pendingJobs,
      description: "Awaiting service provider",
      icon: <Calendar className="h-4 w-4 text-primary" />
    },
    {
      title: "Earnings Potential",
      value: formatCurrency(pendingJobs * 850),
      description: "From available jobs",
      icon: <DollarSign className="h-4 w-4 text-primary" />
    },
    {
      title: "Rating",
      value: avgRating.toFixed(1),
      description: "Based on client feedback",
      icon: <BarChart3 className="h-4 w-4 text-primary" />,
      progress: {
        value: avgRating * 10,
        max: 50
      }
    }
  ];
}

export function getDashboardMetrics(role: UserRoleType) {
  switch (role) {
    case 'tenant':
      return getTenantMetrics();
    case 'landlord':
      return getLandlordMetrics();
    case 'agency':
      return getAgencyMetrics();
    case 'maintenance':
      return getMaintenanceMetrics();
    default:
      return [];
  }
}