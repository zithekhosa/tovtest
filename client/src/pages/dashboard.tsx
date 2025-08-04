import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Building, 
  User as UserIcon, 
  DollarSign, 
  Wrench, 
  BarChart4,
  CalendarClock,
  FileText,
  AlertTriangle
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { PropertyCard } from "@/components/dashboard/property-card";
import { MaintenanceTable } from "@/components/dashboard/maintenance-table";
import { Button } from "@/components/ui/button";
import { Property, MaintenanceRequest } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch properties if user is landlord
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties/user"],
    enabled: user?.role === "landlord" || user?.role === "agency",
  });

  // Fetch maintenance requests
  const { data: maintenanceRequests = [], isLoading: isLoadingMaintenance } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance-requests"],
    enabled: !!user,
  });

  // Dashboard content depends on user role
  const renderDashboardContent = () => {
    switch (user?.role) {
      case "landlord":
        return renderLandlordDashboard();
      case "tenant":
        return renderTenantDashboard();
      case "agency":
        return renderAgencyDashboard();
      case "maintenance":
        return renderMaintenanceDashboard();
      default:
        return <div>Unknown role</div>;
    }
  };

  const renderLandlordDashboard = () => {
    // Sample data for landlord dashboard
    const stats = [
      {
        title: "Total Properties",
        value: properties.length,
        icon: Building,
        iconColor: "text-primary-700",
        iconBgColor: "bg-primary-100",
        changeValue: 2,
        changeText: "since last month",
        changeDirection: "up" as const,
      },
      {
        title: "Active Tenants",
        value: 24,
        icon: UserIcon,
        iconColor: "text-secondary-700",
        iconBgColor: "bg-secondary-100",
        changeValue: 3,
        changeText: "since last month",
        changeDirection: "up" as const,
      },
      {
        title: "Pending Payments",
        value: "$8,420",
        icon: DollarSign,
        iconColor: "text-destructive-foreground",
        iconBgColor: "bg-destructive",
        changeValue: "$1,250",
        changeText: "since last month",
        changeDirection: "up" as const,
      },
      {
        title: "Maintenance Requests",
        value: maintenanceRequests.length,
        icon: Wrench,
        iconColor: "text-warning-foreground",
        iconBgColor: "bg-warning",
        changeValue: 2,
        changeText: "since last week",
        changeDirection: "up" as const,
      },
    ];

    const activities = [
      {
        id: "1",
        title: "Rent Payment Received",
        description: "$1,200 payment received from Jason Cooper for Apt 5B, Riverside Heights.",
        time: "2 hours ago",
        icon: DollarSign,
        iconColor: "text-primary-700",
        iconBgColor: "bg-primary-100",
      },
      {
        id: "2",
        title: "New Tenant Application",
        description: "New application received for Cedar Apartments, Unit 12 from Sarah Williams.",
        time: "Yesterday",
        icon: UserIcon,
        iconColor: "text-secondary-700",
        iconBgColor: "bg-secondary-100",
      },
      {
        id: "3",
        title: "Maintenance Request",
        description: "Urgent plumbing issue reported at Maple Grove, Unit 3A by Daniel Smith.",
        time: "2 days ago",
        icon: Wrench,
        iconColor: "text-destructive-foreground",
        iconBgColor: "bg-destructive",
      },
    ];

    const alerts = [
      {
        id: "1",
        title: "3 Overdue Payments",
        description: "Payments from multiple tenants are past due by 5+ days.",
        severity: "error" as const,
        icon: AlertTriangle,
        actionLink: "#view-payments",
        actionText: "View Payments",
      },
      {
        id: "2",
        title: "5 Leases Expiring Soon",
        description: "Lease agreements for 5 properties are expiring within 30 days.",
        severity: "warning" as const,
        icon: CalendarClock,
        actionLink: "#view-leases",
        actionText: "View Leases",
      },
      {
        id: "3",
        title: "Documents Pending Review",
        description: "3 new documents require your attention and approval.",
        severity: "info" as const,
        icon: FileText,
        actionLink: "#review-documents",
        actionText: "Review Documents",
      },
    ];

    // Convert maintenance requests to the format expected by the component
    const formattedMaintenanceRequests = maintenanceRequests.map(request => ({
      id: request.id,
      property: "Property Name", // This would be fetched in a real implementation
      issue: request.title,
      tenant: "Tenant Name", // This would be fetched in a real implementation
      date: format(new Date(request.submittedAt), 'MMM dd, yyyy'),
      priority: request.priority,
      status: request.status,
    }));

    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
        </header>
        
        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </section>
        
        {/* Recent Activities and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ActivityCard
            title="Recent Activities"
            activities={activities}
            viewAllLink="#view-all"
            className="lg:col-span-2"
          />
          <AlertCard
            title="Alerts"
            alerts={alerts}
            viewAllLink="#view-all"
          />
        </div>
        
        {/* Properties Overview */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-3 text-gray-900">Your Properties</h2>
            <Link href="/properties/new">
              <Button className="inline-flex items-center">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Property
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingProperties ? (
              <>
                <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
                <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
                <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
              </>
            ) : properties.length > 0 ? (
              properties.slice(0, 3).map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  name={property.name}
                  address={`${property.address}, ${property.city}`}
                  imageUrl=""
                  units={property.units}
                  tenants={0} // This would be calculated in a real implementation
                  income={`$${property.monthlyIncome || 0}/mo`}
                  status={property.units === 0 ? 'Vacant' : 'Partially Occupied'}
                  onClick={() => navigate(`/properties/${property.id}`)}
                />
              ))
            ) : (
              <div className="col-span-3 bg-white p-6 rounded-lg border border-gray-200 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-body-large">No properties yet</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first property</p>
                <Link href="/properties/new">
                  <Button>Add Your First Property</Button>
                </Link>
              </div>
            )}
          </div>
          
          {properties.length > 0 && (
            <div className="mt-4 text-center">
              <Link href="/properties">
                <a className="text-primary font-medium hover:underline text-sm inline-flex items-center">
                  View All Properties
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </Link>
            </div>
          )}
        </section>
        
        {/* Recent Maintenance Requests */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-3 text-gray-900">Recent Maintenance Requests</h2>
            <Link href="/maintenance">
              <a className="text-primary text-sm font-medium hover:underline">View All</a>
            </Link>
          </div>
          
          <MaintenanceTable
            requests={formattedMaintenanceRequests.slice(0, 3)}
            isLoading={isLoadingMaintenance}
            onAssign={(id) => navigate(`/maintenance/${id}/assign`)}
            onViewDetails={(id) => navigate(`/maintenance/${id}`)}
          />
        </section>
      </>
    );
  };

  const renderTenantDashboard = () => {
    // Sample tenant dashboard (simplified)
    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-heading-3 mb-4">Your Rental</h2>
            <p className="text-gray-600">Rental information will be displayed here</p>
            <Button className="mt-4">View Details</Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-heading-3 mb-4">Rent Payment</h2>
            <p className="text-gray-600">Next payment: $1,200 due on Oct 1, 2023</p>
            <Button className="mt-4">Pay Rent</Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-heading-3 mb-4">Maintenance Requests</h2>
          <Link href="/maintenance/new">
            <Button>Submit New Request</Button>
          </Link>
        </div>
      </>
    );
  };

  const renderAgencyDashboard = () => {
    // Sample agency dashboard (simplified)
    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Agency Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-heading-3 mb-4">Property Listings</h2>
            <p className="text-gray-600">Manage your property listings</p>
            <Button className="mt-4">View Listings</Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-heading-3 mb-4">Client Inquiries</h2>
            <p className="text-gray-600">Handle inquiries from potential clients</p>
            <Button className="mt-4">View Inquiries</Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-heading-3 mb-4">Performance</h2>
            <p className="text-gray-600">Track your agency's performance</p>
            <Button className="mt-4">View Analytics</Button>
          </div>
        </div>
      </>
    );
  };

  const renderMaintenanceDashboard = () => {
    // Sample maintenance provider dashboard (simplified)
    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Maintenance Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-heading-3 mb-4">Job Listings</h2>
            <p className="text-gray-600">Find new maintenance jobs</p>
            <Button className="mt-4">Browse Jobs</Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-heading-3 mb-4">Your Assignments</h2>
            <p className="text-gray-600">View your current maintenance assignments</p>
            <Button className="mt-4">View Assignments</Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
          {renderDashboardContent()}
        </div>
      </main>
    </div>
  );
}
