import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import DashLayout from '@/components/layout/DashLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw, DollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function TenantPaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch tenant's active leases
  const { data: leases = [], isLoading: isLoadingLeases } = useQuery({
    queryKey: ["/api/leases/tenant"],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/leases/tenant");
      return response;
    }
  });

  // Fetch tenant's payment history
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ["/api/payments/tenant"],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/payments/tenant");
      return response;
    }
  });

  // Calculate outstanding balance from active leases
  const calculateOutstandingBalance = () => {
    const activeLeases = leases.filter(lease => lease.active);
    if (activeLeases.length === 0) return { amount: 0, dueDate: null };
    
    // For simplicity, use the first active lease
    const lease = activeLeases[0];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Check if rent for current month has been paid
    const currentMonthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear &&
             payment.leaseId === lease.id;
    });
    
    const totalPaid = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstanding = Math.max(0, lease.rentAmount - totalPaid);
    
    // Due date is typically first of next month
    const dueDate = new Date(currentYear, currentMonth + 1, 1);
    
    return { amount: outstanding, dueDate };
  };

  // Payment processing mutation
  const paymentMutation = useMutation({
    mutationFn: async (paymentData: { leaseId: number; amount: number }) => {
      const response = await apiRequest("POST", "/api/payments", {
        leaseId: paymentData.leaseId,
        amount: paymentData.amount,
        paymentDate: new Date().toISOString(),
        paymentMethod: "online",
        status: "completed"
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments/tenant"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leases/tenant"] });
      toast({
        title: "Payment Successful",
        description: "Your rent payment has been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePayNow = () => {
    const activeLeases = leases.filter(lease => lease.active);
    if (activeLeases.length === 0) {
      toast({
        title: "No Active Lease",
        description: "You don't have any active leases to pay for.",
        variant: "destructive",
      });
      return;
    }

    const lease = activeLeases[0];
    const { amount } = calculateOutstandingBalance();
    
    if (amount <= 0) {
      toast({
        title: "No Outstanding Balance",
        description: "You don't have any outstanding payments.",
      });
      return;
    }

    paymentMutation.mutate({ leaseId: lease.id, amount });
  };

  const { amount: outstandingAmount, dueDate } = calculateOutstandingBalance();
  const isLoading = isLoadingLeases || isLoadingPayments;

  if (!user) {
    return (
      <DashLayout title="Payments" description="Manage your rent and utility payments">
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-heading-3 text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">You must be logged in to view payments.</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout
      title="Payments"
      description="Manage your rent and utility payments"
    >
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-600">Manage your rent and utility payments</p>
        </div>

        {/* Outstanding Balance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-24" />
              </div>
            ) : (
              <>
                <div className={`text-3xl font-bold mb-2 ${outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  P {outstandingAmount.toLocaleString('en-BW', { minimumFractionDigits: 2 })}
                </div>
                {outstandingAmount > 0 && dueDate ? (
                  <p className="text-gray-600 mb-4">
                    Rent due: {dueDate.toLocaleDateString('en-BW', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                ) : (
                  <p className="text-gray-600 mb-4">All payments are up to date</p>
                )}
                <Button 
                  className="w-full md:w-auto" 
                  onClick={handlePayNow}
                  disabled={paymentMutation.isPending || outstandingAmount <= 0}
                >
                  {paymentMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : outstandingAmount > 0 ? (
                    `Pay P ${outstandingAmount.toLocaleString('en-BW', { minimumFractionDigits: 2 })}`
                  ) : (
                    "No Payment Due"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-semibold">
                        {payment.paymentMethod === 'online' ? 'Online Payment' : 'Rent Payment'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(payment.paymentDate).toLocaleDateString('en-BW', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                    </div>
                    <div className="text-green-600 font-semibold">
                      P {payment.amount.toLocaleString('en-BW', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment history found</p>
                <p className="text-sm">Your payment transactions will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashLayout>
  );
}