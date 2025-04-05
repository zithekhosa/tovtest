import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashLayout } from "@/layout/dash-layout";
import { useAuth } from "@/hooks/use-auth";
import { Lease, MaintenanceRequest, Property } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn, formatDateTime } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  Droplets,
  FileText,
  Home,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Wrench as Tool,
  Trash,
  Upload,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// Form schema
const maintenanceFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Please provide a detailed description"),
  priority: z.string().default("medium"),
  category: z.string().default("other"),
  property_id: z.number(),
  allow_entry: z.boolean().default(true),
  preferred_time: z.string().default("anytime"),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

// Maintenance categories with icons
const categories = [
  { id: "plumbing", label: "Plumbing", icon: <Droplets className="h-4 w-4" />, color: "bg-blue-500" },
  { id: "electrical", label: "Electrical", icon: <Zap className="h-4 w-4" />, color: "bg-yellow-500" },
  { id: "appliance", label: "Appliance", icon: <Home className="h-4 w-4" />, color: "bg-green-500" },
  { id: "structural", label: "Structural", icon: <Building className="h-4 w-4" />, color: "bg-orange-500" },
  { id: "other", label: "Other", icon: <Tool className="h-4 w-4" />, color: "bg-gray-500" },
];

// Simple Empty State component
function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted/30 p-6 rounded-full mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-5">{description}</p>
      {action}
    </div>
  );
}

// Request Card component
function RequestCard({ 
  request, 
  onClick 
}: { 
  request: MaintenanceRequest; 
  onClick: () => void;
}) {
  // Format priority label
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">High</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>;
      case "in progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes === 0 ? 'just now' : `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all border border-gray-100 overflow-hidden"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-medium line-clamp-1">{request.title}</h3>
              {getPriorityBadge(request.priority)}
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-1.5">
              {request.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {getRelativeTime(new Date(request.createdAt))}
              </span>
              
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Property #{request.propertyId}
              </span>
              
              {request.category && (
                <span className="flex items-center gap-1.5 capitalize">
                  <Tool className="h-3.5 w-3.5" />
                  {request.category}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            {getStatusBadge(request.status)}
            <Button variant="ghost" size="icon" className="mt-2">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {(request.status === "in progress" || request.status === "pending") && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">
                {request.status === "in progress" ? 'Work in progress' : 'Awaiting assignment'}
              </span>
              <span className="font-medium">
                {request.status === "in progress" ? '50%' : '0%'}
              </span>
            </div>
            <Progress value={request.status === "in progress" ? 50 : 0} className="h-1.5" />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function MaintenancePortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Fetch active lease for the tenant
  const {
    data: leases,
    isLoading: isLoadingLeases,
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

  // Fetch maintenance requests for the tenant
  const {
    data: maintenanceRequests = [],
    isLoading: isLoadingRequests,
    refetch: refetchRequests
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/tenant"],
  });

  const isLoading = isLoadingLeases || isLoadingProperty || isLoadingRequests;

  // Form for creating maintenance requests
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "other",
      property_id: activeLease?.propertyId || 0,
      allow_entry: true,
      preferred_time: "anytime",
    },
  });

  // Mutations for maintenance requests
  const createRequestMutation = useMutation({
    mutationFn: async (values: MaintenanceFormValues) => {
      const requestData = {
        propertyId: values.property_id,
        tenantId: user?.id,
        title: values.title,
        description: values.description,
        priority: values.priority,
        category: values.category,
        status: "pending",
        allowEntry: values.allow_entry,
        preferredTime: values.preferred_time,
        createdAt: new Date(),
        images: uploadedImages,
      };

      const response = await apiRequest("POST", "/api/maintenance", requestData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/tenant"] });
      toast({
        title: "Success",
        description: "Maintenance request submitted successfully",
      });
      setIsNewRequestOpen(false);
      form.reset();
      setUploadedImages([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit maintenance request",
        variant: "destructive",
      });
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest("PATCH", `/api/maintenance/${requestId}`, {
        status: "cancelled",
        updatedAt: new Date(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/tenant"] });
      toast({
        title: "Request Cancelled",
        description: "Your maintenance request has been cancelled",
      });
      setIsDetailsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel maintenance request",
        variant: "destructive",
      });
    },
  });

  // Filter and categorize maintenance requests
  const activeRequests = maintenanceRequests.filter(
    (request) => 
      request.status === "pending" || 
      request.status === "in progress"
  );
  
  const completedRequests = maintenanceRequests.filter(
    (request) => 
      request.status === "completed"
  );
  
  const cancelledRequests = maintenanceRequests.filter(
    (request) => 
      request.status === "cancelled"
  );

  const filteredRequests = (() => {
    let requests;
    
    switch (activeTab) {
      case "active":
        requests = activeRequests;
        break;
      case "completed":
        requests = completedRequests;
        break;
      case "cancelled":
        requests = cancelledRequests;
        break;
      default:
        requests = maintenanceRequests;
    }
    
    if (searchTerm) {
      return requests.filter(request => 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return requests;
  })();

  // Event handlers
  const handleSubmit = (values: MaintenanceFormValues) => {
    createRequestMutation.mutate(values);
  };
  
  const handleCancelRequest = () => {
    if (!selectedRequest) return;
    
    if (confirm("Are you sure you want to cancel this maintenance request?")) {
      cancelRequestMutation.mutate(selectedRequest.id);
    }
  };
  
  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading maintenance portal...</p>
        </div>
      </DashLayout>
    );
  }

  // No active lease state
  if (!activeLease || !property) {
    return (
      <DashLayout>
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <div className="bg-amber-50 p-8 rounded-xl border border-amber-200">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Lease Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You need an active lease to request property maintenance. Please contact your
              property manager if you believe this is an error.
            </p>
            <Button variant="outline" asChild>
              <a href="/tenant/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </a>
            </Button>
          </div>
        </div>
      </DashLayout>
    );
  }

  // Main UI - Airbnb inspired
  return (
    <DashLayout>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Maintenance</h1>
              <p className="text-muted-foreground mt-1">
                Request repairs and track maintenance for your rental property
              </p>
            </div>
            <Button onClick={() => setIsNewRequestOpen(true)} className="rounded-full h-10 px-5">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Requests</p>
                  <p className="text-2xl font-bold">{activeRequests.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedRequests.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{maintenanceRequests.length}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Tool className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border border-gray-100 overflow-hidden">
          <CardHeader className="pb-0 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle>Maintenance Requests</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative w-[250px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search requests..."
                    className="pl-9 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => refetchRequests()}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-8 h-10">
                <TabsTrigger value="active" className="relative">
                  Active
                  {activeRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {activeRequests.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="space-y-4">
                {filteredRequests.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredRequests.map((request) => (
                      <RequestCard 
                        key={request.id} 
                        request={request} 
                        onClick={() => handleViewRequest(request)} 
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Wrench className="h-12 w-12 text-muted-foreground/30" />}
                    title="No active requests"
                    description={searchTerm ? "No matching requests found. Try a different search term." : "You don't have any active maintenance requests."}
                    action={
                      !searchTerm && (
                        <Button onClick={() => setIsNewRequestOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Request
                        </Button>
                      )
                    }
                  />
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-4">
                {filteredRequests.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredRequests.map((request) => (
                      <RequestCard 
                        key={request.id} 
                        request={request} 
                        onClick={() => handleViewRequest(request)} 
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<CheckCircle className="h-12 w-12 text-muted-foreground/30" />}
                    title="No completed requests"
                    description={searchTerm ? "No matching requests found. Try a different search term." : "You don't have any completed maintenance requests."}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="cancelled" className="space-y-4">
                {filteredRequests.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredRequests.map((request) => (
                      <RequestCard 
                        key={request.id} 
                        request={request} 
                        onClick={() => handleViewRequest(request)} 
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<X className="h-12 w-12 text-muted-foreground/30" />}
                    title="No cancelled requests"
                    description={searchTerm ? "No matching requests found. Try a different search term." : "You don't have any cancelled maintenance requests."}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Create Maintenance Request Dialog */}
      <Dialog open={isNewRequestOpen} onOpenChange={(open) => {
        setIsNewRequestOpen(open);
        if (!open) {
          setUploadedImages([]);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>New Maintenance Request</DialogTitle>
            <DialogDescription>
              Submit a request for repairs or maintenance at your property
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., Leaking bathroom sink"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                {category.icon}
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <span>Low</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <span>Medium</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-orange-500" />
                              <span>High</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="urgent">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <span>Urgent</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe the issue in detail"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allow_entry"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow Entry</FormLabel>
                      <FormDescription>
                        Maintenance staff may enter the property if you are not present
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferred_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="morning" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Morning (8am - 12pm)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="afternoon" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Afternoon (12pm - 5pm)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="anytime" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Anytime
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRequestMutation.isPending}>
                  {createRequestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>Submit Request</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Maintenance Request</span>
                <Badge className="ml-2">#{selectedRequest.id}</Badge>
              </DialogTitle>
              <DialogDescription>
                Submitted on {formatDateTime(selectedRequest.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-lg font-semibold">{selectedRequest.title}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={
                    selectedRequest.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200" :
                    selectedRequest.status === "in progress" ? "bg-blue-50 text-blue-600 border-blue-200" :
                    selectedRequest.status === "completed" ? "bg-green-50 text-green-600 border-green-200" :
                    "bg-gray-50 text-gray-600 border-gray-200"
                  }>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
                  <Badge variant="outline" className={
                    selectedRequest.priority === "low" ? "bg-blue-50 text-blue-600 border-blue-200" :
                    selectedRequest.priority === "medium" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                    selectedRequest.priority === "high" ? "bg-orange-50 text-orange-600 border-orange-200" :
                    selectedRequest.priority === "urgent" ? "bg-red-50 text-red-600 border-red-200" :
                    "bg-gray-50 text-gray-600 border-gray-200"
                  }>
                    {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                  <p className="text-sm capitalize">{selectedRequest.category || 'Other'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm whitespace-pre-line">{selectedRequest.description}</p>
              </div>
              
              {selectedRequest.status === "pending" && (
                <>
                  <Separator />
                  <div className="flex justify-end">
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelRequest}
                      disabled={cancelRequestMutation.isPending}
                    >
                      {cancelRequestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Cancel Request
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashLayout>
  );
}