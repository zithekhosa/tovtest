import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property, User } from "@shared/schema";
import DashLayout from "@/components/layout/DashLayout";
import { useParams, useLocation } from "wouter";
import { 
  Loader2, 
  ChevronLeft, 
  Users, 
  PhoneCall, 
  Calendar, 
  Eye, 
  Mail,
  ExternalLink,
  MapPin,
  Home,
  Bed,
  Bath,
  Car,
  AreaChart,
  DollarSign,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Mock data for the view - in a real implementation this would come from APIs
interface PropertyLead {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "new" | "contacted" | "viewing_scheduled" | "canceled" | "converted";
  date: string;
  message: string;
  avatarUrl?: string;
}

interface ViewTimeline {
  date: string;
  count: number;
}

interface PropertyMetrics {
  viewsTimeline: ViewTimeline[];
  totalViews: number;
  uniqueVisitors: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  callsRequested: number;
  emailsRequested: number;
  viewingsScheduled: number;
  averageTimeOnPage: string;
  leads: PropertyLead[];
  similarRentAverage: number;
  marketCompetitiveness: number;
}

// Function to generate mock metrics based on property
const generatePropertyMetrics = (propertyId: number): PropertyMetrics => {
  const seed = propertyId * 13;
  
  // Create views timeline for last 30 days
  const viewsTimeline: ViewTimeline[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    viewsTimeline.push({
      date: date.toISOString().split('T')[0],
      // Random views between 0-10 but with a trend
      count: Math.max(0, Math.floor((seed % 5) + Math.random() * 10 * (1 - i/30)))
    });
  }
  
  // Total views is sum of timeline
  const totalViews = viewsTimeline.reduce((sum, day) => sum + day.count, 0);
  
  // Generate some random leads
  const leadCount = 3 + (seed % 5);
  const leadStatuses: ("new" | "contacted" | "viewing_scheduled" | "canceled" | "converted")[] = [
    "new", "contacted", "viewing_scheduled", "canceled", "converted"
  ];
  
  const leads: PropertyLead[] = [];
  for (let i = 0; i < leadCount; i++) {
    leads.push({
      id: i + 1,
      name: `Potential Client ${i + 1}`,
      email: `client${i+1}@example.com`,
      phone: `+267 ${(75000000 + seed + i) % 80000000}`,
      status: leadStatuses[i % leadStatuses.length],
      date: new Date(today.getTime() - (i * 86400000 * 2)).toISOString().split('T')[0],
      message: "I'm interested in this property and would like more information."
    });
  }
  
  return {
    viewsTimeline,
    totalViews,
    uniqueVisitors: Math.floor(totalViews * 0.7),
    viewsLast7Days: viewsTimeline.slice(-7).reduce((sum, day) => sum + day.count, 0),
    viewsLast30Days: totalViews,
    callsRequested: Math.floor(totalViews * 0.1),
    emailsRequested: Math.floor(totalViews * 0.15),
    viewingsScheduled: Math.floor(totalViews * 0.05),
    averageTimeOnPage: `${1 + (seed % 3)}m ${(seed * 7) % 60}s`,
    leads,
    similarRentAverage: 5000 + (seed % 3000),
    marketCompetitiveness: 25 + (seed % 50)
  };
};

export default function AgencyPropertyDetail() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const propertyId = parseInt(params.id);
  
  // Fetch property details
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property>({
    queryKey: ["/api/properties", propertyId],
    enabled: !isNaN(propertyId) && user?.role === "agency",
  });
  
  // This would be an actual API call in a real application
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<PropertyMetrics>({
    queryKey: ["/api/property/metrics", propertyId],
    enabled: !isNaN(propertyId) && user?.role === "agency",
    initialData: !isNaN(propertyId) ? generatePropertyMetrics(propertyId) : undefined
  });
  
  // Fetch property owner information
  const { data: owner, isLoading: isLoadingOwner } = useQuery<User>({
    queryKey: ["/api/users", property?.landlordId],
    enabled: !!property?.landlordId && user?.role === "agency",
  });
  
  if (isLoadingProperty || isLoadingMetrics || isLoadingOwner) {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading property details...</p>
        </div>
      </DashLayout>
    );
  }
  
  if (!property) {
    return (
      <DashLayout>
        <div className="bg-white p-6 rounded-lg text-center">
          <h3 className="text-body-large">Property not found</h3>
          <p className="text-gray-500 mb-4">The property you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate("/agency/properties")}>
            Back to Properties
          </Button>
        </div>
      </DashLayout>
    );
  }
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} BWP`;
  };
  
  return (
    <DashLayout>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/agency/properties")}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
            <p className="text-gray-500 flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address}, {property.city}, {property.state}
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Listing
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          {/* Property images */}
          <div className="bg-gray-100 h-[300px] rounded-lg overflow-hidden mb-6">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[0]} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>
          
          {/* Property features */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>
                Basic information about this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Home className="h-5 w-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">Type</span>
                  <span className="text-body-small">{property.propertyType}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Bed className="h-5 w-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">Bedrooms</span>
                  <span className="text-body-small">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Bath className="h-5 w-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">Bathrooms</span>
                  <span className="text-body-small">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Car className="h-5 w-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">Parking</span>
                  <span className="text-body-small">{property.parkingSpaces || 0} spaces</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <AreaChart className="h-5 w-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">Area</span>
                  <span className="text-body-small">{property.squareFootage || 0} sqft</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">Rent</span>
                  <span className="text-body-small">{formatCurrency(property.rentAmount)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">Available</span>
                  <span className="text-body-small">
                    {property.available ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-500 mb-1" />
                  <span className="text-sm font-medium">Min Lease</span>
                  <span className="text-body-small">{property.minLeaseTerm || 12} months</span>
                </div>
              </div>
              
              {property.description && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">{property.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          {/* Owner information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Property Owner</CardTitle>
            </CardHeader>
            <CardContent>
              {owner ? (
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={owner.profileImage || undefined} />
                    <AvatarFallback>{owner.firstName.charAt(0)}{owner.lastName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{owner.firstName} {owner.lastName}</p>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Owner information not available</p>
              )}
              <Button className="w-full mt-4" variant="outline">Contact Owner</Button>
            </CardContent>
          </Card>
          
          {/* Market position */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Market Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium">Rent vs. Market Average</p>
                  {property.rentAmount > metrics?.similarRentAverage ? (
                    <Badge variant="outline" className="text-warning-foreground bg-warning/10">Above Average</Badge>
                  ) : (
                    <Badge variant="outline" className="text-success-foreground bg-success/10">Below Average</Badge>
                  )}
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-1 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-success-foreground bg-success/30">
                        Market Avg: {formatCurrency(metrics?.similarRentAverage || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-primary bg-primary/30">
                        This Property: {formatCurrency(property.rentAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium">Competitiveness</p>
                  <p className="text-sm font-semibold">{metrics?.marketCompetitiveness}%</p>
                </div>
                <Progress value={metrics?.marketCompetitiveness || 0} className="h-2" />
                <p className="text-caption mt-1">
                  {metrics?.marketCompetitiveness && metrics.marketCompetitiveness > 70 
                    ? "High competition in this area" 
                    : metrics?.marketCompetitiveness && metrics.marketCompetitiveness > 30
                      ? "Moderate competition" 
                      : "Low competition in this area"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Analytics and Leads Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Performance</CardTitle>
          <CardDescription>
            Analytics and lead information for this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analytics">
            <TabsList className="mb-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="leads">Leads ({metrics?.leads.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-primary mr-2" />
                      <p className="text-heading-2">{metrics?.totalViews || 0}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {metrics?.viewsLast7Days || 0} in last 7 days
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Call Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <PhoneCall className="h-5 w-5 text-primary mr-2" />
                      <p className="text-heading-2">{metrics?.callsRequested || 0}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(((metrics?.callsRequested || 0) / (metrics?.totalViews || 1)) * 100)}% of viewers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Email Inquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-primary mr-2" />
                      <p className="text-heading-2">{metrics?.emailsRequested || 0}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(((metrics?.emailsRequested || 0) / (metrics?.totalViews || 1)) * 100)}% of viewers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Viewings Scheduled</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-primary mr-2" />
                      <p className="text-heading-2">{metrics?.viewingsScheduled || 0}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(((metrics?.viewingsScheduled || 0) / ((metrics?.callsRequested || 0) + (metrics?.emailsRequested || 0))) * 100)}% conversion
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Views Over Time</h3>
                <div className="h-[200px] bg-gray-50 rounded-lg p-4">
                  {/* In a real implementation, there would be a chart here showing the views timeline */}
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Views chart would be displayed here</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="leads">
              {!metrics?.leads.length ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-body-large">No leads yet</h3>
                  <p className="text-gray-500 mb-4">When potential renters show interest, they'll appear here.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{lead.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{lead.email}</p>
                            <p className="text-sm text-gray-500">{lead.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{lead.date}</TableCell>
                        <TableCell>
                          <Badge className={
                            lead.status === "new" ? "bg-primary/10 text-primary" :
                            lead.status === "contacted" ? "bg-warning text-warning-foreground" :
                            lead.status === "viewing_scheduled" ? "bg-accent text-primary" :
                            lead.status === "converted" ? "bg-success text-success-foreground" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {lead.status === "new" ? "New Lead" :
                             lead.status === "contacted" ? "Contacted" :
                             lead.status === "viewing_scheduled" ? "Viewing Scheduled" :
                             lead.status === "converted" ? "Converted" :
                             "Canceled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Contact</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashLayout>
  );
}