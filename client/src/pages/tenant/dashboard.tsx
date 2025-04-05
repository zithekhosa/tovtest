import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  DollarSign,
  FileText,
  Wrench,
  Calendar,
  CreditCard,
  Download,
  Clock,
  CheckCircle,
  Bell,
  HelpCircle,
  Settings,
  Menu,
  X,
  Search,
  ChevronDown,
  User,
  MapPin,
  Star,
  Plus
} from "lucide-react";
import { Property, Payment, Lease, Document } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Currency formatter for Botswana Pula
const formatCurrency = (value: number = 0): string => {
  try {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
      minimumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    return "BWP " + value;
  }
};

// Date formatter
const formatDate = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-BW", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch (e) {
    return String(dateString);
  }
};

// Calculate days remaining until a date
const daysUntil = (dateString: string | Date): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Payment method badge component
const PaymentMethodBadge = ({ method }: { method: string }) => {
  switch(method.toLowerCase()) {
    case 'm-zaka':
      return <Badge className="bg-blue-100 text-blue-800 border-0">M-Zaka</Badge>;
    case 'orange money':
      return <Badge className="bg-orange-100 text-orange-800 border-0">Orange Money</Badge>;
    case 'credit card':
      return <Badge className="bg-purple-100 text-purple-800 border-0">Credit Card</Badge>;
    case 'bank transfer':
      return <Badge className="bg-green-100 text-green-800 border-0">Bank Transfer</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-0">{method}</Badge>;
  }
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch(status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'active':
      return <Badge className="bg-green-100 text-green-800 border-0">{status}</Badge>;
    case 'pending':
    case 'in progress':
      return <Badge className="bg-blue-100 text-blue-800 border-0">{status}</Badge>;
    case 'overdue':
    case 'late':
      return <Badge className="bg-red-100 text-red-800 border-0">{status}</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-0">{status}</Badge>;
  }
};

export default function TenantDashboard() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current date for displaying
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-BW', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Fetch tenant's property data
  const {
    data: properties = [],
    isLoading: propertiesLoading,
    error: propertiesError
  } = useQuery<(Property & { lease?: Lease })[]>({
    queryKey: ["/api/properties/tenant"],
    retry: 1,
    staleTime: 30000,
  });
  
  // Fetch payment history
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError
  } = useQuery<Payment[]>({
    queryKey: ["/api/payments/tenant"],
    retry: 1,
    staleTime: 30000,
  });
  
  // Fetch lease history
  const {
    data: leases = [],
    isLoading: leasesLoading,
    error: leasesError
  } = useQuery<(Lease & { property?: Property })[]>({
    queryKey: ["/api/leases/history"],
    retry: 1,
    staleTime: 30000,
  });
  
  // Fetch maintenance requests
  const {
    data: maintenanceRequests = [],
    isLoading: maintenanceLoading,
    error: maintenanceError
  } = useQuery<any[]>({
    queryKey: ["/api/maintenance/tenant"],
    retry: 1,
    staleTime: 30000,
  });
  
  // Fetch documents
  const {
    data: documents = [],
    isLoading: documentsLoading,
    error: documentsError
  } = useQuery<Document[]>({
    queryKey: ["/api/documents/user"],
    retry: 1,
    staleTime: 30000,
  });
  
  // Get current property (first active one)
  const currentProperty = properties[0];
  const currentLease = currentProperty?.lease;
  
  // Calculate next payment due date (5th of next month)
  const nextPaymentDate = new Date();
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  nextPaymentDate.setDate(5);
  
  // Days until next payment
  const daysUntilPayment = daysUntil(nextPaymentDate);
  
  // Monthly payment amount
  const monthlyRent = currentProperty?.rentAmount || 6000;
  
  // Total paid to date (all payments)
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Security deposit
  const securityDeposit = currentLease?.securityDeposit || 12000;
  
  // Calculate lease end date and days remaining
  const leaseEndDate = currentLease ? new Date(currentLease.endDate) : new Date();
  const daysUntilLeaseEnd = currentLease ? daysUntil(leaseEndDate) : 0;
  
  // Generate monthly payment history data for charts
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  
  const paymentHistoryData = monthNames.map(month => {
    const matchingPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate.getMonth() === monthNames.indexOf(month) && 
             paymentDate.getFullYear() === currentYear;
    });
    
    return {
      name: month,
      amount: matchingPayments.reduce((sum, payment) => sum + payment.amount, 0),
      onTime: matchingPayments.some(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getDate() <= 5;
      })
    };
  });
  
  // Mock data for upcoming events
  const upcomingEvents = [
    { 
      id: 1, 
      title: 'Rent Due', 
      date: nextPaymentDate, 
      type: 'payment' 
    },
    { 
      id: 2, 
      title: 'Annual Property Inspection', 
      date: new Date(today.getFullYear(), today.getMonth() + 1, 15), 
      type: 'inspection' 
    },
    { 
      id: 3, 
      title: 'HVAC Maintenance', 
      date: new Date(today.getFullYear(), today.getMonth() + 2, 8), 
      type: 'maintenance' 
    }
  ];
  
  // Recent transactions - use 3 most recent payments
  const recentTransactions = payments
    .slice()
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 3);
  
  // Recent maintenance requests - use 3 most recent
  const recentMaintenanceRequests = maintenanceRequests
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Check if all data is loading
  const isLoading = propertiesLoading || paymentsLoading || leasesLoading || maintenanceLoading || documentsLoading;
  
  // Check if there are any errors
  const hasError = !!(propertiesError || paymentsError || leasesError || maintenanceError || documentsError);

  // Component for displaying a skeleton loader during data fetch
  const DashboardSkeleton = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="h-[200px] w-full md:w-2/3 rounded-xl" />
        <Skeleton className="h-[200px] w-full md:w-1/3 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-[120px] rounded-xl" />
        <Skeleton className="h-[120px] rounded-xl" />
        <Skeleton className="h-[120px] rounded-xl" />
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  );

  // Component for displaying the error state
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center h-[400px] text-center">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <X className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        We encountered an error while loading your dashboard data. Please try again later or contact support if the problem persists.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );

  // Sidebar component
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? "block lg:hidden" : "hidden lg:block"} h-full`}>
      <div className="flex flex-col h-full">
        <div className="px-6 py-8 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl || undefined} alt={user?.firstName || "User"} />
              <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="flex flex-col gap-1">
            <Button variant="ghost" className="justify-start gap-3" asChild>
              <Link href="/tenant/dashboard">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-3" asChild>
              <Link href="/tenant/payments">
                <DollarSign className="h-4 w-4" />
                <span>Payments</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-3" asChild>
              <Link href="/tenant/documents">
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-3" asChild>
              <Link href="/tenant/maintenance">
                <Wrench className="h-4 w-4" />
                <span>Maintenance</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-3" asChild>
              <Link href="/tenant/marketplace">
                <Search className="h-4 w-4" />
                <span>Marketplace</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-3" asChild>
              <Link href="/tenant/lease-history">
                <FileText className="h-4 w-4" />
                <span>Lease History</span>
              </Link>
            </Button>
          </div>
        </ScrollArea>
        
        <div className="mt-auto p-6 border-t">
          <Button variant="ghost" className="justify-start gap-3 w-full" asChild>
            <Link href="/auth">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 w-full" asChild>
            <Link href="/tenant/support">
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

  // Header component
  const Header = () => (
    <header className="py-4 px-6 border-b bg-white flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">My Home</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );

  // Mobile menu
  const MobileMenu = () => (
    <div className={`fixed inset-0 z-50 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      <div className="absolute inset-y-0 left-0 w-3/4 max-w-sm bg-white">
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <Sidebar mobile />
        </div>
      </div>
    </div>
  );

  // Hero section with property info
  const PropertyHero = () => {
    if (!currentProperty) return null;
    
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-8">
          <div className="space-y-4">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">Current Residence</Badge>
            <h2 className="text-3xl font-bold">{currentProperty.title || 'Block 10 Residence'}</h2>
            <p className="flex items-center text-white/90">
              <MapPin className="h-4 w-4 mr-1" /> 
              {currentProperty.address || 'Plot 12345, Block 10'}, {currentProperty.city || 'Gaborone'}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-sm text-white/70">Monthly Rent</p>
                <p className="text-lg font-semibold">{formatCurrency(monthlyRent)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-sm text-white/70">Next Payment</p>
                <p className="text-lg font-semibold">{formatDate(nextPaymentDate)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-sm text-white/70">Days Remaining</p>
                <p className="text-lg font-semibold">{daysUntilPayment} days</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-sm text-white/70">Lease Expires</p>
                <p className="text-lg font-semibold">{currentLease ? formatDate(currentLease.endDate) : 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button className="bg-white text-blue-600 hover:bg-white/90">
                <DollarSign className="h-4 w-4 mr-1" />
                Make Payment
              </Button>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
                <Wrench className="h-4 w-4 mr-1" />
                Request Repair
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Upcoming events component
  const UpcomingEvents = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Upcoming Events</CardTitle>
        <CardDescription>Important dates and upcoming activities</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-1">
          {upcomingEvents.map(event => (
            <div key={event.id} className="px-6 py-3 hover:bg-muted/50 transition-colors flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                event.type === 'payment' ? 'bg-blue-100 text-blue-600' : 
                event.type === 'inspection' ? 'bg-amber-100 text-amber-600' : 
                'bg-green-100 text-green-600'
              }`}>
                {event.type === 'payment' ? <DollarSign className="h-5 w-5" /> :
                 event.type === 'inspection' ? <Search className="h-5 w-5" /> :
                 <Wrench className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.date)} ({daysUntil(event.date)} days)
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-center">
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          Add to Calendar
        </Button>
      </CardFooter>
    </Card>
  );

  // Payment summary component
  const PaymentSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-green-50 border-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center text-green-700">
            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">Current</div>
          <p className="text-xs text-green-600 mt-1 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            All payments up to date
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center text-blue-700">
            <Clock className="h-4 w-4 mr-1 text-blue-500" />
            Next Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{formatDate(nextPaymentDate)}</div>
          <p className="text-xs text-blue-600 mt-1">{daysUntilPayment} days remaining</p>
        </CardContent>
      </Card>
      
      <Card className="bg-purple-50 border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center text-purple-700">
            <CreditCard className="h-4 w-4 mr-1 text-purple-500" />
            Security Deposit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">{formatCurrency(securityDeposit)}</div>
          <p className="text-xs text-purple-600 mt-1">Fully refundable at end of lease</p>
        </CardContent>
      </Card>
    </div>
  );

  // Recent transactions component
  const RecentTransactions = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
        <CardDescription>Your latest payment activity</CardDescription>
      </CardHeader>
      <CardContent>
        {recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Monthly Rent - {formatDate(transaction.paymentDate)}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <PaymentMethodBadge method={transaction.paymentMethod || 'Bank Transfer'} />
                    <span className="text-xs text-muted-foreground">
                      • Ref: {transaction.id.toString().padStart(6, '0')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                  <StatusBadge status={transaction.status || 'paid'} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No recent transactions found</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/tenant/payments">
            View All Transactions
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  // Payment history chart component
  const PaymentHistoryChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Payment History</CardTitle>
        <CardDescription>Your monthly payment activity this year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={paymentHistoryData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `P${value/1000}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#4f46e5" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  // Recent maintenance requests component
  const RecentMaintenance = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Maintenance Requests</CardTitle>
        <CardDescription>Recent repair and maintenance activity</CardDescription>
      </CardHeader>
      <CardContent>
        {recentMaintenanceRequests.length > 0 ? (
          <div className="space-y-4">
            {recentMaintenanceRequests.map(request => (
              <div key={request.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{request.title || 'Maintenance Request'}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted on {formatDate(request.createdAt || new Date())}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={request.status || 'pending'} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wrench className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No maintenance requests found</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button className="w-full" asChild>
          <Link href="/tenant/maintenance">
            <Wrench className="h-4 w-4 mr-1" />
            New Maintenance Request
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  // Lease details component
  const LeaseDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lease Details</CardTitle>
        <CardDescription>Your current lease information</CardDescription>
      </CardHeader>
      <CardContent>
        {currentLease ? (
          <div>
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Lease Timeline</h4>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {Math.min(Math.round((today.getTime() - new Date(currentLease.startDate).getTime()) / 
                      (new Date(currentLease.endDate).getTime() - new Date(currentLease.startDate).getTime()) * 100), 100)}% Complete
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {daysUntilLeaseEnd > 0 ? `${daysUntilLeaseEnd} days remaining` : 'Expired'}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.min(Math.round((today.getTime() - new Date(currentLease.startDate).getTime()) / 
                  (new Date(currentLease.endDate).getTime() - new Date(currentLease.startDate).getTime()) * 100), 100)} 
                  className="h-2" 
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>{formatDate(currentLease.startDate)}</span>
                  <span>{formatDate(currentLease.endDate)}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Lease Terms</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Rent</span>
                    <span className="text-sm">{formatCurrency(monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Security Deposit</span>
                    <span className="text-sm">{formatCurrency(securityDeposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lease Status</span>
                    <StatusBadge status="active" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Property Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Property Type</span>
                    <span className="text-sm">{currentProperty?.propertyType || 'Apartment'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Bedrooms</span>
                    <span className="text-sm">{currentProperty?.bedrooms || 2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Bathrooms</span>
                    <span className="text-sm">{currentProperty?.bathrooms || 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No active lease found</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/tenant/documents">
            <FileText className="h-4 w-4 mr-1" />
            View Lease Documents
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobileMenu />
      <Header />
      
      <div className="flex-1 flex">
        <div className="w-64 border-r bg-white hidden lg:block">
          <Sidebar />
        </div>
        
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          {isLoading ? (
            <DashboardSkeleton />
          ) : hasError ? (
            <ErrorState />
          ) : (
            <div className="space-y-6">
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-1">Welcome, {user?.firstName || 'Tenant'}!</h1>
                  <p className="text-muted-foreground">{formattedDate}</p>
                </div>
                
                {/* Top Section - Property Hero + Upcoming Events */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <PropertyHero />
                  </div>
                  <div>
                    <UpcomingEvents />
                  </div>
                </div>
                
                {/* Payment Summary Cards */}
                <PaymentSummary />
              </div>
              
              {/* Dashboard Tabs */}
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="finances">Finances</TabsTrigger>
                  <TabsTrigger value="property">Property</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentTransactions />
                    <RecentMaintenance />
                  </div>
                  <LeaseDetails />
                </TabsContent>
                
                {/* Finances Tab */}
                <TabsContent value="finances" className="pt-6 space-y-6">
                  <PaymentHistoryChart />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Payment Methods</CardTitle>
                        <CardDescription>Your saved payment options</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">M-Zaka Mobile Money</h3>
                              <p className="text-sm text-muted-foreground">******5678</p>
                            </div>
                            <Badge>Default</Badge>
                          </div>
                          
                          <div className="p-4 border rounded-lg flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">Orange Money</h3>
                              <p className="text-sm text-muted-foreground">******1234</p>
                            </div>
                          </div>
                          
                          <Button className="w-full" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Payment Method
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Billing Summary</CardTitle>
                        <CardDescription>Year to date statistics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Paid (YTD)</span>
                            <span className="font-medium">{formatCurrency(totalPaid)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Annual Rent</span>
                            <span className="font-medium">{formatCurrency(monthlyRent * 12)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Monthly Average</span>
                            <span className="font-medium">{formatCurrency(monthlyRent)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Security Deposit</span>
                            <span className="font-medium">{formatCurrency(securityDeposit)}</span>
                          </div>
                          
                          <Tabs defaultValue="automatic" className="w-full pt-4 border-t">
                            <TabsList className="grid grid-cols-2 w-full">
                              <TabsTrigger value="automatic">Auto Pay</TabsTrigger>
                              <TabsTrigger value="reminders">Reminders</TabsTrigger>
                            </TabsList>
                            <TabsContent value="automatic" className="pt-4">
                              <Button className="w-full" variant="outline">Enable Auto Pay</Button>
                            </TabsContent>
                            <TabsContent value="reminders" className="pt-4">
                              <Button className="w-full" variant="outline">Set Up Reminders</Button>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Property Tab */}
                <TabsContent value="property" className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Property Details</CardTitle>
                        <CardDescription>Information about your current residence</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Location & Contact</h3>
                            <div className="p-4 border rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Address</p>
                                  <p className="font-medium">
                                    {currentProperty?.address || 'Plot 12345, Block 10'}<br />
                                    {currentProperty?.city || 'Gaborone'}, Botswana
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Property Manager</p>
                                  <p className="font-medium">Demo Landlord</p>
                                  <p className="text-sm">landlord@example.com</p>
                                  <p className="text-sm">+267 1234 5678</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Property Features</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {(currentProperty?.amenities || ['Parking', 'Security', 'Water Supply', 'Electricity', 'WiFi', 'AC', 'Garden', 'Swimming Pool']).map((amenity, idx) => (
                                <div key={idx} className="p-3 border rounded-lg flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">{amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Property Rules</h3>
                            <div className="p-4 border rounded-lg space-y-2">
                              <p className="text-sm">
                                <span className="font-medium">Noise:</span> Quiet hours from
                                10 pm to 6 am on weekdays and 11 pm to 7 am on weekends.
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Guests:</span> Overnight guests allowed for up to 
                                7 consecutive days with prior notice to property management.
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Maintenance:</span> Report any maintenance issues 
                                promptly through the tenant portal.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Quick Actions</CardTitle>
                          <CardDescription>Property management tools</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/tenant/maintenance">
                              <Wrench className="h-4 w-4 mr-2" />
                              Request Maintenance
                            </Link>
                          </Button>
                          <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/tenant/documents">
                              <FileText className="h-4 w-4 mr-2" />
                              View Documents
                            </Link>
                          </Button>
                          <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/tenant/messages">
                              <div className="flex items-center">
                                Contact Landlord
                              </div>
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Property Rating</CardTitle>
                          <CardDescription>Your experience rating</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center justify-center py-4">
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-8 w-8 ${star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-center text-lg font-medium">4.0/5.0</p>
                            <p className="text-center text-sm text-muted-foreground">
                              Based on your ratings
                            </p>
                            <Button className="mt-4" variant="outline">
                              Update Rating
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}