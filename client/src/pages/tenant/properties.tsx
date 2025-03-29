import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashLayout } from "@/layout/dash-layout";
import { useAuth } from "@/hooks/use-auth";
import { Property, Lease } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, Building, MapPin, Calendar, User, DollarSign, Home, Phone, Mail, Tag, MessageSquare, Wrench } from "lucide-react";

export default function TenantProperties() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");

  // Fetch active lease for the tenant
  const { 
    data: leases,
    isLoading: isLoadingLeases,
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/tenant"],
  });

  // Find the active lease
  const activeLease = leases?.find(lease => lease.active === true);

  // Fetch property details if we have an active lease
  const {
    data: property,
    isLoading: isLoadingProperty
  } = useQuery<Property>({
    queryKey: ["/api/properties", activeLease?.propertyId],
    enabled: !!activeLease?.propertyId,
  });

  // Fetch landlord details
  const {
    data: landlord,
    isLoading: isLoadingLandlord
  } = useQuery({
    queryKey: ["/api/users", property?.landlordId],
    enabled: !!property?.landlordId,
  });

  const isLoading = isLoadingLeases || isLoadingProperty || isLoadingLandlord;

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashLayout>
    );
  }

  if (!activeLease || !property) {
    return (
      <DashLayout>
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Active Lease Found</h2>
          <p className="text-gray-500 mb-4">You don't have an active lease in the system.</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="animate-fade-in space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Property</h1>
            <p className="text-gray-500">View details about your rented property</p>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-md">
          <div className="h-48 bg-gray-200 relative">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[0]} 
                alt={property.address} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Home className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h2 className="text-white text-lg md:text-xl font-semibold">{property.address}</h2>
              <div className="flex items-center text-white/90 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {property.city}, {property.state} {property.zipCode}
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Property Details</TabsTrigger>
              <TabsTrigger value="lease">Lease Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Property Type</h3>
                    <p className="font-medium">{property.propertyType || "Residential"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bedrooms</h3>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bathrooms</h3>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Size</h3>
                    <p className="font-medium">{property.squareFeet || 0} sq ft</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Year Built</h3>
                    <p className="font-medium">Not specified</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Amenities</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <p className="text-gray-500">No amenities listed</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="text-gray-700 text-sm">
                      {property.description || "No description available"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="lease" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Lease Period</h3>
                    <p className="font-medium">{formatDate(activeLease.startDate)} - {formatDate(activeLease.endDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Monthly Rent</h3>
                    <p className="font-medium">{formatCurrency(activeLease.rentAmount)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Security Deposit</h3>
                    <p className="font-medium">{formatCurrency(activeLease.securityDeposit)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Due Date</h3>
                    <p className="font-medium">1st of each month</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Lease Status</h3>
                    <p className="font-medium capitalize">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {activeLease.active ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Lease Terms</h3>
                    <p className="text-sm text-gray-700">{activeLease.terms || "Standard lease terms apply"}</p>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full">
                      <Tag className="h-4 w-4 mr-2" />
                      View Lease Document
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4 pt-4">
              {landlord ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Landlord Contact</CardTitle>
                      <CardDescription>Property owner information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{landlord.firstName} {landlord.lastName}</p>
                          <p className="text-sm text-gray-500">Property Owner</p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{landlord.phone || "Phone number not available"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{landlord.email}</span>
                        </div>
                      </div>
                      <div className="pt-3">
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Landlord
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Property Management</CardTitle>
                      <CardDescription>For maintenance and support</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Maintenance Requests</h3>
                        <p className="text-sm text-gray-500">
                          For any maintenance issues or repairs needed at the property.
                        </p>
                        <Button variant="secondary" className="w-full mt-2">
                          <Wrench className="h-4 w-4 mr-2" />
                          Submit Maintenance Request
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Emergency Contact</h3>
                        <p className="text-sm text-gray-500">
                          For urgent issues requiring immediate attention.
                        </p>
                        <div className="flex items-center text-sm mt-1">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span>+267 71234567</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">Landlord information not available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashLayout>
  );
}