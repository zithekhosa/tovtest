import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashLayout from "@/components/layout/DashLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { formatCurrency, formatDate, apiRequest } from "@/lib/utils";
import { Lease, Property } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Building, 
  Clock, 
  FileText, 
  CheckCircle2,
  XCircle
} from "lucide-react";

interface Application {
  id: number;
  propertyId: number;
  tenantId: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  employmentInfo: {
    monthlyIncome: number;
    employer: string;
  };
  rentalInfo: {
    moveInDate: string;
    leaseDuration: number;
  };
  property?: Property;
  documents?: {
    type: string;
    filename: string;
    uploadedAt: string;
  }[];
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Fetch tenant applications
  const {
    data: applications,
    isLoading,
    error
  } = useQuery<Application[]>({
    queryKey: ["/api/applications/tenant"],
    queryFn: () => apiRequest("GET", "/api/applications/tenant"),
  });

  // Get application status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-destructive">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get application status description
  const getStatusDescription = (status: string) => {
    switch (status) {
      case "approved":
        return "Your application has been approved! Check your lease history for next steps.";
      case "rejected":
        return "Unfortunately, your application was not approved this time.";
      case "pending":
        return "Your application is currently being reviewed by the landlord.";
      default:
        return "Application status unknown.";
    }
  };

  // Separate applications by status
  const pendingApplications = applications?.filter(app => app.status === 'pending') || [];
  const approvedApplications = applications?.filter(app => app.status === 'approved') || [];
  const rejectedApplications = applications?.filter(app => app.status === 'rejected') || [];

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
          <XCircle className="h-12 w-12 text-destructive-foreground mx-auto mb-4" />
          <h2 className="text-heading-3 mb-2">Error Loading Applications</h2>
          <p className="text-gray-500 mb-4">Failed to load your applications. Please try again later.</p>
        </div>
      </DashLayout>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <DashLayout>
        <DashboardHeader
          title="Leasing Management"
          subtitle="Manage applications, lease history, and renewals"
        />
        <div className="p-6 bg-white rounded-lg shadow-md text-center mt-6">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-heading-3 mb-2">No Applications Found</h2>
          <p className="text-gray-500 mb-4">You haven't submitted any rental applications yet.</p>
          <Button asChild>
            <a href="/properties">Find Properties</a>
          </Button>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="space-y-6">
        <DashboardHeader
          title="Leasing Management"
          subtitle="Manage applications, lease history, and renewals"
        />
        
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="history">Lease History</TabsTrigger>
            <TabsTrigger value="renewal">Lease Renewal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-warning">{pendingApplications.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-success">{approvedApplications.length}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-destructive">{rejectedApplications.length}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {applications?.map(application => (
                <Card key={application.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {application.property?.title || `Property #${application.propertyId}`}
                        </h3>
                        <p className="text-gray-600">
                          {application.property?.address}
                        </p>
                        <p className="text-sm text-gray-500">
                          Applied on {formatDate(new Date(application.submittedAt))}
                        </p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    {/* Status Description */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {getStatusDescription(application.status)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Property Rent:</span>
                        <p>{formatCurrency(application.property?.rentAmount || 0)}/month</p>
                      </div>
                      <div>
                        <span className="font-medium">Move-in Date:</span>
                        <p>{formatDate(new Date(application.rentalInfo.moveInDate))}</p>
                      </div>
                      <div>
                        <span className="font-medium">Lease Duration:</span>
                        <p>{application.rentalInfo.leaseDuration} months</p>
                      </div>
                    </div>

                    {/* Documents */}
                    {application.documents && application.documents.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">Documents Submitted: {application.documents.length}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {application.documents.map((doc, index) => (
                            <div key={index} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                              {doc.type.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {application.status === 'approved' && (
                      <div className="mt-4 pt-4 border-t">
                        <Button asChild className="bg-success hover:bg-success/90">
                          <a href="/tenant/lease-history">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            View Lease Agreement
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lease History</CardTitle>
                <CardDescription>View your past and current lease agreements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-body-large mb-2">Lease History</h3>
                  <p className="text-gray-500 mb-4">View all your lease agreements and history</p>
                  <Button asChild>
                    <a href="/tenant/lease-history" className="inline-flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      View Lease History
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="renewal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lease Renewal</CardTitle>
                <CardDescription>Manage your lease renewal process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-body-large mb-2">Lease Renewal</h3>
                  <p className="text-gray-500 mb-4">Manage your lease renewal and extension requests</p>
                  <Button asChild>
                    <a href="/tenant/lease-renewal-management" className="inline-flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Manage Renewals
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashLayout>
  );
}