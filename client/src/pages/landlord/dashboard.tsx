import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property, Lease, MaintenanceRequest, Payment, User } from "@shared/schema";
import { DashLayout } from "@/layout/dash-layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCard, getLandlordMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
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
  BadgePercent,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Eye,
  Pencil,
  UserCheck
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
      <div className="bg-gray-50 pb-6">
        <div className="container mx-auto max-w-7xl px-4">
          <DashboardHeader 
            title={`Welcome back, ${user?.firstName}`}
            subtitle="Here's an overview of your properties and latest activity"
          />

          {/* Dashboard Metrics Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardMetrics.map((metric, index) => {
              // Get the appropriate background color for the icon
              let iconBgColor = "bg-primary-100";
              if (metric.icon.props.className.includes("text-blue")) {
                iconBgColor = "bg-blue-100";
              } else if (metric.icon.props.className.includes("text-green")) {
                iconBgColor = "bg-green-100";
              } else if (metric.icon.props.className.includes("text-amber")) {
                iconBgColor = "bg-amber-100";
              } else if (metric.icon.props.className.includes("text-purple")) {
                iconBgColor = "bg-purple-100";
              }
              
              return (
                <div key={index}>
                  <DashboardMetricCard
                    title={metric.title}
                    value={metric.value}
                    description={metric.description}
                    icon={metric.icon}
                    iconBgColor={iconBgColor}
                    trend={metric.trend}
                    progress={metric.progress}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
            <TabsTrigger value="properties" className="py-2">Properties</TabsTrigger>
            <TabsTrigger value="tenants" className="py-2">Tenants</TabsTrigger>
            <TabsTrigger value="maintenance" className="py-2">Maintenance</TabsTrigger>
          </TabsList>

          {/* OVERVIEW SECTION */}
          <TabsContent value="overview" className="space-y-8 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Financial Summary */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-medium">Financial Summary</CardTitle>
                    <Button variant="ghost" size="sm" className="h-9 gap-2">
                      <span>View Report</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-base text-muted-foreground">Monthly Income</span>
                      <span className="text-lg font-medium">{formatCurrency(totalMonthlyIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-muted-foreground">Expenses (Est.)</span>
                      <span className="text-lg font-medium">{formatCurrency(totalMonthlyIncome * 0.25)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-muted-foreground">Net Income</span>
                      <span className="text-lg font-medium">{formatCurrency(totalMonthlyIncome * 0.75)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Rent Collection</span>
                        <span className="text-base font-medium">{rentCollectionRate}%</span>
                      </div>
                      <Progress value={rentCollectionRate} className="h-2.5" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base text-muted-foreground">Occupancy Rate</span>
                        <span className="text-base font-medium">{occupancyRate}%</span>
                      </div>
                      <Progress value={occupancyRate} className="h-2.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-medium">Recent Activity</CardTitle>
                    <Button variant="ghost" size="sm" className="h-9 gap-2">
                      <span>View All</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[310px] px-6">
                    <div className="space-y-6 py-4">
                      {/* Activity items - these would come from a real data source */}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-base font-medium">Rent Payment Received</p>
                          <p className="text-sm text-muted-foreground mt-1">Tumelo Mokoena paid {formatCurrency(3500)} for November</p>
                          <p className="text-sm text-muted-foreground mt-2">Today at 9:42 AM</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                          <Wrench className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-base font-medium">New Maintenance Request</p>
                          <p className="text-sm text-muted-foreground mt-1">Leaking faucet in Unit 103</p>
                          <p className="text-sm text-muted-foreground mt-2">Yesterday at 3:15 PM</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-base font-medium">New Message</p>
                          <p className="text-sm text-muted-foreground mt-1">Lesego from Gabs Real Estate regarding property inspection</p>
                          <p className="text-sm text-muted-foreground mt-2">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-base font-medium">Maintenance Completed</p>
                          <p className="text-sm text-muted-foreground mt-1">A/C repair at Unit 202 has been completed</p>
                          <p className="text-sm text-muted-foreground mt-2">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Expiring Leases Card */}
              <Card className="md:col-span-1 shadow-sm">
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="text-xl font-medium">Expiring Leases</CardTitle>
                  <CardDescription className="text-base">Leases ending in the next 60 days</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {expiringLeases.length > 0 ? (
                    <ScrollArea className="h-[220px] px-6">
                      <div className="space-y-5 py-4">
                        {expiringLeases.map((lease) => (
                          <div key={lease.id} className="flex justify-between items-start">
                            <div>
                              <p className="text-base font-medium">Unit {lease.propertyId}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Expires on {formatDate(lease.endDate)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-9" asChild>
                              <Link href={`/landlord/leases/${lease.id}`}>
                                <Eye className="h-4 w-4 mr-2 shrink-0" />
                                <span>View</span>
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                      <p className="text-base text-muted-foreground">No leases expiring soon</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Maintenance Card */}
              <Card className="md:col-span-2 shadow-sm">
                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-medium">Pending Maintenance</CardTitle>
                      <CardDescription className="text-base">Requests requiring your attention</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="h-9" asChild>
                      <Link href="/landlord/maintenance">
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingMaintenanceCount > 0 || inProgressMaintenanceCount > 0 ? (
                    <ScrollArea className="h-[220px] px-6">
                      <div className="space-y-5 py-4">
                        {getPendingMaintenance().map((request) => (
                          <div key={request.id} className="flex justify-between items-start">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-base font-medium">{request.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Unit {request.propertyId} • {formatDate(request.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 px-3 py-1 text-sm">
                              Pending
                            </Badge>
                          </div>
                        ))}
                        {getInProgressMaintenance().map((request) => (
                          <div key={request.id} className="flex justify-between items-start">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Clock className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-base font-medium">{request.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Unit {request.propertyId} • {formatDate(request.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 px-3 py-1 text-sm">
                              In Progress
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                      <p className="text-base text-muted-foreground">No pending maintenance requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PROPERTIES SECTION */}
          <TabsContent value="properties" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium">Your Properties</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2 shrink-0" />
                  Filter
                </Button>
                <Button size="sm" className="h-9">
                  <Plus className="h-4 w-4 mr-2 shrink-0" />
                  Add Property
                </Button>
              </div>
            </div>

            {properties && properties.length > 0 ? (
              <div className="tov-grid-layout gap-6">
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
                          <p className="font-medium">{property.squareFootage || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0 gap-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/landlord/properties/${property.id}`}>
                          <Eye className="h-4 w-4 mr-2 shrink-0" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Pencil className="h-4 w-4 mr-2 shrink-0" />
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
                    <Plus className="h-4 w-4 mr-2 shrink-0" />
                    Add Your First Property
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* TENANTS SECTION */}
          <TabsContent value="tenants" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium">Your Tenants</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2 shrink-0" />
                  Filter
                </Button>
                <Button size="sm" className="h-9">
                  <Plus className="h-4 w-4 mr-2 shrink-0" />
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
                    <Plus className="h-4 w-4 mr-2 shrink-0" />
                    Add Your First Tenant
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* MAINTENANCE SECTION */}
          <TabsContent value="maintenance" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium">Maintenance Requests</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2 shrink-0" />
                  Filter
                </Button>
                <Button size="sm" className="h-9">
                  <Plus className="h-4 w-4 mr-2 shrink-0" />
                  Create Request
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="text-xl font-medium flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                    Pending
                  </CardTitle>
                  <CardDescription className="text-base">{pendingMaintenanceCount} requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMaintenanceCount > 0 ? (
                    <ScrollArea className="h-[280px] pr-4">
                      <div className="space-y-5">
                        {getPendingMaintenance().map((request) => (
                          <div key={request.id} className="p-4 border rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-base">{request.title}</h4>
                              <Badge className="bg-amber-50 text-amber-700 px-3 py-1 text-sm">Pending</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5">
                              Unit {request.propertyId} • Submitted {formatDate(request.createdAt)}
                            </p>
                            <p className="text-sm mt-3 text-gray-700">{request.description}</p>
                            <div className="flex justify-between mt-4 pt-3 border-t">
                              <Badge variant="outline" className={
                                request.priority === "urgent" 
                                  ? "bg-red-50 text-red-700 px-2.5 py-1" 
                                  : request.priority === "high" 
                                    ? "bg-orange-50 text-orange-700 px-2.5 py-1" 
                                    : "bg-blue-50 text-blue-700 px-2.5 py-1"
                              }>
                                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                              </Badge>
                              <Button variant="outline" size="sm" className="h-9">
                                <Eye className="h-4 w-4 mr-2 shrink-0" />
                                <span>View</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-12 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                      <p className="text-base text-muted-foreground">No pending requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="text-xl font-medium flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    In Progress
                  </CardTitle>
                  <CardDescription className="text-base">{inProgressMaintenanceCount} requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {inProgressMaintenanceCount > 0 ? (
                    <ScrollArea className="h-[280px] pr-4">
                      <div className="space-y-5">
                        {getInProgressMaintenance().map((request) => (
                          <div key={request.id} className="p-4 border rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-base">{request.title}</h4>
                              <Badge className="bg-blue-50 text-blue-700 px-3 py-1 text-sm">In Progress</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5">
                              Unit {request.propertyId} • Submitted {formatDate(request.createdAt)}
                            </p>
                            <p className="text-sm mt-3 text-gray-700">{request.description}</p>
                            <div className="flex justify-between mt-4 pt-3 border-t">
                              <Badge variant="outline" className={
                                request.priority === "urgent" 
                                  ? "bg-red-50 text-red-700 px-2.5 py-1" 
                                  : request.priority === "high" 
                                    ? "bg-orange-50 text-orange-700 px-2.5 py-1" 
                                    : "bg-blue-50 text-blue-700 px-2.5 py-1"
                              }>
                                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                              </Badge>
                              <Button variant="outline" size="sm" className="h-9">
                                <Eye className="h-4 w-4 mr-2 shrink-0" />
                                <span>View</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-12 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                      <p className="text-base text-muted-foreground">No in-progress requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="text-xl font-medium flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Completed
                  </CardTitle>
                  <CardDescription className="text-base">{completedMaintenanceCount} requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {completedMaintenanceCount > 0 ? (
                    <ScrollArea className="h-[280px] pr-4">
                      <div className="space-y-5">
                        {/* Placeholder for completed maintenance requests */}
                        <div className="p-4 border rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-base">Broken light fixture</h4>
                            <Badge className="bg-green-50 text-green-700 px-3 py-1 text-sm">Completed</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1.5">
                            Unit 202 • Completed Nov 15, 2023
                          </p>
                          <div className="flex justify-between mt-4 pt-3 border-t">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 px-2.5 py-1">
                              Medium Priority
                            </Badge>
                            <Button variant="outline" size="sm" className="h-9">
                              <Eye className="h-4 w-4 mr-2 shrink-0" />
                              <span>View</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-12 text-center">
                      <Wrench className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                      <p className="text-base text-muted-foreground">No completed requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 shadow-sm">
              <CardHeader className="pb-3 pt-6">
                <CardTitle className="text-xl font-medium">Find Maintenance Professionals</CardTitle>
                <CardDescription className="text-base">Connect with verified maintenance providers in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="mb-4 flex justify-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-2">
                        <UserCheck className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm">Verified Providers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-2">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm">Fast Service</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-2">
                        <BadgePercent className="h-6 w-6 text-amber-600" />
                      </div>
                      <span className="text-sm">Competitive Rates</span>
                    </div>
                  </div>
                  <Button size="lg" className="mt-4" asChild>
                    <Link href="/maintenance/marketplace">
                      <Wrench className="h-4 w-4 mr-2 shrink-0" />
                      Browse Maintenance Marketplace
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FEATURE SHOWCASE SECTION */}
          <div className="py-12">
            <div className="container mx-auto max-w-6xl px-4">
              <h2 className="text-2xl font-semibold tracking-tight text-center">Premium Features</h2>
              <p className="text-muted-foreground text-center mb-8">Enhance your property management experience with these powerful tools</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Financial Analytics */}
                <Card className="tov-card shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 mx-auto bg-blue-100 h-12 w-12 flex items-center justify-center rounded-full shrink-0">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="mb-3 tov-card-title">Financial Analytics</CardTitle>
                    <div className="tov-card-content">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        Advanced financial reporting and analytics to track your rental income,
                        expenses, and ROI across your property portfolio.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tenant Verification */}
                <Card className="tov-card shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 mx-auto bg-green-100 h-12 w-12 flex items-center justify-center rounded-full shrink-0">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="mb-3 tov-card-title">Tenant Verification</CardTitle>
                    <div className="tov-card-content">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        Comprehensive background checks, credit reports, and rental history verification for
                        potential tenants to minimize risk.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Smart Pricing */}
                <Card className="tov-card shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 mx-auto bg-indigo-100 h-12 w-12 flex items-center justify-center rounded-full shrink-0">
                      <BadgePercent className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="mb-3 tov-card-title">Smart Pricing</CardTitle>
                    <div className="tov-card-content">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        AI-powered rent pricing recommendations based on market data, property features, 
                        and local trends to maximize your rental income.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </DashLayout>
  );
}