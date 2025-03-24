import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Home, Building, Users, Wrench, FileText, MessageSquare, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  // Get user's initials for avatar
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
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
        href: "/messages",
        icon: MessageSquare,
        label: "Messages",
        active: location === "/messages",
      },
      {
        href: "/settings",
        icon: Settings,
        label: "Settings",
        active: location === "/settings",
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
          icon: Tool,
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
          icon: Tool,
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
          icon: Tool,
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
  };

  return (
    <aside className={cn("hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full", className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">TOV Platform</h1>
        </div>
      </div>
      
      {/* User Profile Summary */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">{initials}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
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
      </nav>
      
      {/* Account Actions */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </aside>
  );
}
