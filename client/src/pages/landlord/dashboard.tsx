import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  DollarSign, 
  Users, 
  Home, 
  Wrench, 
  FileText, 
  ChevronRight,
  Bell,
  Plus,
  ArrowUp,
  PieChart,
  ArrowDown,
  BarChart3,
  CalendarDays
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { type User, type Property, type Lease, type MaintenanceRequest } from "@shared/schema";

export default function LandlordDashboard() {
  const { user } = useAuth();

  // Fetch data from API
  const {
    data: properties,
    isLoading: propertiesLoading,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: user?.role === "landlord",
  });

  const {
    data: tenants,
    isLoading: tenantsLoading,
  } = useQuery<User[]>({
    queryKey: ["/api/tenants"],
    enabled: user?.role === "landlord",
  });

  const {
    data: leases,
    isLoading: leasesLoading,
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases"],
    enabled: user?.role === "landlord",
  });

  const {
    data: maintenanceRequests,
    isLoading: maintenanceLoading,
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance-requests"],
    enabled: user?.role === "landlord",
  });

  if (!user) return null;

  // Calculate metrics
  const totalProperties = properties?.length || 0;
  const occupiedProperties = properties?.filter(p => !p.available).length || 0;
  const vacantProperties = properties?.filter(p => p.available).length || 0;
  const occupancyRate = totalProperties ? Math.round((occupiedProperties / totalProperties) * 100) : 0;
  
  const totalIncome = leases?.reduce((sum, lease) => sum + lease.rentAmount, 0) || 0;
  const totalTenants = tenants?.length || 0;
  const totalMaintenanceRequests = maintenanceRequests?.length || 0;
  const pendingMaintenanceRequests = maintenanceRequests?.filter(m => m.status === "pending").length || 0;
  
  const isLoading = propertiesLoading || tenantsLoading || leasesLoading || maintenanceLoading;

  return (
    <StandardLayout
      title="Overview"
      subtitle={`Welcome back, ${user.firstName || user.username}`}
    >
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-6">
        {/* Total Property Value */}
        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">Portfolio</Badge>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-bold">P12.5M</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total property value</p>
            </div>
            <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>2.4% from last valuation</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Rental Income */}
        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">Income</Badge>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-bold">P{totalIncome.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly rental income</p>
            </div>
            <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>5.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">Expenses</Badge>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-bold">P32,450</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total expenses</p>
            </div>
            <div className="mt-3 flex items-center text-xs text-red-600 dark:text-red-400">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>3.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">Occupancy</Badge>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-bold">{occupancyRate}%</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy rate</p>
            </div>
            <div className="mt-2">
              <Progress value={occupancyRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 gap-2"
          asChild
        >
          <Link href="/landlord/properties/add">
            <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium">Add Property</span>
          </Link>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 gap-2"
          asChild
        >
          <Link href="/landlord/tenants/add">
            <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium">Add Tenant</span>
          </Link>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 gap-2"
          asChild
        >
          <Link href="/landlord/documents/upload">
            <Plus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium">Upload Document</span>
          </Link>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 gap-2"
          asChild
        >
          <Link href="/landlord/maintenance/request">
            <Plus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium">Request Maintenance</span>
          </Link>
        </Button>
      </div>

      {/* Notification Center */}
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
      <div className="space-y-3 mb-6">
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <Bell className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">Rent payment overdue</h4>
                  <Badge variant="outline" className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ml-2">
                    Urgent
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Palm Residences, Unit 203 - 5 days overdue
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">2 hours ago</span>
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs" asChild>
                    <Link href="/landlord/payments/overdue">
                      Take Action
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">Maintenance request</h4>
                  <Badge variant="outline" className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 ml-2">
                    Pending
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Water leakage in bathroom at Gaborone Heights, Unit 10B
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">Yesterday</span>
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs" asChild>
                    <Link href="/landlord/maintenance/details/1">
                      View Details
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">Lease expiring soon</h4>
                  <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ml-2">
                    Upcoming
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Francistown Suites, Unit 5A - Expires in 15 days
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">3 days ago</span>
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs" asChild>
                    <Link href="/landlord/leases/renew/2">
                      Renew Lease
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Overview */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Properties</h2>
        <Button variant="link" size="sm" className="text-primary" asChild>
          <Link href="/landlord/properties">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {properties?.slice(0, 3).map((property) => (
          <Link key={property.id} href={`/landlord/properties/${property.id}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
              <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
                {property.images && property.images[0] ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                    <Home className="h-8 w-8" />
                  </div>
                )}
                <Badge 
                  className={`absolute top-2 right-2 ${property.available ? 'bg-green-500' : 'bg-blue-500'}`}
                >
                  {property.available ? 'Available' : 'Occupied'}
                </Badge>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-medium mb-1 line-clamp-1">{property.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                  {property.address}, {property.city}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span className="mr-2">{property.bedrooms} beds</span>
                  <span className="mr-2">•</span>
                  <span>{property.bathrooms} baths</span>
                  {property.squareFootage && (
                    <>
                      <span className="mr-2">•</span>
                      <span>{property.squareFootage} sqft</span>
                    </>
                  )}
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-semibold">P{property.rentAmount.toLocaleString()}/mo</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tenant Overview */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tenants</h2>
        <Button variant="link" size="sm" className="text-primary" asChild>
          <Link href="/landlord/tenants">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tenant</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Property</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rent</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {tenants?.slice(0, 5).map((tenant) => {
                const tenantLease = leases?.find(lease => lease.tenantId === tenant.id);
                const tenantProperty = tenantLease ? properties?.find(p => p.id === tenantLease.propertyId) : null;
                
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <td className="py-3 px-4">
                      <Link href={`/landlord/tenants/${tenant.id}`} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 mr-3">
                          {tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{tenant.firstName} {tenant.lastName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tenant.phone || tenant.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {tenantProperty ? (
                        <Link href={`/landlord/properties/${tenantProperty.id}`}>
                          <span className="text-primary hover:underline">{tenantProperty.title}</span>
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {tenantLease ? `P${tenantLease.rentAmount.toLocaleString()}/mo` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {tenantLease ? (
                        <Badge className={
                          tenantLease.status === "active" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" 
                            : tenantLease.status === "pending" 
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" 
                              : ""
                        }>
                          {tenantLease.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No lease</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </StandardLayout>
  );
}