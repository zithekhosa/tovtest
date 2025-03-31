import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCard, getAgencyMetrics } from "@/components/dashboard/DashboardMetrics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Property, User, Lease } from "@shared/schema";

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
  Phone
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

// Sample property listing data with Botswana context
const activeListings = [
  {
    id: 1,
    title: "Luxury Apartment in CBD",
    address: "Plot 5419, Queens Road",
    location: "Gaborone",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    price: 4500,
    status: "active",
    views: 247,
    inquiries: 12,
    imageUrl: null,
    listedDate: new Date(2023, 9, 15)
  },
  {
    id: 2,
    title: "Family Home in Phakalane",
    address: "Plot 12364, Phakalane Golf Estate",
    location: "Gaborone",
    type: "House",
    bedrooms: 4,
    bathrooms: 3,
    price: 8500,
    status: "active",
    views: 189,
    inquiries: 8,
    imageUrl: null,
    listedDate: new Date(2023, 10, 2)
  },
  {
    id: 3,
    title: "Office Space in Main Mall",
    address: "Plot 1243, Main Mall",
    location: "Gaborone",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 2,
    price: 12000,
    status: "active",
    views: 103,
    inquiries: 5,
    imageUrl: null,
    listedDate: new Date(2023, 10, 10)
  },
  {
    id: 4,
    title: "Bachelor Pad in Extension 9",
    address: "Plot 7389, Extension 9",
    location: "Gaborone",
    type: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    price: 3200,
    status: "active",
    views: 156,
    inquiries: 9,
    imageUrl: null,
    listedDate: new Date(2023, 10, 5)
  }
];

// Sample client inquiries
const recentInquiries = [
  {
    id: 1,
    clientName: "Mpho Khumalo",
    propertyId: 1,
    propertyTitle: "Luxury Apartment in CBD",
    contactInfo: "71234567",
    email: "mpho.k@example.com",
    date: new Date(2023, 10, 12),
    status: "new",
    notes: "Interested in viewing this weekend"
  },
  {
    id: 2,
    clientName: "Tebogo Moilwa",
    propertyId: 2,
    propertyTitle: "Family Home in Phakalane",
    contactInfo: "72345678",
    email: "tebogo.m@example.com",
    date: new Date(2023, 10, 11),
    status: "contacted",
    notes: "Scheduled viewing for Friday"
  },
  {
    id: 3,
    clientName: "Kagiso Molefe",
    propertyId: 3,
    propertyTitle: "Office Space in Main Mall",
    contactInfo: "73456789",
    email: "kagiso.m@example.com",
    date: new Date(2023, 10, 10),
    status: "viewing_scheduled",
    notes: "Representing a tech company looking for office space"
  },
  {
    id: 4,
    clientName: "Naledi Phiri",
    propertyId: 4,
    propertyTitle: "Bachelor Pad in Extension 9",
    contactInfo: "74567890",
    email: "naledi.p@example.com",
    date: new Date(2023, 10, 9),
    status: "negotiating",
    notes: "Interested in 6-month lease with option to extend"
  }
];

// Sample upcoming viewings
const upcomingViewings = [
  {
    id: 1,
    clientName: "Tebogo Moilwa",
    propertyId: 2,
    propertyTitle: "Family Home in Phakalane",
    date: new Date(2023, 10, 18, 10, 0), // Friday at 10 AM
    status: "confirmed"
  },
  {
    id: 2,
    clientName: "Mpho Khumalo",
    propertyId: 1,
    propertyTitle: "Luxury Apartment in CBD",
    date: new Date(2023, 10, 19, 14, 30), // Saturday at 2:30 PM
    status: "confirmed"
  },
  {
    id: 3,
    clientName: "Kagiso Molefe",
    propertyId: 3,
    propertyTitle: "Office Space in Main Mall",
    date: new Date(2023, 10, 20, 9, 0), // Monday at 9 AM
    status: "pending"
  }
];

// Sample landlord clients
const landlordClients = [
  {
    id: 1,
    name: "Kgosi Sebina",
    email: "kgosi.s@example.com",
    phone: "75678901",
    properties: 3,
    joined: new Date(2023, 6, 15),
    status: "active"
  },
  {
    id: 2,
    name: "Masego Tau",
    email: "masego.t@example.com",
    phone: "76789012",
    properties: 2,
    joined: new Date(2023, 8, 3),
    status: "active"
  },
  {
    id: 3,
    name: "Boitumelo Ndlovu",
    email: "boitumelo.n@example.com",
    phone: "77890123",
    properties: 1,
    joined: new Date(2023, 9, 22),
    status: "active"
  },
  {
    id: 4,
    name: "Thabo Moremi",
    email: "thabo.m@example.com",
    phone: "78901234",
    properties: 4,
    joined: new Date(2023, 5, 7),
    status: "active"
  }
];

// Format time for viewing appointments
const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

// Format date for cards
const formatCardDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric"
  };
  return date.toLocaleDateString("en-US", options);
};

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch properties managed by the agency
  const {
    data: properties,
    isLoading: isLoadingProperties
  } = useQuery<Property[]>({
    queryKey: ["/api/properties/agency"],
  });

  // Fetch landlords
  const {
    data: landlords,
    isLoading: isLoadingLandlords
  } = useQuery<User[]>({
    queryKey: ["/api/users/landlords"],
  });

  // Fetch leases
  const {
    data: leases,
    isLoading: isLoadingLeases
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/agency"],
  });

  const isLoading = isLoadingProperties || isLoadingLandlords || isLoadingLeases;

  // Calculate metrics
  const listedProperties = properties?.length || 0;
  const activeLeases = leases?.filter(lease => lease.active).length || 0;
  
  // Calculate potential commission (10% of annual rent for all active leases)
  const annualCommission = leases?.reduce((sum, lease) => {
    if (lease.active) {
      return sum + (lease.rentAmount * 12 * 0.1);
    }
    return sum;
  }, 0) || 0;

  // Dashboard metrics
  const dashboardMetrics = getAgencyMetrics(listedProperties, activeLeases, annualCommission);

  // Calculate occupancy rate
  const occupiedCount = properties?.filter(p => !p.available).length || 0;
  const occupancyRate = properties?.length ? Math.round((occupiedCount / properties.length) * 100) : 0;

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
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
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Performance Metrics */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-medium">Agency Performance</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <span className="text-xs">View Reports</span>
                      <BarChart3 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                        <span className="text-sm font-medium">{occupancyRate}%</span>
                      </div>
                      <Progress value={occupancyRate} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Inquiry Conversion</span>
                        <span className="text-sm font-medium">28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Days to Rent</span>
                        <span className="text-sm font-medium">21 days</span>
                      </div>
                      <Progress value={70} className="h-2" />
                      <p className="text-xs text-muted-foreground">3 days faster than previous quarter</p>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-2">Monthly Commission (BWP)</h3>
                      <div className="bg-slate-50 p-3 rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Target</span>
                          <span className="text-xs font-medium">{formatCurrency(25000)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Current</span>
                          <span className="text-xs font-medium">{formatCurrency(annualCommission / 12)}</span>
                        </div>
                        <Progress 
                          value={(annualCommission / 12) / 25000 * 100} 
                          className="h-2 mt-2" 
                        />
                        <div className="flex items-center text-xs mt-1 text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span>5.2% growth this month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Viewings */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-medium">Upcoming Viewings</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                      <Link href="/agency/calendar">
                        <span className="text-xs">View Calendar</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[260px] px-6">
                    <div className="space-y-4 py-2">
                      {upcomingViewings.length > 0 ? (
                        upcomingViewings.map((viewing) => (
                          <div key={viewing.id} className="flex justify-between p-3 border rounded-lg">
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{viewing.propertyTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCardDate(viewing.date)} • {formatTime(viewing.date)}
                                </p>
                                <p className="text-xs font-medium mt-1">Client: {viewing.clientName}</p>
                              </div>
                            </div>
                            <Badge className={viewing.status === "confirmed" 
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                            }>
                              {viewing.status === "confirmed" ? "Confirmed" : "Pending"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <Calendar className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                          <p className="text-sm text-muted-foreground">No upcoming viewings</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Schedule Viewing
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recent Inquiries Summary */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-md font-medium">Recent Inquiries</CardTitle>
                      <CardDescription>Latest client inquiries requiring attention</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/agency/inquiries">
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {recentInquiries.length > 0 ? (
                    <ScrollArea className="h-[220px] px-6">
                      <div className="space-y-4 py-2">
                        {recentInquiries.map((inquiry) => (
                          <div key={inquiry.id} className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{inquiry.clientName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Interested in: {inquiry.propertyTitle}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(inquiry.date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Badge className={
                                inquiry.status === "new" 
                                  ? "bg-green-50 text-green-700 mr-2" 
                                  : inquiry.status === "contacted" 
                                    ? "bg-blue-50 text-blue-700 mr-2" 
                                    : inquiry.status === "viewing_scheduled" 
                                      ? "bg-purple-50 text-purple-700 mr-2"
                                      : "bg-amber-50 text-amber-700 mr-2"
                              }>
                                {inquiry.status === "new" 
                                  ? "New" 
                                  : inquiry.status === "contacted" 
                                    ? "Contacted" 
                                    : inquiry.status === "viewing_scheduled" 
                                      ? "Viewing Set"
                                      : "Negotiating"
                                }
                              </Badge>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No recent inquiries</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" asChild>
                      <Link href="/agency/properties/add">
                        <Building className="h-4 w-4 mr-2" />
                        Add New Property
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href="/agency/inquiries/new">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Record Inquiry
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href="/agency/calendar/add">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Viewing
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href="/agency/landlords/add">
                        <Users className="h-4 w-4 mr-2" />
                        Add Landlord
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href="/agency/leases/create">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Lease
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href="/agency/reports">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Reports
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PROPERTIES SECTION */}
          <TabsContent value="properties" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Listed Properties ({properties?.length || 0})</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2 shrink-0" />
                  Filter
                </Button>
                <Button size="sm" asChild>
                  <Link href="/agency/properties/add">
                    <Plus className="h-4 w-4 mr-2 shrink-0" />
                    Add Property
                  </Link>
                </Button>
              </div>
            </div>

            {properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.address}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Building className="h-10 w-10 text-muted-foreground opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className={property.available ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                          {property.available ? "Available" : "Rented"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium truncate">{property.address}</h4>
                          <p className="text-sm text-muted-foreground">
                            {property.city}, {property.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-primary">{formatCurrency(property.rentAmount)}</div>
                          <p className="text-xs text-muted-foreground">per month</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Beds</p>
                          <p className="font-medium">{property.bedrooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Baths</p>
                          <p className="font-medium">{property.bathrooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sq.Ft</p>
                          <p className="font-medium">{property.squareFeet || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground mr-1">Listed:</span>
                          <span>{formatDate(new Date())}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <EyeIcon className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          <span className="text-muted-foreground">24 views</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0 gap-2">
                      <Button className="w-full" asChild>
                        <Link href={`/agency/properties/${property.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-9 w-9">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Edit Listing</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Viewing</DropdownMenuItem>
                          <DropdownMenuItem>Record Inquiry</DropdownMenuItem>
                          <DropdownMenuItem>Mark as {property.available ? "Rented" : "Available"}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">Remove Listing</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-8">
                <div className="text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No Properties Listed</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't added any properties to your listings yet.
                  </p>
                  <Button asChild>
                    <Link href="/agency/properties/add">
                      <Plus className="h-4 w-4 mr-2 shrink-0" />
                      Add Your First Property
                    </Link>
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* INQUIRIES SECTION */}
          <TabsContent value="inquiries" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Client Inquiries</h3>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search inquiries..."
                    className="w-full pl-8 py-2 pr-4 rounded-md border border-input bg-background"
                  />
                </div>
                <Button size="sm" asChild>
                  <Link href="/agency/inquiries/new">
                    <Plus className="h-4 w-4 mr-2 shrink-0" />
                    Add Inquiry
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-md font-medium">Recent Inquiries</CardTitle>
                      <CardDescription>Manage and track client inquiries about properties</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="rounded-md border">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Client</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Property</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Notes</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[100px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentInquiries.map((inquiry) => (
                          <tr key={inquiry.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div>
                                <div className="font-medium">{inquiry.clientName}</div>
                                <div className="text-xs text-muted-foreground">{inquiry.email}</div>
                                <div className="text-xs text-muted-foreground">{inquiry.contactInfo}</div>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="font-medium">{inquiry.propertyTitle}</div>
                              <div className="text-xs text-muted-foreground">ID: {inquiry.propertyId}</div>
                            </td>
                            <td className="p-4 align-middle">
                              {formatDate(inquiry.date)}
                            </td>
                            <td className="p-4 align-middle">
                              <Badge className={
                                inquiry.status === "new" 
                                  ? "bg-green-50 text-green-700" 
                                  : inquiry.status === "contacted" 
                                    ? "bg-blue-50 text-blue-700" 
                                    : inquiry.status === "viewing_scheduled" 
                                      ? "bg-purple-50 text-purple-700"
                                      : "bg-amber-50 text-amber-700"
                              }>
                                {inquiry.status === "new" 
                                  ? "New" 
                                  : inquiry.status === "contacted" 
                                    ? "Contacted" 
                                    : inquiry.status === "viewing_scheduled" 
                                      ? "Viewing Set"
                                      : "Negotiating"
                                }
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="max-w-xs truncate">{inquiry.notes}</div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Update Status</DropdownMenuItem>
                                    <DropdownMenuItem>Schedule Viewing</DropdownMenuItem>
                                    <DropdownMenuItem>Send Email</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-500">Archive</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* LANDLORDS SECTION */}
          <TabsContent value="landlords" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Landlord Clients</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2 shrink-0" />
                  Filter
                </Button>
                <Button size="sm" asChild>
                  <Link href="/agency/landlords/add">
                    <Plus className="h-4 w-4 mr-2 shrink-0" />
                    Add Landlord
                  </Link>
                </Button>
              </div>
            </div>

            {landlords && landlords.length > 0 ? (
              <Card>
                <CardContent className="p-0 overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left font-medium">Landlord</th>
                        <th className="h-12 px-4 text-left font-medium">Contact</th>
                        <th className="h-12 px-4 text-left font-medium">Properties</th>
                        <th className="h-12 px-4 text-left font-medium">Client Since</th>
                        <th className="h-12 px-4 text-left font-medium">Status</th>
                        <th className="h-12 px-4 text-left font-medium w-[100px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {landlordClients.map((landlord) => (
                        <tr key={landlord.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{landlord.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{landlord.name}</div>
                                <div className="text-xs text-muted-foreground">ID: {landlord.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="text-sm">{landlord.email}</div>
                            <div className="text-xs text-muted-foreground">{landlord.phone}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="text-sm font-medium">{landlord.properties}</div>
                            <div className="text-xs text-muted-foreground">Listed Properties</div>
                          </td>
                          <td className="p-4 align-middle">
                            {formatDate(landlord.joined)}
                          </td>
                          <td className="p-4 align-middle">
                            <Badge className="bg-green-50 text-green-700">Active</Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Contact Landlord</DropdownMenuItem>
                                <DropdownMenuItem>View Properties</DropdownMenuItem>
                                <DropdownMenuItem>Add Property</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">Remove Client</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : (
              <Card className="py-8">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No Landlord Clients</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't added any landlord clients to your account yet.
                  </p>
                  <Button asChild>
                    <Link href="/agency/landlords/add">
                      <Plus className="h-4 w-4 mr-2 shrink-0" />
                      Add Your First Landlord
                    </Link>
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashLayout>
  );
}