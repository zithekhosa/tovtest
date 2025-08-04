import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashLayout from "@/components/layout/DashLayout";
import { useAuth } from "@/hooks/use-auth";
import { Property, Lease } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, Building, MapPin, Calendar, User, DollarSign, Home, Phone, Mail, Tag, MessageSquare, Wrench, FileText, Star as StarIcon, Download, ExternalLink } from "lucide-react";
import LeaseTerminationModal from "@/components/lease/LeaseTerminationModal";

export default function TenantProperties() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [showTerminationModal, setShowTerminationModal] = useState(false);

  const handleViewDocument = (documentUrl: string) => {
    try {
      // Check if the URL is valid
      new URL(documentUrl);
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Invalid document URL:', error);
      // You could show a toast notification here
      alert('Unable to open document. Please contact your landlord.');
    }
  };

  const handleDownloadDocument = (documentUrl: string, leaseId: number) => {
    try {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = `lease-agreement-${leaseId}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      // Fallback to opening in new tab
      handleViewDocument(documentUrl);
    }
  };

  // Fetch active lease for the tenant
  const { 
    data: leases,
    isLoading: isLoadingLeases,
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/tenant"],
    queryFn: async () => {
      const response = await fetch("/api/leases/tenant", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch leases");
      }
      return response.json();
    },
  });

  // Find the active lease
  const activeLease = leases?.find(lease => lease.active === true);

  // Fetch all termination requests for the tenant
  const {
    data: terminationRequests,
    isLoading: isLoadingTermination
  } = useQuery({
    queryKey: ["/api/lease-terminations/tenant"],
    queryFn: async () => {
      const response = await fetch("/api/lease-terminations/tenant", {
        credentials: "include"
      });
      if (!response.ok) {
        if (response.status === 404) return []; // No termination requests
        throw new Error("Failed to fetch termination requests");
      }
      return response.json();
    },
  });

  // Find termination request for the active lease
  const activeLeaseTermination = terminationRequests?.find(
    (req: any) => req.leaseId === activeLease?.id && ['pending', 'active'].includes(req.status)
  );

  // Fetch property details if we have an active lease
  const {
    data: property,
    isLoading: isLoadingProperty
  } = useQuery<Property>({
    queryKey: ["/api/properties", activeLease?.propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${activeLease?.propertyId}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch property");
      }
      return response.json();
    },
    enabled: !!activeLease?.propertyId,
  });

  // Fetch landlord details
  const {
    data: landlord,
    isLoading: isLoadingLandlord
  } = useQuery({
    queryKey: ["/api/users", property?.landlordId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${property?.landlordId}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch landlord");
      }
      return response.json();
    },
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
          <h2 className="text-heading-3 mb-2">No Active Lease Found</h2>
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
            <h1 className="text-heading-2 text-gray-900">Your Property</h1>
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
              <h2 className="text-white text-lg md:text-heading-3">{property.address}</h2>
              <div className="flex items-center text-white/90 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {property.city}, {property.state} {property.zipCode}
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Property Details</TabsTrigger>
              <TabsTrigger value="lease">Lease Info</TabsTrigger>
              <TabsTrigger value="booking">Book Inspection</TabsTrigger>
              <TabsTrigger value="rating">Rate Experience</TabsTrigger>
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
                    <p className="font-medium">{property.squareMeters || 0} m²</p>
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
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-success text-success-foreground">
                        {activeLease.active ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Lease Terms</h3>
                    <p className="text-sm text-gray-700">Standard lease terms apply</p>
                  </div>
                  <div className="pt-4 space-y-2">
                    {activeLease?.documentUrl ? (
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleViewDocument(activeLease.documentUrl!)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleDownloadDocument(activeLease.documentUrl!, activeLease.id)}
                          title="Download lease document"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled
                        title="No lease document available - contact your landlord"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        No Document Available
                      </Button>
                    )}
                    
                    {/* Termination Status and Button */}
                    {activeLeaseTermination ? (
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-yellow-800">
                                {activeLeaseTermination.status === 'pending' && 'Termination Pending Approval'}
                                {activeLeaseTermination.status === 'active' && 'Termination Approved'}
                                {activeLeaseTermination.status === 'completed' && 'Lease Terminated'}
                                {activeLeaseTermination.status === 'disputed' && 'Termination Disputed'}
                                {activeLeaseTermination.status === 'cancelled' && 'Termination Cancelled'}
                              </p>
                              <p className="text-sm text-yellow-600">
                                {activeLeaseTermination.status === 'pending' && 'Your landlord will review your request'}
                                {activeLeaseTermination.status === 'active' && `Effective: ${formatDate(activeLeaseTermination.effectiveDate)}`}
                                {activeLeaseTermination.status === 'completed' && 'Your lease has been terminated'}
                                {activeLeaseTermination.status === 'disputed' && 'There is a dispute regarding your termination'}
                                {activeLeaseTermination.status === 'cancelled' && 'Your termination request was cancelled'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Submitted: {formatDate(activeLeaseTermination.createdAt)} • 
                                Reason: {activeLeaseTermination.reason.replace(/_/g, ' ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                activeLeaseTermination.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                activeLeaseTermination.status === 'active' ? 'bg-green-100 text-green-800' :
                                activeLeaseTermination.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                activeLeaseTermination.status === 'disputed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activeLeaseTermination.status.charAt(0).toUpperCase() + activeLeaseTermination.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {activeLeaseTermination.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              // TODO: Add cancel termination functionality
                              console.log('Cancel termination request');
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Cancel Termination Request
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => setShowTerminationModal(true)}
                        disabled={isLoadingTermination}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Request Lease Termination
                      </Button>
                    )}
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
                          <p className="font-medium">{(landlord as any).firstName || 'Unknown'} {(landlord as any).lastName || 'Landlord'}</p>
                          <p className="text-sm text-gray-500">Property Owner</p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{(landlord as any).phone || "Phone number not available"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{(landlord as any).email || "Email not available"}</span>
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
                          <Wrench className="h-4 w-4 mr-2 shrink-0" />
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
            
            <TabsContent value="booking" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Book Inspection</CardTitle>
                  <CardDescription>Schedule property inspections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-body-large mb-2">Schedule Inspection</h3>
                    <p className="text-gray-500 mb-4">Book property maintenance or move-in inspections</p>
                    <Button asChild>
                      <a href="/tenant/appointment-booking" className="inline-flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="rating" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rate Experience</CardTitle>
                  <CardDescription>Share feedback about your rental experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-body-large mb-2">Property & Landlord Rating</h3>
                    <p className="text-gray-500 mb-4">Rate your property and landlord experience</p>
                    <Button asChild>
                      <a href="/tenant/rating-reviews" className="inline-flex items-center">
                        <StarIcon className="h-4 w-4 mr-2" />
                        Leave Review
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Termination History */}
        {terminationRequests && terminationRequests.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lease Termination History
              </CardTitle>
              <CardDescription>
                Your lease termination requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {terminationRequests.map((request: any) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">
                          {request.property?.address || `Property ${request.lease?.propertyId}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Reason: {request.reason.replace(/_/g, ' ')} • 
                          Submitted: {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'active' ? 'bg-green-100 text-green-800' :
                        request.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        request.status === 'disputed' ? 'bg-red-100 text-red-800' :
                        request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Notice Period:</span>
                        <p className="font-medium">{request.noticePeriodDays} days</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Effective Date:</span>
                        <p className="font-medium">{formatDate(request.effectiveDate)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Termination Fee:</span>
                        <p className="font-medium">{formatCurrency(request.terminationFee || 0)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Initiated By:</span>
                        <p className="font-medium capitalize">{request.initiatedBy}</p>
                      </div>
                    </div>

                    {request.legalNotes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Notes:</span> {request.legalNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lease Termination Modal */}
      {activeLease && (
        <LeaseTerminationModal
          isOpen={showTerminationModal}
          onClose={() => setShowTerminationModal(false)}
          lease={{
            id: activeLease.id,
            startDate: activeLease.startDate,
            endDate: activeLease.endDate,
            rentAmount: activeLease.rentAmount,
            securityDeposit: activeLease.securityDeposit,
            property: property ? {
              title: property.title,
              address: property.address
            } : undefined
          }}
        />
      )}
    </DashLayout>
  );
}