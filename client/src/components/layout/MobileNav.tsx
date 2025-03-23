import { Link, useLocation } from "wouter";
import { UserRoleType } from "@shared/schema";
import { 
  LayoutDashboard, 
  Home, 
  Wrench, 
  MessageSquare, 
  FileText,
  Building,
  User,
  Search
} from "lucide-react";

interface MobileNavProps {
  role: UserRoleType;
}

export default function MobileNav({ role }: MobileNavProps) {
  const [location] = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location === path;
    return `flex flex-col items-center justify-center ${
      isActive ? "text-primary" : "text-gray-500"
    }`;
  };

  const renderTenantNav = () => (
    <div className="grid grid-cols-5 h-16">
      <Link href="/tenant/dashboard">
        <a className={getLinkClass("/tenant/dashboard")}>
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </a>
      </Link>
      <Link href="/tenant/properties">
        <a className={getLinkClass("/tenant/properties")}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Property</span>
        </a>
      </Link>
      <Link href="/tenant/maintenance">
        <a className={getLinkClass("/tenant/maintenance")}>
          <Wrench className="h-6 w-6" />
          <span className="text-xs mt-1">Maintenance</span>
        </a>
      </Link>
      <Link href="/tenant/messages">
        <a className={getLinkClass("/tenant/messages")}>
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </a>
      </Link>
      <Link href="/tenant/documents">
        <a className={getLinkClass("/tenant/documents")}>
          <FileText className="h-6 w-6" />
          <span className="text-xs mt-1">Documents</span>
        </a>
      </Link>
    </div>
  );

  const renderLandlordNav = () => (
    <div className="grid grid-cols-5 h-16">
      <Link href="/landlord/dashboard">
        <a className={getLinkClass("/landlord/dashboard")}>
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </a>
      </Link>
      <Link href="/landlord/properties">
        <a className={getLinkClass("/landlord/properties")}>
          <Building className="h-6 w-6" />
          <span className="text-xs mt-1">Properties</span>
        </a>
      </Link>
      <Link href="/landlord/tenants">
        <a className={getLinkClass("/landlord/tenants")}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Tenants</span>
        </a>
      </Link>
      <Link href="/landlord/maintenance">
        <a className={getLinkClass("/landlord/maintenance")}>
          <Wrench className="h-6 w-6" />
          <span className="text-xs mt-1">Maintenance</span>
        </a>
      </Link>
      <Link href="/landlord/messages">
        <a className={getLinkClass("/landlord/messages")}>
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </a>
      </Link>
    </div>
  );

  const renderAgencyNav = () => (
    <div className="grid grid-cols-5 h-16">
      <Link href="/agency/dashboard">
        <a className={getLinkClass("/agency/dashboard")}>
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </a>
      </Link>
      <Link href="/agency/properties">
        <a className={getLinkClass("/agency/properties")}>
          <Building className="h-6 w-6" />
          <span className="text-xs mt-1">Properties</span>
        </a>
      </Link>
      <Link href="/agency/landlords">
        <a className={getLinkClass("/agency/landlords")}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Landlords</span>
        </a>
      </Link>
      <Link href="/agency/tenants">
        <a className={getLinkClass("/agency/tenants")}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Tenants</span>
        </a>
      </Link>
      <Link href="/agency/messages">
        <a className={getLinkClass("/agency/messages")}>
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </a>
      </Link>
    </div>
  );

  const renderMaintenanceNav = () => (
    <div className="grid grid-cols-4 h-16">
      <Link href="/maintenance/dashboard">
        <a className={getLinkClass("/maintenance/dashboard")}>
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </a>
      </Link>
      <Link href="/maintenance/jobs">
        <a className={getLinkClass("/maintenance/jobs")}>
          <Wrench className="h-6 w-6" />
          <span className="text-xs mt-1">Jobs</span>
        </a>
      </Link>
      <Link href="/maintenance/messages">
        <a className={getLinkClass("/maintenance/messages")}>
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </a>
      </Link>
      <Link href="/maintenance/profile">
        <a className={getLinkClass("/maintenance/profile")}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </a>
      </Link>
    </div>
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      {role === "tenant" && renderTenantNav()}
      {role === "landlord" && renderLandlordNav()}
      {role === "agency" && renderAgencyNav()}
      {role === "maintenance" && renderMaintenanceNav()}
    </div>
  );
}
