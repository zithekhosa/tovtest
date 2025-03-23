import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { MaintenanceTable } from "@/components/dashboard/maintenance-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, DownloadCloud, Upload, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceRequest } from "@shared/schema";

interface FormattedMaintenanceRequest {
  id: number;
  property: string;
  issue: string;
  tenant: string;
  date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
}

export default function Maintenance() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch maintenance requests
  const { data: maintenanceRequests = [], isLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance-requests"],
    enabled: !!user,
  });

  // Format maintenance requests for the table component
  const formattedRequests: FormattedMaintenanceRequest[] = maintenanceRequests.map(request => ({
    id: request.id,
    property: "Property Name", // This would be fetched in a real implementation
    issue: request.title,
    tenant: "Tenant Name", // This would be fetched in a real implementation
    date: new Date(request.submittedAt).toLocaleDateString(),
    priority: request.priority,
    status: request.status,
  }));

  // Filter requests based on active tab and status filter
  const filteredRequests = formattedRequests.filter(request => {
    if (activeTab === "all") {
      if (statusFilter === "all") return true;
      return request.status === statusFilter;
    }
    
    if (activeTab === "urgent") {
      if (statusFilter === "all") return request.priority === "urgent";
      return request.priority === "urgent" && request.status === statusFilter;
    }
    
    if (activeTab === "pending") {
      if (statusFilter === "all") return request.status === "pending";
      return request.status === statusFilter && request.status === "pending";
    }
    
    if (activeTab === "completed") {
      if (statusFilter === "all") return request.status === "completed";
      return request.status === statusFilter && request.status === "completed";
    }
    
    return true;
  });

  const handleAssign = (id: number) => {
    navigate(`/maintenance/${id}/assign`);
  };

  const handleViewDetails = (id: number) => {
    navigate(`/maintenance/${id}`);
  };

  // Different view based on user role
  const renderMaintenanceContent = () => {
    if (user?.role === "tenant") {
      return (
        <>
          <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Maintenance Requests</h1>
              <p className="text-gray-500 mt-1">Submit and track maintenance issues</p>
            </div>
            <Link href="/maintenance/new">
              <Button className="mt-4 md:mt-0">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </Link>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formattedRequests.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formattedRequests.filter(r => r.status === "pending" || r.status === "assigned" || r.status === "in_progress").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formattedRequests.filter(r => r.status === "completed").length}</div>
              </CardContent>
            </Card>
          </div>
          
          <MaintenanceTable
            requests={filteredRequests}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />
        </>
      );
    }
    
    if (user?.role === "landlord") {
      return (
        <>
          <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Maintenance Management</h1>
              <p className="text-gray-500 mt-1">Track and assign maintenance requests</p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button variant="outline">
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formattedRequests.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formattedRequests.filter(r => r.priority === "urgent").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formattedRequests.filter(r => r.status === "pending").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formattedRequests.filter(r => r.status === "completed").length}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <TabsList>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="urgent">Urgent</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center space-x-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Tabs>
            </CardHeader>
            <CardContent>
              <MaintenanceTable
                requests={filteredRequests}
                isLoading={isLoading}
                onAssign={handleAssign}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </>
      );
    }
    
    if (user?.role === "maintenance") {
      return (
        <>
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Maintenance Jobs</h1>
            <p className="text-gray-500 mt-1">Track your assigned maintenance tasks</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formattedRequests.filter(r => r.status === "assigned").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formattedRequests.filter(r => r.status === "in_progress").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formattedRequests.filter(r => r.status === "completed").length}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Assigned Jobs</CardTitle>
              <CardDescription>Update the status of your maintenance assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <MaintenanceTable
                requests={filteredRequests.filter(r => r.status === "assigned" || r.status === "in_progress")}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500">You don't have permission to view this page.</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading maintenance requests...</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      {renderMaintenanceContent()}
    </DashLayout>
  );
}
