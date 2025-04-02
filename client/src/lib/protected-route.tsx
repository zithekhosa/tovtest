import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { UserRoleType } from "@shared/schema";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export function ProtectedRoute({
  path,
  component: Component,
  role,
}: {
  path: string;
  component: (props?: { user?: any }) => React.JSX.Element | null;
  role?: UserRoleType;
}) {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Not authenticated - redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if user has required role
  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on role
    const roleRedirectMap: Record<string, string> = {
      tenant: "/tenant/dashboard",
      landlord: "/landlord/dashboard",
      agency: "/agency/dashboard",
      maintenance: "/maintenance/dashboard"
    };

    return (
      <Route path={path}>
        <Redirect to={roleRedirectMap[user.role] || "/"} />
      </Route>
    );
  }

  // User is authenticated and has proper role, render component with layout
  return (
    <Route path={path}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="flex">
          <Sidebar role={user.role} />
          <main className="flex-1 pt-16 pb-20 md:ml-64 md:pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
              <Component user={user} />
            </div>
          </main>
        </div>
        <MobileNav role={user.role} />
      </div>
    </Route>
  );
}
