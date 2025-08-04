import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { UserRoleType } from "@shared/schema";
import AppLayout from "@/components/layout/AppLayout";

export function ProtectedRoute({
  path,
  component: Component,
  role,
}: {
  path: string;
  component: (props?: { user?: any }) => React.JSX.Element | null;
  role?: UserRoleType;
}) {
  const { user, isLoading, authBypassMode } = useAuth();

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
      <AppLayout role={user.role}>
        <Component user={user} />
      </AppLayout>
    </Route>
  );
}
