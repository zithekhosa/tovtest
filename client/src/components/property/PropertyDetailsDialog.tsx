import React, { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Property } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  Leaf,
  DollarSign,
  Calendar,
  Timer,
  CornerDownRight,
} from "lucide-react";

interface PropertyDetailsDialogProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PropertyDetailsDialog({
  property,
  open,
  onOpenChange,
}: PropertyDetailsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applyLoading, setApplyLoading] = useState(false);

  // Format the currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle the apply button click
  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to apply for this property",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplyLoading(true);
      
      const response = await apiRequest(
        "POST", 
        "/api/applications", 
        { 
          propertyId: property.id,
          status: "pending",
          moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          notes: "Interested in this property",
        }
      );

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
        toast({
          title: "Application submitted",
          description: "Your application has been submitted successfully",
        });
        onOpenChange(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }
    } catch (error) {
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting your application",
        variant: "destructive",
      });
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{property.title}</DialogTitle>
          <DialogDescription className="flex items-center text-gray-500">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            {property.location}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image gallery */}
          <div className="space-y-3">
            {property.images && property.images.length > 0 ? (
              <div className="rounded-lg overflow-hidden aspect-video bg-gray-100 relative">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden aspect-video bg-gray-100 flex items-center justify-center">
                <Building className="h-16 w-16 text-gray-300" />
              </div>
            )}

            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded overflow-hidden bg-gray-100"
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">
                {formatCurrency(property.rentAmount)}{" "}
                <span className="text-gray-500 text-sm font-normal">
                  per month
                </span>
              </h3>
              <Badge
                variant={
                  property.propertyType === "Apartment"
                    ? "default"
                    : property.propertyType === "House"
                    ? "outline"
                    : "secondary"
                }
                className="mt-1"
              >
                {property.propertyType}
              </Badge>
              {property.available && (
                <Badge variant="success" className="ml-2 mt-1">
                  Available
                </Badge>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-y-3">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{property.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center">
                <Maximize className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{property.squareFootage} sq ft</span>
              </div>
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{property.parkingSpaces} Parking</span>
              </div>
              <div className="flex items-center">
                <Leaf className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">
                  Year built: {property.yearBuilt || "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">
                  Deposit: {formatCurrency(property.securityDeposit)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Description</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {property.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Amenities</h4>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {property.amenities &&
                  property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CornerDownRight className="h-3 w-3 mr-2 text-gray-500" />
                      {amenity}
                    </div>
                  ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Lease Terms</h4>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    Minimum lease: {property.minLeaseTerm || "1"} months
                  </span>
                </div>
                <div className="flex items-center">
                  <Timer className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    Available: {new Date(property.availableDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex items-center">
            <span className="text-lg font-semibold">
              {formatCurrency(property.rentAmount)}
            </span>
            <span className="text-sm text-gray-500 ml-1">per month</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={handleApply}
              disabled={applyLoading || !property.available}
            >
              {applyLoading ? "Applying..." : "Apply Now"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}