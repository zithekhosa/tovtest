import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, Home, Building, Users, Wrench, FileText, 
  MessageSquare, Settings, LogOut, DollarSign, 
  Search, Bell, User as UserIcon, ChevronRight
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

interface StandardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  pageAction?: ReactNode;
  mobileTitle?: string;
}

export function StandardLayout({ 
  children, 
  title, 
  subtitle,
  pageAction,
  mobileTitle
}: StandardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return <div className="p-8 text-center">Please log in to view this page.</div>;

  const role = user.role as UserRoleType;
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return user.username.substring(0, 2).toUpperCase();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Define navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        href: `/${role}/dashboard`,
        icon: Home,
        label: "Dashboard",
        active: location.includes("dashboard") || location === `/${role}`,
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
          href: "/tenant/payments",
          icon: DollarSign,
          label: "Payments",
          active: location.includes("payments"),
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
  const mobileTabItems = navItems.slice(0, 5); // Show only 5 items in the bottom tab bar

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center px-4 mb-5">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center mr-2">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl dark:text-white">TOV</span>
          </div>
          
          {/* User Profile */}
          <div className="px-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                  {user.profileImage && <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />}
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{role}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="px-3 mt-2 flex-1">
            <div className="space-y-1">
              {navItems.map((item, index) => (
                <Link 
                  key={index} 
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-gray-700 dark:text-gray-300 rounded-lg group relative",
                    item.active 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 flex items-center justify-center mr-3", 
                    item.active ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                  {item.notification && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-medium min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
                      {item.notification}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Logout */}
          <div className="p-3 mt-auto border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-3 h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div>
            {title && (
              <h1 className="text-xl font-semibold">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              asChild
            >
              <Link href={`/${role}/notifications`}>
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </Link>
            </Button>
            {pageAction}
          </div>
        </header>

        {/* Mobile Top Bar */}
        <header className="md:hidden flex h-14 items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="font-bold">{mobileTitle || title || "TOV"}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              asChild
            >
              <Link href={`/${role}/notifications`}>
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 pt-14 md:pt-0">
          <div className="container mx-auto px-4 py-6 max-w-6xl">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around items-center py-1">
            {mobileTabItems.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={cn(
                  "flex flex-col items-center px-2 py-1.5 relative",
                  item.active 
                    ? "text-primary" 
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.notification && (
                  <span className="absolute top-0 right-1/4 bg-red-500 text-white text-[10px] font-medium min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                    {item.notification}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden">
            <div className="h-full w-full max-w-[300px] bg-white dark:bg-gray-900 flex flex-col animate-in slide-in-from-left">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-2">
                    <span className="text-primary-foreground font-bold text-lg">T</span>
                  </div>
                  <span className="font-bold text-lg">TOV</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* User Profile */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                    {user.profileImage && <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />}
                  </Avatar>
                  <div className="ml-3 min-w-0">
                    <p className="font-medium truncate">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.username}
                    </p>
                    <Link 
                      href={`/${role}/profile`}
                      className="text-sm text-primary hover:underline truncate"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      View your profile
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-2">
                <div className="space-y-1 px-3">
                  {navItems.map((item, index) => (
                    <Link 
                      key={index} 
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-lg",
                        item.active 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 flex items-center justify-center mr-3", 
                        item.active ? "text-primary" : "text-gray-500 dark:text-gray-400"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.notification && (
                        <span className="bg-red-500 text-white text-xs font-medium min-w-[20px] h-5 flex items-center justify-center rounded-full px-1 ml-2">
                          {item.notification}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 ml-2 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Settings and Logout */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <Link 
                  href={`/${role}/settings`}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mb-2"
                >
                  <div className="w-6 h-6 flex items-center justify-center mr-3 text-gray-500 dark:text-gray-400">
                    <Settings className="h-5 w-5" />
                  </div>
                  <span>Settings</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                </Link>
                
                <Button
                  variant="outline"
                  className="w-full justify-start mt-2 text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    handleLogout();
                    setIsSidebarOpen(false);
                  }}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}