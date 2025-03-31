import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ProvidersSignup from "@/pages/providers-signup";
import LandingPage from "@/pages/landing-page";
import { ProtectedRoute } from "./lib/protected-route";

// Shared pages
import Documents from "@/pages/documents";
import Messages from "@/pages/messages";
import Maintenance from "@/pages/maintenance";
import Tenants from "@/pages/tenants";
import Properties from "@/pages/properties";

// Tenant pages
import TenantDashboard from "@/pages/tenant/dashboard";
import TenantMaintenance from "@/pages/tenant/maintenance";

// Landlord pages
import LandlordDashboard from "@/pages/landlord/dashboard";
import LandlordProperties from "@/pages/landlord/properties";
import FinancialManagement from "@/pages/landlord/financial-management";

// Agency pages
import AgencyDashboard from "@/pages/agency/dashboard";
import LeadsManagement from "@/pages/agency/leads-management";
import CommissionTracker from "@/pages/agency/commission-tracker";
import PropertyListings from "@/pages/agency/property-listings";
import ExpiringLeases from "@/pages/agency/expiring-leases";

// Maintenance pages
import MaintenanceDashboard from "@/pages/maintenance/dashboard";
import MaintenanceMarketplace from "@/pages/maintenance/marketplace";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/providers-signup" component={ProvidersSignup} />
      
      {/* Dashboard route - redirect to appropriate dashboard based on role */}
      <ProtectedRoute path="/dashboard" component={(props) => {
        const user = props?.user;
        if (user?.role === 'landlord') return <LandlordDashboard />;
        if (user?.role === 'tenant') return <TenantDashboard />;
        if (user?.role === 'agency') return <AgencyDashboard />;
        if (user?.role === 'maintenance') return <MaintenanceDashboard />;
        return <TenantDashboard />;
      }} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/documents" component={Documents} />
      <ProtectedRoute path="/maintenance" component={Maintenance} />
      <ProtectedRoute path="/tenants" component={Tenants} />
      <ProtectedRoute path="/properties" component={Properties} />
      
      {/* Tenant routes */}
      <ProtectedRoute path="/tenant/dashboard" component={TenantDashboard} role="tenant" />
      <ProtectedRoute path="/tenant/maintenance" component={TenantMaintenance} role="tenant" />
      <ProtectedRoute path="/tenant/messages" component={Messages} role="tenant" />
      <ProtectedRoute path="/tenant/documents" component={Documents} role="tenant" />
      <ProtectedRoute path="/tenant/properties" component={Properties} role="tenant" />
      
      {/* Landlord routes */}
      <ProtectedRoute path="/landlord/dashboard" component={LandlordDashboard} role="landlord" />
      <ProtectedRoute path="/landlord/properties" component={LandlordProperties} role="landlord" />
      <ProtectedRoute path="/landlord/tenants" component={Tenants} role="landlord" />
      <ProtectedRoute path="/landlord/maintenance" component={Maintenance} role="landlord" />
      <ProtectedRoute path="/landlord/messages" component={Messages} role="landlord" />
      <ProtectedRoute path="/landlord/documents" component={Documents} role="landlord" />
      <ProtectedRoute path="/landlord/financial-management" component={FinancialManagement} role="landlord" />
      
      {/* Agency routes */}
      <ProtectedRoute path="/agency/dashboard" component={AgencyDashboard} role="agency" />
      <ProtectedRoute path="/agency/properties" component={Properties} role="agency" />
      <ProtectedRoute path="/agency/property-listings" component={PropertyListings} role="agency" />
      <ProtectedRoute path="/agency/leads-management" component={LeadsManagement} role="agency" />
      <ProtectedRoute path="/agency/commission-tracker" component={CommissionTracker} role="agency" />
      <ProtectedRoute path="/agency/expiring-leases" component={ExpiringLeases} role="agency" />
      <ProtectedRoute path="/agency/tenants" component={Tenants} role="agency" />
      <ProtectedRoute path="/agency/messages" component={Messages} role="agency" />
      <ProtectedRoute path="/agency/documents" component={Documents} role="agency" />
      
      {/* Maintenance routes */}
      <ProtectedRoute path="/maintenance/dashboard" component={MaintenanceDashboard} role="maintenance" />
      <ProtectedRoute path="/maintenance/jobs" component={Maintenance} role="maintenance" />
      <ProtectedRoute path="/maintenance/messages" component={Messages} role="maintenance" />
      <ProtectedRoute path="/maintenance/documents" component={Documents} role="maintenance" />
      
      {/* Maintenance Marketplace - accessible by all users */}
      <ProtectedRoute path="/maintenance/marketplace" component={MaintenanceMarketplace} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
