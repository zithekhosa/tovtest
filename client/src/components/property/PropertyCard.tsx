import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Building, Bed, Bath, Home, SquareIcon } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  showActions?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export default function PropertyCard({
  property,
  onClick,
  showActions = false,
  actionLabel = "View Details",
  onAction,
}: PropertyCardProps) {
  const {
    address,
    city,
    state,
    zipCode,
    propertyType,
    bedrooms,
    bathrooms,
    squareFeet,
    rentAmount,
    available,
  } = property;

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) onAction();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      {/* Property image placeholder */}
      <div className="relative w-full aspect-video bg-gray-200 flex items-center justify-center text-gray-500">
        <Building size={48} />
        {available && (
          <Badge className="absolute top-2 right-2 bg-green-500">Available</Badge>
        )}
      </div>

      <CardContent className="pt-4 flex-grow">
        <h3 className="text-lg font-semibold line-clamp-1">{address}</h3>
        <p className="text-gray-500 mb-2">{city}, {state} {zipCode}</p>
        <p className="text-xl font-bold text-primary mb-4">{formatCurrency(rentAmount)}<span className="text-sm font-normal text-gray-500">/month</span></p>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center text-gray-600">
            <Home className="h-4 w-4 mr-1" />
            <span className="text-sm">{propertyType}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Bed className="h-4 w-4 mr-1" />
            <span className="text-sm">{bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Bath className="h-4 w-4 mr-1" />
            <span className="text-sm">{bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          {squareFeet && (
            <div className="flex items-center text-gray-600">
              <SquareIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">{squareFeet} sq ft</span>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="border-t p-4">
          <Button className="w-full" onClick={handleAction}>
            {actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
