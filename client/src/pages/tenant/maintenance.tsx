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

// Simple Empty State component - Airbnb style
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
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="bg-gray-50 p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-base font-medium mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-3">{description}</p>
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
    <div 
      className="cursor-pointer hover:shadow-sm transition-all border border-gray-100 bg-white rounded-xl overflow-hidden"
      onClick={onClick}
    >
      <div className="p-3">
        <div className="flex justify-between items-start">
          {/* Left Side - Main Content */}
          <div className="space-y-1.5 flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-sm line-clamp-1">{request.title}</h3>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-1">
              {request.description}
            </p>
            
            {/* Footer with metadata */}
            <div className="flex flex-wrap pt-1 text-[11px] text-gray-500">
              <div className="flex items-center mr-3">
                <Clock className="h-3 w-3 mr-1 opacity-70" />
                {getRelativeTime(new Date(request.createdAt))}
              </div>
              
              {request.category && (
                <div className="flex items-center capitalize mr-3">
                  <Tool className="h-3 w-3 mr-1 opacity-70" />
                  {request.category}
                </div>
              )}
              
              {getStatusBadge(request.status)}
            </div>
          </div>
          
          {/* Right Side - Priority indicator */}
          <div>
            {getPriorityBadge(request.priority)}
          </div>
        </div>
        
        {/* Progress bar for pending/in progress */}
        {(request.status === "in progress" || request.status === "pending") && (
          <div className="mt-2">
            <Progress 
              value={request.status === "in progress" ? 50 : 5} 
              className="h-1 bg-gray-100" 
            />
          </div>
        )}
      </div>
    </div>
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

  // Main UI - Airbnb inspired (simplified version)
  return (
    <DashLayout>
      <div className="py-6">
        {/* Header - Simplified, Airbnb-style */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium">Maintenance</h1>
          <Button 
            onClick={() => setIsNewRequestOpen(true)} 
            className="rounded-full shadow-sm"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Request
          </Button>
        </div>

        {/* Quick Stats - Inline, Airbnb Style */}
        <div className="flex items-center space-x-6 mb-6 text-sm">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-50 rounded-full mr-2">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <span><span className="font-medium">{activeRequests.length}</span> Active</span>
          </div>
          
          <div className="flex items-center">
            <div className="p-1.5 bg-green-50 rounded-full mr-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            </div>
            <span><span className="font-medium">{completedRequests.length}</span> Completed</span>
          </div>
          
          <div className="flex items-center">
            <div className="p-1.5 bg-gray-50 rounded-full mr-2">
              <Tool className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span><span className="font-medium">{maintenanceRequests.length}</span> Total</span>
          </div>
        </div>

        {/* Search and Tabs - Simplified */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search requests..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content - Clean and Simple */}
        <TabsContent value="active" className="mt-0">
          {filteredRequests.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
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
              icon={<Wrench className="h-10 w-10 text-muted-foreground/30" />}
              title="No active requests"
              description={searchTerm ? "No matching requests found." : "You don't have any active maintenance requests."}
              action={
                !searchTerm && (
                  <Button 
                    onClick={() => setIsNewRequestOpen(true)} 
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Create Request
                  </Button>
                )
              }
            />
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {filteredRequests.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
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
              icon={<CheckCircle className="h-10 w-10 text-muted-foreground/30" />}
              title="No completed requests"
              description={searchTerm ? "No matching requests found." : "You don't have any completed maintenance requests."}
            />
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="mt-0">
          {filteredRequests.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
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
              icon={<X className="h-10 w-10 text-muted-foreground/30" />}
              title="No cancelled requests"
              description={searchTerm ? "No matching requests found." : "You don't have any cancelled maintenance requests."}
            />
          )}
        </TabsContent>
      </div>

      {/* Create Maintenance Request Dialog - Simplified Airbnb style */}
      <Dialog open={isNewRequestOpen} onOpenChange={(open) => {
        setIsNewRequestOpen(open);
        if (!open) {
          setUploadedImages([]);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[500px] rounded-xl p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl">Report an issue</DialogTitle>
            <DialogDescription className="text-sm">
              Let us know what needs repair or maintenance
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Title field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">What's the issue?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Leaking faucet, broken AC"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Two-column layout for category and priority */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select" />
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
                      <FormLabel className="text-sm font-medium">Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                              <span>Low</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                              <span>Medium</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                              <span>High</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="urgent">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
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
              
              {/* Description field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Describe the issue</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide details about the problem..."
                        className="resize-none min-h-[90px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Simplified allow entry toggle */}
              <FormField
                control={form.control}
                name="allow_entry"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Allow entry when absent</FormLabel>
                      <FormDescription className="text-xs">
                        Maintenance staff may enter if you're not home
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Simplified time selection */}
              <FormField
                control={form.control}
                name="preferred_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Preferred time</FormLabel>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      <Button 
                        type="button"
                        variant={field.value === "morning" ? "default" : "outline"}
                        size="sm"
                        className="h-9"
                        onClick={() => field.onChange("morning")}
                      >
                        Morning
                      </Button>
                      <Button 
                        type="button"
                        variant={field.value === "afternoon" ? "default" : "outline"}
                        size="sm"
                        className="h-9"
                        onClick={() => field.onChange("afternoon")}
                      >
                        Afternoon
                      </Button>
                      <Button 
                        type="button"
                        variant={field.value === "anytime" ? "default" : "outline"}
                        size="sm"
                        className="h-9"
                        onClick={() => field.onChange("anytime")}
                      >
                        Anytime
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6 gap-2">
                <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => setIsNewRequestOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="h-9 px-5" disabled={createRequestMutation.isPending}>
                  {createRequestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>Submit</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Request Details Dialog - Airbnb style */}
      {selectedRequest && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-xl p-6">
            <DialogHeader className="space-y-1 mb-4">
              <DialogTitle className="text-xl font-semibold">
                {selectedRequest.title}
              </DialogTitle>
              <div className="flex items-center flex-wrap gap-2">
                <Badge variant="outline" className={
                  selectedRequest.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200" :
                  selectedRequest.status === "in progress" ? "bg-blue-50 text-blue-600 border-blue-200" :
                  selectedRequest.status === "completed" ? "bg-green-50 text-green-600 border-green-200" :
                  "bg-gray-50 text-gray-600 border-gray-200"
                }>
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </Badge>
                <Badge variant="outline" className={
                  selectedRequest.priority === "low" ? "bg-blue-50 text-blue-600 border-blue-200" :
                  selectedRequest.priority === "medium" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                  selectedRequest.priority === "high" ? "bg-orange-50 text-orange-600 border-orange-200" :
                  selectedRequest.priority === "urgent" ? "bg-red-50 text-red-600 border-red-200" :
                  "bg-gray-50 text-gray-600 border-gray-200"
                }>
                  {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)} Priority
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Submitted {formatDateTime(selectedRequest.createdAt)}
                </span>
              </div>
            </DialogHeader>
            
            <div className="space-y-5 text-sm">
              {/* Category with icon */}
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-gray-50 rounded-full">
                  <Tool className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="text-muted-foreground">
                  <span className="capitalize">{selectedRequest.category || 'Other'}</span> issue
                </span>
              </div>
              
              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-1">Description</p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {selectedRequest.description}
                </p>
              </div>
              
              {/* Progress indicator for in-progress requests */}
              {selectedRequest.status === "in progress" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Work in progress</p>
                    <p className="text-xs font-medium">50%</p>
                  </div>
                  <Progress value={50} className="h-1.5" />
                </div>
              )}
              
              {/* Preferences */}
              {(selectedRequest.allowEntry !== undefined || selectedRequest.preferredTime) && (
                <div className="border rounded-lg p-4 space-y-3">
                  <p className="font-medium">Your preferences</p>
                  
                  {selectedRequest.allowEntry !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Allow entry when absent</span>
                      <span>{selectedRequest.allowEntry ? "Yes" : "No"}</span>
                    </div>
                  )}
                  
                  {selectedRequest.preferredTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Preferred time</span>
                      <span className="capitalize">{selectedRequest.preferredTime}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Cancel button for pending requests */}
              {selectedRequest.status === "pending" && (
                <div className="pt-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={handleCancelRequest}
                    disabled={cancelRequestMutation.isPending}
                  >
                    {cancelRequestMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>Cancel this request</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashLayout>
  );
}