import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { MaintenanceRequest, Property } from "@shared/schema";
import SummaryCard from "@/components/dashboard/SummaryCard";
import MaintenanceRequestCard from "@/components/maintenance/MaintenanceRequestCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { 
  Loader2, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Calendar, 
  AlertTriangle,
  Check,
  X
} from "lucide-react";

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch assigned maintenance requests
  const { 
    data: assignedRequests,
    isLoading: isLoadingAssigned,
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/assigned"],
  });

  // We would typically fetch available maintenance jobs
  // For now, let's create a placeholder query
  const { 
    data: availableRequests,
    isLoading: isLoadingAvailable,
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/status", "pending"],
  });

  const isLoading = isLoadingAssigned || isLoadingAvailable;

  // Count requests by status
  const pendingCount = assignedRequests?.filter(r => r.status === "pending").length || 0;
  const inProgressCount = assignedRequests?.filter(r => r.status === "in progress").length || 0;
  const completedCount = assignedRequests?.filter(r => r.status === "completed").length || 0;

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return;
    
    try {
      await apiRequest("PATCH", `/api/maintenance/${selectedRequest.id}`, {
        status,
        updatedAt: new Date()
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/assigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/status", "pending"] });
      
      toast({
        title: "Success",
        description: "Maintenance request status updated successfully",
      });
      
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update maintenance request status",
        variant: "destructive",
      });
    }
  };

  const handleTakeJob = async () => {
    if (!selectedRequest) return;
    
    try {
      await apiRequest("PATCH", `/api/maintenance/${selectedRequest.id}`, {
        assignedToId: user?.id,
        status: "in progress",
        updatedAt: new Date()
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/assigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/status", "pending"] });
      
      toast({
        title: "Success",
        description: "Job assigned to you successfully",
      });
      
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to take the job",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = assignedRequests?.filter(request => {
    if (statusFilter === "all") return true;
    return request.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-500">Here's an overview of your maintenance tasks.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Pending"
          subtitle="Awaiting action"
          value={`${pendingCount}`}
          valueSubtext="Assigned to you"
          icon={AlertTriangle}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-500"
          actionLabel="View Pending"
          onAction={() => setStatusFilter("pending")}
        />

        <SummaryCard
          title="In Progress"
          subtitle="Active jobs"
          value={`${inProgressCount}`}
          valueSubtext="Being worked on"
          icon={Clock}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-500"
          actionLabel="View In Progress"
          onAction={() => setStatusFilter("in progress")}
        />

        <SummaryCard
          title="Completed"
          subtitle="Finished tasks"
          value={`${completedCount}`}
          valueSubtext="This month"
          icon={CheckCircle2}
          iconBgColor="bg-green-50"
          iconColor="text-green-500"
          actionLabel="View Completed"
          onAction={() => setStatusFilter("completed")}
        />
      </div>

      <Tabs defaultValue="assigned" className="mb-8">
        <TabsList className="grid w-full md:w-auto grid-cols-2 mb-4">
          <TabsTrigger value="assigned">My Assignments</TabsTrigger>
          <TabsTrigger value="available">Available Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assigned" className="mt-0">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">My Maintenance Tasks</h3>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {filteredRequests && filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRequests.map((request) => (
                <MaintenanceRequestCard
                  key={request.id}
                  request={request}
                  onClick={() => setSelectedRequest(request)}
                  actionLabel={
                    request.status === "pending" 
                      ? "Start Job" 
                      : request.status === "in progress" 
                        ? "Mark Complete" 
                        : "View Details"
                  }
                  onAction={() => setSelectedRequest(request)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 shadow-card text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
              <p className="text-gray-500 mb-4">
                {statusFilter === "all" 
                  ? "You don't have any maintenance tasks assigned to you." 
                  : `You don't have any ${statusFilter} tasks.`}
              </p>
              <Button onClick={() => setStatusFilter("all")}>View All Tasks</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-0">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Available Maintenance Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableRequests && availableRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableRequests.map((request) => (
                    <MaintenanceRequestCard
                      key={request.id}
                      request={request}
                      onClick={() => setSelectedRequest(request)}
                      actionLabel="Take Job"
                      onAction={() => setSelectedRequest(request)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No available jobs at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Maintenance Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        {selectedRequest && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Maintenance Request Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-2">
              <div className="flex justify-between">
                <Badge variant="outline" className="bg-gray-100">
                  ID: #{selectedRequest.id}
                </Badge>
                <Badge className="bg-primary/10 text-primary">
                  {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)} Priority
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-semibold">{selectedRequest.title}</h3>
                <p className="text-gray-500 text-sm">
                  Submitted on {formatDateTime(selectedRequest.createdAt)}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-gray-600 whitespace-pre-line">{selectedRequest.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Property Details</h4>
                <p className="text-gray-600">Property ID: {selectedRequest.propertyId}</p>
                <p className="text-gray-600">Tenant ID: {selectedRequest.tenantId}</p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Current Status</h4>
                <div className="flex items-center">
                  {selectedRequest.status === "pending" && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  )}
                  {selectedRequest.status === "in progress" && (
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  )}
                  {selectedRequest.status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  )}
                  <span className="capitalize">{selectedRequest.status}</span>
                </div>
              </div>

              {/* Action buttons based on request status and whether it's assigned or available */}
              <div className="pt-4 flex justify-end gap-3">
                {selectedRequest.assignedToId === user?.id ? (
                  // For assigned maintenance tasks
                  <>
                    {selectedRequest.status === "pending" && (
                      <Button onClick={() => handleUpdateStatus("in progress")}>
                        <Clock className="h-4 w-4 mr-2" />
                        Start Job
                      </Button>
                    )}
                    {selectedRequest.status === "in progress" && (
                      <Button onClick={() => handleUpdateStatus("completed")}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </>
                ) : (
                  // For available jobs
                  <Button onClick={handleTakeJob}>
                    <Check className="h-4 w-4 mr-2" />
                    Take Job
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
