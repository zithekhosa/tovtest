import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property, User } from "@shared/schema";
import SummaryCard from "@/components/dashboard/SummaryCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import PropertyCard from "@/components/property/PropertyCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { 
  Loader2, 
  Building, 
  Users, 
  Calendar, 
  MessageSquare, 
  Plus,
  Landmark,
  BarChart3,
  TrendingUp,
  ListFilter
} from "lucide-react";

export default function AgencyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all properties (for an agency)
  const { 
    data: properties,
    isLoading: isLoadingProperties,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch all landlords
  const {
    data: landlords,
    isLoading: isLoadingLandlords
  } = useQuery<User[]>({
    queryKey: ["/api/users", "landlord"],
  });

  const isLoading = isLoadingProperties || isLoadingLandlords;

  // Count properties by status
  const totalProperties = properties?.length || 0;
  const availableProperties = properties?.filter(p => p.available).length || 0;
  
  // Total landlords
  const totalLandlords = landlords?.length || 0;
  
  // Calculate total potential commission (2.5% of yearly rent for all properties)
  const potentialYearlyCommission = (properties?.reduce((sum, property) => {
    return sum + property.rentAmount;
  }, 0) || 0) * 12 * 0.025;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-500">Here's an overview of your agency's portfolio.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Properties"
          subtitle="Total properties"
          value={`${totalProperties}`}
          valueSubtext={`${availableProperties} available for rent`}
          icon={Building}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-500"
          actionLabel="View All Properties"
          onAction={() => {}}
        />

        <SummaryCard
          title="Landlords"
          subtitle="Property owners"
          value={`${totalLandlords}`}
          valueSubtext="Active partnerships"
          icon={Users}
          iconBgColor="bg-green-50"
          iconColor="text-green-500"
          actionLabel="View All Landlords"
          onAction={() => {}}
        />

        <SummaryCard
          title="Appointments"
          subtitle="Upcoming viewings"
          value="5"
          valueSubtext="Next 7 days"
          icon={Calendar}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-500"
          actionLabel="View Calendar"
          onAction={() => {}}
        />

        <SummaryCard
          title="Revenue"
          subtitle="Potential yearly commission"
          value={formatCurrency(potentialYearlyCommission)}
          valueSubtext="Based on current properties"
          icon={Landmark}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-500"
          actionLabel="View Finances"
          onAction={() => {}}
        />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Properties Listed</span>
                    <div className="flex items-center">
                      <span className="font-medium">{totalProperties}</span>
                      <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Occupancy Rate</span>
                    <div className="flex items-center">
                      <span className="font-medium">{totalProperties ? Math.round(((totalProperties - availableProperties) / totalProperties) * 100) : 0}%</span>
                      <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Time to Rent</span>
                    <div className="flex items-center">
                      <span className="font-medium">21 days</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Client Satisfaction</span>
                    <div className="flex items-center">
                      <span className="font-medium">4.8/5</span>
                      <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem
                    icon={Building}
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                    title="New Property Listed"
                    description="123 Main St has been added to your listings"
                    timestamp={new Date()}
                  />
                  <ActivityItem
                    icon={Users}
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    title="New Landlord Onboarded"
                    description="John Smith has registered as a landlord"
                    timestamp={new Date(Date.now() - 86400000)}
                  />
                  <ActivityItem
                    icon={Calendar}
                    iconBgColor="bg-yellow-100"
                    iconColor="text-yellow-600"
                    title="Property Viewing Scheduled"
                    description="Viewing for 456 Oak Ave at 2:00 PM tomorrow"
                    timestamp={new Date(Date.now() - 2 * 86400000)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="mt-0">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-medium">Available Properties</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ListFilter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" onClick={() => toast({
                  title: "Coming Soon",
                  description: "Add property functionality is coming soon",
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Listing
                </Button>
              </div>
            </div>
            
            {properties && properties.filter(p => p.available).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.filter(p => p.available).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    showActions={true}
                    actionLabel="Promote Listing"
                    onAction={() => toast({
                      title: "Coming Soon",
                      description: "Property promotion functionality is coming soon",
                    })}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No available properties to list</p>
                <Button className="mt-4" onClick={() => toast({
                  title: "Coming Soon",
                  description: "Add property functionality is coming soon",
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Listing
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inquiries" className="mt-0">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Recent Inquiries</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">All</Button>
                <Button variant="outline" size="sm">New</Button>
                <Button variant="outline" size="sm">Responded</Button>
              </div>
            </div>
            
            <div className="divide-y">
              {/* Placeholder inquiries */}
              <div className="py-4 flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Inquiry about 123 Main St</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">New</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">From: Sarah Johnson (sarahjohnson@example.com)</p>
                  <p className="text-sm text-gray-600 mt-1">I'm interested in viewing this property. Is it available for a showing this weekend?</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm">Respond</Button>
                  </div>
                </div>
              </div>
              
              <div className="py-4 flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Inquiry about 456 Oak Ave</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Responded</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">From: Michael Brown (michaelbrown@example.com)</p>
                  <p className="text-sm text-gray-600 mt-1">Are pets allowed in this property? I have a small dog.</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Follow Up</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
