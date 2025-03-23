import { cn } from '@/lib/utils';
import { Building, User } from 'lucide-react';

interface PropertyCardProps {
  id: number;
  name: string;
  address: string;
  imageUrl: string;
  units: number;
  tenants: number;
  income: string;
  status: 'Fully Occupied' | 'Partially Occupied' | 'Vacant';
  className?: string;
  onClick?: () => void;
}

export function PropertyCard({
  id,
  name,
  address,
  imageUrl,
  units,
  tenants,
  income,
  status,
  className,
  onClick,
}: PropertyCardProps) {
  // Determine badge color based on status
  const getBadgeColor = () => {
    switch (status) {
      case 'Fully Occupied':
        return 'bg-green-500';
      case 'Partially Occupied':
        return 'bg-yellow-500';
      case 'Vacant':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div 
      className={cn(
        "bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-w-16 aspect-h-9 w-full h-40 bg-gray-100 relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`${name} property`} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Building className="h-10 w-10 text-gray-400" />
          </div>
        )}
        <span className={cn(
          "absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-md",
          getBadgeColor()
        )}>
          {status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">{address}</p>
        <div className="flex items-center space-x-3 mt-3">
          <div className="flex items-center">
            <Building className="text-gray-400 mr-1 h-4 w-4" />
            <span className="text-sm text-gray-600">{units} Units</span>
          </div>
          <div className="flex items-center">
            <User className="text-gray-400 mr-1 h-4 w-4" />
            <span className="text-sm text-gray-600">{tenants} Tenants</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <span className="text-primary font-medium">{income}</span>
          <a href={`/properties/${id}`} className="text-sm text-gray-500 hover:text-primary">
            View Details
          </a>
        </div>
      </div>
    </div>
  );
}
