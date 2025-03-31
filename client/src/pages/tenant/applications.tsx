import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Lease, Property } from "@shared/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { 
  Loader2, 
  Building, 
  Clock, 
  Calendar, 
  CalendarDays,
  FileText, 
  MapPin,
  Home,
  Bed,
  Bath,
  SquareIcon,
  DollarSign,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
  LinkIcon,
  CornerDownRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";

interface ApplicationWithProperty extends Lease {
  property?: Property;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithProperty | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch applications (pending leases)
  const {
    data: applications,
    isLoading,
    error
  } = useQuery<ApplicationWithProperty[]>({
    queryKey: ["/api/applications"],
  });

  // Get application status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "pending_approval":
        return <Badge className="bg-yellow-500">Pending Approval</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case "rejected":
        return <XCircle className="h-8 w-8 text-red-500" />;
      case "pending_approval":
      default:
        return <Clock className="h-8 w-8 text-yellow-500" />;
    }
  };

  // View application details
  const handleViewApplication = (application: ApplicationWithProperty) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  // Send a message about the application
  const handleSendMessage = async () => {
    if (!selectedApplication || !message.trim()) return;
    
    try {
      // In a real app, this would send a message to the landlord/agency
      alert("Message sent successfully!");
      setMessage("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Applications</h2>
          <p className="text-gray-500 mb-4">Failed to load your applications. Please try again later.</p>
        </div>
      </DashLayout>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <DashLayout>
        <DashboardHeader
          title="My Applications"
          subtitle="Track the status of your rental applications"
        />
        <div className="p-6 bg-white rounded-lg shadow-md text-center mt-6">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Applications Found</h2>
          <p className="text-gray-500 mb-4">You haven't submitted any rental applications yet.</p>
          <Button asChild>
            <a href="/tenant/property-search">Find Properties</a>
          </Button>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="space-y-6">
        <DashboardHeader
          title="My Applications"
          subtitle="Track the status of your rental applications"
        />

        {/* Application Status Cards */}
        <div className="space-y-4">
          {applications.map(application => (
            <Card key={application.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                <div className="w-full md:w-1/4 bg-gray-100">
                  {application.property?.images && application.property.images.length > 0 ? (
                    <img 
                      src={application.property.images[0]} 
                      alt={application.property?.address || 'Property'} 
                      className="object-cover w-full h-full min-h-[160px]"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[160px] flex items-center justify-center">
                      <Building className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                </div>
                
                {/* Application Details */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">
                        {application.property ? application.property.address : `Property #${application.propertyId}`}
                      </h3>
                      {application.property && (
                        <p className="text-gray-500 text-sm flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {application.property.city}, {application.property.state}
                        </p>
                      )}
                    </div>
                    <div>
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Applied on:</span>
                      <span className="ml-1 font-medium">{formatDate(application.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Lease Period:</span>
                      <span className="ml-1 font-medium truncate">
                        {formatDate(application.startDate)} - {formatDate(application.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="ml-1 font-medium">{formatCurrency(application.rentAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleViewApplication(application)}
                    >
                      <FileText className="h-4 w-4" />
                      View Details
                    </Button>
                    
                    {application.status === "pending_approval" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                      >
                        <HelpCircle className="h-4 w-4" />
                        Check Status
                      </Button>
                    )}
                    
                    {application.status === "approved" && (
                      <Button 
                        size="sm" 
                        className="gap-1 bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        View Lease
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Status Timeline */}
                <div className="w-full md:w-1/6 bg-gray-50 p-4 flex flex-col items-center justify-center border-l">
                  {getStatusIcon(application.status)}
                  <p className="text-sm font-medium mt-2">
                    {application.status === "pending_approval" ? "Under Review" : 
                     application.status === "approved" ? "Approved" : "Rejected"}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {application.status === "pending_approval" 
                      ? "Your application is being reviewed" 
                      : application.status === "approved"
                        ? "Congratulations! Your application has been approved."
                        : "Unfortunately, your application was not accepted."}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Application tracking info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Process</CardTitle>
            <CardDescription>
              Understanding the rental application process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 my-1"></div>
                </div>
                <div className="pt-1">
                  <h3 className="font-medium">Application Submitted</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Your application is received by the property manager or landlord for review.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 my-1"></div>
                </div>
                <div className="pt-1">
                  <h3 className="font-medium">Document Verification</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Your submitted documents and information are verified.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 my-1"></div>
                </div>
                <div className="pt-1">
                  <h3 className="font-medium">Background Check</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    A background check may be conducted, including rental history and credit check.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center text-white font-bold">
                    4
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="font-medium">Decision</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Based on all information, your application will be approved or declined. 
                    If approved, a lease agreement will be prepared.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Application for {selectedApplication.property ? selectedApplication.property.address : `Property #${selectedApplication.propertyId}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Application Status */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  {getStatusIcon(selectedApplication.status)}
                  <div className="ml-3">
                    <h3 className="font-medium">
                      {selectedApplication.status === "pending_approval" ? "Application Under Review" : 
                       selectedApplication.status === "approved" ? "Application Approved" : "Application Rejected"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedApplication.status === "pending_approval" 
                        ? "Your application is being reviewed by the property manager." 
                        : selectedApplication.status === "approved"
                          ? "Congratulations! Your application has been approved."
                          : "Unfortunately, your application was not accepted."}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Property Details */}
              {selectedApplication.property && (
                <div>
                  <h3 className="font-medium mb-2">Property Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center text-sm">
                      <Home className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-1 font-medium">
                        {selectedApplication.property.propertyType}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-1 font-medium">
                        {selectedApplication.property.city}, {selectedApplication.property.state}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Bed className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="ml-1 font-medium">
                        {selectedApplication.property.bedrooms}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Bath className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="ml-1 font-medium">
                        {selectedApplication.property.bathrooms}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <SquareIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-1 font-medium">
                        {selectedApplication.property.squareFootage || 'N/A'} sq ft
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Rent:</span>
                      <span className="ml-1 font-medium">
                        {formatCurrency(selectedApplication.property.rentAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              {/* Application Details */}
              <div>
                <h3 className="font-medium mb-2">Application Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Applied on:</span>
                    <span className="ml-1 font-medium">
                      {formatDate(selectedApplication.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Proposed Lease Period:</span>
                    <span className="ml-1 font-medium">
                      {formatDate(selectedApplication.startDate)} - {formatDate(selectedApplication.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="ml-1 font-medium">
                      {formatCurrency(selectedApplication.rentAmount)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Security Deposit:</span>
                    <span className="ml-1 font-medium">
                      {formatCurrency(selectedApplication.securityDeposit)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Contact Landlord/Agent */}
              <div>
                <h3 className="font-medium mb-2">Contact About This Application</h3>
                <Textarea 
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mb-3"
                />
                <Button 
                  className="w-full gap-1"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              {selectedApplication.status === "pending_approval" && (
                <Button variant="destructive" size="sm">
                  Withdraw Application
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashLayout>
  );
}