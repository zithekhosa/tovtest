import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCard, getTenantMetrics } from "@/components/dashboard/DashboardMetrics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Lease, Payment, MaintenanceRequest, Property } from "@shared/schema";
import { ResponsiveGrid, ScrollableGrid } from "@/components/ui/responsive-grid";
import { ContentContainer, PageSection } from "@/components/layout/ContentContainer";
import { SectionHeader } from "@/components/ui/section-header";
import { MobileOptimizedCard, HorizontalCard, CompactCard } from "@/components/ui/mobile-optimized-card";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { 
  Loader2, 
  Building, 
  Home, 
  DollarSign, 
  Receipt, 
  Calendar, 
  Wrench, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MoreHorizontal, 
  Download, 
  ExternalLink,
  Plus,
  ArrowRight,
  Eye,
  CalendarDays,
  CreditCard
} from "lucide-react";
import { Link } from "wouter";

export default function TenantDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch active lease for the tenant
  const { 
    data: leases,
    isLoading: isLoadingLeases,
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/tenant"],
  });

  // Find the active lease
  const activeLease = leases?.find(lease => lease.active === true);

  // Fetch property details if we have an active lease
  const {
    data: property,
    isLoading: isLoadingProperty
  } = useQuery<Property>({
    queryKey: ["/api/properties", activeLease?.propertyId],
    enabled: !!activeLease?.propertyId,
  });

  // Fetch landlord details
  const {
    data: landlord,
    isLoading: isLoadingLandlord
  } = useQuery<{ 
    id: number; 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone: string;
    profileImage?: string;
  }>({
    queryKey: ["/api/users", property?.landlordId],
    enabled: !!property?.landlordId,
  });

  // Fetch payment history
  const { 
    data: payments,
    isLoading: isLoadingPayments
  } = useQuery<Payment[]>({
    queryKey: ["/api/payments/tenant"],
  });

  // Fetch maintenance requests
  const { 
    data: maintenanceRequests,
    isLoading: isLoadingMaintenance
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/tenant"],
  });

  const isLoading = 
    isLoadingLeases || 
    isLoadingProperty || 
    isLoadingLandlord || 
    isLoadingPayments || 
    isLoadingMaintenance;

  // Get maintenance counts
  const pendingMaintenanceCount = maintenanceRequests?.filter(r => r.status === "pending").length || 0;
  const inProgressMaintenanceCount = maintenanceRequests?.filter(r => r.status === "in progress").length || 0;
  const completedMaintenanceCount = maintenanceRequests?.filter(r => r.status === "completed").length || 0;

  // Dashboard metrics
  const dashboardMetrics = getTenantMetrics();
  
  // Get last payment
  const lastPayment = payments && payments.length > 0 ? payments[0] : null;

  // Calculate days until next rent due
  const nextRentDate = new Date();
  nextRentDate.setDate(1);
  nextRentDate.setMonth(nextRentDate.getMonth() + 1);
  const today = new Date();
  const daysUntilRentDue = Math.max(0, Math.ceil((nextRentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Filter maintenance requests by status
  const getPendingMaintenance = () => maintenanceRequests?.filter(r => r.status === "pending") || [];
  const getInProgressMaintenance = () => maintenanceRequests?.filter(r => r.status === "in progress") || [];
  const getCompletedMaintenance = () => maintenanceRequests?.filter(r => r.status === "completed") || [];

  // Generate mock payment history
  const generatePaymentHistory = () => {
    const currentMonth = new Date().getMonth();
    const payments = [];
    
    for (let i = 0; i < 6; i++) {
      const paymentDate = new Date();
      paymentDate.setMonth(currentMonth - i);
      paymentDate.setDate(1);
      
      payments.push({
        id: i + 1,
        amount: 3500, // Example rent amount
        status: "paid",
        paymentDate: paymentDate,
        paymentMethod: i % 2 === 0 ? "Credit Card" : "Bank Transfer"
      });
    }
    
    return payments;
  };
  
  const paymentHistory = generatePaymentHistory();

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
          <h2 className="text-xl font-semibold mb-2">No Active Lease Found</h2>
          <p className="text-gray-500 mb-4">You don't have an active lease in the system.</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-900">
          <ContentContainer>
            <DashboardHeader 
              title={`Welcome back, ${user?.firstName}`}
              subtitle="Here's an overview of your rental property and upcoming payments"
            />

            {/* Metrics Cards - Mobile Optimized with Horizontal Scroll */}
            <div className="mt-6 flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
              {dashboardMetrics.map((metric, index) => (
                <div key={index} className="flex-shrink-0 w-[260px] sm:w-auto">
                  <MetricsCard
                    title={metric.title}
                    value={metric.value}
                    description={metric.description}
                    icon={metric.icon}
                    trend={metric.trend}
                    progress={metric.progress}
                  />
                </div>
              ))}
            </div>
          </ContentContainer>
        </div>

        {/* Main Content */}
        <ContentContainer>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
              <TabsList className="grid w-full min-w-[500px] sm:min-w-0 grid-cols-3 h-auto">
                <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
                <TabsTrigger value="payments" className="py-2">Payments</TabsTrigger>
                <TabsTrigger value="maintenance" className="py-2">Maintenance</TabsTrigger>
              </TabsList>
            </div>

            {/* OVERVIEW SECTION */}
            <TabsContent value="overview" className="space-y-6 mt-4">
              <SectionHeader 
                title="Quick Overview" 
                subtitle="Your rental information at a glance"
              />
              
              {/* Mobile-Optimized Scrollable Grid for Cards */}
              <ScrollableGrid itemWidth="min-w-[300px]" gap="gap-5">
                {/* Rent Due Card */}
                <MobileOptimizedCard
                  title="Next Rent Payment"
                  icon={<DollarSign className="h-5 w-5 text-primary" />}
                  headerClassName="pb-2"
                  contentClassName="px-4 py-4"
                  footer={
                    <div className="text-xs text-center text-muted-foreground w-full">
                      Payment methods: Credit Card, Bank Transfer, Mobile Money
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount Due</p>
                        <p className="text-2xl font-bold">{formatCurrency(activeLease.rentAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="text-md font-medium">{formatDate(nextRentDate)}</p>
                        {lastPayment && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 mt-1">
                            Last Payment: Paid
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time Remaining</span>
                        <span className="font-medium">{daysUntilRentDue} days</span>
                      </div>
                      <Progress value={(30 - daysUntilRentDue) / 30 * 100} className="h-2" />
                    </div>
                    
                    <Button className="w-full gap-2" asChild>
                      <Link href="/tenant/payments">
                        <CreditCard className="h-4 w-4 shrink-0" />
                        Pay Now
                      </Link>
                    </Button>
                  </div>
                </MobileOptimizedCard>

                {/* Property Card */}
                <MobileOptimizedCard
                  title="Your Property"
                  icon={<Home className="h-5 w-5 text-primary" />}
                  headerClassName="pb-2"
                  contentClassName="px-4 py-4"
                >
                  <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-md relative">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.address}
                          className="object-cover w-full h-full rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                          <Home className="h-10 w-10 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium truncate">{property.address}</h3>
                        <p className="text-sm text-muted-foreground">
                          {property.city}, {property.state} {property.zipCode}
                        </p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p>{property.propertyType || "Residential"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Bedrooms</p>
                          <p>{property.bedrooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Bathrooms</p>
                          <p>{property.bathrooms}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/tenant/properties">
                          <Eye className="h-4 w-4 mr-2 shrink-0" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </MobileOptimizedCard>

                {/* Maintenance Requests Summary */}
                <MobileOptimizedCard
                  title="Maintenance Status"
                  icon={<Wrench className="h-5 w-5 text-primary" />}
                  headerClassName="pb-2"
                  contentClassName="px-4 py-4"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-md p-2">
                        <div className="text-amber-600 dark:text-amber-400 font-semibold text-lg">{pendingMaintenanceCount}</div>
                        <div className="text-xs text-amber-700 dark:text-amber-400">Pending</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2">
                        <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg">{inProgressMaintenanceCount}</div>
                        <div className="text-xs text-blue-700 dark:text-blue-400">In Progress</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-2">
                        <div className="text-green-600 dark:text-green-400 font-semibold text-lg">{completedMaintenanceCount}</div>
                        <div className="text-xs text-green-700 dark:text-green-400">Completed</div>
                      </div>
                    </div>
                    
                    {maintenanceRequests && maintenanceRequests.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Recent Requests</h4>
                        {maintenanceRequests.slice(0, 2).map((request) => (
                          <div key={request.id} className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-2">
                            <div>
                              <p className="text-sm font-medium truncate w-40">{request.title}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</p>
                            </div>
                            <Badge variant="outline" className={
                              request.status === "pending" 
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" 
                                : request.status === "in progress" 
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" 
                                  : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            }>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-sm text-muted-foreground">No maintenance requests</p>
                      </div>
                    )}
                    
                    <Button className="w-full" asChild>
                      <Link href="/tenant/maintenance">
                        <Plus className="h-4 w-4 mr-2 shrink-0" />
                        Submit New Request
                      </Link>
                    </Button>
                  </div>
                </MobileOptimizedCard>
              </ScrollableGrid>

              {/* Lease Details */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-md font-medium">Lease Information</CardTitle>
                      <CardDescription>Details about your current lease agreement</CardDescription>
                    </div>
                    <Badge className="bg-green-50 text-green-700">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Lease Period</h3>
                        <p className="font-medium">
                          {formatDate(activeLease.startDate)} - {formatDate(activeLease.endDate)}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Monthly Rent</h3>
                        <p className="font-medium">{formatCurrency(activeLease.rentAmount)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Security Deposit</h3>
                        <p className="font-medium">{formatCurrency(activeLease.securityDeposit)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Lease Document</h3>
                        {activeLease.documentUrl ? (
                          <Button variant="outline" size="sm" className="mt-1">
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            View Document
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground">No document available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Landlord</h3>
                        <div className="flex items-center mt-1">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {landlord?.firstName?.charAt(0) || "L"}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium">
                            {landlord ? `${landlord.firstName} ${landlord.lastName}` : "Property Owner"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Contact Info</h3>
                        <div className="mt-1">
                          <p className="text-sm">Email: {landlord?.email || "Not available"}</p>
                          <p className="text-sm">Phone: {landlord?.phone || "Not available"}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/tenant/messages">
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />
                              Message
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/tenant/maintenance">
                              <Wrench className="h-3.5 w-3.5 mr-1" />
                              Report Issue
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/tenant/lease-history">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      View Lease History
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* PAYMENTS SECTION */}
            <TabsContent value="payments" className="space-y-4 mt-4">
              {/* Payments content would go here */}
              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>Manage your rental payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Payment history and options will be displayed here</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MAINTENANCE SECTION */}
            <TabsContent value="maintenance" className="space-y-4 mt-4">
              {/* Maintenance content would go here */}
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance</CardTitle>
                  <CardDescription>View and submit maintenance requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Maintenance requests and status will be displayed here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ContentContainer>
      </div>
    </DashLayout>
  );
}