import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Payment, Lease, Property } from "@shared/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText, 
  Download, 
  ArrowUpRight,
  Filter,
  Wallet,
  Building,
  Landmark,
  CalendarDays,
  Receipt,
  CircleDollarSign,
  AlertCircle
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentWithDetails extends Payment {
  lease?: Lease;
  property?: Property;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [paymentAmount, setPaymentAmount] = useState("");

  // Fetch payment history
  const {
    data: payments,
    isLoading: isLoadingPayments,
    error: paymentsError
  } = useQuery<PaymentWithDetails[]>({
    queryKey: ["/api/payments/history"],
  });

  // Fetch active leases for the payment dropdown
  const {
    data: leases,
    isLoading: isLoadingLeases,
    error: leasesError
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/tenant"],
  });

  // Find active leases
  const activeLeases = leases ? leases.filter(lease => lease.active) : [];

  const isLoading = isLoadingPayments || isLoadingLeases;
  const error = paymentsError || leasesError;

  // Calculate total paid and pending payments
  const calculateTotals = () => {
    if (!payments) return { total: 0, paid: 0, pending: 0 };
    
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const paid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
    
    return { total, paid, pending };
  };

  const { total, paid, pending } = calculateTotals();

  // Get payment status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-500">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter payments by status
  const filteredPayments = (status: string) => {
    if (!payments) return [];
    if (status === "all") return payments;
    return payments.filter(payment => payment.status === status);
  };

  // Open payment dialog with selected lease
  const handleMakePayment = (lease: Lease) => {
    setSelectedLease(lease);
    setPaymentAmount(lease.rentAmount.toString());
    setIsPaymentDialogOpen(true);
  };

  // Submit payment
  const handleSubmitPayment = async () => {
    if (!selectedLease) return;
    
    try {
      // In a real app, this would integrate with a payment gateway
      alert(`Payment of ${formatCurrency(Number(paymentAmount))} to be processed via ${paymentMethod.replace('_', ' ')}`);
      setIsPaymentDialogOpen(false);
      
      // A real implementation would submit to the server
      // and handle payment processing
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Payment Data</h2>
          <p className="text-gray-500 mb-4">Failed to load your payment history. Please try again later.</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="space-y-6">
        <DashboardHeader
          title="Payments & Billing"
          subtitle="Manage your rent payments and view payment history"
        />

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Receipt className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-xl font-semibold">{formatCurrency(total)}</h3>
                <p className="text-sm text-gray-500">Total Payments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="text-xl font-semibold">{formatCurrency(paid)}</h3>
                <p className="text-sm text-gray-500">Paid</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Clock className="h-8 w-8 text-yellow-500 mb-2" />
                <h3 className="text-xl font-semibold">{formatCurrency(pending)}</h3>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
            <TabsTrigger value="history" className="py-2">Payment History</TabsTrigger>
            <TabsTrigger value="pay" className="py-2">Make a Payment</TabsTrigger>
            <TabsTrigger value="methods" className="py-2">Payment Methods</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Next payment due */}
            {activeLeases.length > 0 ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Next Rent Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeLeases.map(lease => {
                      // Calculate next payment date (first of next month)
                      const nextPaymentDate = new Date();
                      nextPaymentDate.setDate(1);
                      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                      
                      // Calculate days until due
                      const today = new Date();
                      const daysUntilPayment = Math.max(0, Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                      
                      return (
                        <div key={lease.id} className="space-y-3">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Amount Due</p>
                              <p className="text-2xl font-bold">{formatCurrency(lease.rentAmount)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Due Date</p>
                              <p className="text-md font-medium">{formatDate(nextPaymentDate)}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Time Remaining</span>
                              <span className="font-medium">{daysUntilPayment} days</span>
                            </div>
                            <Progress value={(30 - daysUntilPayment) / 30 * 100} className="h-2" />
                          </div>
                          
                          <Button className="w-full gap-2" onClick={() => handleMakePayment(lease)}>
                            <CreditCard className="h-4 w-4" />
                            Pay Now
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">No Active Leases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Building className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 mb-4">You don't have any active leases that require payments.</p>
                    <Button asChild>
                      <a href="/tenant/property-search">Find Properties</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Payments */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md font-medium">Recent Payments</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setActiveTab("history")}>
                    <span className="text-xs">View All</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments && payments.length > 0 ? (
                    <div className="space-y-3">
                      {payments.slice(0, 5).map(payment => (
                        <div key={payment.id} className="flex justify-between items-center border-b pb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <Receipt className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {payment.property ? payment.property.address : 'Property'}
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(payment.paymentDate)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Receipt className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No payment history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View all your past and upcoming payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {payments && payments.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Receipt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map(payment => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              {payment.property ? 
                                payment.property.address.length > 25 
                                  ? payment.property.address.substring(0, 25) + '...' 
                                  : payment.property.address
                                : 'Property'
                              }
                            </TableCell>
                            <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>{payment.paymentMethod || 'Credit Card'}</TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell className="text-right">
                              {payment.status === 'paid' && (
                                <Button variant="ghost" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">No Payment History</h3>
                    <p className="text-gray-500 mb-4">You haven't made any payments yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Make a Payment Tab */}
          <TabsContent value="pay" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Make a Payment</CardTitle>
                <CardDescription>Pay your rent securely online</CardDescription>
              </CardHeader>
              <CardContent>
                {activeLeases.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Select Property</h3>
                      <div className="space-y-3">
                        {activeLeases.map(lease => (
                          <Card key={lease.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={() => handleMakePayment(lease)}>
                            <CardContent className="p-4 flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                                  <Building className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">Property #{lease.propertyId}</p>
                                  <p className="text-sm text-gray-500">Lease ends: {formatDate(lease.endDate)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(lease.rentAmount)}</p>
                                <p className="text-xs text-gray-500">Monthly Rent</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500 mb-2">Click on a property to make a payment</p>
                      <p className="text-xs text-gray-400">
                        Payments are securely processed through our payment gateway
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">No Active Leases</h3>
                    <p className="text-gray-500 mb-4">You need an active lease to make payments.</p>
                    <Button asChild>
                      <a href="/tenant/property-search">Find Properties</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payment Methods Tab */}
          <TabsContent value="methods" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Credit Card */}
                  <Card className="border-dashed border-2">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Add Credit/Debit Card</p>
                          <p className="text-sm text-gray-500">Securely save your card for easy payments</p>
                        </div>
                      </div>
                      <Button variant="ghost">Add</Button>
                    </CardContent>
                  </Card>
                  
                  {/* Bank Account */}
                  <Card className="border-dashed border-2">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Landmark className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Link Bank Account</p>
                          <p className="text-sm text-gray-500">Connect your account for direct debits</p>
                        </div>
                      </div>
                      <Button variant="ghost">Add</Button>
                    </CardContent>
                  </Card>
                  
                  {/* Mobile Money */}
                  <Card className="border-dashed border-2">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Mobile Money</p>
                          <p className="text-sm text-gray-500">Pay directly using your mobile wallet</p>
                        </div>
                      </div>
                      <Button variant="ghost">Add</Button>
                    </CardContent>
                  </Card>
                  
                  <div className="pt-4 text-center">
                    <p className="text-sm text-gray-400">
                      All payment information is encrypted and securely stored
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>
              Pay your rent for Property #{selectedLease?.propertyId}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <div className="flex items-center mt-1">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    BWP
                  </span>
                  <Input 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-12"
                    type="number"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select 
                defaultValue="credit_card" 
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {paymentMethod === "credit_card" && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Card Number</label>
                  <Input placeholder="**** **** **** ****" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Expiry Date</label>
                    <Input placeholder="MM/YY" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">CVV</label>
                    <Input placeholder="***" className="mt-1" />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === "mobile_money" && (
              <div>
                <label className="text-sm font-medium">Mobile Number</label>
                <Input placeholder="+267 ..." className="mt-1" />
              </div>
            )}
            
            {paymentMethod === "bank_transfer" && (
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                <p className="font-medium mb-1">Bank Transfer Details:</p>
                <p>Bank: TOV Bank</p>
                <p>Account: 1234567890</p>
                <p>Reference: RENT-{selectedLease?.id}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPayment}>
              Pay {formatCurrency(Number(paymentAmount))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashLayout>
  );
}