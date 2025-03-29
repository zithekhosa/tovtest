import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property, Lease, MaintenanceRequest, Payment, User } from "@shared/schema";
import { DashLayout } from "@/layout/dash-layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCard, getLandlordMetrics } from "@/components/dashboard/DashboardMetrics";
import { formatCurrency, formatDate } from "@/lib/utils";

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

import { 
  Loader2, 
  MoreHorizontal, 
  Building, 
  Users, 
  Wrench, 
  DollarSign, 
  ArrowRight, 
  ExternalLink,
  CalendarDays,
  BarChart3,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Eye,
  Pencil
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

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

  // Fetch tenants
  const { 
    data: tenants,
    isLoading: isLoadingTenants 
  } = useQuery<User[]>({
    queryKey: ["/api/users/tenants"],
  });

  // Fetch leases
  const { 
    data: leases,
    isLoading: isLoadingLeases 
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/landlord"],
  });

  // Fetch maintenance requests
  const {
    data: maintenanceRequests,
    isLoading: isLoadingMaintenance
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/landlord"],
  });

  // Fetch recent payments
  const {
    data: recentPayments,
    isLoading: isLoadingPayments
  } = useQuery<Payment[]>({
    queryKey: ["/api/payments/recent"],
  });

  const isLoading = 
    isLoadingProperties || 
    isLoadingTenants || 
    isLoadingLeases || 
    isLoadingMaintenance || 
    isLoadingPayments;

  // Calculate dashboard metrics
  const propertyCount = properties?.length || 0;
  const vacantCount = properties?.filter(p => p.available).length || 0;
  const occupiedCount = propertyCount - vacantCount;
  
  // Calculate total monthly income from properties
  const totalMonthlyIncome = properties?.reduce((sum, property) => {
    if (!property.available) {
      return sum + property.rentAmount;
    }
    return sum;
  }, 0) || 0;

  // Dashboard metrics
  const dashboardMetrics = getLandlordMetrics(propertyCount, vacantCount, totalMonthlyIncome);

  // Get maintenance counts
  const pendingMaintenanceCount = maintenanceRequests?.filter(r => r.status === "pending").length || 0;
  const inProgressMaintenanceCount = maintenanceRequests?.filter(r => r.status === "in progress").length || 0;
  const completedMaintenanceCount = maintenanceRequests?.filter(r => r.status === "completed").length || 0;

  // Filter maintenance requests based on status
  const getPendingMaintenance = () => maintenanceRequests?.filter(r => r.status === "pending") || [];
  const getInProgressMaintenance = () => maintenanceRequests?.filter(r => r.status === "in progress") || [];

  // Calculate occupancy rate
  const occupancyRate = propertyCount > 0 ? Math.round((occupiedCount / propertyCount) * 100) : 0;

  // Calculate rent collection rate from recent payments
  const rentCollectionRate = recentPayments?.length ? 95 : 0; // Placeholder - would calculate from actual data

  // Find leases expiring soon (next 60 days)
  const today = new Date();
  const sixtyDaysFromNow = new Date(today);
  sixtyDaysFromNow.setDate(today.getDate() + 60);
  
  const expiringLeases = leases?.filter(lease => {
    const endDate = new Date(lease.endDate);
    return endDate > today && endDate < sixtyDaysFromNow;
  }) || [];

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="space-y-6">
        <DashboardHeader 
          title={`Welcome back, ${user?.firstName}`}
          subtitle="Here's an overview of your properties and latest activity"
        />

        {/* Dashboard Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardMetrics.map((metric, index) => (
            <MetricsCard
              key={index}
              title={metric.title}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
              trend={metric.trend}
              progress={metric.progress}
            />
          ))}
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
            <TabsTrigger value="properties" className="py-2">Properties</TabsTrigger>
            <TabsTrigger value="tenants" className="py-2">Tenants</TabsTrigger>
            <TabsTrigger value="maintenance" className="py-2">Maintenance</TabsTrigger>
          </TabsList>

          {/* OVERVIEW SECTION */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Financial Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-medium">Financial Summary</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <span className="text-xs">View Reports</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monthly Income</span>
                      <span className="font-medium">{formatCurrency(totalMonthlyIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expenses (Est.)</span>
                      <span className="font-medium">{formatCurrency(totalMonthlyIncome * 0.25)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Net Income</span>
                      <span className="font-medium">{formatCurrency(totalMonthlyIncome * 0.75)}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rent Collection</span>
                        <span className="text-sm font-medium">{rentCollectionRate}%</span>
                      </div>
                      <Progress value={rentCollectionRate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                        <span className="text-sm font-medium">{occupancyRate}%</span>
                      </div>
                      <Progress value={occupancyRate} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-medium">Recent Activity</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <span className="text-xs">View All</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[260px] px-6">
                    <div className="space-y-4 py-2">
                      {/* Activity items - these would come from a real data source */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Rent Payment Received</p>
                          <p className="text-xs text-muted-foreground">Tumelo Mokoena paid {formatCurrency(3500)} for November</p>
                          <p className="text-xs text-muted-foreground mt-1">Today at 9:42 AM</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                          <Wrench className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New Maintenance Request</p>
                          <p className="text-xs text-muted-foreground">Leaking faucet in Unit 103</p>
                          <p className="text-xs text-muted-foreground mt-1">Yesterday at 3:15 PM</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New Message</p>
                          <p className="text-xs text-muted-foreground">Lesego from Gabs Real Estate regarding property inspection</p>
                          <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Maintenance Completed</p>
                          <p className="text-xs text-muted-foreground">A/C repair at Unit 202 has been completed</p>
                          <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Expiring Leases Card */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Expiring Leases</CardTitle>
                  <CardDescription>Leases ending in the next 60 days</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {expiringLeases.length > 0 ? (
                    <ScrollArea className="h-[180px] px-6">
                      <div className="space-y-4 py-2">
                        {expiringLeases.map((lease) => (
                          <div key={lease.id} className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">Unit {lease.propertyId}</p>
                              <p className="text-xs text-muted-foreground">
                                Expires on {formatDate(lease.endDate)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/landlord/leases/${lease.id}`}>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">View</span>
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No leases expiring soon</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Maintenance Card */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-md font-medium">Pending Maintenance</CardTitle>
                      <CardDescription>Requests requiring your attention</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/landlord/maintenance">
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingMaintenanceCount > 0 || inProgressMaintenanceCount > 0 ? (
                    <ScrollArea className="h-[180px] px-6">
                      <div className="space-y-4 py-2">
                        {getPendingMaintenance().map((request) => (
                          <div key={request.id} className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{request.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Unit {request.propertyId} • {formatDate(request.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                              Pending
                            </Badge>
                          </div>
                        ))}
                        {getInProgressMaintenance().map((request) => (
                          <div key={request.id} className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                                <Clock className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{request.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Unit {request.propertyId} • {formatDate(request.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                              In Progress
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No pending maintenance requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PROPERTIES SECTION */}
          <TabsContent value="properties" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Your Properties</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>
            </div>

            {properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.address}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Building className="h-10 w-10 text-muted-foreground opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className={property.available ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}>
                          {property.available ? "Vacant" : "Occupied"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium truncate">{property.address}</h4>
                          <p className="text-sm text-muted-foreground">
                            {property.city}, {property.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-primary">{formatCurrency(property.rentAmount)}</div>
                          <p className="text-xs text-muted-foreground">per month</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Beds</p>
                          <p className="font-medium">{property.bedrooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Baths</p>
                          <p className="font-medium">{property.bathrooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sq.Ft</p>
                          <p className="font-medium">{property.squareFeet || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0 gap-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/landlord/properties/${property.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-9 w-9">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Mark as {property.available ? "Occupied" : "Vacant"}</DropdownMenuItem>
                          <DropdownMenuItem>View Tenants</DropdownMenuItem>
                          <DropdownMenuItem>View Lease</DropdownMenuItem>
                          <DropdownMenuItem>Create Maintenance Request</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">Delete Property</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-8">
                <div className="text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No Properties Found</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't added any properties to your account yet.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* TENANTS SECTION */}
          <TabsContent value="tenants" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Your Tenants</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tenant
                </Button>
              </div>
            </div>

            {tenants && tenants.length > 0 ? (
              <Card>
                <CardContent className="p-0 overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left font-medium">Name</th>
                        <th className="h-12 px-4 text-left font-medium">Contact</th>
                        <th className="h-12 px-4 text-left font-medium">Property</th>
                        <th className="h-12 px-4 text-left font-medium">Lease</th>
                        <th className="h-12 px-4 text-left font-medium">Status</th>
                        <th className="h-12 px-4 text-left font-medium w-[100px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => {
                        const tenantLease = leases?.find(l => l.tenantId === tenant.id);
                        const tenantProperty = properties?.find(p => p.id === tenantLease?.propertyId);
                        
                        return (
                          <tr key={tenant.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {tenant.profileImage ? (
                                    <AvatarImage src={tenant.profileImage} alt={tenant.firstName} />
                                  ) : (
                                    <AvatarFallback>{tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}</AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="font-medium">{tenant.firstName} {tenant.lastName}</div>
                                  <div className="text-xs text-muted-foreground">ID: {tenant.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="text-sm">{tenant.email}</div>
                              <div className="text-xs text-muted-foreground">{tenant.phone || "No phone"}</div>
                            </td>
                            <td className="p-4 align-middle">
                              {tenantProperty ? (
                                <div>
                                  <div className="text-sm">{tenantProperty.address}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {tenantProperty.city}, {tenantProperty.state}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">No property assigned</div>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {tenantLease ? (
                                <div>
                                  <div className="text-sm">{formatCurrency(tenantLease.rentAmount)}/month</div>
                                  <div className="text-xs text-muted-foreground">
                                    Ends {formatDate(tenantLease.endDate)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">No active lease</div>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {tenantLease?.active ? (
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                              ) : (
                                <Badge variant="outline">Inactive</Badge>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                                  <DropdownMenuItem>Contact Tenant</DropdownMenuItem>
                                  <DropdownMenuItem>View Lease</DropdownMenuItem>
                                  <DropdownMenuItem>View Payment History</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-500">End Tenancy</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : (
              <Card className="py-8">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No Tenants Found</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't added any tenants to your account yet.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Tenant
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* MAINTENANCE SECTION */}
          <TabsContent value="maintenance" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Maintenance Requests</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Request
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Pending
                  </CardTitle>
                  <CardDescription>{pendingMaintenanceCount} requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMaintenanceCount > 0 ? (
                    <ScrollArea className="h-[260px] pr-4">
                      <div className="space-y-4">
                        {getPendingMaintenance().map((request) => (
                          <div key={request.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm">{request.title}</h4>
                              <Badge className="bg-amber-50 text-amber-700">Pending</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Unit {request.propertyId} • Submitted {formatDate(request.createdAt)}
                            </p>
                            <p className="text-sm line-clamp-2 mt-2">{request.description}</p>
                            <div className="flex justify-between mt-3 pt-2 border-t">
                              <Badge variant="outline" className={
                                request.priority === "urgent" 
                                  ? "bg-red-50 text-red-700" 
                                  : request.priority === "high" 
                                    ? "bg-orange-50 text-orange-700" 
                                    : "bg-blue-50 text-blue-700"
                              }>
                                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                              </Badge>
                              <Button variant="ghost" size="sm" className="h-7">
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">View</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No pending requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    In Progress
                  </CardTitle>
                  <CardDescription>{inProgressMaintenanceCount} requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {inProgressMaintenanceCount > 0 ? (
                    <ScrollArea className="h-[260px] pr-4">
                      <div className="space-y-4">
                        {getInProgressMaintenance().map((request) => (
                          <div key={request.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm">{request.title}</h4>
                              <Badge className="bg-blue-50 text-blue-700">In Progress</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Unit {request.propertyId} • Submitted {formatDate(request.createdAt)}
                            </p>
                            <p className="text-sm line-clamp-2 mt-2">{request.description}</p>
                            <div className="flex justify-between mt-3 pt-2 border-t">
                              <Badge variant="outline" className={
                                request.priority === "urgent" 
                                  ? "bg-red-50 text-red-700" 
                                  : request.priority === "high" 
                                    ? "bg-orange-50 text-orange-700" 
                                    : "bg-blue-50 text-blue-700"
                              }>
                                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                              </Badge>
                              <Button variant="ghost" size="sm" className="h-7">
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">View</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No in-progress requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Completed
                  </CardTitle>
                  <CardDescription>{completedMaintenanceCount} requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {completedMaintenanceCount > 0 ? (
                    <ScrollArea className="h-[260px] pr-4">
                      <div className="space-y-4">
                        {/* Placeholder for completed maintenance requests */}
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-sm">Broken light fixture</h4>
                            <Badge className="bg-green-50 text-green-700">Completed</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Unit 202 • Completed Nov 15, 2023
                          </p>
                          <div className="flex justify-between mt-3 pt-2 border-t">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Medium Priority
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-7">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">View</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center">
                      <Wrench className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No completed requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium">Find Maintenance Professionals</CardTitle>
                <CardDescription>Connect with verified maintenance providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Button variant="outline" asChild>
                    <Link href="/maintenance/marketplace">
                      <Wrench className="h-4 w-4 mr-2" />
                      Browse Maintenance Marketplace
                    </Link>
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