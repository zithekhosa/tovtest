import { useState } from "react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashLayout from "@/components/layout/DashLayout";
import { MaintenanceRequest } from "@shared/schema";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Loader2
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  
  // Fetch maintenance requests assigned to this provider
  const { data: assignedRequests = [], isLoading: isLoadingAssigned } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/assigned"],
    enabled: !!user && user.role === 'maintenance',
  });

  // Fetch available jobs (not assigned to anyone)
  const { data: availableJobs = [], isLoading: isLoadingAvailable } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/available"],
    enabled: !!user && user.role === 'maintenance',
  });

  const isLoading = isLoadingAssigned || isLoadingAvailable;

  const activeJobs = assignedRequests.filter(job => job.status === 'in_progress' || job.status === 'assigned');
  const completedJobs = assignedRequests.filter(job => job.status === 'completed');
  
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.estimatedCost || 0), 0);

  // Debug logging (remove in production)
  React.useEffect(() => {
    if (assignedRequests.length > 0) {
      console.log('🔧 Assigned requests:', assignedRequests);
    }
    if (availableJobs.length > 0) {
      console.log('📋 Available jobs:', availableJobs);
    }
  }, [assignedRequests, availableJobs]);

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="max-w-[1600px] mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Maintenance Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Welcome back, {user?.firstName}! Here are your current jobs and opportunities.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-center">
                <div className="text-heading-2">{activeJobs.length}</div>
                <div className="text-sm text-blue-100">Active Jobs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Wrench className="h-4 w-4 mr-2" />
                Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{activeJobs.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success-foreground">{completedJobs.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{formatCurrency(totalEarnings)}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning-foreground">{availableJobs.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Jobs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              Your Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-body-large mb-2">No Active Jobs</h3>
                <p>Check the available jobs section below to find new work opportunities.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <p className="text-gray-600 mb-3">{job.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(job.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            Property #{job.propertyId}
                          </span>
                          {job.category && (
                            <span className="flex items-center capitalize">
                              <Wrench className="h-4 w-4 mr-1" />
                              {job.category}
                            </span>
                          )}
                          {job.estimatedCost && (
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatCurrency(job.estimatedCost)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          variant={job.priority === 'urgent' ? 'destructive' : 
                                 job.priority === 'high' ? 'default' : 'secondary'}
                        >
                          {job.priority} priority
                        </Badge>
                        <Badge variant="outline">
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Client
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Jobs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Available Job Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-body-large mb-2">No Available Jobs</h3>
                <p>Check back later for new maintenance requests in your area.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <p className="text-gray-600 mb-3">{job.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(job.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            Property #{job.propertyId}
                          </span>
                          {job.category && (
                            <span className="flex items-center capitalize">
                              <Wrench className="h-4 w-4 mr-1" />
                              {job.category}
                            </span>
                          )}
                          {job.estimatedCost && (
                            <span className="flex items-center text-success-foreground font-medium">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatCurrency(job.estimatedCost)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          variant={job.priority === 'urgent' ? 'destructive' : 
                                 job.priority === 'high' ? 'default' : 'secondary'}
                        >
                          {job.priority} priority
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button size="sm" className="bg-success hover:bg-success">
                        Accept Job
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                
                {availableJobs.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">
                      View All {availableJobs.length} Available Jobs
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashLayout>
  );
}