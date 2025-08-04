import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Property } from "@shared/schema";
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  Square, 
  Calendar, 
  Home, 
  UserRound,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface PropertyDetailsDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestToViewProperty?: (property: Property) => void;
  onApplyForProperty?: (property: Property) => void;
}

export default function PropertyDetailsDialog({
  property,
  open,
  onOpenChange,
  onRequestToViewProperty,
  onApplyForProperty,
}: PropertyDetailsDialogProps) {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!property) return null;
  
  // Default property image if none available
  const defaultImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1473&auto=format&fit=crop";
  
  // Helper function to get property images
  const getPropertyImages = () => {
    if (property.images && property.images.length > 0) {
      return property.images;
    }
    return [defaultImage];
  };
  
  const images = getPropertyImages();
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  // Format currency (BWP)
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + " BWP";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Image Carousel */}
        <div className="relative h-64 sm:h-80 md:h-96 mb-4 rounded-md overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={property.title || "Property Image"}
            className="w-full h-full object-cover"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-white">
              {property.propertyType === 'apartment' ? 'Apartment' : 
               property.propertyType === 'house' ? 'House' : 
               property.propertyType === 'commercial' ? 'Commercial' :
               property.propertyType === 'office' ? 'Office' :
               property.propertyType === 'land' ? 'Land' : 'Property'}
            </Badge>
          </div>
        </div>
        
        <DialogHeader>
          <DialogTitle className="text-heading-2">
            {property.title || `${property.propertyType} in ${property.city}`}
          </DialogTitle>
          <DialogDescription className="flex items-center text-primary">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location || property.address}, {property.city}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
            <Home className="text-primary mb-1" />
            <span className="text-sm text-gray-500">Property Type</span>
            <span className="font-medium">{property.propertyType}</span>
          </div>
          
          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
              <BedDouble className="text-primary mb-1" />
              <span className="text-sm text-gray-500">Bedrooms</span>
              <span className="font-medium">{property.bedrooms}</span>
            </div>
          )}
          
          {property.bathrooms !== null && property.bathrooms !== undefined && (
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
              <Bath className="text-primary mb-1" />
              <span className="text-sm text-gray-500">Bathrooms</span>
              <span className="font-medium">{property.bathrooms}</span>
            </div>
          )}
          
          {property.squareMeters !== null && property.squareMeters !== undefined && (
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
              <Square className="text-primary mb-1" />
              <span className="text-sm text-gray-500">Area</span>
              <span className="font-medium">{property.squareMeters} m²</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Price</h3>
          <div className="text-heading-2 text-primary">
            {formatCurrency(property.rentAmount)}<span className="text-base font-normal text-gray-500"> / month</span>
          </div>
          {property.securityDeposit && (
            <div className="text-sm text-gray-500 mt-1">
              Security Deposit: {formatCurrency(property.securityDeposit)}
            </div>
          )}
        </div>
        
        {property.description && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-4">
          <div className="text-sm text-gray-500 flex items-center sm:order-first order-last">
            <Calendar className="h-4 w-4 mr-1" />
            {property.createdAt 
              ? `Listed on ${new Date(property.createdAt).toLocaleDateString()}`
              : "Available Now"}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {user?.role === "tenant" && (
              <>
                {onRequestToViewProperty && (
                  <Button 
                    variant="outline" 
                    onClick={() => onRequestToViewProperty(property)}
                  >
                    Request Viewing
                  </Button>
                )}
                
                {onApplyForProperty && (
                  <Button onClick={() => onApplyForProperty(property)}>
                    Apply Now
                  </Button>
                )}
              </>
            )}
            
            {(!user || (user.role !== "tenant")) && (
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}