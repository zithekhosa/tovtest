import { Link, useLocation } from "wouter";
import { UserRoleType } from "@shared/schema";
import { 
  LayoutDashboard, 
  Home, 
  Wrench, 
  MessageSquare, 
  FileText, 
  Search,
  Building,
  Users,
  DollarSign,
  Calendar,
  Settings
} from "lucide-react";

interface SidebarProps {
  role: UserRoleType;
}

export default function Sidebar({ role }: SidebarProps) {
  const [location] = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location === path;
    return `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
      isActive
        ? "bg-primary text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;
  };

  return (
    <div className="hidden md:flex md:flex-col md:fixed md:w-64 md:top-16 md:bottom-0 md:bg-white md:border-r md:border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Tenant Navigation */}
        {role === "tenant" && (
          <nav className="space-y-1">
            <Link href="/tenant/dashboard">
              <a className={getLinkClass("/tenant/dashboard")}>
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </a>
            </Link>
            <Link href="/tenant/properties">
              <a className={getLinkClass("/tenant/properties")}>
                <Home className="mr-3 h-5 w-5" />
                My Property
              </a>
            </Link>
            <Link href="/tenant/maintenance">
              <a className={getLinkClass("/tenant/maintenance")}>
                <Wrench className="mr-3 h-5 w-5" />
                Maintenance
              </a>
            </Link>
            <Link href="/tenant/messages">
              <a className={getLinkClass("/tenant/messages")}>
                <MessageSquare className="mr-3 h-5 w-5" />
                Messages
              </a>
            </Link>
            <Link href="/tenant/documents">
              <a className={getLinkClass("/tenant/documents")}>
                <FileText className="mr-3 h-5 w-5" />
                Documents
              </a>
            </Link>
            <Link href="/tenant/search">
              <a className={getLinkClass("/tenant/search")}>
                <Search className="mr-3 h-5 w-5" />
                Find Properties
              </a>
            </Link>
          </nav>
        )}

        {/* Landlord Navigation */}
        {role === "landlord" && (
          <nav className="space-y-1">
            <Link href="/landlord/dashboard">
              <a className={getLinkClass("/landlord/dashboard")}>
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </a>
            </Link>
            <Link href="/landlord/properties">
              <a className={getLinkClass("/landlord/properties")}>
                <Building className="mr-3 h-5 w-5" />
                Properties
              </a>
            </Link>
            <Link href="/landlord/tenants">
              <a className={getLinkClass("/landlord/tenants")}>
                <Users className="mr-3 h-5 w-5" />
                Tenants
              </a>
            </Link>
            <Link href="/landlord/maintenance">
              <a className={getLinkClass("/landlord/maintenance")}>
                <Wrench className="mr-3 h-5 w-5" />
                Maintenance
              </a>
            </Link>
            <Link href="/landlord/payments">
              <a className={getLinkClass("/landlord/payments")}>
                <DollarSign className="mr-3 h-5 w-5" />
                Payments
              </a>
            </Link>
            <Link href="/landlord/messages">
              <a className={getLinkClass("/landlord/messages")}>
                <MessageSquare className="mr-3 h-5 w-5" />
                Messages
              </a>
            </Link>
            <Link href="/landlord/documents">
              <a className={getLinkClass("/landlord/documents")}>
                <FileText className="mr-3 h-5 w-5" />
                Documents
              </a>
            </Link>
          </nav>
        )}

        {/* Agency Navigation */}
        {role === "agency" && (
          <nav className="space-y-1">
            <Link href="/agency/dashboard">
              <a className={getLinkClass("/agency/dashboard")}>
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </a>
            </Link>
            <Link href="/agency/properties">
              <a className={getLinkClass("/agency/properties")}>
                <Building className="mr-3 h-5 w-5" />
                Properties
              </a>
            </Link>
            <Link href="/agency/landlords">
              <a className={getLinkClass("/agency/landlords")}>
                <Users className="mr-3 h-5 w-5" />
                Landlords
              </a>
            </Link>
            <Link href="/agency/tenants">
              <a className={getLinkClass("/agency/tenants")}>
                <Users className="mr-3 h-5 w-5" />
                Tenants
              </a>
            </Link>
            <Link href="/agency/inquiries">
              <a className={getLinkClass("/agency/inquiries")}>
                <MessageSquare className="mr-3 h-5 w-5" />
                Inquiries
              </a>
            </Link>
            <Link href="/agency/appointments">
              <a className={getLinkClass("/agency/appointments")}>
                <Calendar className="mr-3 h-5 w-5" />
                Appointments
              </a>
            </Link>
          </nav>
        )}

        {/* Maintenance Provider Navigation */}
        {role === "maintenance" && (
          <nav className="space-y-1">
            <Link href="/maintenance/dashboard">
              <a className={getLinkClass("/maintenance/dashboard")}>
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </a>
            </Link>
            <Link href="/maintenance/jobs">
              <a className={getLinkClass("/maintenance/jobs")}>
                <Wrench className="mr-3 h-5 w-5" />
                Jobs
              </a>
            </Link>
            <Link href="/maintenance/schedule">
              <a className={getLinkClass("/maintenance/schedule")}>
                <Calendar className="mr-3 h-5 w-5" />
                Schedule
              </a>
            </Link>
            <Link href="/maintenance/messages">
              <a className={getLinkClass("/maintenance/messages")}>
                <MessageSquare className="mr-3 h-5 w-5" />
                Messages
              </a>
            </Link>
            <Link href="/maintenance/settings">
              <a className={getLinkClass("/maintenance/settings")}>
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </a>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
