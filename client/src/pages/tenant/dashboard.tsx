import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCard, getTenantMetrics } from "@/components/dashboard/DashboardMetrics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Lease, Payment, MaintenanceRequest, Property } from "@shared/schema";

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
  } = useQuery({
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
        <DashboardHeader 
          title={`Welcome back, ${user?.firstName}`}
          subtitle="Here's an overview of your rental property and upcoming payments"
        />

        {/* Metrics Cards */}
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
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
            <TabsTrigger value="payments" className="py-2">Payments</TabsTrigger>
            <TabsTrigger value="maintenance" className="py-2">Maintenance</TabsTrigger>
          </TabsList>

          {/* OVERVIEW SECTION */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rent Due Card */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-medium">Next Rent Payment</CardTitle>
                    {lastPayment && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Last Payment: Paid
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount Due</p>
                        <p className="text-2xl font-bold">{formatCurrency(activeLease.rentAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="text-md font-medium">{formatDate(nextRentDate)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time Remaining</span>
                        <span className="font-medium">{daysUntilRentDue} days</span>
                      </div>
                      <Progress value={(30 - daysUntilRentDue) / 30 * 100} className="h-2" />
                    </div>
                    
                    <Button className="w-full gap-2">
                      <CreditCard className="h-4 w-4" />
                      Pay Now
                    </Button>
                    
                    <div className="text-xs text-center text-muted-foreground pt-2">
                      Payment methods: Credit Card, Bank Transfer, Mobile Money
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Card */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Your Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md relative mb-4">
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
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Requests Summary */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-medium">Maintenance</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                      <Link href="/tenant/maintenance">
                        <span className="text-xs">View All</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-amber-50 rounded-md p-2">
                        <div className="text-amber-600 font-semibold text-lg">{pendingMaintenanceCount}</div>
                        <div className="text-xs text-amber-700">Pending</div>
                      </div>
                      <div className="bg-blue-50 rounded-md p-2">
                        <div className="text-blue-600 font-semibold text-lg">{inProgressMaintenanceCount}</div>
                        <div className="text-xs text-blue-700">In Progress</div>
                      </div>
                      <div className="bg-green-50 rounded-md p-2">
                        <div className="text-green-600 font-semibold text-lg">{completedMaintenanceCount}</div>
                        <div className="text-xs text-green-700">Completed</div>
                      </div>
                    </div>
                    
                    {maintenanceRequests && maintenanceRequests.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Recent Requests</h4>
                        {maintenanceRequests.slice(0, 2).map((request) => (
                          <div key={request.id} className="flex justify-between items-start border-b pb-2">
                            <div>
                              <p className="text-sm font-medium truncate w-40">{request.title}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</p>
                            </div>
                            <Badge variant="outline" className={
                              request.status === "pending" 
                                ? "bg-amber-50 text-amber-700" 
                                : request.status === "in progress" 
                                  ? "bg-blue-50 text-blue-700" 
                                  : "bg-green-50 text-green-700"
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
                        <Plus className="h-4 w-4 mr-2" />
                        Submit New Request
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                      <h3 className="text-sm font-medium text-muted-foreground">Payment Due Date</h3>
                      <p className="font-medium">1st of each month</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Property Manager</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {landlord?.firstName?.charAt(0)}{landlord?.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{landlord?.firstName} {landlord?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{landlord?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Lease Document</h3>
                      {activeLease.documentUrl ? (
                        <Button variant="outline" size="sm" className="mt-1 gap-1">
                          <FileText className="h-4 w-4" />
                          <span>View Lease Agreement</span>
                        </Button>
                      ) : (
                        <p className="text-sm">No document available</p>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <Button variant="outline" className="gap-1" asChild>
                        <Link href="/messages">
                          <MessageSquare className="h-4 w-4" />
                          <span>Contact Landlord</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENTS SECTION */}
          <TabsContent value="payments" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Payment */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Current Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount Due</p>
                        <p className="text-2xl font-bold">{formatCurrency(activeLease.rentAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="text-md font-medium">{formatDate(nextRentDate)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time Remaining</span>
                        <span className="font-medium">{daysUntilRentDue} days</span>
                      </div>
                      <Progress value={(30 - daysUntilRentDue) / 30 * 100} className="h-2" />
                    </div>
                    
                    <Button className="w-full gap-2">
                      <CreditCard className="h-4 w-4" />
                      Pay Now
                    </Button>
                    
                    <div className="text-xs text-center text-muted-foreground pt-2">
                      Payment methods: Credit Card, Bank Transfer, Mobile Money
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Breakdown */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Payment Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Base Rent</span>
                      <span className="font-medium">{formatCurrency(activeLease.rentAmount * 0.9)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Utilities</span>
                      <span className="font-medium">{formatCurrency(activeLease.rentAmount * 0.1)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Monthly Rent</span>
                      <span className="font-bold">{formatCurrency(activeLease.rentAmount)}</span>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-sm font-medium pb-2">Auto-Pay Status</h3>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">Not Enrolled</Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Set up auto-pay to automatically process your rent payment each month
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Set Up Auto-Pay
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Token Rewards */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Rent Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-primary/10 rounded-md p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(358)}</p>
                      <p className="text-sm text-primary/80">Available to use toward rent</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">How to earn more</h3>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Shop at partner merchants to earn tokens</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Pay rent on time for bonus rewards</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Refer friends to earn additional tokens</span>
                        </li>
                      </ul>
                    </div>

                    <Button className="w-full">
                      Apply Rewards to Next Rent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-md font-medium">Payment History</CardTitle>
                    <CardDescription>Record of your past rent payments</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Download Records</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Description</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Amount</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Method</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[80px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">{formatDate(payment.paymentDate)}</td>
                          <td className="p-4 align-middle">Monthly Rent</td>
                          <td className="p-4 align-middle font-medium">{formatCurrency(payment.amount)}</td>
                          <td className="p-4 align-middle">
                            <Badge className="bg-green-50 text-green-700">Paid</Badge>
                          </td>
                          <td className="p-4 align-middle">{payment.paymentMethod}</td>
                          <td className="p-4 align-middle">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Receipt className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MAINTENANCE SECTION */}
          <TabsContent value="maintenance" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Maintenance Requests</h3>
              <Button asChild>
                <Link href="/tenant/maintenance">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Link>
              </Button>
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
                    <ScrollArea className="h-[250px] pr-4">
                      <div className="space-y-4">
                        {getPendingMaintenance().map(request => (
                          <div key={request.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm">{request.title}</h4>
                              <Badge className="bg-amber-50 text-amber-700">Pending</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted {formatDate(request.createdAt)}
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
                              <Button variant="ghost" size="sm" className="h-7" asChild>
                                <Link href={`/tenant/maintenance/${request.id}`}>
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  <span className="text-xs">View</span>
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
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
                    <ScrollArea className="h-[250px] pr-4">
                      <div className="space-y-4">
                        {getInProgressMaintenance().map(request => (
                          <div key={request.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm">{request.title}</h4>
                              <Badge className="bg-blue-50 text-blue-700">In Progress</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Started {request.updatedAt ? formatDate(request.updatedAt) : formatDate(request.createdAt)}
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
                              <Button variant="ghost" size="sm" className="h-7" asChild>
                                <Link href={`/tenant/maintenance/${request.id}`}>
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  <span className="text-xs">View</span>
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center">
                      <Clock className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
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
                    <ScrollArea className="h-[250px] pr-4">
                      <div className="space-y-4">
                        {getCompletedMaintenance().map(request => (
                          <div key={request.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm">{request.title}</h4>
                              <Badge className="bg-green-50 text-green-700">Completed</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed {request.updatedAt ? formatDate(request.updatedAt) : formatDate(request.createdAt)}
                            </p>
                            <p className="text-sm line-clamp-2 mt-2">{request.description}</p>
                            <div className="flex justify-between mt-3 pt-2 border-t">
                              <Button variant="ghost" size="sm" className="h-7" asChild>
                                <Link href={`/tenant/maintenance/${request.id}`}>
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  <span className="text-xs">View</span>
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No completed requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-md font-medium">Need Professional Help?</CardTitle>
                    <CardDescription>Find qualified maintenance providers in our marketplace</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4 md:justify-between">
                  <div className="max-w-md">
                    <p className="text-sm text-muted-foreground">
                      Browse our marketplace of verified maintenance professionals for plumbing, electrical, 
                      cleaning, and other services. Get quotes and book appointments directly.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full md:w-auto" asChild>
                    <Link href="/maintenance/marketplace">
                      <Wrench className="h-4 w-4 mr-2" />
                      Browse Marketplace
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