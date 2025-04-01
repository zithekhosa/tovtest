import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, Home, Building, Users, Wrench, FileText, 
  MessageSquare, Settings, LogOut, DollarSign, 
  Search, Bell, User as UserIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    const baseItems: NavItem[] = [
      {
        href: role === "tenant" ? "/tenant/dashboard" : role === "landlord" ? "/landlord/dashboard" : role === "agency" ? "/agency/dashboard" : "/maintenance/dashboard",
        icon: Home,
        label: "Home",
        active: location.includes("dashboard"),
      },
      {
        href: `/${role}/messages`,
        icon: MessageSquare,
        label: "Messages",
        active: location.includes("messages"),
        notification: 2,
      }
    ];

    const roleSpecificItems: Record<UserRoleType, NavItem[]> = {
      landlord: [
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
          href: "/landlord/financial-management",
          icon: DollarSign,
          label: "Finances",
          active: location.includes("financial-management"),
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
      ],
      tenant: [
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
      ],
      agency: [
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
      ],
      maintenance: [
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
      ],
    };

    return [...baseItems, ...roleSpecificItems[role]];
  };

  const navItems: NavItem[] = getNavItems();
  const tabItems = navItems.slice(0, 5); // Show only 5 items in the tab bar

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <>
      {/* Facebook-like Mobile Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-lg dark:text-white">TOV</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 dark:bg-gray-800">
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
            
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 dark:bg-gray-800 relative">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-gray-100 dark:bg-gray-800"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Facebook-style Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex justify-around items-center py-1">
          {tabItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "flex flex-col items-center px-2 py-1 rounded-md relative",
                item.active 
                  ? "text-primary" 
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <item.icon className="h-6 w-6 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.notification && (
                <span className="absolute top-0 right-1/4 bg-red-500 text-white text-[10px] font-medium min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                  {item.notification}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Full-screen Facebook-style drawer menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden">
          <div className="h-full w-full max-w-[320px] sm:max-w-sm ml-auto bg-white dark:bg-gray-900 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="text-xl font-semibold">Menu</div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User profile section */}
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.firstName && user.lastName 
                      ? getInitials(user.firstName, user.lastName) 
                      : user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lg truncate">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </p>
                  <Link 
                    href={`/${role}/profile`}
                    className="text-sm text-primary hover:underline truncate"
                  >
                    View your profile
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Shortcuts section */}
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2">
                {navItems.slice(0, 4).map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg",
                      item.active && "bg-primary/5 dark:bg-primary/10"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                      item.active ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" 
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium truncate max-w-full">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* All menu items section */}
            <div className="flex-1 overflow-y-auto py-2 px-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-3 pt-2">All menu</h3>
              <div className="space-y-0.5">
                {navItems.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg",
                      item.active && "bg-primary/5 dark:bg-primary/10 text-primary"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                      item.active ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" 
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {item.notification && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-medium min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
                        {item.notification}
                      </span>
                    )}
                  </Link>
                ))}
                
                <Link
                  href={`/${role}/settings`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Settings</span>
                </Link>
              </div>
            </div>

            {/* Logout section */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="outline"
                className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-3 h-5 w-5 shrink-0" />
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}