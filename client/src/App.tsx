import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";

// Tenant pages
import TenantDashboard from "@/pages/tenant/dashboard";
import TenantMaintenance from "@/pages/tenant/maintenance";

// Landlord pages
import LandlordDashboard from "@/pages/landlord/dashboard";
import LandlordProperties from "@/pages/landlord/properties";

// Agency pages
import AgencyDashboard from "@/pages/agency/dashboard";

// Maintenance pages
import MaintenanceDashboard from "@/pages/maintenance/dashboard";

function Router() {
  return (
    <Switch>
      {/* Auth page (public) */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Tenant routes */}
      <ProtectedRoute path="/" component={TenantDashboard} role="tenant" />
      <ProtectedRoute path="/tenant/dashboard" component={TenantDashboard} role="tenant" />
      <ProtectedRoute path="/tenant/maintenance" component={TenantMaintenance} role="tenant" />
      
      {/* Landlord routes */}
      <ProtectedRoute path="/landlord/dashboard" component={LandlordDashboard} role="landlord" />
      <ProtectedRoute path="/landlord/properties" component={LandlordProperties} role="landlord" />
      
      {/* Agency routes */}
      <ProtectedRoute path="/agency/dashboard" component={AgencyDashboard} role="agency" />
      
      {/* Maintenance routes */}
      <ProtectedRoute path="/maintenance/dashboard" component={MaintenanceDashboard} role="maintenance" />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
