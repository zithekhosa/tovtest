import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, Home, Building, Users, Wrench, FileText, 
  MessageSquare, Settings, LogOut, DollarSign 
} from "lucide-react";
import { UserRoleType } from "@shared/schema";

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
  const getNavItems = () => {
    const baseItems = [
      {
        href: role === "tenant" ? "/tenant/dashboard" : role === "landlord" ? "/landlord/dashboard" : role === "agency" ? "/agency/dashboard" : "/maintenance/dashboard",
        icon: Home,
        label: "Dashboard",
        active: location.includes("dashboard"),
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
    <>
      {/* Mobile Menu Button */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white border-0"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>

      {/* Mobile Bottom Navigation for Most Used Functions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-4 md:hidden">
        <div className="flex justify-around items-center">
          {navItems.slice(0, 4).map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "flex flex-col items-center px-1 py-1 rounded-md",
                item.active 
                  ? "text-primary" 
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
              {item.label === "Messages" && (
                <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-medium w-4 h-4 flex items-center justify-center rounded-full">
                  2
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Full-screen drawer menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 dark:bg-black/80 md:hidden">
          <div className="h-full w-full max-w-[280px] sm:max-w-sm ml-auto bg-white dark:bg-gray-900 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">T</span>
                </div>
                <span className="font-bold text-lg dark:text-white">TOV Platform</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium text-lg">
                    {user.firstName && user.lastName 
                      ? getInitials(user.firstName, user.lastName) 
                      : user.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <div className="space-y-1">
                {navItems.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md mx-2",
                      item.active && "bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3 shrink-0" />
                    <span>{item.label}</span>
                    {item.label === "Messages" && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                        2
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="mt-6 px-4">
                <Link
                  href={`/${role}/settings`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <Settings className="h-5 w-5 mr-3 shrink-0" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
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