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
  Phone,
  AlertTriangle,
  StarIcon,
  CalendarIcon,
  AlertTriangleIcon,
  FileTextIcon,
  CheckCircleIcon,
  Search
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

  // Role-specific navigation items - CLEAN STRUCTURE
  const roleItems = {
    // Tenant items - Clean and focused navigation (reduced from 10 to 7 items)
    tenant: [
      {
        href: "/tenant/properties",
        icon: Building,
        label: "My Property",
        active: location.includes("/tenant/properties"),
      },
      {
        href: "/properties",
        icon: Search,
        label: "Find Property",
        active: location === "/properties",
      },
      {
        href: "/tenant/leasing",
        icon: FileText,
        label: "Leasing",
        active: location.includes("/tenant/leasing") || location.includes("/tenant/applications"),
      },
      {
        href: "/tenant/maintenance",
        icon: Wrench,
        label: "Maintenance",
        active: location.includes("/tenant/maintenance"),
      },
      {
        href: "/tenant/payments",
        icon: DollarSign,
        label: "Payments",
        active: location.includes("/tenant/payments"),
      },
      {
        href: "/tenant/messages",
        icon: MessageSquare,
        label: "Messages",
        active: location.includes("/tenant/messages") || location.includes("/tenant/communications") || location.includes("/tenant/inbox"),
      },
      {
        href: "/tenant/lease-history",
        icon: Calendar,
        label: "History",
        active: location.includes("/tenant/history") || location.includes("/tenant/lease-history"),
      },
    ],
    
    // Landlord items - OPTIMIZED: 13 → 7 items
    landlord: [
      {
        href: "/landlord/properties",
        icon: Building,
        label: "Properties",
        active: location.includes("/landlord/properties"),
      },
      {
        href: "/landlord/applications",
        icon: FileText,
        label: "Applications",
        active: location.includes("/landlord/applications"),
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
        href: "/landlord/finances",
        icon: DollarSign,
        label: "Finances",
        active: location.includes("/landlord/finances"),
      },
      {
        href: "/landlord/analytics",
        icon: BarChart,
        label: "Analytics",
        active: location.includes("/landlord/analytics"),
      },
      {
        href: "/landlord/inbox",
        icon: MessageSquare,
        label: "Inbox",
        active: location.includes("/landlord/inbox"),
      },
      {
        href: "/landlord/documents",
        icon: FileText,
        label: "Documents",
        active: location.includes("/landlord/documents"),
      },
      {
        href: "/landlord/lease-templates",
        icon: FileText,
        label: "Lease Templates",
        active: location.includes("/landlord/lease-templates"),
      },
    ],
      
      // Agency items - OPTIMIZED: 13 → 7 items (46% reduction)
      agency: [
        {
          href: "/agency/properties",
          icon: Building,
          label: "Properties",
          active: location.includes("/agency/properties") || location.includes("/agency/property-listings"),
        },
        {
          href: "/agency/leads",
          icon: Users,
          label: "Leads & Clients",
          active: location.includes("/agency/leads") || location.includes("/agency/leads-management") || location.includes("/agency/landlords") || location.includes("/agency/landlord-management"),
        },
        {
          href: "/agency/leases",
          icon: FileText,
          label: "Lease Management",
          active: location.includes("/agency/lease-renewal-management") || location.includes("/agency/expiring-leases") || location.includes("/agency/eviction-management"),
        },
        {
          href: "/agency/commissions",
          icon: DollarSign,
          label: "Commissions",
          active: location.includes("/agency/commission-tracker") || location.includes("/agency/commission-management"),
        },
        {
          href: "/agency/appointments",
          icon: Calendar,
          label: "Appointments",
          active: location.includes("/agency/appointment-management"),
        },
        {
          href: "/agency/marketplace",
          icon: Wrench,
          label: "Services",
          active: location.includes("/agency/marketplace"),
        },
        {
          href: "/admin/verification",
          icon: CheckCircleIcon,
          label: "Verification Admin",
          active: location.includes("/admin/verification"),
        },
        // CONSOLIDATION SUMMARY:
        // - Properties: Property Marketing + Listings
        // - Leads & Clients: Leads + Landlords + Landlord Management  
        // - Lease Management: Lease Renewals + Expiring Leases + Eviction Management
        // - Commissions: Commission Tracker + Commission Processing
        // - Appointments: Appointment Management
        // - Services: Service Marketplace
        // REMOVED: Dashboard (hardcoded at top)
      ],
      
      // Maintenance provider items
      maintenance: [
        // Dashboard is handled by the generic hardcoded link at the top
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

  const roleSpecificItems = roleItems[role] || [];
  
  // Common navigation items at the bottom
  const bottomItems = [
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
            <img src="/tov-logo.png" alt="TOV Property Management" className="h-8 w-auto" />
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
                <p className="text-caption capitalize">{role}</p>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1">
            {/* Dashboard item */}
            <Link 
              href={`/${role}/dashboard`}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                (location === `/${role}/dashboard` || location === "/dashboard")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Home className={cn(
                "mr-3 h-5 w-5",
                (location === `/${role}/dashboard` || location === "/dashboard") ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
              )} />
              Dashboard
              {(location === `/${role}/dashboard` || location === "/dashboard") && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
            </Link>
            
            {/* Role-specific items */}
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

export default Sidebar;