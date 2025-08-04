import { cn } from '@/lib/utils';
import { Building, User, Eye, PhoneCall, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Property } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AgencyPropertyCardProps {
  property: Property;
  marketingStats: {
    views: number;
    calls: number;
    inquiries: number;
    leadConversionRate: number;
    daysListed: number;
    scheduledViewings: number;
  };
  className?: string;
  onClick?: () => void;
}

export function AgencyPropertyCard({
  property,
  marketingStats,
  className,
  onClick,
}: AgencyPropertyCardProps) {
  // Calculate engagement score (0-100)
  const engagementScore = Math.min(
    100, 
    Math.round((marketingStats.views * 0.2) + (marketingStats.calls * 2) + (marketingStats.scheduledViewings * 5))
  );
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} BWP`;
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-w-16 aspect-h-9 w-full h-48 bg-gray-100 relative">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={property.title || "Property"} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Building className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Badge className="bg-primary text-white">
            {property.propertyType === 'apartment' ? 'Apartment' : 
             property.propertyType === 'house' ? 'House' : 
             property.propertyType === 'commercial' ? 'Commercial' :
             property.propertyType === 'office' ? 'Office' :
             property.propertyType === 'land' ? 'Land' : 'Property'}
          </Badge>
          <Badge className="bg-white text-primary">
            {formatCurrency(property.rentAmount)}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-1">{property.title}</CardTitle>
        <p className="text-sm text-gray-500 line-clamp-1">{property.address}, {property.city}</p>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-4">
        {/* Marketing metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded p-2">
            <div className="flex justify-center mb-1">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg font-semibold">{marketingStats.views}</p>
            <p className="text-caption">Views</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="flex justify-center mb-1">
              <PhoneCall className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg font-semibold">{marketingStats.calls}</p>
            <p className="text-caption">Calls</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="flex justify-center mb-1">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg font-semibold">{marketingStats.scheduledViewings}</p>
            <p className="text-caption">Viewings</p>
          </div>
        </div>
        
        {/* Engagement score */}
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-sm font-medium">Engagement Score</p>
            <p className="text-sm font-semibold">{engagementScore}%</p>
          </div>
          <Progress value={engagementScore} />
        </div>
        
        {/* Market performance indicators */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-success-foreground mr-1" />
            <span className="text-success-foreground font-medium">{marketingStats.leadConversionRate}% conversion</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-600">{marketingStats.daysListed} days listed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}