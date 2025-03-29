import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Building, Users, Wrench, FileText, MessageSquare, Settings, LogOut } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  // Get user's initials for avatar
  const initials = user.firstName && user.lastName
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : user.username.slice(0, 2).toUpperCase();

  // Determine navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        href: "/dashboard",
        icon: Home,
        label: "Dashboard",
        active: location === "/dashboard",
      },
      {
        href: "/maintenance/marketplace",
        icon: Wrench,
        label: "Marketplace",
        active: location.includes("marketplace"),
      },
      {
        href: "/messages",
        icon: MessageSquare,
        label: "Messages",
        active: location === "/messages",
      },
    ];

    const roleSpecificItems = {
      landlord: [
        {
          href: "/properties",
          icon: Building,
          label: "Properties",
          active: location === "/properties",
        },
        {
          href: "/tenants",
          icon: Users,
          label: "Tenants",
          active: location === "/tenants",
        },
        {
          href: "/maintenance",
          icon: Wrench,
          label: "Maintenance",
          active: location === "/maintenance",
        },
        {
          href: "/documents",
          icon: FileText,
          label: "Documents",
          active: location === "/documents",
        },
      ],
      tenant: [
        {
          href: "/properties",
          icon: Building,
          label: "My Rental",
          active: location === "/properties",
        },
        {
          href: "/maintenance",
          icon: Wrench,
          label: "Maintenance",
          active: location === "/maintenance",
        },
        {
          href: "/documents",
          icon: FileText,
          label: "Documents",
          active: location === "/documents",
        },
      ],
      agency: [
        {
          href: "/properties",
          icon: Building,
          label: "Properties",
          active: location === "/properties",
        },
        {
          href: "/documents",
          icon: FileText,
          label: "Documents",
          active: location === "/documents",
        },
      ],
      maintenance: [
        {
          href: "/maintenance",
          icon: Wrench,
          label: "Jobs",
          active: location === "/maintenance",
        },
        {
          href: "/documents",
          icon: FileText,
          label: "Documents",
          active: location === "/documents",
        },
      ],
    };

    return [...roleSpecificItems[user.role], ...baseItems];
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setIsOpen(false);
  };

  return (
    <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">TOV</h1>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-gray-500"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="animate-fade-in">
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">{initials}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                </p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
                      item.active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.label === "Messages" && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                        3
                      </span>
                    )}
                  </a>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-5 w-5" />
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </Button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
