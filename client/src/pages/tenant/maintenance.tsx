import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashLayout } from "@/layout/dash-layout";
import { useAuth } from "@/hooks/use-auth";
import { Lease, MaintenanceRequest, Property } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { 
  Loader2, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Plus,
  Filter,
  Search,
  X
} from "lucide-react";

// Form schema for maintenance requests
const maintenanceFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description cannot exceed 500 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  property_id: z.number(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

// Priority badge colors
const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

// Status badge colors
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  "in progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function TenantMaintenance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
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
    data: maintenanceRequests,
    isLoading: isLoadingRequests
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/tenant"],
  });

  const isLoading = isLoadingLeases || isLoadingProperty || isLoadingRequests;

  // Setup form for creating maintenance requests
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      property_id: activeLease?.propertyId || 0,
    },
  });

  // Create mutation for submitting maintenance requests
  const createMaintenanceMutation = useMutation({
    mutationFn: async (values: MaintenanceFormValues) => {
      const requestData = {
        propertyId: values.property_id,
        tenantId: user?.id,
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: "pending",
        createdAt: new Date(),
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
      setIsRequestDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit maintenance request",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: MaintenanceFormValues) => {
    createMaintenanceMutation.mutate(values);
  };

  // Cancel maintenance request
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
      setIsDetailDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel maintenance request",
        variant: "destructive",
      });
    },
  });

  // Handle cancelling a request
  const handleCancelRequest = (requestId: number) => {
    if (confirm("Are you sure you want to cancel this request?")) {
      cancelRequestMutation.mutate(requestId);
    }
  };

  // Filter maintenance requests
  const filteredRequests = maintenanceRequests?.filter(request => {
    // Filter by status
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !request.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Group requests by status for the counter
  const requestCounts = {
    all: maintenanceRequests?.length || 0,
    pending: maintenanceRequests?.filter(r => r.status === "pending").length || 0,
    "in progress": maintenanceRequests?.filter(r => r.status === "in progress").length || 0,
    completed: maintenanceRequests?.filter(r => r.status === "completed").length || 0,
    cancelled: maintenanceRequests?.filter(r => r.status === "cancelled").length || 0,
  };

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashLayout>
    );
  }

  if (!activeLease || !property) {
    return (
      <DashLayout>
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Active Lease Found</h2>
          <p className="text-gray-500 mb-4">You need an active lease to access maintenance features.</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
            <p className="text-gray-500">Manage your maintenance requests</p>
          </div>
          <Button onClick={() => setIsRequestDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            New Request
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Maintenance Requests</CardTitle>
            <CardDescription>
              Track the status of your property maintenance requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({requestCounts.all})</SelectItem>
                  <SelectItem value="pending">Pending ({requestCounts.pending})</SelectItem>
                  <SelectItem value="in progress">In Progress ({requestCounts["in progress"]})</SelectItem>
                  <SelectItem value="completed">Completed ({requestCounts.completed})</SelectItem>
                  <SelectItem value="cancelled">Cancelled ({requestCounts.cancelled})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredRequests && filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="border rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900">{request.title}</h3>
                          <Badge className={`ml-2 ${priorityColors[request.priority as keyof typeof priorityColors]}`}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Request #{request.id} • {formatDateTime(request.createdAt)}
                        </p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{request.description}</p>
                      </div>
                      <div className="ml-4">
                        <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No maintenance requests found</h3>
                <p className="text-gray-500 mt-1">Create a new request if you have maintenance issues</p>
                <Button className="mt-4" onClick={() => setIsRequestDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2 shrink-0" />
                  New Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Maintenance Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>New Maintenance Request</DialogTitle>
            <DialogDescription>
              Submit a request for maintenance or repairs at your property
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief title of the issue" {...field} />
                    </FormControl>
                    <FormDescription>
                      Keep it short and descriptive
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide detailed information about the issue" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the issue in detail including when it started
                    </FormDescription>
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
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low - Not urgent</SelectItem>
                        <SelectItem value="medium">Medium - Needs attention soon</SelectItem>
                        <SelectItem value="high">High - Requires prompt attention</SelectItem>
                        <SelectItem value="urgent">Urgent - Immediate attention needed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the appropriate urgency level
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <FormControl>
                      <Input
                        value={property?.address}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMaintenanceMutation.isPending}
                >
                  {createMaintenanceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Maintenance Request Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Maintenance Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">{selectedRequest.title}</h2>
                  <Badge className={statusColors[selectedRequest.status as keyof typeof statusColors]}>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Request #{selectedRequest.id}</span>
                  <span>•</span>
                  <Badge className={priorityColors[selectedRequest.priority as keyof typeof priorityColors]}>
                    {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)} Priority
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-500">
                  {selectedRequest.status === "pending" && (
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>Awaiting assignment</span>
                    </div>
                  )}
                  {selectedRequest.status === "in progress" && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-500 mr-1" />
                      <span>Work in progress</span>
                    </div>
                  )}
                  {selectedRequest.status === "completed" && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span>Work completed</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedRequest.description}</p>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="mr-2 h-4 w-4 bg-primary rounded-full mt-1"></div>
                      <div>
                        <p className="text-sm font-medium">Request Submitted</p>
                        <p className="text-xs text-gray-500">{formatDateTime(selectedRequest.createdAt)}</p>
                      </div>
                    </div>
                    
                    {selectedRequest.assignedToId && (
                      <div className="flex items-start">
                        <div className="mr-2 h-4 w-4 bg-blue-500 rounded-full mt-1"></div>
                        <div>
                          <p className="text-sm font-medium">Assigned to Maintenance Staff</p>
                          <p className="text-xs text-gray-500">{selectedRequest.updatedAt ? formatDateTime(selectedRequest.updatedAt) : "Date not recorded"}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedRequest.status === "completed" && (
                      <div className="flex items-start">
                        <div className="mr-2 h-4 w-4 bg-green-500 rounded-full mt-1"></div>
                        <div>
                          <p className="text-sm font-medium">Work Completed</p>
                          <p className="text-xs text-gray-500">{selectedRequest.completedAt ? formatDateTime(selectedRequest.completedAt) : "Date not recorded"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedRequest.notes && (
                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Notes</h3>
                    <p className="text-gray-600 text-sm">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter className="gap-2">
            {selectedRequest && selectedRequest.status === "pending" && (
              <Button 
                variant="destructive" 
                onClick={() => handleCancelRequest(selectedRequest.id)}
                disabled={cancelRequestMutation.isPending}
              >
                {cancelRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Request
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashLayout>
  );
}