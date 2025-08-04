import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property, Lease, MaintenanceRequest, Payment, User } from "@shared/schema";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { FeedContainer } from "@/components/layout/ContentContainer";
import { SocialCard } from "@/components/ui/mobile-optimized-card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { SocialFeed } from "@/components/ui/responsive-grid";
import { getLandlordMetrics } from "@/components/dashboard/DashboardMetrics";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { 
  Loader2, 
  MoreHorizontal, 
  Building, 
  Users, 
  Wrench, 
  DollarSign, 
  ArrowRight, 
  CalendarDays,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Eye,
  Pencil,
  UserCheck,
  Home,
  ThumbsUp,
  MessageCircle,
  Share,
  Globe
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

// Activity object type for dashboard feed
type Activity = {
  id: number;
  type: 'payment' | 'maintenance' | 'message' | 'lease' | 'tenant' | 'property';
  title: string;
  description: string;
  date: Date;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  actionUrl?: string;
  actionLabel?: string;
  image?: string;
};

const propertyImages = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070"
];

export default function FacebookLandlordDashboard() {
  const { user } = useAuth();
  const [feedActivities, setFeedActivities] = useState<Activity[]>([]);
  
  // Fetch landlord properties
  const { 
    data: properties,
    isLoading: isLoadingProperties,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties/landlord"],
  });

  // Fetch tenants
  const { 
    data: tenants,
    isLoading: isLoadingTenants 
  } = useQuery<User[]>({
    queryKey: ["/api/users/tenants"],
  });

  // Fetch leases
  const { 
    data: leases,
    isLoading: isLoadingLeases 
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/landlord"],
  });

  // Fetch maintenance requests
  const {
    data: maintenanceRequests,
    isLoading: isLoadingMaintenance
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/landlord"],
  });

  // Fetch recent payments
  const {
    data: recentPayments,
    isLoading: isLoadingPayments
  } = useQuery<Payment[]>({
    queryKey: ["/api/payments/recent"],
  });

  const isLoading = 
    isLoadingProperties || 
    isLoadingTenants || 
    isLoadingLeases || 
    isLoadingMaintenance || 
    isLoadingPayments;

  // Calculate dashboard metrics
  const propertyCount = properties?.length || 0;
  const vacantCount = properties?.filter(p => p.available).length || 0;
  const occupiedCount = propertyCount - vacantCount;
  
  // Calculate total monthly income from properties
  const totalMonthlyIncome = properties?.reduce((sum, property) => {
    if (!property.available) {
      return sum + property.rentAmount;
    }
    return sum;
  }, 0) || 0;

  // Calculate occupancy rate
  const occupancyRate = propertyCount > 0 ? Math.round((occupiedCount / propertyCount) * 100) : 0;

  // Generate feed activities when data is loaded
  useEffect(() => {
    if (isLoading) return;

    const activities: Activity[] = [];

    // Add welcome post
    activities.push({
      id: 0,
      type: 'message',
      title: 'Welcome to your Facebook-style dashboard!',
      description: 'This new dashboard experience makes property management feel more intuitive and social. Scroll through your feed to see updates about your properties, tenants, and finances all in one place.',
      date: new Date(),
      icon: <Globe className="h-5 w-5" />,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      image: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&q=80&w=2070'
    });

    // Add property summary
    if (properties && properties.length > 0) {
      activities.push({
        id: 1,
        type: 'property',
        title: 'Your Property Portfolio',
        description: `You currently manage ${propertyCount} properties with ${occupancyRate}% occupancy rate, generating ${formatCurrency(totalMonthlyIncome)} in monthly rental income.`,
        date: new Date(),
        icon: <Building className="h-5 w-5" />,
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        actionUrl: '/landlord/properties',
        actionLabel: 'Manage Properties'
      });
    }

    // Add maintenance requests
    if (maintenanceRequests && maintenanceRequests.length > 0) {
      const pendingCount = maintenanceRequests.filter(r => r.status === 'pending').length;
      
      if (pendingCount > 0) {
        activities.push({
          id: 2,
          type: 'maintenance',
          title: 'Maintenance Requests Need Attention',
          description: `You have ${pendingCount} pending maintenance ${pendingCount === 1 ? 'request' : 'requests'} that ${pendingCount === 1 ? 'requires' : 'require'} your attention.`,
          date: new Date(new Date().setDate(new Date().getDate() - 1)),
          icon: <Wrench className="h-5 w-5" />,
          iconBg: 'bg-warning',
          iconColor: 'text-warning-foreground',
          actionUrl: '/landlord/maintenance',
          actionLabel: 'View Requests'
        });
      }
    }

    // Add recent payment activity
    activities.push({
      id: 3,
      type: 'payment',
      title: 'Recent Rent Collection',
      description: `Your rent collection rate is currently at 85%. ${recentPayments?.length ? 'Recent payments have been received on time.' : 'No recent payments have been recorded.'}`,
      date: new Date(new Date().setDate(new Date().getDate() - 2)),
      icon: <DollarSign className="h-5 w-5" />,
      iconBg: 'bg-success',
      iconColor: 'text-success-foreground',
      actionUrl: '/landlord/financial-management',
      actionLabel: 'View Finances'
    });

    // Add expiring leases if any
    const today = new Date();
    const sixtyDaysFromNow = new Date(today);
    sixtyDaysFromNow.setDate(today.getDate() + 60);
    
    const expiringLeases = leases?.filter(lease => {
      const endDate = new Date(lease.endDate);
      return endDate > today && endDate < sixtyDaysFromNow;
    }) || [];

    if (expiringLeases.length > 0) {
      activities.push({
        id: 4,
        type: 'lease',
        title: 'Leases Expiring Soon',
        description: `You have ${expiringLeases.length} ${expiringLeases.length === 1 ? 'lease' : 'leases'} expiring in the next 60 days. Plan for renewals or new tenants.`,
        date: new Date(new Date().setDate(new Date().getDate() - 3)),
        icon: <CalendarDays className="h-5 w-5" />,
        iconBg: 'bg-accent',
        iconColor: 'text-primary',
        actionUrl: '/landlord/leases',
        actionLabel: 'Review Leases'
      });
    }

    // Add tenant posts
    if (tenants && tenants.length > 0) {
      // Random selection of tenants to create more engaging feed
      const randomTenants = [...tenants].sort(() => 0.5 - Math.random()).slice(0, Math.min(3, tenants.length));
      
      randomTenants.forEach((tenant, idx) => {
        const randomDaysAgo = Math.floor(Math.random() * 7) + 1;
        
        activities.push({
          id: 5 + idx,
          type: 'tenant',
          title: `${tenant.firstName} ${tenant.lastName}`,
          description: `Tenant ${tenant.firstName} has been living in your property for ${Math.floor(Math.random() * 24) + 1} months with excellent payment history.`,
          date: new Date(new Date().setDate(new Date().getDate() - randomDaysAgo)),
          icon: <UserCheck className="h-5 w-5" />,
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          actionUrl: `/landlord/tenants/${tenant.id}`,
          actionLabel: 'View Profile'
        });
      });
    }

    // Add featured property posts
    if (properties && properties.length > 0) {
      // Get 2 random properties to feature
      const featureProperties = [...properties].sort(() => 0.5 - Math.random()).slice(0, Math.min(2, properties.length));
      
      featureProperties.forEach((property, idx) => {
        activities.push({
          id: 10 + idx,
          type: 'property',
          title: property.title || `Property at ${property.address}`,
          description: property.description || `${property.bedrooms} bedroom, ${property.bathrooms} bathroom property located in ${property.city}. Currently ${property.available ? 'available' : 'occupied'}.`,
          date: new Date(new Date().setDate(new Date().getDate() - (5 + idx))),
          icon: <Home className="h-5 w-5" />,
          iconBg: 'bg-cyan-100',
          iconColor: 'text-cyan-600',
          image: propertyImages[idx % propertyImages.length],
          actionUrl: `/landlord/properties/${property.id}`,
          actionLabel: 'View Property'
        });
      });
    }

    // Sort by date (newest first)
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    setFeedActivities(activities);
  }, [properties, tenants, leases, maintenanceRequests, recentPayments, isLoading, propertyCount, occupancyRate, totalMonthlyIncome]);

  if (isLoading) {
    return (
      <StandardLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StandardLayout>
    );
  }

  // Format initials for avatar
  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Quick stats for the top of feed
  const quickStats = [
    { 
      label: 'Properties', 
      value: propertyCount,
      icon: <Building className="h-4 w-4" />,
      color: 'text-primary'
    },
    { 
      label: 'Tenants', 
      value: tenants?.length || 0,
      icon: <Users className="h-4 w-4" />,
      color: 'text-success-foreground'
    },
    { 
      label: 'Monthly Income', 
      value: formatCurrency(totalMonthlyIncome),
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-primary'
    },
  ];

  return (
    <StandardLayout title="Dashboard" subtitle="Welcome to your social feed">
      <div className="pb-16 md:pb-0">
        {/* Stories/Highlights Section */}
        <div className="bg-white dark:bg-gray-900 py-3 border-b border-gray-200 dark:border-gray-800 mb-3">
          <div className="mx-auto px-4 max-w-[600px]">
            <div className="flex overflow-x-auto gap-3 pb-2 tov-hide-scrollbar">
              {/* Create Story Button */}
              <div className="flex flex-col items-center space-y-1 shrink-0">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-primary">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs">Add Post</span>
              </div>

              {/* Quick Stat Cards */}
              {quickStats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center space-y-1 shrink-0">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center shadow-sm">
                    <div className={cn("flex items-center justify-center", stat.color)}>
                      {stat.icon}
                    </div>
                    <div className="text-sm font-semibold mt-1">
                      {typeof stat.value === 'number' && stat.value < 1000 ? stat.value : stat.value}
                    </div>
                  </div>
                  <span className="text-xs">{stat.label}</span>
                </div>
              ))}

              {/* Occupancy Rate */}
              <div className="flex flex-col items-center space-y-1 shrink-0">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center shadow-sm">
                  <div className="text-warning-foreground flex items-center justify-center">
                    <Home className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold mt-1">{occupancyRate}%</div>
                </div>
                <span className="text-xs">Occupied</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Create Post Card */}
        <FeedContainer>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user ? getInitials(user.firstName, user.lastName) : 'LP'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <button className="w-full text-left bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 text-gray-500 dark:text-gray-400">
                  What's on your mind?
                </button>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-around">
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <Plus className="h-4 w-4" />
                <span>Property</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <MessageSquare className="h-4 w-4" />
                <span>Update</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <Building className="h-4 w-4" />
                <span>Listing</span>
              </Button>
            </div>
          </div>
        </FeedContainer>

        {/* Activity Feed Section */}
        <SocialFeed>
          {feedActivities.map((activity) => (
            <SocialCard
              key={activity.id}
              title={activity.title}
              subtitle={formatDate(activity.date)}
              icon={
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", activity.iconBg)}>
                  <div className={activity.iconColor}>
                    {activity.icon}
                  </div>
                </div>
              }
              content={activity.description}
              image={activity.image}
              actionUrl={activity.actionUrl}
              actionLabel={activity.actionLabel}
            />
          ))}
        </SocialFeed>
      </div>
    </StandardLayout>
  );
}