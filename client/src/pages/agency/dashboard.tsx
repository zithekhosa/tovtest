import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { TOVLayout } from "@/components/layout/TOVLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCard, getAgencyMetrics } from "@/components/dashboard/DashboardMetrics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Property, User, Lease, Payment } from "@shared/schema";

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
  Users, 
  Calendar,
  MessageSquare, 
  CheckCircle, 
  Filter,
  BarChart3,
  FileText,
  Clock,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  EyeIcon,
  Plus,
  Search,
  CalendarDays,
  LayoutDashboard,
  ChevronRight,
  MoreHorizontal,
  PlusCircle,
  Phone,
  MapPin
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real data
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/agency"],
  });

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<User[]>({
    queryKey: ["/api/tenants/agency"],
  });

  const { data: leases = [], isLoading: leasesLoading } = useQuery<Lease[]>({
    queryKey: ["/api/leases/agency"],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments/agency"],
  });

  // Fetch property views from analytics API
  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/agency"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/agency");
      if (!res.ok) return {};
      return res.json();
    },
  });

  // Fetch inquiries from inquiries API
  const { data: inquiriesData = [], isLoading: inquiriesLoading } = useQuery({
    queryKey: ["/api/inquiries/agency"],
    queryFn: async () => {
      const res = await fetch("/api/inquiries/agency");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Calculate real metrics first
  const totalProperties = properties.length;
  const activeListings = properties.filter(p => p.available).length;
  const totalTenants = tenants.length;
  const totalLeases = leases.length;
  const totalCommission = payments.reduce((sum, p) => sum + p.amount, 0) * 0.1; // 10% commission
  const monthlyCommission = totalCommission / 12; // Simplified monthly calculation

  // Then calculate derived metrics
  const propertyViews = analytics.propertyViews || 0;
  const inquiries = inquiriesData.length || 0;
  const conversionRate = totalLeases > 0 && inquiries > 0 ? (totalLeases / inquiries) * 100 : 0;

  // Dashboard metrics
  const dashboardMetrics = getAgencyMetrics(
    totalProperties,
    activeListings,
    totalTenants,
    totalLeases,
    monthlyCommission,
    propertyViews,
    inquiries,
    conversionRate
  );

  const isLoading = propertiesLoading || tenantsLoading || leasesLoading || paymentsLoading || analyticsLoading || inquiriesLoading;

  if (isLoading) {
    return (
      <TOVLayout title="Agency Dashboard" subtitle="Welcome back">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TOVLayout>
    );
  }

  return (
    <TOVLayout>
      <div className="space-y-6">
        <DashboardHeader 
          title={`Welcome back, ${user?.firstName}`}
          subtitle="Here's an overview of your agency performance and listed properties"
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
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
            <TabsTrigger value="properties" className="py-2">Properties</TabsTrigger>
            <TabsTrigger value="inquiries" className="py-2">Inquiries</TabsTrigger>
            <TabsTrigger value="landlords" className="py-2">Landlords</TabsTrigger>
          </TabsList>

          {/* OVERVIEW SECTION */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {properties.slice(0, 3).map((property) => (
                      <div key={property.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="bg-primary/10 dark:bg-primary/30 p-2 rounded-full">
                          <Building className="h-4 w-4 text-primary dark:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium">{property.title}</h4>
                          <p className="text-caption dark:text-gray-400">
                            {property.address}, {property.city}
                          </p>
                          <p className="text-caption dark:text-gray-400">
                            Listed {new Date(property.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {property.available ? 'Available' : 'Rented'}
                        </Badge>
                      </div>
                    ))}
                    
                    {properties.length === 0 && (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-body-large text-gray-900 dark:text-gray-100 mb-2">No properties yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Start by adding your first property listing</p>
                        <Button asChild>
                          <Link href="/agency/properties/add">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Property
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Property Views</span>
                      <span className="text-sm text-gray-500">{propertyViews}</span>
                    </div>
                    <Progress value={(propertyViews / 200) * 100} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Inquiries</span>
                      <span className="text-sm text-gray-500">{inquiries}</span>
                    </div>
                    <Progress value={(inquiries / 50) * 100} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-sm text-gray-500">{conversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={conversionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PROPERTIES SECTION */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Property Listings</h2>
              <Button asChild>
                <Link href="/agency/properties/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Link>
              </Button>
            </div>

            {/* Property Browser */}
            <Card>
              <CardHeader>
                <CardTitle>Browse All Properties</CardTitle>
                <CardDescription>Search and filter through all available properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-body-large text-gray-900 mb-2">Property Browser</h3>
                  <p className="text-gray-600 mb-4">
                    Use our dedicated property browser to search, filter, and manage all properties with advanced features.
                  </p>
                  <Button asChild>
                    <Link href="/properties">
                      <Search className="h-4 w-4 mr-2" />
                      Open Property Browser
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 relative">
                    {property.images && property.images[0] ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                        <Building className="h-8 w-8" />
                      </div>
                    )}
                    <Badge 
                      className={`absolute top-2 right-2 ${property.available ? 'bg-success' : 'bg-primary'}`}
                    >
                      {property.available ? 'Available' : 'Rented'}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1 line-clamp-1">{property.title}</h3>
                    <p className="text-caption dark:text-gray-400 mb-2 line-clamp-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property.address}, {property.city}
                    </p>
                    <div className="flex items-center text-caption dark:text-gray-400 mb-2">
                      <span className="mr-2">{property.bedrooms} beds</span>
                      <span className="mr-2">•</span>
                      <span>{property.bathrooms} baths</span>
                      {property.squareFootage && (
                        <>
                          <span className="mr-2">•</span>
                          <span>{property.squareFootage} sqft</span>
                        </>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="font-semibold">BWP {property.rentAmount.toLocaleString()}/mo</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/agency/properties/${property.id}`}>
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {properties.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No properties listed</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Start building your property portfolio</p>
                  <Button asChild>
                    <Link href="/agency/properties/add">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Property
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* INQUIRIES SECTION */}
          <TabsContent value="inquiries" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Inquiries</h2>
              <Button variant="outline" asChild>
                <Link href="/agency/leads-management">
                  View All Inquiries
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No inquiries yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Inquiries from potential tenants will appear here</p>
                  <Button asChild>
                    <Link href="/agency/properties">
                      <Search className="h-4 w-4 mr-2" />
                      Promote Properties
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LANDLORDS SECTION */}
          <TabsContent value="landlords" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Landlord Partners</h2>
              <Button asChild>
                <Link href="/agency/landlords/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Landlord
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No landlord partners yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Start building relationships with property owners</p>
                  <Button asChild>
                    <Link href="/agency/landlords/add">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Landlord Partner
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TOVLayout>
  );
}