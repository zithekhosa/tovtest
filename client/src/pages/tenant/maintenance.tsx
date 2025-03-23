import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { MaintenanceRequest, Lease } from "@shared/schema";
import MaintenanceRequestCard from "@/components/maintenance/MaintenanceRequestCard";
import MaintenanceRequestForm from "@/components/maintenance/MaintenanceRequestForm";
import { formatDateTime } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Plus, 
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TenantMaintenance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch active lease for the tenant
  const { 
    data: leases,
    isLoading: isLoadingLeases,
  } = useQuery<Lease[]>({
    queryKey: ["/api/leases/tenant"],
  });

  // Find the active lease
  const activeLease = leases?.find(lease => lease.active === true);

  // Fetch maintenance requests
  const { 
    data: maintenanceRequests,
    isLoading: isLoadingMaintenance
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/tenant"],
  });

  const isLoading = isLoadingLeases || isLoadingMaintenance;

  const handleSubmitMaintenanceRequest = async (formData: any) => {
    if (!activeLease) {
      toast({
        title: "Error",
        description: "You need an active lease to submit a maintenance request",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestData = {
        propertyId: activeLease.propertyId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: "pending",
        images: formData.images?.map((file: File) => URL.createObjectURL(file)) || [],
      };

      await apiRequest("POST", "/api/maintenance", requestData);
      
      // Invalidate maintenance requests to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/tenant"] });
      
      toast({
        title: "Success",
        description: "Maintenance request submitted successfully",
      });
      
      setShowMaintenanceModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit maintenance request",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = maintenanceRequests?.filter(request => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return request.status === "pending" || request.status === "in progress";
    return request.status === statusFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-6 w-6 text-green-500 mr-2" />;
      case "in progress":
        return <Clock className="h-6 w-6 text-blue-500 mr-2" />;
      case "pending":
        return <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-500 mr-2" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Maintenance Requests</h1>
          <p className="text-gray-500">View and manage your maintenance tickets</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="active">Active Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowMaintenanceModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Maintenance Request List */}
      {filteredRequests && filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <MaintenanceRequestCard
              key={request.id}
              request={request}
              onClick={() => setSelectedRequest(request)}
              actionLabel="View Details"
              onAction={() => setSelectedRequest(request)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-card text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Maintenance Requests</h3>
          <p className="text-gray-500 mb-4">You haven't submitted any maintenance requests yet.</p>
          <Button onClick={() => setShowMaintenanceModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Submit First Request
          </Button>
        </div>
      )}

      {/* Maintenance Request Modal */}
      <MaintenanceRequestForm
        propertyId={activeLease?.propertyId || 0}
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        onSubmit={handleSubmitMaintenanceRequest}
      />

      {/* Maintenance Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        {selectedRequest && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {getStatusIcon(selectedRequest.status)}
                Maintenance Request
              </DialogTitle>
              <DialogDescription>
                Details of your maintenance request
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
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
                <h4 className="font-medium mb-1">Status Updates</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Current Status:</span> {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </p>
                  {selectedRequest.updatedAt && (
                    <p className="text-sm text-gray-500">
                      Last updated: {formatDateTime(selectedRequest.updatedAt)}
                    </p>
                  )}
                </div>
              </div>

              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Attached Photos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRequest.images.map((image, index) => (
                      <div key={index} className="bg-gray-100 rounded-md h-24 flex items-center justify-center">
                        <img src={image} alt={`Maintenance request ${index + 1}`} className="max-h-full rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button onClick={() => setSelectedRequest(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
