import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';

interface MaintenanceRequest {
  id: number;
  property: string;
  issue: string;
  tenant: string;
  date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
}

interface MaintenanceTableProps {
  requests: MaintenanceRequest[];
  isLoading?: boolean;
  onAssign?: (id: number) => void;
  onViewDetails?: (id: number) => void;
  className?: string;
}

export function MaintenanceTable({
  requests,
  isLoading = false,
  onAssign,
  onViewDetails,
  className,
}: MaintenanceTableProps) {
  const getPriorityBadge = (priority: MaintenanceRequest['priority']) => {
    const styles = {
      urgent: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    
    return (
      <span className={cn(
        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
        styles[priority]
      )}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };
  
  const getStatusBadge = (status: MaintenanceRequest['status']) => {
    const styles = {
      pending: "bg-gray-100 text-gray-800",
      assigned: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    
    const label = status === 'in_progress' 
      ? 'In Progress' 
      : status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <span className={cn(
        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
        styles[status]
      )}>
        {label}
      </span>
    );
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900">No maintenance requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no maintenance requests at this time.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
      className
    )}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.property}</TableCell>
                <TableCell>{request.issue}</TableCell>
                <TableCell>{request.tenant}</TableCell>
                <TableCell>{request.date}</TableCell>
                <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onAssign && (
                        <DropdownMenuItem onClick={() => onAssign(request.id)}>
                          Assign
                        </DropdownMenuItem>
                      )}
                      {onViewDetails && (
                        <DropdownMenuItem onClick={() => onViewDetails(request.id)}>
                          View Details
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
