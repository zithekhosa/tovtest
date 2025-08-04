import { UserRoleType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Search, 
  Plus, 
  Filter, 
  CalendarPlus, 
  MessageSquarePlus, 
  UserPlus, 
  Building, 
  Wrench 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showActions?: boolean;
}

export function DashboardHeader({ title, subtitle, showSearch = true, showActions = true }: DashboardHeaderProps) {
  const { user } = useAuth();
  const role = user?.role as UserRoleType;

  // Get role-specific actions for the action button
  const getRoleActions = () => {
    switch(role) {
      case 'landlord':
        return [
          { 
            label: 'Add Property', 
            icon: <Building className="h-4 w-4 mr-2" />,
            action: () => console.log('Add property clicked')
          },
          { 
            label: 'Add Tenant', 
            icon: <UserPlus className="h-4 w-4 mr-2 shrink-0" />,
            action: () => console.log('Add tenant clicked')
          },
          { 
            label: 'Schedule Maintenance', 
            icon: <Wrench className="h-4 w-4 mr-2 shrink-0" />,
            action: () => console.log('Schedule maintenance clicked')
          }
        ];

      case 'tenant':
        return [
          { 
            label: 'Submit Maintenance Request', 
            icon: <Wrench className="h-4 w-4 mr-2 shrink-0" />,
            action: () => console.log('Maintenance request clicked')
          },
          { 
            label: 'Schedule Payment', 
            icon: <CalendarPlus className="h-4 w-4 mr-2 shrink-0" />,
            action: () => console.log('Schedule payment clicked')
          },
          { 
            label: 'Message Landlord', 
            icon: <MessageSquarePlus className="h-4 w-4 mr-2 shrink-0" />,
            action: () => console.log('Message landlord clicked')
          }
        ];

      case 'agency':
        return [
          { 
            label: 'Add Property Listing', 
            icon: <Building className="h-4 w-4 mr-2" />,
            action: () => console.log('Add property listing clicked')
          },
          { 
            label: 'Add Client', 
            icon: <UserPlus className="h-4 w-4 mr-2 shrink-0" />,
            action: () => console.log('Add client clicked')
          },
          { 
            label: 'Schedule Viewing', 
            icon: <CalendarPlus className="h-4 w-4 mr-2 shrink-0" />,
            action: () => console.log('Schedule viewing clicked')
          }
        ];

      case 'maintenance':
        return [
          { 
            label: 'Find Available Jobs', 
            icon: <Search className="h-4 w-4 mr-2" />,
            action: () => console.log('Find jobs clicked')
          },
          { 
            label: 'Update Job Status', 
            icon: <Wrench className="h-4 w-4 mr-2 shrink-0" />,
            action: () => console.log('Update job clicked')
          },
          { 
            label: 'Message Client', 
            icon: <MessageSquarePlus className="h-4 w-4 mr-2 shrink-0" />,
            action: () => console.log('Message client clicked')
          }
        ];

      default:
        return [];
    }
  };

  const roleActions = getRoleActions();

  return (
    <div className="flex flex-col space-y-4 pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-heading-2 tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  <DropdownMenuItem className="cursor-pointer flex flex-col items-start">
                    <div className="font-medium">New Maintenance Request</div>
                    <div className="text-sm text-muted-foreground">A maintenance request has been submitted</div>
                    <div className="text-xs text-muted-foreground mt-1">2 minutes ago</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex flex-col items-start">
                    <div className="font-medium">Rent Payment Received</div>
                    <div className="text-sm text-muted-foreground">Rent payment for November has been received</div>
                    <div className="text-xs text-muted-foreground mt-1">Yesterday</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex flex-col items-start">
                    <div className="font-medium">Lease Expiring Soon</div>
                    <div className="text-sm text-muted-foreground">Your lease will expire in 30 days</div>
                    <div className="text-xs text-muted-foreground mt-1">2 days ago</div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-center font-medium text-primary">
                  View All Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Actions Button */}
            {roleActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2 shrink-0" />
                    Quick Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roleActions.map((action, index) => (
                    <DropdownMenuItem 
                      key={index} 
                      className="cursor-pointer"
                      onClick={action.action}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {showSearch && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-8 bg-background"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}