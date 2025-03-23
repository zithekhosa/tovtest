import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Payment, Lease, MaintenanceRequest, Property } from "@shared/schema";
import SummaryCard from "@/components/dashboard/SummaryCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable";
import MaintenanceRequestForm from "@/components/maintenance/MaintenanceRequestForm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { 
  Loader2, 
  DollarSign, 
  Home, 
  Wrench, 
  CheckCircle, 
  MessageSquare, 
  Clock,
  CalendarDays 
} from "lucide-react";

export default function TenantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Fetch active lease for the tenant
  const { 
    data: leases,
    isLoading: isLoadingLeases,
    error: leaseError
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

  const isLoading = isLoadingLeases || isLoadingProperty || isLoadingPayments || isLoadingMaintenance;

  const handleSubmitMaintenanceRequest = async (formData: any) => {
    if (!activeLease) {
      toast({
        title: "Error",
        description: "You need an active lease to submit a maintenance request",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestData = {
        propertyId: activeLease.propertyId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: "pending",
        images: formData.images?.map((file: File) => URL.createObjectURL(file)) || [],
      };

      await apiRequest("POST", "/api/maintenance", requestData);
      
      // Invalidate maintenance requests to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/tenant"] });
      
      toast({
        title: "Success",
        description: "Maintenance request submitted successfully",
      });
      
      setShowMaintenanceModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit maintenance request",
        variant: "destructive",
      });
    }
  };

  const handlePayNow = () => {
    toast({
      title: "Coming Soon",
      description: "Online payment functionality is coming soon",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (leaseError || !activeLease) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-card text-center">
        <h2 className="text-xl font-semibold mb-2">No Active Lease Found</h2>
        <p className="text-gray-500 mb-4">You don't have an active lease in the system.</p>
      </div>
    );
  }

  // Calculate the next rent due date (first day of next month)
  const nextRentDate = new Date();
  nextRentDate.setDate(1);
  nextRentDate.setMonth(nextRentDate.getMonth() + 1);

  // Find active maintenance requests
  const activeMaintenanceRequests = maintenanceRequests?.filter(
    request => request.status !== "completed" && request.status !== "cancelled"
  ) || [];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-500">Here's what you need to know about your rental property.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Rent Card */}
        <SummaryCard
          title="Rent Payment"
          subtitle="Next payment due"
          value={formatCurrency(activeLease.rentAmount)}
          valueSubtext={`Due on ${formatDate(nextRentDate)}`}
          icon={DollarSign}
          actionLabel="Pay Now"
          onAction={handlePayNow}
        />

        {/* Property Card */}
        <SummaryCard
          title="Your Property"
          subtitle="Current residence"
          value={property?.address || ""}
          valueSubtext={`${property?.city || ""}, ${property?.state || ""} ${property?.zipCode || ""}`}
          icon={Home}
          actionLabel="View Details"
          onAction={() => {}}
        />

        {/* Maintenance Card */}
        <SummaryCard
          title="Maintenance"
          subtitle="Recent requests"
          value={`${activeMaintenanceRequests.length} Active Requests`}
          valueSubtext={activeMaintenanceRequests.length ? "Click to view details" : "No active requests"}
          icon={Wrench}
          actionLabel="Submit New Request"
          onAction={() => setShowMaintenanceModal(true)}
        />
      </div>

      {/* Lease Information */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="text-xl font-semibold mb-4">Lease Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Lease Term</p>
              <p className="font-medium">
                {formatDate(activeLease.startDate)} - {formatDate(activeLease.endDate)}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p className="font-medium">{formatCurrency(activeLease.rentAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Security Deposit</p>
              <p className="font-medium">{formatCurrency(activeLease.securityDeposit)}</p>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Landlord</p>
              <p className="font-medium">Contact your property manager</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Property Manager</p>
              <p className="font-medium">Contact information in messages</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lease Document</p>
              {activeLease.documentUrl ? (
                <a 
                  href={activeLease.documentUrl} 
                  className="inline-flex items-center font-medium text-primary hover:text-primary/80"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  View Lease Agreement
                </a>
              ) : (
                <p className="text-sm text-gray-500">No document available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Payment History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {(maintenanceRequests && maintenanceRequests.length > 0) || (payments && payments.length > 0) ? (
              <>
                {payments && payments.length > 0 && (
                  <ActivityItem
                    icon={CheckCircle}
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    title="Rent Payment Confirmed"
                    description={`Your payment of ${formatCurrency(payments[0].amount)} has been received.`}
                    timestamp={payments[0].paymentDate}
                  />
                )}
                
                {maintenanceRequests && maintenanceRequests.length > 0 && (
                  <>
                    <ActivityItem
                      icon={MessageSquare}
                      iconBgColor="bg-blue-100"
                      iconColor="text-blue-600"
                      title="Maintenance Request Update"
                      description={`Status for "${maintenanceRequests[0].title}" is now ${maintenanceRequests[0].status}`}
                      timestamp={maintenanceRequests[0].updatedAt || maintenanceRequests[0].createdAt}
                    />
                    
                    {maintenanceRequests.length > 1 && (
                      <ActivityItem
                        icon={Clock}
                        iconBgColor="bg-yellow-100"
                        iconColor="text-yellow-600"
                        title="Maintenance Request Submitted"
                        description={`You submitted a request for "${maintenanceRequests[1].title}"`}
                        timestamp={maintenanceRequests[1].createdAt}
                      />
                    )}
                  </>
                )}
                
                <ActivityItem
                  icon={CalendarDays}
                  iconBgColor="bg-purple-100"
                  iconColor="text-purple-600"
                  title="Lease Anniversary"
                  description="Your lease started one year ago today."
                  timestamp={new Date(activeLease.startDate)}
                />
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity to display</p>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Payment History</h2>
          </div>
          <PaymentHistoryTable payments={payments || []} />
        </div>
      </div>

      {/* Maintenance Request Modal */}
      <MaintenanceRequestForm
        propertyId={activeLease.propertyId}
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        onSubmit={handleSubmitMaintenanceRequest}
      />
    </div>
  );
}
