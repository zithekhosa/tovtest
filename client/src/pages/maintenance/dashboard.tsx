import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCard, getMaintenanceMetrics } from "@/components/dashboard/DashboardMetrics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MaintenanceRequest } from "@shared/schema";
import { Download } from "lucide-react";

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
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Star, 
  Search, 
  Filter, 
  ArrowRight,
  ExternalLink,
  Plus,
  Eye,
  MoreHorizontal,
  Building,
  MapPin,
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

// Sample upcoming job data
const upcomingJobs = [
  {
    id: 1,
    title: "Leaking kitchen faucet repair",
    address: "Plot 5419, Queens Road, Gaborone",
    date: new Date(2023, 10, 18, 10, 0), // Friday at 10 AM
    status: "confirmed",
    client: "Mpho Khumalo",
    clientContact: "71234567",
    price: 450
  },
  {
    id: 2,
    title: "Air conditioning maintenance",
    address: "Plot 12364, Phakalane Golf Estate, Gaborone",
    date: new Date(2023, 10, 19, 14, 30), // Saturday at 2:30 PM
    status: "confirmed",
    client: "Tebogo Moilwa",
    clientContact: "72345678",
    price: 650
  },
  {
    id: 3,
    title: "Bathroom tile replacement",
    address: "Plot 7389, Extension 9, Gaborone",
    date: new Date(2023, 10, 20, 9, 0), // Monday at 9 AM
    status: "pending_confirmation",
    client: "Naledi Phiri",
    clientContact: "74567890",
    price: 1200
  }
];

// Sample task history data
const recentlyCompletedJobs = [
  {
    id: 101,
    title: "Ceiling fan installation",
    address: "Plot 8871, Block 10, Gaborone",
    completedDate: new Date(2023, 10, 15),
    client: "Lesego Sebina",
    rating: 5,
    feedback: "Excellent service, very professional and efficient.",
    paymentStatus: "paid",
    amount: 550
  },
  {
    id: 102,
    title: "Broken window repair",
    address: "Plot 3452, Extension 12, Gaborone",
    completedDate: new Date(2023, 10, 12),
    client: "Kabo Moilwa",
    rating: 4,
    feedback: "Good work, arrived on time and completed the job well.",
    paymentStatus: "paid",
    amount: 350
  },
  {
    id: 103,
    title: "Water heater replacement",
    address: "Plot 6734, Block 5, Gaborone",
    completedDate: new Date(2023, 10, 8),
    client: "Tumelo Molefe",
    rating: 5,
    feedback: "Very satisfied with the installation. Works perfectly.",
    paymentStatus: "paid",
    amount: 1800
  }
];

// Format time for appointments
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

// Sample service categories with the specific skills the provider offers
const serviceCategories = [
  {
    id: 1,
    name: "Plumbing",
    skills: ["Leak Repairs", "Pipe Installation", "Drain Cleaning", "Fixture Installation"],
    active: true
  },
  {
    id: 2,
    name: "Electrical",
    skills: ["Wiring", "Lighting Installation", "Fan Installation", "Outlet Repairs"],
    active: true
  },
  {
    id: 3,
    name: "Carpentry",
    skills: ["Furniture Assembly", "Door Repairs", "Cabinet Installation"],
    active: true
  },
  {
    id: 4,
    name: "Painting",
    skills: ["Interior Painting", "Exterior Painting", "Wall Preparation"],
    active: false
  }
];

// Sample available jobs in the marketplace
const availableJobs = [
  {
    id: 201,
    title: "Bathroom sink replacement",
    location: "Gaborone, Block A",
    distance: "3.2 km",
    category: "Plumbing",
    postedDate: new Date(2023, 10, 16),
    budget: 650,
    priority: "medium",
    description: "Need to replace a cracked bathroom sink. New sink will be provided."
  },
  {
    id: 202,
    title: "Living room outlets not working",
    location: "Gaborone, Extension 12",
    distance: "5.8 km",
    category: "Electrical",
    postedDate: new Date(2023, 10, 16),
    budget: 450,
    priority: "high",
    description: "Three outlets in the living room stopped working suddenly. Need diagnosis and repair."
  },
  {
    id: 203,
    title: "Ceiling fan installation",
    location: "Phakalane",
    distance: "8.7 km",
    category: "Electrical",
    postedDate: new Date(2023, 10, 15),
    budget: 550,
    priority: "low",
    description: "Need to install a new ceiling fan in the master bedroom. Fan will be provided."
  },
  {
    id: 204,
    title: "Kitchen cabinet door repair",
    location: "Gaborone, Block 8",
    distance: "4.3 km",
    category: "Carpentry",
    postedDate: new Date(2023, 10, 14),
    budget: 350,
    priority: "medium",
    description: "Kitchen cabinet door is loose and needs to be repaired or replaced."
  }
];

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch maintenance requests assigned to the provider
  const { 
    data: assignedRequests,
    isLoading: isLoadingAssigned
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/assigned"],
  });

  // Fetch available maintenance requests
  const { 
    data: availableRequests,
    isLoading: isLoadingAvailable
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/available"],
  });

  // Fetch completed maintenance requests
  const { 
    data: completedRequests,
    isLoading: isLoadingCompleted
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/completed"],
  });

  const isLoading = isLoadingAssigned || isLoadingAvailable || isLoadingCompleted;

  // Calculate dashboard metrics
  const completedJobsCount = completedRequests?.length || 0;
  const pendingJobsCount = assignedRequests?.filter(r => r.status === "pending" || r.status === "assigned").length || 0;
  const avgRating = 4.8; // Calculate from actual ratings once available
  
  // Dashboard metrics
  const dashboardMetrics = getMaintenanceMetrics(completedJobsCount, pendingJobsCount, avgRating);

  // Calculate total earnings in current month
  const currentMonthEarnings = recentlyCompletedJobs.reduce((sum, job) => sum + job.amount, 0);

  // Calculate upcoming jobs count
  const upcomingJobsCount = assignedRequests?.filter(r => r.status === "assigned").length || 0;

  // Filter maintenance requests based on status
  const getAssignedRequests = () => assignedRequests?.filter(r => r.status === "assigned") || [];
  const getPendingRequests = () => assignedRequests?.filter(r => r.status === "pending") || [];
  const getInProgressRequests = () => assignedRequests?.filter(r => r.status === "in progress") || [];

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
          subtitle="Here's an overview of your maintenance jobs and earnings"
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
            <TabsTrigger value="jobs" className="py-2">My Jobs</TabsTrigger>
            <TabsTrigger value="marketplace" className="py-2">Marketplace</TabsTrigger>
            <TabsTrigger value="earnings" className="py-2">Earnings</TabsTrigger>
          </TabsList>

          {/* OVERVIEW SECTION */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upcoming Jobs */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-md font-medium">Upcoming Jobs</CardTitle>
                      <CardDescription>Your scheduled maintenance work</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                      <Link href="/maintenance/jobs">
                        <span className="text-xs">View All</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px] px-6">
                    <div className="space-y-4 py-2">
                      {upcomingJobs.length > 0 ? (
                        upcomingJobs.map((job) => (
                          <div key={job.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{job.title}</h4>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{job.address}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span>{formatCardDate(job.date)} • {formatTime(job.date)}</span>
                                </div>
                              </div>
                              <Badge className={
                                job.status === "confirmed" 
                                  ? "bg-green-50 text-green-700" 
                                  : "bg-amber-50 text-amber-700"
                              }>
                                {job.status === "confirmed" ? "Confirmed" : "Pending"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t">
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-1">{job.client}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                  <Phone className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-sm font-medium text-primary">
                                {formatCurrency(job.price)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <Calendar className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                          <p className="text-sm text-muted-foreground">No upcoming jobs scheduled</p>
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link href="/maintenance/marketplace">
                              <Search className="h-3.5 w-3.5 mr-1" />
                              Find Available Jobs
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Monthly Performance */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-medium">Monthly Performance</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <span className="text-xs">Detailed Stats</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Completed Jobs</p>
                        <div className="flex items-end gap-1">
                          <p className="text-2xl font-bold">{completedJobsCount}</p>
                          <p className="text-xs text-green-600 mb-1">+3 from last month</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Earnings</p>
                        <div className="flex items-end gap-1">
                          <p className="text-2xl font-bold">{formatCurrency(currentMonthEarnings)}</p>
                          <p className="text-xs text-green-600 mb-1">+12%</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Rating Distribution</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs">5 stars</span>
                          </div>
                          <span className="text-xs font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs">4 stars</span>
                          </div>
                          <span className="text-xs font-medium">15%</span>
                        </div>
                        <Progress value={15} className="h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs">3 stars</span>
                          </div>
                          <span className="text-xs font-medium">0%</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <h3 className="text-sm font-medium">Job Acceptance Rate</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">This Month</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                      <p className="text-xs text-muted-foreground">You're in the top 10% of providers.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Available Jobs */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-md font-medium">Available Jobs</CardTitle>
                      <CardDescription>Maintenance requests matching your skills</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/maintenance/marketplace">
                        Browse All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[220px] px-6">
                    <div className="space-y-4 py-2">
                      {availableJobs.length > 0 ? (
                        availableJobs.slice(0, 3).map((job) => (
                          <div key={job.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{job.title}</h4>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <Badge variant="outline" className="mr-2 bg-slate-50">
                                    {job.category}
                                  </Badge>
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{job.location}</span>
                                  <span className="mx-1">•</span>
                                  <span>{job.distance}</span>
                                </div>
                              </div>
                              <div>
                                <Badge className={
                                  job.priority === "high" 
                                    ? "bg-red-50 text-red-700" 
                                    : job.priority === "medium" 
                                      ? "bg-amber-50 text-amber-700" 
                                      : "bg-blue-50 text-blue-700"
                                }>
                                  {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t">
                              <div className="text-sm font-medium text-primary">
                                {formatCurrency(job.budget)}
                              </div>
                              <Button size="sm" asChild>
                                <Link href={`/maintenance/jobs/${job.id}`}>
                                  Apply
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <Wrench className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                          <p className="text-sm text-muted-foreground">No available jobs matching your skills</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Your Services */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-medium">Your Services</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                      <Link href="/maintenance/services">
                        <span className="text-xs">Edit</span>
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[220px]">
                    <div className="space-y-3">
                      {serviceCategories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">{category.name}</h3>
                            {category.active ? (
                              <Badge className="bg-green-50 text-green-700">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {category.skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="bg-slate-50">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Recent Client Feedback */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Recent Client Feedback</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-4">
                  {recentlyCompletedJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < job.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(job.completedDate)}
                        </span>
                      </div>
                      <p className="text-sm italic mb-2">"{job.feedback}"</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium">{job.client}</span>
                        <span className="text-muted-foreground">{job.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* JOBS SECTION */}
          <TabsContent value="jobs" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">My Jobs</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2 shrink-0" />
                  Filter
                </Button>
                <Button size="sm" asChild>
                  <Link href="/maintenance/marketplace">
                    <Plus className="h-4 w-4 mr-2 shrink-0" />
                    Find New Jobs
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <Calendar className="h-4 w-4 text-primary mr-2" />
                    Scheduled
                  </CardTitle>
                  <CardDescription>{upcomingJobsCount} jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingJobs.length > 0 ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {upcomingJobs.map((job) => (
                          <div key={job.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{job.title}</h4>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate w-32">{job.address}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span>{formatCardDate(job.date)} • {formatTime(job.date)}</span>
                                </div>
                              </div>
                              <Badge className={
                                job.status === "confirmed" 
                                  ? "bg-green-50 text-green-700" 
                                  : "bg-amber-50 text-amber-700"
                              }>
                                {job.status === "confirmed" ? "Confirmed" : "Pending"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t">
                              <div className="text-sm font-medium text-primary">
                                {formatCurrency(job.price)}
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/maintenance/jobs/${job.id}`}>
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center">
                      <Calendar className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No scheduled jobs</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    In Progress
                  </CardTitle>
                  <CardDescription>{getInProgressRequests().length} jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  {getInProgressRequests().length > 0 ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {getInProgressRequests().map((request) => (
                          <div key={request.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm">{request.title}</h4>
                              <Badge className="bg-blue-50 text-blue-700">In Progress</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Property #{request.propertyId} • Started {request.updatedAt ? formatDate(request.updatedAt) : formatDate(request.createdAt)}
                            </p>
                            <p className="text-sm line-clamp-2 mt-2">{request.description}</p>
                            <div className="flex justify-between mt-3 pt-2 border-t">
                              <Badge variant="outline" className={
                                request.priority === "urgent" 
                                  ? "bg-red-50 text-red-700" 
                                  : request.priority === "high" 
                                    ? "bg-orange-50 text-orange-700" 
                                    : "bg-blue-50 text-blue-700"
                              }>
                                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                              </Badge>
                              <Button variant="ghost" size="sm" className="h-7" asChild>
                                <Link href={`/maintenance/jobs/${request.id}`}>
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  <span className="text-xs">View</span>
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center">
                      <Clock className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No in-progress jobs</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Completed
                  </CardTitle>
                  <CardDescription>{completedRequests?.length || 0} jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  {(completedRequests?.length || 0) > 0 ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {recentlyCompletedJobs.map((job) => (
                          <div key={job.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm">{job.title}</h4>
                              <Badge className="bg-green-50 text-green-700">Completed</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {job.address} • Completed {formatDate(job.completedDate)}
                            </p>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3.5 w-3.5 ${i < job.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                                  />
                                ))}
                              </div>
                              <div className="text-sm font-medium text-primary">
                                {formatCurrency(job.amount)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-sm text-muted-foreground">No completed jobs</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium">Job History</CardTitle>
                <CardDescription>Complete history of all your maintenance work</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Job</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Location</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Client</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Amount</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[80px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Combine all jobs for the table */}
                      {[...upcomingJobs, ...recentlyCompletedJobs].map((job) => (
                        <tr key={job.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <div className="font-medium">{job.title}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="max-w-[200px] truncate">{job.address}</div>
                          </td>
                          <td className="p-4 align-middle">
                            {formatDate('completedDate' in job ? job.completedDate : job.date)}
                          </td>
                          <td className="p-4 align-middle">
                            <div className="font-medium">{job.client}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge className={
                              'completedDate' in job 
                                ? "bg-green-50 text-green-700"
                                : job.status === "confirmed" 
                                  ? "bg-blue-50 text-blue-700" 
                                  : "bg-amber-50 text-amber-700"
                            }>
                              {'completedDate' in job 
                                ? "Completed" 
                                : job.status === "confirmed" 
                                  ? "Confirmed" 
                                  : "Pending"
                              }
                            </Badge>
                          </td>
                          <td className="p-4 align-middle font-medium">
                            {formatCurrency('amount' in job ? job.amount : job.price)}
                          </td>
                          <td className="p-4 align-middle">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/maintenance/jobs/${job.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MARKETPLACE SECTION */}
          <TabsContent value="marketplace" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Maintenance Marketplace</h3>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search jobs..."
                    className="w-full pl-8 py-2 pr-4 rounded-md border border-input bg-background"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2 shrink-0" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md font-medium">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {serviceCategories.map((category) => (
                        <div 
                          key={category.id} 
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                            category.active ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${category.active ? "bg-primary" : "bg-muted-foreground"} mr-2`} />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <Badge variant={category.active ? "default" : "outline"} className="ml-auto">
                            {category.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Job Type</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="residential" className="mr-2" defaultChecked />
                          <label htmlFor="residential" className="text-sm">Residential</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="commercial" className="mr-2" defaultChecked />
                          <label htmlFor="commercial" className="text-sm">Commercial</label>
                        </div>
                      </div>
                      
                      <h3 className="text-sm font-medium">Distance</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="within5km" className="mr-2" defaultChecked />
                          <label htmlFor="within5km" className="text-sm">Within 5 km</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="within10km" className="mr-2" defaultChecked />
                          <label htmlFor="within10km" className="text-sm">Within 10 km</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="beyond10km" className="mr-2" />
                          <label htmlFor="beyond10km" className="text-sm">Beyond 10 km</label>
                        </div>
                      </div>
                      
                      <h3 className="text-sm font-medium">Priority</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="urgent" className="mr-2" defaultChecked />
                          <label htmlFor="urgent" className="text-sm">Urgent</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="high" className="mr-2" defaultChecked />
                          <label htmlFor="high" className="text-sm">High</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="medium" className="mr-2" defaultChecked />
                          <label htmlFor="medium" className="text-sm">Medium</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="low" className="mr-2" defaultChecked />
                          <label htmlFor="low" className="text-sm">Low</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm">Reset</Button>
                      <Button size="sm">Apply Filters</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md font-medium">Available Jobs</CardTitle>
                    <CardDescription>Find maintenance jobs matching your skills</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-4 p-6">
                      {availableJobs.map((job) => (
                        <div key={job.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{job.title}</h4>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{job.location}</span>
                                <span className="mx-1">•</span>
                                <span>{job.distance}</span>
                              </div>
                            </div>
                            <Badge className={
                              job.priority === "high" 
                                ? "bg-red-50 text-red-700" 
                                : job.priority === "medium" 
                                  ? "bg-amber-50 text-amber-700" 
                                  : "bg-blue-50 text-blue-700"
                            }>
                              {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
                            </Badge>
                          </div>
                          
                          <div className="mt-3">
                            <Badge variant="outline" className="mr-2 bg-slate-50">
                              {job.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Posted {formatDate(job.postedDate)}
                            </span>
                          </div>
                          
                          <p className="text-sm mt-3">{job.description}</p>
                          
                          <div className="flex justify-between items-center mt-4 pt-3 border-t">
                            <div className="text-lg font-medium text-primary">
                              {formatCurrency(job.budget)}
                              <span className="text-xs text-muted-foreground ml-1">budget</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/maintenance/jobs/${job.id}`}>
                                  <Eye className="h-4 w-4 mr-2 shrink-0" />
                                  View Details
                                </Link>
                              </Button>
                              <Button size="sm">
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* EARNINGS SECTION */}
          <TabsContent value="earnings" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Current Month</CardTitle>
                  <CardDescription>November 2023</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold">{formatCurrency(currentMonthEarnings)}</p>
                      <p className="text-xs text-green-600">+12% from last month</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Completed Jobs</span>
                        <span className="font-medium">{recentlyCompletedJobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Job Value</span>
                        <span className="font-medium">
                          {formatCurrency(recentlyCompletedJobs.reduce((sum, job) => sum + job.amount, 0) / recentlyCompletedJobs.length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Service Fee (10%)</span>
                        <span className="font-medium text-red-500">
                          -{formatCurrency(currentMonthEarnings * 0.1)}
                        </span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Net Earnings</span>
                        <span className="font-medium">
                          {formatCurrency(currentMonthEarnings * 0.9)}
                        </span>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Statement
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-md font-medium">Earnings History</CardTitle>
                      <CardDescription>Track your income over time</CardDescription>
                    </div>
                    <select className="px-2 py-1 text-sm border rounded-md">
                      <option>Last 6 months</option>
                      <option>Last year</option>
                      <option>All time</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground opacity-30 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Earnings chart visualization would appear here</p>
                      <p className="text-xs text-muted-foreground mt-1">Showing monthly earnings trend</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 mt-4 text-center">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Jun</p>
                      <p className="text-sm font-medium">{formatCurrency(2500)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Jul</p>
                      <p className="text-sm font-medium">{formatCurrency(2800)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Aug</p>
                      <p className="text-sm font-medium">{formatCurrency(3200)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Sep</p>
                      <p className="text-sm font-medium">{formatCurrency(2900)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Oct</p>
                      <p className="text-sm font-medium">{formatCurrency(2400)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Nov</p>
                      <p className="text-sm font-medium">{formatCurrency(currentMonthEarnings)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium">Payment History</CardTitle>
                <CardDescription>Record of payments for completed jobs</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Job</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Client</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Gross Amount</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Fee</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Net Amount</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                        <th className="h-10 px-4 text-right font-medium text-muted-foreground w-[80px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentlyCompletedJobs.map((job) => (
                        <tr key={job.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            {formatDate(job.completedDate)}
                          </td>
                          <td className="p-4 align-middle">
                            <div className="font-medium">{job.title}</div>
                            <div className="text-xs text-muted-foreground">ID: #{job.id}</div>
                          </td>
                          <td className="p-4 align-middle">
                            {job.client}
                          </td>
                          <td className="p-4 align-middle">
                            {formatCurrency(job.amount)}
                          </td>
                          <td className="p-4 align-middle text-red-500">
                            -{formatCurrency(job.amount * 0.1)}
                          </td>
                          <td className="p-4 align-middle font-medium">
                            {formatCurrency(job.amount * 0.9)}
                          </td>
                          <td className="p-4 align-middle">
                            <Badge className="bg-green-50 text-green-700">
                              {job.paymentStatus.charAt(0).toUpperCase() + job.paymentStatus.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium">Payment Settings</CardTitle>
                <CardDescription>Manage your banking and payment preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Payment Method</h3>
                    <div className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-6 bg-blue-600 rounded mr-2"></div>
                          <span className="font-medium">••••  ••••  ••••  4582</span>
                        </div>
                        <Badge variant="outline">Default</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires 05/25
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2 shrink-0" />
                      Add Payment Method
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Payout Information</h3>
                    <div className="p-4 border rounded-lg bg-muted/20">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Bank Name</span>
                          <span className="text-sm">First National Bank</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Account Number</span>
                          <span className="text-sm">••••••••5932</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Account Holder</span>
                          <span className="text-sm">{user?.firstName} {user?.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Payout Schedule</span>
                          <span className="text-sm">Bi-weekly</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Update Payout Information
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashLayout>
  );
}