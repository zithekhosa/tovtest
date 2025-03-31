import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, BedDouble, Bath, Square, ArrowRight } from "lucide-react";
import { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  showViewDetails?: boolean;
}

export default function PropertyCard({ 
  property, 
  onClick,
  showViewDetails = true 
}: PropertyCardProps) {
  // Default property image if none available
  const defaultImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1473&auto=format&fit=crop";
  
  // Helper function to get property image
  const getPropertyImage = () => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    return defaultImage;
  };

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <div className="relative h-52 overflow-hidden">
        <img 
          src={getPropertyImage()} 
          alt={property.title || "Property Image"} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary text-white">
            {property.propertyType === 'apartment' ? 'Apartment' : 
             property.propertyType === 'house' ? 'House' : 
             property.propertyType === 'commercial' ? 'Commercial' :
             property.propertyType === 'office' ? 'Office' :
             property.propertyType === 'land' ? 'Land' : 'Property'}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-white text-primary">
            {property.rentAmount.toLocaleString()} BWP/mo
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{property.title || `${property.propertyType} in ${property.city}`}</CardTitle>
        <div className="flex items-center text-gray-500 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          {property.location || property.address}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <div className="flex items-center text-gray-600">
              <BedDouble className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
          )}
          {property.bathrooms !== null && property.bathrooms !== undefined && (
            <div className="flex items-center text-gray-600">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
          )}
          {property.squareFootage !== null && property.squareFootage !== undefined && (
            <div className="flex items-center text-gray-600">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.squareFootage} m²</span>
            </div>
          )}
        </div>
      </CardContent>
      {showViewDetails && (
        <CardFooter className="pt-0 flex justify-between">
          <Button variant="ghost" className="text-primary p-0 hover:bg-transparent hover:text-primary/80">
            View Details <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}