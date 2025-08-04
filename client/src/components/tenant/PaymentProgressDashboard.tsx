import React from 'react';
import { Calendar, Clock, DollarSign, AlertTriangle, CheckCircle2, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Payment, Lease } from '@shared/schema';
import { format, differenceInDays, addMonths, differenceInMonths } from 'date-fns';

interface PaymentProgressProps {
  payments: Payment[];
  lease?: Lease;
  rentAmount: number;
}

export default function PaymentProgressDashboard({ payments, lease, rentAmount }: PaymentProgressProps) {
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'BWP',
      maximumFractionDigits: 0 
    }).format(amount);
  };
  
  // Calculate payment status
  const calculatePaymentStatus = () => {
    if (!lease) return { status: 'unknown', daysLeft: 0, nextPaymentDate: new Date() };
    
    const today = new Date();
    const startDate = new Date(lease.startDate);
    const monthsSinceLease = differenceInMonths(today, startDate);
    const nextPaymentDate = addMonths(startDate, monthsSinceLease + 1);
    const daysLeft = differenceInDays(nextPaymentDate, today);
    
    // Check if current month's payment is made
    const currentMonthPayment = payments.find(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return (
        paymentDate.getMonth() === today.getMonth() &&
        paymentDate.getFullYear() === today.getFullYear()
      );
    });
    
    if (currentMonthPayment) {
      return { 
        status: 'paid', 
        daysLeft, 
        nextPaymentDate 
      };
    }
    
    if (daysLeft < 0) {
      return { 
        status: 'overdue', 
        daysLeft: Math.abs(daysLeft), 
        nextPaymentDate 
      };
    }
    
    if (daysLeft <= 7) {
      return { 
        status: 'due-soon', 
        daysLeft, 
        nextPaymentDate 
      };
    }
    
    return { 
      status: 'upcoming', 
      daysLeft, 
      nextPaymentDate 
    };
  };
  
  const paymentStatus = calculatePaymentStatus();
  
  // Calculate overall payment consistency
  const totalExpectedPayments = lease ? differenceInMonths(new Date(), new Date(lease.startDate)) + 1 : 0;
  const consistencyPercentage = totalExpectedPayments > 0 
    ? Math.min(100, (payments.length / totalExpectedPayments) * 100) 
    : 0;
  
  // Calculate yearly payment summary
  const currentYear = new Date().getFullYear();
  const paymentsThisYear = payments.filter(payment => 
    new Date(payment.paymentDate).getFullYear() === currentYear
  );
  
  const totalPaidThisYear = paymentsThisYear.reduce(
    (sum, payment) => sum + payment.amount, 
    0
  );
  
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-success-foreground';
      case 'overdue': return 'text-destructive-foreground';
      case 'due-soon': return 'text-amber-500';
      default: return 'text-primary';
    }
  };
  
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid for this month';
      case 'overdue': return 'Payment Overdue';
      case 'due-soon': return 'Payment Due Soon';
      default: return 'Next Payment Upcoming';
    }
  };
  
  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-6 w-6 text-success-foreground" />;
      case 'overdue': return <AlertTriangle className="h-6 w-6 text-destructive-foreground" />;
      case 'due-soon': return <Clock className="h-6 w-6 text-amber-500" />;
      default: return <Calendar className="h-6 w-6 text-primary" />;
    }
  };
  
  // Calculate remaining lease timeline
  const leaseProgress = () => {
    if (!lease) return 0;
    
    const startDate = new Date(lease.startDate);
    const endDate = new Date(lease.endDate);
    const today = new Date();
    
    const totalDays = differenceInDays(endDate, startDate);
    const daysElapsed = differenceInDays(today, startDate);
    
    return Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));
  };
  
  return (
    <div className="space-y-6">
      {/* Current Payment Status Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {getPaymentStatusIcon(paymentStatus.status)}
              <div className="ml-3">
                <h3 className={`font-semibold ${getPaymentStatusColor(paymentStatus.status)}`}>
                  {getPaymentStatusText(paymentStatus.status)}
                </h3>
                {paymentStatus.status !== 'paid' && (
                  <p className="text-body-small">
                    {paymentStatus.status === 'overdue' 
                      ? `Overdue by ${paymentStatus.daysLeft} days` 
                      : `${paymentStatus.daysLeft} days until payment`}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-heading-2">{formatCurrency(rentAmount)}</div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
            </div>
          </div>
          
          {paymentStatus.status !== 'paid' && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Next payment due</span>
                <span>{format(paymentStatus.nextPaymentDate, 'MMM d, yyyy')}</span>
              </div>
              <Progress 
                value={paymentStatus.status === 'overdue' ? 100 : (100 - (paymentStatus.daysLeft / 30) * 100)} 
                className={`h-2 ${paymentStatus.status === 'overdue' ? 'bg-destructive' : ''}`}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payment Consistency Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Payment Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <DollarSign className="h-8 w-8 text-emerald-500 mr-3" />
            <div>
              <h3 className="font-semibold">{consistencyPercentage.toFixed(0)}% On-Time Payments</h3>
              <p className="text-body-small">
                {payments.length} of {totalExpectedPayments} expected payments made
              </p>
            </div>
          </div>
          <Progress value={consistencyPercentage} className="h-2 mb-2" />
        </CardContent>
      </Card>
      
      {/* Lease Timeline Card */}
      {lease && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Lease Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Start: {format(new Date(lease.startDate), 'MMM d, yyyy')}</span>
                <span className="text-gray-600">End: {format(new Date(lease.endDate), 'MMM d, yyyy')}</span>
              </div>
              <Progress value={leaseProgress()} className="h-2 mb-1" />
              <p className="text-sm text-right text-gray-600">
                {differenceInDays(new Date(lease.endDate), new Date())} days remaining
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Yearly Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Yearly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="h-6 w-6 text-indigo-500 mr-3" />
              <div>
                <h3 className="font-semibold">{formatCurrency(totalPaidThisYear)}</h3>
                <p className="text-body-small">Paid this year</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-md font-semibold">{paymentsThisYear.length}</div>
              <p className="text-sm text-gray-500">Payments made</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}