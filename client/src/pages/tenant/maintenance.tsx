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
import { StatusBadge } from "@/components/ui/status-badge";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

// Icons
import {
  Loader2,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Filter,
  Search,
  X,
  Calendar,
  ArrowRight,
  Camera,
  Upload,
  FileText,
  Edit,
  ChevronRight,
  MessageSquare,
  MapPin,
  Home,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Paintbrush,
  Hammer,
  Droplets,
  Zap,
  DoorClosed,
  Wifi,
  Trash2,
  Star,
  Info,
  Eye,
  HelpCircle,
  Phone,
} from "lucide-react";

// Form schema for maintenance requests
const maintenanceFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum([
    "plumbing",
    "electrical",
    "hvac",
    "appliance",
    "structural",
    "pest",
    "other",
  ]),
  property_id: z.number(),
  allow_entry: z.boolean().default(true),
  preferred_time: z.enum(["morning", "afternoon", "evening", "anytime"]).optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

// Available maintenance categories with icons
const categories = [
  { id: "plumbing", label: "Plumbing", icon: <Droplets className="h-4 w-4" /> },
  { id: "electrical", label: "Electrical", icon: <Zap className="h-4 w-4" /> },
  { id: "hvac", label: "HVAC", icon: <Zap className="h-4 w-4" /> },
  { id: "appliance", label: "Appliance", icon: <Home className="h-4 w-4" /> },
  { id: "structural", label: "Structural", icon: <Hammer className="h-4 w-4" /> },
  { id: "pest", label: "Pest Control", icon: <Trash2 className="h-4 w-4" /> },
  { id: "other", label: "Other", icon: <Wrench className="h-4 w-4" /> },
];

// Status and priority styling helpers
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "text-blue-600 border-blue-200 bg-blue-50";
    case "medium":
      return "text-yellow-600 border-yellow-200 bg-yellow-50";
    case "high":
      return "text-orange-600 border-orange-200 bg-orange-50";
    case "urgent":
      return "text-red-600 border-red-200 bg-red-50";
    default:
      return "text-gray-600 border-gray-200 bg-gray-50";
  }
};

const getCategoryIcon = (category: string) => {
  const found = categories.find((c) => c.id === category);
  return found ? found.icon : <Wrench className="h-4 w-4" />;
};

export default function MaintenancePortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [actionInProgress, setActionInProgress] = useState(false);

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

  // Handle file upload (mock implementation)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    setActionInProgress(true);
    
    // This would normally be an actual upload to a server
    // For demo purposes, we're just adding placeholder image URLs
    setTimeout(() => {
      const newImages = Array.from(files).map((_, index) => 
        `https://source.unsplash.com/random/800x600?maintenance&sig=${Date.now() + index}`
      );
      
      setUploadedImages(prev => [...prev, ...newImages]);
      setActionInProgress(false);
      
      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) uploaded successfully`,
      });
    }, 1500);
  };

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

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Loading state
  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
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

  // Main UI
  return (
    <DashLayout>
      <div className="container py-6 max-w-7xl">
        {/* Header section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-2xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Maintenance Hub</h1>
              <p className="text-muted-foreground mt-2">Request and track repairs for your property</p>
            </div>
            <Button size="lg" onClick={() => setIsNewRequestOpen(true)} className="gap-2">
              <Plus className="h-5 w-5" />
              <span>New Request</span>
            </Button>
          </div>
          
          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activeRequests.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedRequests.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <X className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold">{cancelledRequests.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{maintenanceRequests.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Requests list section */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Maintenance Requests</CardTitle>
                    <CardDescription>View and manage your property maintenance requests</CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => refetchRequests()}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh requests</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or description..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-6">
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
                      filteredRequests.map((request) => (
                        <RequestCard 
                          key={request.id} 
                          request={request} 
                          onClick={() => handleViewRequest(request)} 
                        />
                      ))
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
                      filteredRequests.map((request) => (
                        <RequestCard 
                          key={request.id} 
                          request={request} 
                          onClick={() => handleViewRequest(request)} 
                        />
                      ))
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
                      filteredRequests.map((request) => (
                        <RequestCard 
                          key={request.id} 
                          request={request} 
                          onClick={() => handleViewRequest(request)} 
                        />
                      ))
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Your Property</CardTitle>
                <CardDescription>Current residence information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <img 
                    src="https://source.unsplash.com/random/600x400?house,property,apartment" 
                    alt="Property" 
                    className="w-full h-40 object-cover rounded-md" 
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{property.address || "Plot 12345, Block 10"}</p>
                      <p className="text-sm text-muted-foreground">{property.city || "Gaborone"}, Botswana</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{property.title || "Block 10 Residence"}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.bedrooms || 2} beds • {property.bathrooms || 1} bath • {120}m²
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/tenant/dashboard?tab=property">
                    View More Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Common issues guide */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Common Issues</CardTitle>
                <CardDescription>Quick maintenance guides</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <HelpGuideItem
                    icon={<Droplets className="h-4 w-4 text-blue-500" />}
                    title="Plumbing Issues"
                    description="For leaks, turn off the main water valve located near your front door. Check under sinks for shut-off valves for specific fixtures."
                  />
                  
                  <HelpGuideItem
                    icon={<Zap className="h-4 w-4 text-yellow-500" />}
                    title="Electrical Problems"
                    description="Check circuit breakers in your distribution panel first. Never attempt to fix electrical issues yourself."
                  />
                  
                  <HelpGuideItem
                    icon={<Zap className="h-4 w-4 text-red-500" />}
                    title="HVAC Not Working"
                    description="Check if the thermostat has power and is set correctly. Ensure air filters are clean and vents are unblocked."
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="ghost" className="w-full" asChild>
                  <a href="/tenant/help-guides">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    View All Guides
                  </a>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Emergency contacts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>For urgent maintenance issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 p-1.5 rounded-full">
                        <Phone className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Emergency Maintenance</p>
                        <p className="text-xs text-muted-foreground">24/7 Line</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="tel:+26712345678">+267 1234 5678</a>
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-1.5 rounded-full">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Property Manager</p>
                        <p className="text-xs text-muted-foreground">Business Hours</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="tel:+26787654321">+267 8765 4321</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
                        placeholder="Please provide detailed information about the issue..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include when the issue started and any relevant details
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                <FormLabel>Images</FormLabel>
                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative w-24 h-24 border rounded-md overflow-hidden group"
                    >
                      <img 
                        src={image} 
                        alt={`Uploaded ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="w-24 h-24 border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      multiple
                      onChange={handleFileUpload}
                      disabled={actionInProgress}
                    />
                  </label>
                </div>
                <FormDescription>
                  Upload photos of the issue (maximum 5 images)
                </FormDescription>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                          Allow maintenance staff to enter if you're not home
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!form.watch("allow_entry")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                          <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                          <SelectItem value="anytime">Anytime</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewRequestOpen(false)}
                  disabled={createRequestMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createRequestMutation.isPending || actionInProgress}
                >
                  {(createRequestMutation.isPending || actionInProgress) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-xl">Maintenance Request Details</DialogTitle>
                  <DialogDescription>
                    Request #{selectedRequest.id} • {formatDateTime(selectedRequest.createdAt)}
                  </DialogDescription>
                </div>
                <StatusBadge status={selectedRequest.status as any} />
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{selectedRequest.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn("px-2 py-1 gap-1", getPriorityColor(selectedRequest.priority))}>
                      <div className="w-2 h-2 rounded-full bg-current" />
                      <span className="capitalize">{selectedRequest.priority} Priority</span>
                    </Badge>
                    
                    <Badge variant="outline" className="gap-1 px-2 py-1">
                      {getCategoryIcon(selectedRequest.category || 'other')}
                      <span className="capitalize">{selectedRequest.category || 'General'}</span>
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{selectedRequest.description}</p>
                </div>
                
                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Images</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedRequest.images.map((image, index) => (
                        <div 
                          key={index} 
                          className="aspect-square rounded-md overflow-hidden border"
                        >
                          <img 
                            src={image} 
                            alt={`Issue image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h4>
                  <div className="space-y-4">
                    <TimelineItem 
                      status="complete"
                      icon={<Plus className="h-4 w-4" />}
                      title="Request Submitted"
                      time={formatDateTime(selectedRequest.createdAt)}
                    />
                    
                    {selectedRequest.status === "in progress" && (
                      <TimelineItem
                        status="complete"
                        icon={<Wrench className="h-4 w-4" />}
                        title="Work Started"
                        time={selectedRequest.updatedAt ? formatDateTime(selectedRequest.updatedAt) : "Date not recorded"}
                        description={"Maintenance team assigned"}
                      />
                    )}
                    
                    {selectedRequest.status === "completed" && (
                      <>
                        <TimelineItem
                          status="complete"
                          icon={<Wrench className="h-4 w-4" />}
                          title="Work Started"
                          time={selectedRequest.updatedAt ? formatDateTime(selectedRequest.updatedAt) : "Date not recorded"}
                          description={"Maintenance team assigned"}
                        />
                        
                        <TimelineItem
                          status="complete"
                          icon={<CheckCircle className="h-4 w-4" />}
                          title="Work Completed"
                          time={selectedRequest.updatedAt ? formatDateTime(selectedRequest.updatedAt) : "Date not recorded"}
                        />
                      </>
                    )}
                    
                    {selectedRequest.status === "cancelled" && (
                      <TimelineItem
                        status="cancelled"
                        icon={<X className="h-4 w-4" />}
                        title="Request Cancelled"
                        time={selectedRequest.updatedAt ? formatDateTime(selectedRequest.updatedAt) : "Date not recorded"}
                      />
                    )}
                  </div>
                </div>
                
                {/* Notes section (hidden for now) */}
                
                {selectedRequest.status === "completed" && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Feedback</h4>
                    <div className="flex gap-4 items-center">
                      <Button variant="outline" className="flex-1 h-auto py-6 gap-2">
                        <ThumbsUp className="h-5 w-5 text-green-500" />
                        <div className="flex flex-col">
                          <span>Satisfied</span>
                          <span className="text-xs text-muted-foreground">Work was done well</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="flex-1 h-auto py-6 gap-2">
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                        <div className="flex flex-col">
                          <span>Not Satisfied</span>
                          <span className="text-xs text-muted-foreground">Issue not resolved</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <DialogFooter className="gap-2 border-t pt-4 mt-4">
              {selectedRequest.status === "pending" && (
                <Button
                  variant="destructive"
                  onClick={handleCancelRequest}
                  disabled={cancelRequestMutation.isPending}
                >
                  {cancelRequestMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cancel Request
                </Button>
              )}
              
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashLayout>
  );
}

// Component for request cards
function RequestCard({ request, onClick }: { request: MaintenanceRequest; onClick: () => void }) {
  const statusMap = {
    pending: { label: "Pending", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    "in progress": { label: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200" },
    completed: { label: "Completed", color: "text-green-600 bg-green-50 border-green-200" },
    cancelled: { label: "Cancelled", color: "text-gray-600 bg-gray-50 border-gray-200" },
  };
  
  const status = statusMap[request.status as keyof typeof statusMap] || statusMap.pending;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex">
        <div className={cn("w-2.5", request.status === "pending" ? "bg-yellow-400" : request.status === "in progress" ? "bg-blue-400" : request.status === "completed" ? "bg-green-400" : "bg-gray-400")} />
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium mb-1">{request.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={cn("px-2 py-0.5", getPriorityColor(request.priority))}>
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                </Badge>
                
                <span className="text-xs text-muted-foreground">
                  #{request.id} • {formatDateTime(request.createdAt)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <Badge variant="outline" className={cn(status.color, "whitespace-nowrap")}>
                {status.label}
              </Badge>
              
              {request.category && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  {getCategoryIcon(request.category)}
                  <span className="capitalize">{request.category}</span>
                </div>
              )}
            </div>
          </div>
          
          {(request.status === "in progress" || request.status === "completed") && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {request.status === "in progress" ? (
                  <>
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    <span>Work in progress</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <span>Completed on {request.updatedAt ? formatDateTime(request.updatedAt) : "N/A"}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Component for empty states
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-3 rounded-full bg-muted mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Component for timeline items
function TimelineItem({ 
  status, 
  icon, 
  title, 
  time, 
  description 
}: { 
  status: "pending" | "complete" | "cancelled"; 
  icon: React.ReactNode; 
  title: string; 
  time: string; 
  description?: string;
}) {
  return (
    <div className="flex">
      <div className="mr-4 flex flex-col items-center">
        <div className={cn(
          "rounded-full p-1.5",
          status === "complete" ? "bg-primary" : 
          status === "cancelled" ? "bg-gray-400" : 
          "bg-gray-200"
        )}>
          <div className="text-white">{icon}</div>
        </div>
        {status !== "cancelled" && <div className="h-full w-px bg-border mt-2" />}
      </div>
      <div className="pb-6">
        <p className="font-medium text-sm">{title}</p>
        <time className="text-xs text-muted-foreground block mb-1">{time}</time>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

// Component for help guide items
function HelpGuideItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}