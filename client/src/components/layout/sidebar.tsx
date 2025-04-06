import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserRoleType } from "@shared/schema";
import {
  Building,
  Calendar,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
  Users,
  Wrench,
  DollarSign,
  BarChart,
  LayoutDashboard,
  PanelLeft,
  Phone
} from "lucide-react";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  // Get user's role
  const role = user.role as UserRoleType;

  // Get user's initials for avatar
  const initials = user.firstName && user.lastName
    ? getInitials(user.firstName, user.lastName)
    : user.username.slice(0, 2).toUpperCase();

  // Determine navigation items based on user role
  const getRoleSpecificItems = () => {
    // Base navigation items for each role
    const baseItems = [
      {
        href: `/${role}/dashboard`,
        icon: Home,
        label: "Dashboard",
        active: location === `/${role}/dashboard` || location === "/dashboard",
      },
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
    ];

    // Role-specific items
    const roleItems = {
      // Tenant items
      tenant: [
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
        {
          href: "/landlord/document-management",
          icon: FileText,
          label: "Document Management",
          active: location.includes("/landlord/document-management"),
        },
        {
          href: "/maintenance/marketplace",
          icon: Calendar,
          label: "Service Marketplace",
          active: location.includes("/marketplace"),
        },
        {
          href: "/landlord/financials",
          icon: DollarSign,
          label: "Financials",
          active: location.includes("/landlord/financials") || location.includes("/landlord/financial-management"),
        },
        {
          href: "/landlord/analytics",
          icon: BarChart,
          label: "Analytics",
          active: location.includes("/landlord/analytics"),
        },
      ],
      
      // Agency items
      agency: [
        {
          href: "/agency/dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
          active: location === "/agency/dashboard" || location === "/dashboard",
        },
        {
          href: "/agency/properties",
          icon: Building,
          label: "Property Marketing",
          active: location.includes("/agency/properties"),
        },
        {
          href: "/agency/property-listings",
          icon: PanelLeft,
          label: "Listings",
          active: location.includes("/agency/property-listings"),
        },
        {
          href: "/agency/leads-management",
          icon: Users,
          label: "Leads",
          active: location.includes("/agency/leads-management"),
        },
        {
          href: "/agency/landlords",
          icon: User,
          label: "Landlords",
          active: location.includes("/agency/landlords"),
        },
        {
          href: "/agency/commission-tracker",
          icon: DollarSign,
          label: "Commissions",
          active: location.includes("/agency/commission-tracker"),
        },
        {
          href: "/agency/expiring-leases",
          icon: Calendar,
          label: "Expiring Leases",
          active: location.includes("/agency/expiring-leases"),
        },
        {
          href: "/maintenance/marketplace",
          icon: Wrench,
          label: "Service Marketplace",
          active: location.includes("/marketplace"),
        },
      ],
      
      // Maintenance provider items
      maintenance: [
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
        {
          href: "/maintenance/schedule",
          icon: Calendar,
          label: "Schedule",
          active: location.includes("/maintenance/schedule"),
        },
      ],
    };

    return roleItems[role] || [];
  };

  const roleSpecificItems = getRoleSpecificItems();
  
  // Common navigation items at the bottom
  const bottomItems = [
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
      active: location === "/settings",
    },
    {
      href: "/contact",
      icon: Phone,
      label: "Support",
      active: location === "/contact",
    },
  ];

  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed top-0 left-0">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl text-primary">TOV</span>
            <span className="font-medium text-gray-700 ml-2">Property OS</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-5 px-4">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1">
            {roleSpecificItems.map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5",
                  item.active ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                )} />
                {item.label}
                {item.active && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
              </Link>
            ))}
          </nav>
          
          <div className="pt-6 mt-6 border-t border-gray-200">
            <nav className="space-y-1">
              {bottomItems.map((item, i) => (
                <Link 
                  key={i} 
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5",
                    item.active ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 group"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Sign out
              </button>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}