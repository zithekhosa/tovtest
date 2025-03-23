import { Property } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Home, SquareIcon, MapPin, DollarSign } from "lucide-react";

interface PropertyDetailsProps {
  property: Property;
  onApply?: () => void;
  onContact?: () => void;
  isLandlord?: boolean;
  onEdit?: () => void;
}

export default function PropertyDetails({
  property,
  onApply,
  onContact,
  isLandlord = false,
  onEdit,
}: PropertyDetailsProps) {
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
    description,
    available,
    images,
  } = property;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{address}</h1>
          <p className="text-gray-500 flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {city}, {state} {zipCode}
          </p>
        </div>
        
        <div className="flex flex-col items-start md:items-end">
          <div className="text-2xl font-bold text-primary flex items-center">
            <DollarSign className="h-5 w-5" />
            {formatCurrency(rentAmount, false)}
            <span className="text-sm font-normal text-gray-500 ml-1">/month</span>
          </div>
          
          {available ? (
            <Badge className="mt-1 bg-green-500">Available Now</Badge>
          ) : (
            <Badge variant="outline" className="mt-1">Unavailable</Badge>
          )}
        </div>
      </div>

      {/* Property placeholder image */}
      <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
        <Home className="h-24 w-24" />
      </div>

      {/* Property details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center p-3">
          <Home className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-gray-500">Property Type</span>
          <span className="font-medium">{propertyType}</span>
        </div>
        <div className="flex flex-col items-center p-3">
          <Bed className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-gray-500">Bedrooms</span>
          <span className="font-medium">{bedrooms}</span>
        </div>
        <div className="flex flex-col items-center p-3">
          <Bath className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-gray-500">Bathrooms</span>
          <span className="font-medium">{bathrooms}</span>
        </div>
        <div className="flex flex-col items-center p-3">
          <SquareIcon className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-gray-500">Square Feet</span>
          <span className="font-medium">{squareFeet || "N/A"}</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-gray-600 whitespace-pre-line">
          {description || "No description provided."}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isLandlord ? (
          <Button onClick={onEdit} className="flex-1">
            Edit Property
          </Button>
        ) : (
          <>
            {available && onApply && (
              <Button onClick={onApply} className="flex-1">
                Apply to Rent
              </Button>
            )}
            {onContact && (
              <Button variant="outline" onClick={onContact} className="flex-1">
                Contact Landlord
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
