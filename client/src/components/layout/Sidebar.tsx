import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import tovLogo from "@/assets/images/tov-logo.png";
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
  const [location, navigate] = useLocation();

  if (!user) return null;

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
          href: "/landlord/finances",
          icon: DollarSign,
          label: "Finances",
          active: location.includes("finance"),
        },
        {
          href: "/landlord/market-intelligence",
          icon: BarChart3,
          label: "Market Intelligence",
          active: location.includes("market-intelligence"),
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
    // Remove navigation as it's now handled in the auth hook
  };

  // Return empty div when Standard Layout is used
  // This prevents duplicate sidebars
  return null;
}