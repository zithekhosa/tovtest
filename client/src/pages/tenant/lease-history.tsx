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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { 
  Loader2, 
  Building, 
  Calendar, 
  FileText, 
  MapPin, 
  Home, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  ExternalLink,
  HelpCircle,
  ClipboardList,
  History,
  CalendarDays
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

interface LeaseWithProperty extends Lease {
  property?: Property;
}

export default function LeaseHistoryPage() {
  const { user } = useAuth();
  const [selectedLease, setSelectedLease] = useState<LeaseWithProperty | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all leases for the tenant
  const {
    data: leases,
    isLoading,
    error
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/tenant/all"],
  });

  // Fetch properties for each lease
  const {
    data: properties,
    isLoading: isLoadingProperties
  } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!leases && leases.length > 0,
  });

  // Combine leases with their properties
  const leasesWithProperties: LeaseWithProperty[] = !leases || !properties 
    ? [] 
    : leases.map(lease => ({
        ...lease,
        property: properties.find(p => p.id === lease.propertyId)
      }));

  // Sort leases by start date descending (most recent first)
  const sortedLeases = [...leasesWithProperties].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Active and previous leases
  const activeLeases = sortedLeases.filter(lease => lease.active);
  const previousLeases = sortedLeases.filter(lease => !lease.active);

  // Get lease duration in months
  const getLeaseDurationInMonths = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months;
  };

  // Get lease status badge
  const getStatusBadge = (lease: Lease) => {
    if (!lease) return null;
    
    if (lease.active) {
      return <Badge className="bg-green-500">Active</Badge>;
    }

    const now = new Date();
    const endDate = new Date(lease.endDate);
    
    if (endDate < now) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-700">Expired</Badge>;
    }

    return <Badge variant="outline" className="bg-amber-50 text-amber-700">Upcoming</Badge>;
  };

  // View lease details
  const handleViewLease = (lease: LeaseWithProperty) => {
    setSelectedLease(lease);
    setIsDialogOpen(true);
  };

  if (isLoading || isLoadingProperties) {
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
          <h2 className="text-xl font-semibold mb-2">Error Loading Lease History</h2>
          <p className="text-gray-500 mb-4">Failed to load your lease history. Please try again later.</p>
        </div>
      </DashLayout>
    );
  }

  if (!sortedLeases || sortedLeases.length === 0) {
    return (
      <DashLayout>
        <DashboardHeader
          title="Lease History"
          subtitle="View your current and previous leases"
        />
        <div className="p-6 bg-white rounded-lg shadow-md text-center mt-6">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Lease History Found</h2>
          <p className="text-gray-500 mb-4">You don't have any lease records in the system.</p>
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
          title="Lease History"
          subtitle="View your current and previous rental agreements"
        />

        {/* Active Lease Card */}
        {activeLeases.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Lease</CardTitle>
              <CardDescription>Your current rental agreement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activeLeases.map(lease => {
                  const property = lease.property;
                  
                  return (
                    <div key={lease.id} className="flex flex-col md:flex-row gap-6">
                      {/* Property Image */}
                      <div className="md:w-1/3 aspect-video bg-gray-100 rounded-md overflow-hidden">
                        {property?.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.address} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      {/* Lease Details */}
                      <div className="md:w-2/3 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">
                              {property ? property.address : `Property #${lease.propertyId}`}
                            </h3>
                            {property && (
                              <p className="text-gray-500 text-sm flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {property.city}, {property.state}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(lease)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Start Date</p>
                            <p className="font-medium">{formatDate(lease.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">End Date</p>
                            <p className="font-medium">{formatDate(lease.endDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Monthly Rent</p>
                            <p className="font-medium">{formatCurrency(lease.rentAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium">
                              {getLeaseDurationInMonths(lease.startDate, lease.endDate)} months
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewLease(lease)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {lease.documentUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={lease.documentUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Download Agreement
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Leases Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lease History</CardTitle>
            <CardDescription>Your previous rental agreements</CardDescription>
          </CardHeader>
          <CardContent>
            {previousLeases.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previousLeases.map((lease) => (
                    <TableRow key={lease.id}>
                      <TableCell className="font-medium">
                        {lease.property ? 
                          lease.property.address.length > 30 
                            ? lease.property.address.substring(0, 30) + '...' 
                            : lease.property.address
                          : `Property #${lease.propertyId}`
                        }
                      </TableCell>
                      <TableCell>
                        {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                      </TableCell>
                      <TableCell>{formatCurrency(lease.rentAmount)}</TableCell>
                      <TableCell>{getStatusBadge(lease)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleViewLease(lease)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6">
                <History className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No previous leases found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rental Timeline */}
        {sortedLeases.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Rental Timeline</CardTitle>
              <CardDescription>Your rental history at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline>
                {sortedLeases.map((lease, index) => (
                  <TimelineItem
                    key={lease.id}
                    title={lease.property ? lease.property.address : `Property #${lease.propertyId}`}
                    description={`${formatDate(lease.startDate)} - ${formatDate(lease.endDate)}`}
                    icon={<CalendarDays className="h-4 w-4" />}
                    isActive={lease.active}
                    isFirst={index === 0}
                    isLast={index === sortedLeases.length - 1}
                  >
                    <div className="text-sm text-muted-foreground">
                      <p>{formatCurrency(lease.rentAmount)}/month</p>
                      <p>
                        {lease.property ? 
                          `${lease.property.bedrooms} bed, ${lease.property.bathrooms} bath in ${lease.property.city}` 
                          : 'Property details not available'}
                      </p>
                    </div>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lease Details Dialog */}
      {selectedLease && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Lease Details</DialogTitle>
              <DialogDescription>
                Rental agreement for {selectedLease.property ? selectedLease.property.address : `Property #${selectedLease.propertyId}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Lease Status */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  {selectedLease.active ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {selectedLease.active ? "Active Lease" : "Previous Lease"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedLease.active 
                        ? `This lease is currently active and will expire on ${formatDate(selectedLease.endDate)}.` 
                        : `This lease was from ${formatDate(selectedLease.startDate)} to ${formatDate(selectedLease.endDate)}.`}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Lease and Property Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lease Information */}
                <div>
                  <h3 className="font-medium mb-3">Lease Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Lease ID:</span>
                      <span className="font-medium">{selectedLease.id}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start Date:</span>
                      <span className="font-medium">{formatDate(selectedLease.startDate)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500">End Date:</span>
                      <span className="font-medium">{formatDate(selectedLease.endDate)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">
                        {getLeaseDurationInMonths(selectedLease.startDate, selectedLease.endDate)} months
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500">Monthly Rent:</span>
                      <span className="font-medium">{formatCurrency(selectedLease.rentAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500">Security Deposit:</span>
                      <span className="font-medium">{formatCurrency(selectedLease.securityDeposit)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span>{getStatusBadge(selectedLease)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Property Information */}
                {selectedLease.property && (
                  <div>
                    <h3 className="font-medium mb-3">Property Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Address:</span>
                        <span className="font-medium">{selectedLease.property.address}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">City:</span>
                        <span className="font-medium">
                          {selectedLease.property.city}, {selectedLease.property.state}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Property Type:</span>
                        <span className="font-medium">{selectedLease.property.propertyType}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bedrooms:</span>
                        <span className="font-medium">{selectedLease.property.bedrooms}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bathrooms:</span>
                        <span className="font-medium">{selectedLease.property.bathrooms}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Square Feet:</span>
                        <span className="font-medium">
                          {selectedLease.property.squareFeet || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Lease Document */}
              <div className="pt-2">
                <h3 className="font-medium mb-3">Lease Agreement</h3>
                {selectedLease.documentUrl ? (
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Lease Agreement Document</p>
                      <p className="text-sm text-gray-500">Signed on {formatDate(selectedLease.startDate)}</p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedLease.documentUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border rounded-md border-dashed">
                    <div className="text-center">
                      <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No lease document available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              {selectedLease.documentUrl && (
                <Button asChild>
                  <a href={selectedLease.documentUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download Agreement
                  </a>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashLayout>
  );
}