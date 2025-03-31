import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, Home, Building, Users, Wrench, FileText, 
  MessageSquare, Settings, LogOut, BarChart3, DollarSign,
  CalendarDays, Target, LineChart, Clock, Star, UserPlus
} from "lucide-react";
import { UserRoleType } from "@shared/schema";

interface SidebarProps {
  role: UserRoleType;
}

export default function Sidebar({ role }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Determine navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        href: role === "tenant" ? "/tenant/dashboard" : role === "landlord" ? "/landlord/dashboard" : role === "agency" ? "/agency/dashboard" : "/maintenance/dashboard",
        icon: Home,
        label: "Dashboard",
        active: location.includes("dashboard"),
      },
      {
        href: "/maintenance/marketplace",
        icon: Wrench,
        label: "Maintenance Marketplace",
        active: location.includes("marketplace"),
      },
      {
        href: `/${role}/messages`,
        icon: MessageSquare,
        label: "Messages",
        active: location.includes("messages"),
      }
    ];

    const roleSpecificItems = {
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
          label: "Financial Management",
          active: location.includes("financial-management"),
        },
        {
          href: "/landlord/maintenance",
          icon: Wrench,
          label: "Maintenance",
          active: location.includes("maintenance"),
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
          href: "/tenant/lease-history",
          icon: CalendarDays,
          label: "Lease History",
          active: location.includes("lease-history"),
        },
        {
          href: "/tenant/properties",
          icon: Building,
          label: "My Rental",
          active: location === "/tenant/properties",
        },
        {
          href: "/tenant/property-search",
          icon: Home,
          label: "Find Properties",
          active: location.includes("property-search"),
        },
        {
          href: "/tenant/payments",
          icon: DollarSign,
          label: "Payments",
          active: location.includes("payments"),
        },
        {
          href: "/tenant/maintenance",
          icon: Wrench,
          label: "Maintenance",
          active: location === "/tenant/maintenance",
        },
        {
          href: "/tenant/marketplace",
          icon: Star,
          label: "Marketplace",
          active: location.includes("marketplace"),
        },
        {
          href: "/tenant/documents",
          icon: FileText,
          label: "Documents",
          active: location.includes("documents"),
        },
        {
          href: "/tenant/applications",
          icon: FileText,
          label: "My Applications",
          active: location.includes("applications"),
        },
      ],
      agency: [
        {
          href: "/agency/property-listings",
          icon: Building,
          label: "Property Listings",
          active: location.includes("property-listings"),
        },
        {
          href: "/agency/leads-management",
          icon: UserPlus,
          label: "Leads Management",
          active: location.includes("leads-management"),
        },
        {
          href: "/agency/commission-tracker",
          icon: DollarSign,
          label: "Commission Tracker",
          active: location.includes("commission-tracker"),
        },
        {
          href: "/agency/expiring-leases",
          icon: Clock,
          label: "Expiring Leases",
          active: location.includes("expiring-leases"),
        },
        {
          href: "/agency/properties",
          icon: Building,
          label: "Properties",
          active: location === "/agency/properties",
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
        },
        {
          href: "/maintenance/documents",
          icon: FileText,
          label: "Documents",
          active: location.includes("documents"),
        },
      ],
    };

    return [...roleSpecificItems[role], ...baseItems];
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 pt-16 z-30">
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="pb-6 mb-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-semibold">
                {user.firstName && user.lastName 
                  ? getInitials(user.firstName, user.lastName) 
                  : user.username.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.username}
              </p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.href} className="w-full">
              <Link href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer w-full",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.label === "Messages" && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      2
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="truncate">{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
        </Button>
      </div>
    </aside>
  );
}