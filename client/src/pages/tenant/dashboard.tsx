import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { 
  Home,
  DollarSign,
  FileText,
  Wrench,
  ArrowUp,
  ArrowDown,
  Loader2, 
  Building,
  Calendar,
  CreditCard,
  Download,
  Clock,
  CheckCircle,
  ShieldAlert,
  Shield,
  MapPin,
  Star,
  Wifi as WifiIcon,
  Trash2
} from "lucide-react";
import { Property, Payment, Lease, Document } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Currency formatter
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
    return date.toLocaleDateString();
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

// Payment method icon mapper
const PaymentMethodIcon = ({ method }: { method: string }) => {
  switch(method.toLowerCase()) {
    case 'm-zaka':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">M-Zaka</Badge>;
    case 'orange money':
      return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Orange Money</Badge>;
    case 'credit card':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Credit Card</Badge>;
    case 'bank transfer':
      return <Badge className="bg-green-100 text-green-800 border-green-300">Bank Transfer</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{method}</Badge>;
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function TenantDashboard() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
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
  const monthlyRent = currentProperty?.rentAmount || 0;
  
  // Total paid to date (all payments)
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Security deposit
  const securityDeposit = currentLease?.securityDeposit || 0;
  
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
  
  // Documents by type
  const documentTypes = documents.reduce((acc: Record<string, number>, doc) => {
    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
    return acc;
  }, {});
  
  const documentTypeData = Object.entries(documentTypes).map(([name, value]) => ({
    name,
    value
  }));
  
  // Previous properties data
  const previousLeases = leases.filter(lease => !lease.active).sort((a, b) => {
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });
  
  // Loading state
  if (propertiesLoading || paymentsLoading || leasesLoading || maintenanceLoading || documentsLoading) {
    return (
      <StandardLayout title="Tenant Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </StandardLayout>
    );
  }
  
  // Error state
  if (propertiesError || paymentsError || leasesError || maintenanceError || documentsError) {
    return (
      <StandardLayout title="Tenant Dashboard">
        <div className="text-center py-8">
          <p className="text-lg font-medium text-red-500 mb-2">Unable to load dashboard data</p>
          <p className="text-gray-500">Please try again later or contact support if the problem persists.</p>
        </div>
      </StandardLayout>
    );
  }
  
  return (
    <StandardLayout title="My Rental Dashboard" subtitle="Manage your rental information and payments">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          {currentProperty ? (
            <>
              {/* Property and Rent Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Building className="h-4 w-4 mr-1 text-primary" />
                      Current Residence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{currentProperty.title}</div>
                    <p className="text-sm text-muted-foreground">{currentProperty.address}</p>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{currentProperty.location}, {currentProperty.city}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-primary" />
                      Monthly Rent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(monthlyRent)}</div>
                    <div className="flex items-center mt-1 text-sm">
                      <CreditCard className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">Next payment: </span>
                      <span className="ml-1 font-medium">{formatDate(nextPaymentDate)}</span>
                    </div>
                    <div className="text-xs text-amber-500 mt-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{daysUntilPayment} days until next payment</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Shield className="h-4 w-4 mr-1 text-primary" />
                      Security Deposit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(securityDeposit)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Refundable at end of lease</p>
                    <div className="text-xs text-emerald-500 mt-2 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Deposit in good standing</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Lease Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Lease Information</CardTitle>
                  <CardDescription>Current lease details and important dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Lease Period</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span>{currentLease && formatDate(currentLease.startDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">End Date:</span>
                        <span>{currentLease && formatDate(currentLease.endDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Property Details</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Property Type:</span>
                        <span>{currentProperty.propertyType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bedrooms:</span>
                        <span>{currentProperty.bedrooms}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bathrooms:</span>
                        <span>{currentProperty.bathrooms}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Lease Terms</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{currentLease ? 
                          `${Math.round((new Date(currentLease.endDate).getTime() - 
                             new Date(currentLease.startDate).getTime()) / 
                             (1000 * 60 * 60 * 24 * 30.4))} months` : '12 months'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time Remaining:</span>
                        <span>{daysUntilLeaseEnd} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Security Deposit:</span>
                        <span>{formatCurrency(securityDeposit)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    <ShieldAlert className="h-4 w-4 inline mr-1 text-amber-500" />
                    Lease renewal will be available 60 days before expiration
                  </p>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    View Lease Document
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Property Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Amenities</CardTitle>
                  <CardDescription>Features and amenities included with your rental</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentProperty.amenities?.map((amenity, idx) => (
                      <div key={idx} className="flex items-center p-2 border rounded-md">
                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Overview</CardTitle>
                  <CardDescription>Summary of your rental payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={paymentHistoryData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `P${value/1000}k`} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), "Amount"]} />
                        <Bar 
                          dataKey="amount" 
                          fill="#8884d8" 
                          name="Payment Amount"
                          fillOpacity={0.8}
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-lg font-medium mt-1">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-lg font-medium mt-1">{formatCurrency(monthlyRent)}</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground">Next Due Date</p>
                      <p className="text-lg font-medium mt-1">{formatDate(nextPaymentDate)}</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge variant="outline" className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                        Current
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button className="w-full" variant="default">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Make a Payment
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Maintenance</CardTitle>
                    <CardDescription>Request repairs or report issues</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button variant="outline" className="w-full">
                      <Wrench className="h-4 w-4 mr-1" />
                      Submit Request
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Documents</CardTitle>
                    <CardDescription>Access lease and other documents</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-1" />
                      View Documents
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Contact Landlord</CardTitle>
                    <CardDescription>Send a message to property owner</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button variant="outline" className="w-full">
                      <div className="flex items-center">
                        Send Message
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Home className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Lease Found</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  You don't have any active leases at the moment. Browse available properties or contact support
                  if you think this is an error.
                </p>
                <Button>Browse Available Properties</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* PAYMENTS TAB */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Complete history of your rental payments</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-6 gap-2 p-3 bg-muted font-medium text-sm">
                    <div>Date</div>
                    <div>Property</div>
                    <div>Amount</div>
                    <div>Method</div>
                    <div>Status</div>
                    <div>Receipt</div>
                  </div>
                  {payments.slice()
                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                    .map((payment, index) => {
                      // Find lease and property for this payment
                      const lease = leases.find(l => l.id === payment.leaseId);
                      const property = lease?.property;
                      
                      return (
                        <div 
                          key={payment.id} 
                          className={`grid grid-cols-6 gap-2 p-3 text-sm ${
                            index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                          } border-t`}
                        >
                          <div>{formatDate(payment.paymentDate)}</div>
                          <div>{property?.title || 'Unknown Property'}</div>
                          <div className="font-medium">{formatCurrency(payment.amount)}</div>
                          <div><PaymentMethodIcon method={payment.paymentMethod} /></div>
                          <div>
                            <Badge variant="outline" className={
                              payment.status === 'paid' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                          <div>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <DollarSign className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No payment history found</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Export Payment History
              </Button>
              <Button>
                <DollarSign className="h-4 w-4 mr-1" />
                Make a Payment
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>Visualize your payment patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={paymentHistoryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `P${value/1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Payment Amount" 
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 5 }}
                      activeDot={{ fill: '#8884d8', stroke: '#fff', strokeWidth: 2, r: 7 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-3 border rounded-md">
                  <p className="text-sm text-muted-foreground">Total Paid (YTD)</p>
                  <p className="text-lg font-medium mt-1">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="text-sm text-muted-foreground">Annual Total</p>
                  <p className="text-lg font-medium mt-1">{formatCurrency(monthlyRent * 12)}</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="text-sm text-muted-foreground">Security Deposit</p>
                  <p className="text-lg font-medium mt-1">{formatCurrency(securityDeposit)}</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="text-sm text-muted-foreground">Payment Methods Used</p>
                  <p className="text-lg font-medium mt-1">
                    {new Set(payments.map(p => p.paymentMethod)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Setup</CardTitle>
              <CardDescription>Configure your payment methods and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-3">Payment Methods</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 border rounded-md">
                      <div className="mr-3">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">M-Zaka</Badge>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">M-Zaka Mobile Money</p>
                        <p className="text-xs text-muted-foreground">Connected</p>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    
                    <div className="flex items-center p-3 border rounded-md">
                      <div className="mr-3">
                        <Badge className="bg-green-100 text-green-800 border-green-300">Bank</Badge>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Bank Transfer</p>
                        <p className="text-xs text-muted-foreground">Connected</p>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    
                    <Button variant="outline" className="flex items-center justify-center">
                      <div className="flex items-center">
                        <span>Add Payment Method</span>
                      </div>
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-3">Automatic Payments</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set up automatic payments to never miss a rent payment.
                  </p>
                  <Button variant="outline">Enable Automatic Payments</Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-3">Payment Reminders</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get notified before your rent is due.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Reminders</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">SMS Reminders</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>Access all your rental-related documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={documentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {documentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {documents.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-5 gap-2 p-3 bg-muted font-medium text-sm">
                    <div>Document Name</div>
                    <div>Type</div>
                    <div>Upload Date</div>
                    <div>Size</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {documents.map((document, index) => (
                    <div 
                      key={document.id} 
                      className={`grid grid-cols-5 gap-2 p-3 text-sm ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                      } border-t`}
                    >
                      <div className="font-medium">{document.fileName}</div>
                      <div>
                        <Badge variant="outline">
                          {document.documentType.charAt(0).toUpperCase() + document.documentType.slice(1)}
                        </Badge>
                      </div>
                      <div>{formatDate(document.uploadedAt)}</div>
                      <div>-</div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Download className="h-4 w-4" />
                        </Button>
                        <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No documents found</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full">
                <div className="flex items-center">
                  Upload Document
                </div>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Important Documents</CardTitle>
              <CardDescription>Key documents related to your current lease</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <h4 className="font-medium">Lease Agreement</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your current binding contract with the property owner.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">View Document</Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <h4 className="font-medium">Property Rules</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Guidelines and regulations for the property.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">View Document</Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <h4 className="font-medium">Move-in Inspection</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Condition report from when you moved in.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">View Document</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rental History</CardTitle>
              <CardDescription>Documents from your previous leases</CardDescription>
            </CardHeader>
            <CardContent>
              {previousLeases.length > 0 ? (
                <div className="space-y-4">
                  {previousLeases.map((lease) => (
                    <div key={lease.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">{lease.property?.title || 'Previous Property'}</h4>
                        <Badge variant="outline">
                          {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {lease.property?.address || 'Address not available'}
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View Lease</Button>
                        <Button variant="outline" size="sm">Payment Records</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <Building className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No previous lease history found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* MAINTENANCE TAB */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>Submit and track repair requests for your rental</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceRequests.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-6 gap-2 p-3 bg-muted font-medium text-sm">
                    <div>Date</div>
                    <div>Issue</div>
                    <div>Category</div>
                    <div>Priority</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {maintenanceRequests.map((request, index) => (
                    <div 
                      key={request.id} 
                      className={`grid grid-cols-6 gap-2 p-3 text-sm ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                      } border-t`}
                    >
                      <div>{formatDate(request.createdAt)}</div>
                      <div className="font-medium">{request.title}</div>
                      <div>{request.category}</div>
                      <div>
                        <Badge 
                          variant="outline" 
                          className={
                            request.priority === 'high'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : request.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }
                        >
                          {request.priority}
                        </Badge>
                      </div>
                      <div>
                        <Badge 
                          variant="outline"
                          className={
                            request.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : request.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          View
                        </Button>
                        {request.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <Wrench className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No maintenance requests found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submit a request when you need repairs or have issues with your rental
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full">
                <Wrench className="h-4 w-4 mr-1" />
                Submit New Maintenance Request
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Condition</CardTitle>
                <CardDescription>Report and track issues with your rental</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-3">Common Issues</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <WifiIcon className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm">Internet Connectivity</span>
                      </div>
                      <div className="flex items-center">
                        <Wrench className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm">Plumbing Problems</span>
                      </div>
                      <div className="flex items-center">
                        <Wrench className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm">Electrical Issues</span>
                      </div>
                      <div className="flex items-center">
                        <Wrench className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm">HVAC Maintenance</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-3">Emergency Contacts</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Maintenance</span>
                        <span className="text-sm font-medium">+267 1234 5678</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Property Manager</span>
                        <span className="text-sm font-medium">+267 8765 4321</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Emergency Services</span>
                        <span className="text-sm font-medium">999</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Tips</CardTitle>
                <CardDescription>Helpful guides to maintain your rental</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Tenant Responsibilities</h4>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      <li>Replace air filters every 3 months</li>
                      <li>Clean appliances regularly</li>
                      <li>Report water leaks immediately</li>
                      <li>Keep drains clear and free of debris</li>
                      <li>Test smoke detectors monthly</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Common DIY Fixes</h4>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      <li>Unclogging drains with baking soda and vinegar</li>
                      <li>Resetting circuit breakers during power issues</li>
                      <li>Fixing running toilets by adjusting the float</li>
                      <li>Cleaning air conditioner filters for better efficiency</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Local Services</CardTitle>
              <CardDescription>Find trusted service providers in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Plumbers</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Gaborone Plumbing Services</p>
                      <div className="flex items-center text-xs mt-1">
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-gray-300" />
                        <span className="ml-1 text-muted-foreground">(4.2)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quick Fix Plumbing</p>
                      <div className="flex items-center text-xs mt-1">
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="ml-1 text-muted-foreground">(4.9)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Electricians</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Botswana Electric Solutions</p>
                      <div className="flex items-center text-xs mt-1">
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-gray-300" />
                        <span className="ml-1 text-muted-foreground">(4.3)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Power Pro Electricians</p>
                      <div className="flex items-center text-xs mt-1">
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="ml-1 text-muted-foreground">(4.7)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Cleaning Services</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Pristine Cleaning</p>
                      <div className="flex items-center text-xs mt-1">
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-gray-300" />
                        <span className="ml-1 text-muted-foreground">(4.4)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Gaborone Home Cleaners</p>
                      <div className="flex items-center text-xs mt-1">
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="ml-1 text-muted-foreground">(4.8)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardLayout>
  );
}