import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, Home, Building, Users, Wrench, FileText, 
  MessageSquare, Settings, LogOut, DollarSign, 
  Search, Bell, ChevronRight, LayoutDashboard, PieChart
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRoleType } from "@shared/schema";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  notification?: number;
}

interface MobileNavProps {
  role: UserRoleType;
}

export default function MobileNav({ role }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Determine navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const roleSpecificItems: Record<UserRoleType, NavItem[]> = {
      landlord: [
        {
          href: "/landlord/dashboard",
          icon: LayoutDashboard,
          label: "Overview",
          active: location.includes("dashboard"),
        },
        {
          href: "/landlord/properties",
          icon: Building,
          label: "Properties",
          active: location.includes("properties"),
        },
        {
          href: "/landlord/tenants",
          icon: Users,
          label: "Tenants",
          active: location.includes("tenants"),
        },
        {
          href: "/landlord/finances",
          icon: DollarSign,
          label: "Finances",
          active: location.includes("finance"),
        },
        {
          href: "/landlord/maintenance",
          icon: Wrench,
          label: "Maintenance",
          active: location.includes("maintenance"),
          notification: 3,
        },
        {
          href: "/landlord/documents",
          icon: FileText,
          label: "Documents",
          active: location.includes("documents"),
        },
        {
          href: "/landlord/messages",
          icon: MessageSquare,
          label: "Messages",
          active: location.includes("messages"),
          notification: 2,
        }
      ],
      tenant: [
        {
          href: "/tenant/dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
          active: location.includes("dashboard"),
        },
        {
          href: "/tenant/properties",
          icon: Building,
          label: "My Rental",
          active: location.includes("properties"),
        },
        {
          href: "/tenant/maintenance",
          icon: Wrench,
          label: "Maintenance",
          active: location.includes("maintenance"),
        },
        {
          href: "/tenant/documents",
          icon: FileText,
          label: "Documents",
          active: location.includes("documents"),
        },
        {
          href: "/tenant/messages",
          icon: MessageSquare,
          label: "Messages",
          active: location.includes("messages"),
        }
      ],
      agency: [
        {
          href: "/agency/dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
          active: location.includes("dashboard"),
        },
        {
          href: "/agency/properties",
          icon: Building,
          label: "Properties",
          active: location.includes("properties"),
        },
        {
          href: "/agency/tenants",
          icon: Users,
          label: "Tenants",
          active: location.includes("tenants"),
        },
        {
          href: "/agency/documents",
          icon: FileText,
          label: "Documents",
          active: location.includes("documents"),
        },
        {
          href: "/agency/messages",
          icon: MessageSquare,
          label: "Messages",
          active: location.includes("messages"),
        }
      ],
      maintenance: [
        {
          href: "/maintenance/dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
          active: location.includes("dashboard"),
        },
        {
          href: "/maintenance/jobs",
          icon: Wrench,
          label: "Jobs",
          active: location.includes("jobs"),
          notification: 5,
        },
        {
          href: "/maintenance/documents",
          icon: FileText,
          label: "Documents",
          active: location.includes("documents"),
        },
        {
          href: "/maintenance/messages",
          icon: MessageSquare,
          label: "Messages",
          active: location.includes("messages"),
        }
      ],
    };

    return roleSpecificItems[role];
  };

  const navItems: NavItem[] = getNavItems();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-lg ml-2 dark:text-white">TOV</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300 relative" />
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-0.5 -right-0.5"></div>
              <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {user.firstName && user.lastName 
                    ? getInitials(user.firstName, user.lastName) 
                    : user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
                <AvatarImage src={user.profileImage || ""} />
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer Menu */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsOpen(false)} 
        />
        
        {/* Drawer */}
        <div 
          className={`absolute top-0 bottom-0 left-0 w-[280px] max-w-[80vw] bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* User Section */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-11 w-11 border">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.firstName && user.lastName 
                    ? getInitials(user.firstName, user.lastName) 
                    : user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
                <AvatarImage src={user.profileImage || ""} />
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username}
                </p>
                <Badge variant="outline" className="text-xs mt-0.5 font-normal">
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="px-2 py-3 overflow-y-auto h-[calc(100%-160px)]">
            <div className="space-y-1">
              {navItems.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-2.5 rounded-lg relative",
                    item.active 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  {item.notification && (
                    <Badge variant="destructive" className="ml-auto text-white text-xs">
                      {item.notification}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Link
                href={`/${role}/settings`}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">Settings</span>
              </Link>
              
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 rounded-lg mt-1"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}