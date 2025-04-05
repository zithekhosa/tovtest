import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashLayout } from "@/layout/dash-layout";
import { useAuth } from "@/hooks/use-auth";
import { Lease, MaintenanceRequest as BaseMaintenanceRequest, Property } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn, formatDateTime } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Extended type to include additional fields used in the UI but not in the DB schema
type MaintenanceRequest = BaseMaintenanceRequest & {
  allowEntry?: boolean;
  preferredTime?: string;
};

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import {
  Activity,
  AlertTriangle,
  Building,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Droplets,
  FileText,
  Home,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  RotateCcw,
  Search,
  Wrench as Tool,
  Wrench,
  X,
  Zap,
} from "lucide-react";

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

// Job Card component
function JobCard({ 
  request, 
  onClick 
}: { 
  request: MaintenanceRequest; 
  onClick: () => void;
}) {
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

  // Function to get icon for category
  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : <Tool className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="p-3">
        {/* Provider/Property info */}
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 bg-gray-200 flex items-center justify-center mr-2">
            {request.category && getCategoryIcon(request.category)}
          </div>
          <div>
            <h3 className="font-medium text-sm">{request.title}</h3>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {getRelativeTime(new Date(request.createdAt))}
            </div>
          </div>
        </div>
        
        {/* Job description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {request.description}
        </p>
        
        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {request.category && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs">
              {request.category}
            </span>
          )}
          <span className={`px-1.5 py-0.5 text-xs ${
            request.priority === "urgent" ? "bg-red-100 text-red-800" :
            request.priority === "high" ? "bg-orange-100 text-orange-800" :
            request.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {request.priority} priority
          </span>
          <span className={`px-1.5 py-0.5 text-xs ${
            request.status === "pending" ? "bg-amber-100 text-amber-800" :
            request.status === "in progress" ? "bg-blue-100 text-blue-800" :
            request.status === "completed" ? "bg-green-100 text-green-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {request.status}
          </span>
        </div>
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    
    // Filter by search term
    if (searchTerm) {
      requests = requests.filter(request => 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      requests = requests.filter(request => 
        request.category === selectedCategory
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

  // Main UI - Behance inspired design
  return (
    <DashLayout>
      {/* Hero section with colorful background */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Maintenance Jobs</h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl">
            Find reliable professionals or post your property maintenance needs
          </p>
          <Button 
            onClick={() => setIsNewRequestOpen(true)} 
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Post a job
          </Button>
        </div>
      </div>

      {/* Search bar and filters */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search jobs by keyword" 
                className="pl-10 bg-white border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select 
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <SelectTrigger className="w-[140px] border-gray-300">
                  <SelectValue placeholder="Job Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Jobs</SelectItem>
                  <SelectItem value="completed">Completed Jobs</SelectItem>
                  <SelectItem value="cancelled">Cancelled Jobs</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedCategory || "all-categories"} 
                onValueChange={(value) => setSelectedCategory(value === "all-categories" ? null : value)}
              >
                <SelectTrigger className="w-[180px] border-gray-300">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        {category.icon}
                        <span className="ml-2">{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {activeTab === "active" ? "Active Jobs" : 
               activeTab === "completed" ? "Completed Jobs" : 
               "Cancelled Jobs"}
              <span className="ml-2 text-sm text-gray-500">
                {filteredRequests.length} {filteredRequests.length === 1 ? "job" : "jobs"}
              </span>
            </h2>
            
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
              variant="outline"
              className="text-sm"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Clear Filters
            </Button>
          </div>

          {/* No jobs state */}
          {filteredRequests.length === 0 && (
            <div className="bg-white rounded-lg border p-12 text-center">
              <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5">
                <Tool className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No maintenance jobs found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm || selectedCategory ? 
                  "Try adjusting your search criteria for better results." :
                  activeTab === "active" ? 
                    "There are no active maintenance jobs at the moment." :
                    activeTab === "completed" ?
                      "You don't have any completed maintenance jobs yet." :
                      "You don't have any cancelled maintenance jobs."
                }
              </p>
              {activeTab === "active" && !searchTerm && !selectedCategory && (
                <Button onClick={() => setIsNewRequestOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post a job
                </Button>
              )}
            </div>
          )}

          {/* Job listings in a grid */}
          {filteredRequests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <JobCard
                  key={request.id}
                  request={request}
                  onClick={() => handleViewRequest(request)}
                />
              ))}
            </div>
          )}

          {/* Featured Providers Section */}
          {activeTab === "active" && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-5">Top Maintenance Providers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border">
                  <div className="p-3">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 bg-blue-100 flex items-center justify-center mr-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Mpho Khumalo</h3>
                        <div className="text-xs text-gray-500">
                          Plumbing
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={`h-3 w-3 ${star <= 5 ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                      <span className="ml-1 text-xs text-gray-600">4.9</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      Plumbing repairs and installations. 8+ years experience.
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs">View Profile</Button>
                  </div>
                </div>
                
                <div className="bg-white border">
                  <div className="p-3">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 bg-yellow-100 flex items-center justify-center mr-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Tebogo Moitwa</h3>
                        <div className="text-xs text-gray-500">
                          Electrical
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={`h-3 w-3 ${star <= 4 ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                      <span className="ml-1 text-xs text-gray-600">4.1</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      Licensed electrician for residential & commercial systems.
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs">View Profile</Button>
                  </div>
                </div>
                
                <div className="bg-white border">
                  <div className="p-3">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 bg-green-100 flex items-center justify-center mr-2">
                        <Building className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Lesego Selina</h3>
                        <div className="text-xs text-gray-500">
                          General
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={`h-3 w-3 ${star <= 5 ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                      <span className="ml-1 text-xs text-gray-600">4.8</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      Contractor for structural repairs and renovations.
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs">View Profile</Button>
                  </div>
                </div>
                
                <div className="bg-white border">
                  <div className="p-3">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 bg-orange-100 flex items-center justify-center mr-2">
                        <Tool className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Thato Mabe</h3>
                        <div className="text-xs text-gray-500">
                          Appliance
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={`h-3 w-3 ${star <= 4 ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                      <span className="ml-1 text-xs text-gray-600">4.2</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      Specializes in kitchen and household appliance repair.
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs">View Profile</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog for new maintenance request */}
      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post a maintenance job</DialogTitle>
            <DialogDescription>
              Describe the maintenance issue you need help with. Be as detailed as possible.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Leaking Kitchen Faucet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center">
                                <span className="mr-2">{category.icon}</span>
                                {category.label}
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
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
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe the issue in detail..." 
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
                      <FormLabel>Allow Entry When Not Home</FormLabel>
                      <FormDescription>
                        If checked, maintenance personnel may enter your unit when you're not present.
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
                    <FormLabel>Preferred Maintenance Time</FormLabel>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                    >
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="morning" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">Morning</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="afternoon" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">Afternoon</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="evening" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">Evening</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="anytime" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">Anytime</FormLabel>
                      </FormItem>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Hidden property_id field */}
              <input 
                type="hidden" 
                {...form.register("property_id", { 
                  value: property?.id || 0
                })}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Post Job
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for maintenance request details */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedRequest.title}</DialogTitle>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedRequest.priority === "urgent" ? "bg-red-100 text-red-800" :
                    selectedRequest.priority === "high" ? "bg-orange-100 text-orange-800" :
                    selectedRequest.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {selectedRequest.priority} priority
                  </span>
                </div>
                <DialogDescription>
                  Posted on {formatDateTime(new Date(selectedRequest.createdAt))}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Job Description</h4>
                  <p className="text-sm text-gray-600">{selectedRequest.description}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Job Details</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-500">Status:</div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedRequest.status === "pending" ? "bg-amber-100 text-amber-800" :
                        selectedRequest.status === "in progress" ? "bg-blue-100 text-blue-800" :
                        selectedRequest.status === "completed" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    
                    <div className="text-gray-500">Category:</div>
                    <div className="capitalize">{selectedRequest.category || "Not specified"}</div>
                    
                    <div className="text-gray-500">Priority:</div>
                    <div className="capitalize">{selectedRequest.priority}</div>
                    
                    <div className="text-gray-500">Location:</div>
                    <div>{property?.address || "Unknown"}</div>
                    
                    {selectedRequest.allowEntry !== undefined && (
                      <>
                        <div className="text-gray-500">Allow entry when absent:</div>
                        <div>{selectedRequest.allowEntry ? "Yes" : "No"}</div>
                      </>
                    )}
                    
                    {selectedRequest.preferredTime && (
                      <>
                        <div className="text-gray-500">Preferred time:</div>
                        <div className="capitalize">{selectedRequest.preferredTime}</div>
                      </>
                    )}
                  </div>
                </div>
                
                {selectedRequest.status === "pending" && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Job Status</h4>
                    <p className="text-sm text-blue-600">
                      This job is open and waiting for maintenance providers to submit quotes.
                    </p>
                  </div>
                )}
                
                {selectedRequest.status === "in progress" && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Job Status</h4>
                    <p className="text-sm text-blue-600">
                      A maintenance provider has been assigned and is currently working on this job.
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2">
                {selectedRequest.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={handleCancelRequest}
                    className="text-red-500"
                    disabled={cancelRequestMutation.isPending}
                  >
                    {cancelRequestMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cancel Job
                  </Button>
                )}
                <Button
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashLayout>
  );
}