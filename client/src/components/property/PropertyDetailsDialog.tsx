import { Property } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  MapPin,
  Bed, 
  Bath, 
  Square, 
} from "lucide-react";

interface PropertyDetailsDialogProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export default function PropertyDetailsDialog({
  property,
  isOpen,
  onClose,
  onApply,
}: PropertyDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{property.address}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1 text-gray-500" />
              {property.city}, {property.state} {property.zipCode}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        {/* Property image */}
        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img 
              src={property.images[0]} 
              alt={property.address} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </div>
        
        {/* Price and badges */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(property.rentAmount)}
              <span className="text-sm font-normal text-gray-500"> / month</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Badge>{property.propertyType}</Badge>
            {property.available && (
              <Badge className="bg-green-500">Available</Badge>
            )}
          </div>
        </div>
        
        {/* Property details */}
        <div className="grid grid-cols-3 gap-4 py-2">
          <div className="flex items-center">
            <Bed className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p className="font-medium">{property.bedrooms}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Bath className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p className="font-medium">{property.bathrooms}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Square className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Square Feet</p>
              <p className="font-medium">{property.squareFeet || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Description */}
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-600 text-sm">
            {property.description || 
              `Beautiful ${property.bedrooms} bedroom property in ${property.city}. 
              This ${property.propertyType} offers modern amenities and a great location.`}
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onApply}>
            Apply Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}