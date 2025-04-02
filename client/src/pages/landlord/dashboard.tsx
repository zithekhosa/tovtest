import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { Button } from "@/components/ui/button";
import { 
  Building, DollarSign, Gauge, Plus, Users, 
  ArrowRightLeft, AlertCircle, Bell, ChevronRight,
  HomeIcon, BookOpen, Wrench, CheckSquare, Heart
} from "lucide-react";
import { 
  MetricCard,
  ActionCard,
  ContentCard,
  ResourceCard,
  DataGridCard
} from "@/components/ui/card-components";
import {
  ResponsiveGrid,
  ResponsiveStack,
  ScrollableGrid,
  SectionTitle,
  DashboardContentPanel
} from "@/components/ui/responsive-grid";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { insertUserSchema, type User, type Property, type Lease } from "@shared/schema";

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "tenants">("overview");

  // Mock data - should be replaced with actual API calls
  const {
    data: properties,
    isLoading: propertiesLoading,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: user?.role === "landlord",
  });

  const {
    data: tenants,
    isLoading: tenantsLoading,
  } = useQuery<User[]>({
    queryKey: ["/api/tenants"],
    enabled: user?.role === "landlord",
  });

  const {
    data: leases,
    isLoading: leasesLoading,
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases"],
    enabled: user?.role === "landlord",
  });

  if (!user) return null;

  // Calculate metrics
  const totalProperties = properties?.length || 0;
  const occupiedProperties = properties?.filter(p => !p.available).length || 0;
  const vacantProperties = properties?.filter(p => p.available).length || 0;
  const occupancyRate = totalProperties ? Math.round((occupiedProperties / totalProperties) * 100) : 0;
  
  const totalIncome = leases?.reduce((sum, lease) => sum + lease.rentAmount, 0) || 0;
  const pendingPayments = leases?.filter(lease => lease.status === "pending")
    .reduce((sum, lease) => sum + lease.rentAmount, 0) || 0;
  
  const totalTenants = tenants?.length || 0;
  
  const isLoading = propertiesLoading || tenantsLoading || leasesLoading;

  // Recent notifications - should come from API
  const recentNotifications = [
    {
      id: 1,
      title: "Rent Payment Received",
      description: "John Doe has paid P2,500 for Unit 101, Palm Residences",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Maintenance Request",
      description: "New plumbing issue reported at Garden Apartments, Unit 3B",
      time: "Yesterday",
      isUrgent: true,
    },
    {
      id: 3,
      title: "Lease Ending Soon",
      description: "Lease for Sarah Jones at Sunshine Villa expires in 30 days",
      time: "3 days ago",
    },
  ];

  // Recent activities - should come from API
  const recentActivities = [
    {
      id: 1,
      action: "Payment Received",
      subject: "P5,300 for Unit 203",
      timestamp: "Today, 10:23 AM",
    },
    {
      id: 2,
      action: "Property Inspection",
      subject: "Scheduled for Riverside Apartments",
      timestamp: "Yesterday, 2:15 PM",
    },
    {
      id: 3,
      action: "Tenant Moved Out",
      subject: "David Williams from Unit 105",
      timestamp: "Mar 24, 2025",
    },
    {
      id: 4,
      action: "Document Signed",
      subject: "Lease renewal for Gaborone Heights",
      timestamp: "Mar 22, 2025",
    },
  ];

  return (
    <StandardLayout
      title="Landlord Dashboard"
      subtitle="Manage your properties, tenants, and income in one place"
    >
      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1 md:pb-0 md:mx-0 md:px-0">
        <Button asChild variant="outline" size="sm" className="flex-none">
          <Link href="/landlord/properties/add">
            <Plus className="h-4 w-4 mr-1" />
            Add Property
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-none">
          <Link href="/landlord/tenants/add">
            <Plus className="h-4 w-4 mr-1" />
            Add Tenant
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-none">
          <Link href="/landlord/maintenance/request">
            <Plus className="h-4 w-4 mr-1" />
            Request Maintenance
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-none">
          <Link href="/landlord/payments/record">
            <Plus className="h-4 w-4 mr-1" />
            Record Payment
          </Link>
        </Button>
      </div>

      {/* Main metrics */}
      <DashboardContentPanel>
        <SectionTitle
          title="Portfolio Overview"
          description="Your property portfolio at a glance"
        />
        <ResponsiveGrid
          columns={{ sm: 1, md: 2, lg: 4 }}
          className="mb-6"
        >
          <MetricCard
            title="Total Properties"
            value={totalProperties}
            description={`${occupiedProperties} occupied, ${vacantProperties} vacant`}
            icon={<Building className="h-4 w-4" />}
            iconColor="text-blue-600"
            iconBackground="bg-blue-100"
          />
          <MetricCard
            title="Occupancy Rate"
            value={`${occupancyRate}%`}
            description={`${occupiedProperties}/${totalProperties} properties occupied`}
            icon={<Gauge className="h-4 w-4" />}
            iconColor="text-green-600"
            iconBackground="bg-green-100"
            footer={<Progress value={occupancyRate} className="h-2" />}
          />
          <MetricCard
            title="Monthly Income"
            value={`P${totalIncome.toLocaleString()}`}
            description={`P${pendingPayments.toLocaleString()} pending collection`}
            icon={<DollarSign className="h-4 w-4" />}
            iconColor="text-emerald-600"
            iconBackground="bg-emerald-100"
            trend={{
              value: 5.2,
              isPositive: true
            }}
          />
          <MetricCard
            title="Total Tenants"
            value={totalTenants}
            description="Active lease agreements"
            icon={<Users className="h-4 w-4" />}
            iconColor="text-indigo-600"
            iconBackground="bg-indigo-100"
          />
        </ResponsiveGrid>

        {/* Properties needing attention */}
        <SectionTitle
          title="Properties Needing Attention"
          description="Issues that require your immediate action"
          action={
            <Button variant="link" size="sm" asChild>
              <Link href="/landlord/properties">View all properties</Link>
            </Button>
          }
        />
        <ScrollableGrid
          itemWidth="300px"
          columns={{ md: 2, lg: 3 }}
          className="mb-6"
        >
          <ActionCard
            title="Gaborone Heights, Unit 10B"
            description="Rent payment overdue by 5 days"
            icon={<AlertCircle className="h-4 w-4" />}
            iconColor="text-red-500"
            iconBackground="bg-red-100"
            actionLabel="Follow Up"
            actionHref="/landlord/payments/reminders"
            status={{
              label: "Urgent",
              variant: "destructive"
            }}
          />
          <ActionCard
            title="Palm Residences, Unit 203"
            description="Maintenance request: Water leakage in bathroom"
            icon={<Wrench className="h-4 w-4" />}
            iconColor="text-amber-500"
            iconBackground="bg-amber-100"
            actionLabel="Schedule Repair"
            actionHref="/landlord/maintenance/schedule"
            status={{
              label: "Pending",
              variant: "outline"
            }}
          />
          <ActionCard
            title="Francistown Suites, Unit 5A"
            description="Lease expires in 15 days"
            icon={<Bell className="h-4 w-4" />}
            iconColor="text-blue-500"
            iconBackground="bg-blue-100"
            actionLabel="Renew Lease"
            actionHref="/landlord/leases/renew"
            status={{
              label: "Upcoming",
              variant: "secondary"
            }}
          />
        </ScrollableGrid>

        {/* Recent Activities and Notifications */}
        <ResponsiveGrid columns={{ sm: 1, md: 2 }} className="mb-6">
          {/* Recent Activity */}
          <ContentCard 
            title="Recent Activity" 
            action={{ label: "View all", href: "/landlord/activity" }}
          >
            <ul className="space-y-3">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{activity.action}</p>
                    <p className="text-muted-foreground truncate">{activity.subject}</p>
                  </div>
                  <div className="text-muted-foreground text-xs whitespace-nowrap">
                    {activity.timestamp}
                  </div>
                </li>
              ))}
            </ul>
          </ContentCard>

          {/* Notifications */}
          <ContentCard 
            title="Notifications" 
            action={{ label: "View all", href: "/landlord/notifications" }}
          >
            <ul className="space-y-3">
              {recentNotifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-2.5 rounded-lg border ${notification.isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`rounded-full p-1.5 ${notification.isUrgent ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                      {notification.isUrgent ? 
                        <AlertCircle className="h-4 w-4" /> : 
                        <Bell className="h-4 w-4" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-muted-foreground text-xs line-clamp-2">{notification.description}</p>
                      <p className="text-xs mt-1 text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ContentCard>
        </ResponsiveGrid>

        {/* Quick Links and Resources */}
        <SectionTitle
          title="Resources & Quick Links"
          description="Helpful tools and information"
        />
        <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 4 }}>
          <ResourceCard
            title="Landlord Guide"
            description="Essential tips and best practices for property management in Botswana"
            icon={<BookOpen className="h-4 w-4" />}
            iconColor="text-purple-500"
            iconBackground="bg-purple-100"
            href="/landlord/resources/guide"
          />
          <ResourceCard
            title="Tax Information"
            description="Up-to-date information on property tax rates and filing deadlines"
            icon={<DollarSign className="h-4 w-4" />}
            iconColor="text-emerald-500"
            iconBackground="bg-emerald-100"
            href="https://www.burs.org.bw"
            isExternal
          />
          <ResourceCard
            title="Maintenance Directory"
            description="Find trusted service providers for property repairs and maintenance"
            icon={<Wrench className="h-4 w-4" />}
            iconColor="text-amber-500"
            iconBackground="bg-amber-100"
            href="/landlord/resources/maintenance"
          />
          <ResourceCard
            title="Legal Templates"
            description="Standard lease agreements and legal documents for Botswana properties"
            icon={<CheckSquare className="h-4 w-4" />}
            iconColor="text-blue-500"
            iconBackground="bg-blue-100"
            href="/landlord/resources/legal"
          />
        </ResponsiveGrid>
      </DashboardContentPanel>
    </StandardLayout>
  );
}