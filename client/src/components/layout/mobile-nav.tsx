import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn, getInitials } from "@/lib/utils";
import tovLogo from "@/assets/images/tov-logo.png";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserRoleType } from "@shared/schema";
import { 
  Building, 
  Calendar, 
  FileText, 
  Home, 
  LogOut, 
  Menu, 
  MessageSquare, 
  Settings, 
  User, 
  Users, 
  Wrench,
  DollarSign,
  BarChart,
  X,
  Phone
} from "lucide-react";

export function MobileNav() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // Get user's role
  const role = user.role as UserRoleType;

  // Get user's initials for avatar
  const initials = user.firstName && user.lastName
    ? getInitials(user.firstName, user.lastName)
    : user.username.slice(0, 2).toUpperCase();

  // Determine navigation items based on user role
  const getRoleSpecificItems = () => {
    // Role-specific items
    const roleItems = {
      // Tenant items
      tenant: [
        {
          href: "/tenant/dashboard",
          icon: Home,
          label: "Dashboard",
          active: location.includes("/tenant/dashboard") || location === "/dashboard",
        },
        {
          href: "/tenant/maintenance",
          icon: Wrench,
          label: "Maintenance",
          active: location.includes("/tenant/maintenance"),
        },
        {
          href: "/maintenance/marketplace",
          icon: Calendar,
          label: "Service Marketplace",
          active: location.includes("/marketplace"),
        },
        {
          href: "/tenant/properties",
          icon: Building,
          label: "My Property",
          active: location.includes("/tenant/properties"),
        },
      ],
      
      // Landlord items
      landlord: [
        {
          href: "/landlord/dashboard",
          icon: Home,
          label: "Dashboard",
          active: location.includes("/landlord/dashboard") || location === "/dashboard",
        },
        {
          href: "/landlord/properties",
          icon: Building,
          label: "Properties",
          active: location.includes("/landlord/properties"),
        },
        {
          href: "/landlord/tenants",
          icon: Users,
          label: "Tenants",
          active: location.includes("/landlord/tenants"),
        },
        {
          href: "/landlord/maintenance",
          icon: Wrench,
          label: "Maintenance",
          active: location.includes("/landlord/maintenance"),
        },
      ],
      
      // Agency items
      agency: [
        {
          href: "/agency/dashboard",
          icon: Home,
          label: "Dashboard",
          active: location.includes("/agency/dashboard") || location === "/dashboard",
        },
        {
          href: "/agency/properties",
          icon: Building,
          label: "Properties",
          active: location.includes("/agency/properties"),
        },
        {
          href: "/agency/landlords",
          icon: User,
          label: "Landlords",
          active: location.includes("/agency/landlords"),
        },
        {
          href: "/agency/tenants",
          icon: Users,
          label: "Tenants",
          active: location.includes("/agency/tenants"),
        },
      ],
      
      // Maintenance provider items
      maintenance: [
        {
          href: "/maintenance/dashboard",
          icon: Home,
          label: "Dashboard",
          active: location.includes("/maintenance/dashboard") || location === "/dashboard",
        },
        {
          href: "/maintenance/jobs",
          icon: Wrench,
          label: "My Jobs",
          active: location.includes("/maintenance/jobs") && !location.includes("/marketplace"),
        },
        {
          href: "/maintenance/marketplace",
          icon: Calendar,
          label: "Service Marketplace",
          active: location.includes("/marketplace"),
        },
        {
          href: "/maintenance/earnings",
          icon: DollarSign,
          label: "Earnings",
          active: location.includes("/maintenance/earnings"),
        },
      ],
    };

    return roleItems[role] || [];
  };

  // Common items for mobile menu
  const commonItems = [
    {
      href: "/messages",
      icon: MessageSquare,
      label: "Messages",
      active: location.includes("/messages"),
    },
    {
      href: "/documents",
      icon: FileText,
      label: "Documents",
      active: location.includes("/documents"),
    },
    {
      href: `/${role}/settings`,
      icon: Settings,
      label: "Settings",
      active: location.includes("/settings"),
    },
    {
      href: "/contact",
      icon: Phone,
      label: "Support",
      active: location === "/contact",
    },
  ];

  const navItems = [...getRoleSpecificItems(), ...commonItems];

  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setIsOpen(false);
  };

  // Mobile bottom tabs (max 5 items)
  const bottomTabs = [
    {
      href: `/${role}/dashboard`,
      icon: Home,
      label: "Home",
    },
    {
      href: role === "tenant" ? "/tenant/maintenance" : 
            role === "landlord" ? "/landlord/properties" :
            role === "agency" ? "/agency/properties" : "/maintenance/jobs",
      icon: role === "tenant" || role === "maintenance" ? Wrench : Building,
      label: role === "tenant" || role === "maintenance" ? "Service" : "Properties",
    },
    {
      href: "/maintenance/marketplace",
      icon: Calendar,
      label: "Marketplace",
    },
    {
      href: "/messages",
      icon: MessageSquare,
      label: "Messages",
    },
  ];

  return (
    <>
      {/* Removing bottom nav to fix UI issues as requested by user */}
      
      {/* Mobile Menu Sheet - Top Nav Bar with Menu Icon */}
      <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 p-2 flex items-center justify-between z-40 md:hidden">
        <div className="flex items-center">
          <img src={tovLogo} alt="TOV Logo" className="h-8 w-auto" />
          <span className="font-medium text-gray-700 ml-2">Property OS</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:w-[350px] pt-10 z-50">
            <SheetHeader className="border-b pb-4 mb-4">
              <SheetTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src={tovLogo} alt="TOV Logo" className="h-8 w-auto" />
                  <span className="font-medium text-gray-700 ml-2">Property OS</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </SheetTitle>
            </SheetHeader>
            
            <div className="mb-6 pb-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-semibold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                  </p>
                  <p className="text-caption capitalize">{role}</p>
                </div>
              </div>
            </div>
            
            <nav className="space-y-1 overflow-y-auto max-h-[60vh]">
              {navItems.map((item, i) => (
                <Link key={i} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      item.active ? "text-primary" : "text-gray-400"
                    )} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              ))}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="truncate">Sign out</span>
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Add padding to page content for mobile view */}
      <div className="md:hidden h-12"></div>
    </>
  );
}