import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property, Lease, MaintenanceRequest, Payment } from "@shared/schema";
import SummaryCard from "@/components/dashboard/SummaryCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";
import { 
  Loader2, 
  Building, 
  Users, 
  Wrench, 
  DollarSign, 
  LayoutDashboard, 
  Plus,
  MessageSquare, 
  BellRing,
  CheckCircle
} from "lucide-react";

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch landlord properties
  const { 
    data: properties,
    isLoading: isLoadingProperties,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties/landlord"],
  });

  // Fetch maintenance requests for properties
  const {
    data: maintenanceRequests,
    isLoading: isLoadingMaintenance
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/property", properties?.[0]?.id],
    enabled: !!properties && properties.length > 0,
  });

  // Count all properties
  const propertyCount = properties?.length || 0;
  
  // Count properties with tenants
  const occupiedProperties = properties?.filter(p => !p.available).length || 0;
  
  // Count pending maintenance requests
  const pendingMaintenanceCount = maintenanceRequests?.filter(
    r => r.status === "pending"
  ).length || 0;

  // Calculate total monthly rent
  const totalMonthlyRent = properties?.reduce((sum, property) => {
    return sum + (property.available ? 0 : property.rentAmount);
  }, 0) || 0;

  const isLoading = isLoadingProperties || isLoadingMaintenance;

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
        <p className="text-gray-500">Here's an overview of your rental properties.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Properties"
          subtitle="Total properties"
          value={`${propertyCount}`}
          valueSubtext={`${occupiedProperties} occupied, ${propertyCount - occupiedProperties} vacant`}
          icon={Building}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-500"
          actionLabel="View All Properties"
          onAction={() => {}}
        />

        <SummaryCard
          title="Tenants"
          subtitle="Current tenants"
          value={`${occupiedProperties}`}
          valueSubtext="Active leases"
          icon={Users}
          iconBgColor="bg-green-50"
          iconColor="text-green-500"
          actionLabel="View All Tenants"
          onAction={() => {}}
        />

        <SummaryCard
          title="Maintenance"
          subtitle="Pending requests"
          value={`${pendingMaintenanceCount}`}
          valueSubtext={pendingMaintenanceCount === 1 ? "Needs attention" : "Need attention"}
          icon={Wrench}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-500"
          actionLabel="View Requests"
          onAction={() => {}}
        />

        <SummaryCard
          title="Income"
          subtitle="Monthly rent"
          value={formatCurrency(totalMonthlyRent)}
          valueSubtext="Total from all properties"
          icon={DollarSign}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-500"
          actionLabel="View Finances"
          onAction={() => {}}
        />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <BellRing className="mr-2 h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRequests && maintenanceRequests.length > 0 ? (
                    <>
                      <ActivityItem
                        icon={Wrench}
                        iconBgColor="bg-yellow-100"
                        iconColor="text-yellow-600"
                        title="New Maintenance Request"
                        description={`A tenant reported an issue: "${maintenanceRequests[0].title}"`}
                        timestamp={maintenanceRequests[0].createdAt}
                      />
                      <ActivityItem
                        icon={CheckCircle}
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                        title="Rent Payment Received"
                        description="Tenant paid their monthly rent on time"
                        timestamp={new Date()}
                      />
                      <ActivityItem
                        icon={MessageSquare}
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                        title="New Message"
                        description="You have a new message from a tenant"
                        timestamp={new Date(Date.now() - 86400000)}
                      />
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity to display</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <LayoutDashboard className="mr-2 h-5 w-5 text-primary" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem
                    icon={DollarSign}
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                    title="Collect Rent"
                    description="Monthly rent collection is due in 5 days"
                    timestamp={new Date(Date.now() + 5 * 86400000)}
                  />
                  <ActivityItem
                    icon={Building}
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                    title="Property Inspection"
                    description="Schedule annual inspection for 123 Main St"
                    timestamp={new Date(Date.now() + 15 * 86400000)}
                  />
                  <ActivityItem
                    icon={Users}
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    title="Lease Renewal"
                    description="Tenant lease expires in 30 days"
                    timestamp={new Date(Date.now() + 30 * 86400000)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="mt-0">
          <div className="bg-white rounded-xl p-6 shadow-card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Your Properties</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Property
              </Button>
            </div>
            
            {properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((property) => (
                  <Link key={property.id} href={`/landlord/properties/${property.id}`}>
                    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                      <div className="bg-gray-100 h-36 flex items-center justify-center">
                        <Building className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium truncate">{property.address}</h4>
                        <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-primary font-medium">{formatCurrency(property.rentAmount)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${property.available ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {property.available ? 'Vacant' : 'Occupied'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You haven't added any properties yet</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Property
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-0">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Maintenance Requests</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">All Requests</Button>
                <Button variant="outline" size="sm">Pending ({pendingMaintenanceCount})</Button>
                <Button variant="outline" size="sm">Completed</Button>
              </div>
            </div>
            
            {maintenanceRequests && maintenanceRequests.length > 0 ? (
              <div className="divide-y">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="py-4 flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100' 
                        : request.status === 'in progress' 
                          ? 'bg-blue-100' 
                          : 'bg-green-100'
                    }`}>
                      <Wrench className={`h-5 w-5 ${
                        request.status === 'pending' 
                          ? 'text-yellow-600' 
                          : request.status === 'in progress' 
                            ? 'text-blue-600' 
                            : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{request.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : request.status === 'in progress' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Property: {properties?.find(p => p.id === request.propertyId)?.address || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No maintenance requests at this time</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
