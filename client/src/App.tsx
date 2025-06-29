import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ProvidersSignup from "@/pages/providers-signup";
import LandingPage from "@/pages/landing-page";
import PropertySearchPage from "@/pages/property-search-page";
import { ProtectedRoute } from "./lib/protected-route";

// Shared pages
import Documents from "@/pages/documents";
import Messages from "@/pages/messages";
import Maintenance from "@/pages/maintenance";
import Tenants from "@/pages/tenants";
import Properties from "@/pages/properties";

// Profile pages
import LandlordProfile from "@/pages/landlord-profile";
import TenantProfile from "@/pages/tenant-profile";
import AgencyProfile from "@/pages/agency-profile";
import MaintenanceProfile from "@/pages/maintenance-profile";
import TestFacebookDashboard from "@/pages/test-facebook-dashboard";
import RoleSelectionPage from "@/pages/role-selection";

// Tenant pages
import TenantDashboard from "@/pages/tenant/dashboard";
import TenantMaintenance from "@/pages/tenant/maintenance";
import TenantPayments from "@/pages/tenant/payments";
import TenantApplications from "@/pages/tenant/applications";
import TenantPropertySearch from "@/pages/tenant/property-search";
import TenantMarketplace from "@/pages/tenant/marketplace";
import TenantLeaseHistory from "@/pages/tenant/lease-history";
import TenantSettings from "@/pages/tenant/settings";

// Landlord pages
import LandlordDashboard from "@/pages/landlord/dashboard";
import FacebookLandlordDashboard from "@/pages/landlord/facebook-dashboard";
import LandlordProperties from "@/pages/landlord/properties";
import LandlordTenants from "@/pages/landlord/tenants";
import Finances from "@/pages/landlord/finances";
import LandlordSettings from "@/pages/landlord/settings";
import DocumentManagement from "@/pages/landlord/document-management";
import MarketIntelligence from "@/pages/landlord/market-intelligence";

// Agency pages
import AgencyDashboard from "@/pages/agency/dashboard";
import LeadsManagement from "@/pages/agency/leads-management";
import CommissionTracker from "@/pages/agency/commission-tracker";
import PropertyListings from "@/pages/agency/property-listings";
import ExpiringLeases from "@/pages/agency/expiring-leases";
import AgencySettings from "@/pages/agency/settings";
import AgencyProperties from "@/pages/agency/properties";
import AgencyPropertyDetail from "@/pages/agency/property-detail";

// Maintenance pages
import MaintenanceDashboard from "@/pages/maintenance/dashboard";
import MaintenanceMarketplace from "@/pages/maintenance/marketplace";
import MaintenanceSettings from "@/pages/maintenance/settings";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={RoleSelectionPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/providers-signup" component={ProvidersSignup} />
      <Route path="/properties/search" component={PropertySearchPage} />
      <Route path="/test-facebook" component={TestFacebookDashboard} />
      
      {/* Dashboard route - redirect to appropriate dashboard based on role */}
      <ProtectedRoute path="/dashboard" component={(props) => {
        const user = props?.user;
        if (!user) return null;
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
      <ProtectedRoute path="/tenant/payments" component={TenantPayments} role="tenant" />
      <ProtectedRoute path="/tenant/applications" component={TenantApplications} role="tenant" />
      <ProtectedRoute path="/tenant/property-search" component={TenantPropertySearch} role="tenant" />
      <ProtectedRoute path="/tenant/marketplace" component={TenantMarketplace} role="tenant" />
      <ProtectedRoute path="/tenant/lease-history" component={TenantLeaseHistory} role="tenant" />
      <ProtectedRoute path="/tenant/messages" component={Messages} role="tenant" />
      <ProtectedRoute path="/tenant/documents" component={Documents} role="tenant" />
      <ProtectedRoute path="/tenant/properties" component={Properties} role="tenant" />
      <ProtectedRoute path="/tenant/settings" component={TenantSettings} role="tenant" />
      
      {/* Landlord routes */}
      <ProtectedRoute path="/landlord/dashboard" component={LandlordDashboard} role="landlord" />
      <ProtectedRoute path="/landlord/facebook-dashboard" component={FacebookLandlordDashboard} role="landlord" />
      <ProtectedRoute path="/landlord/properties" component={LandlordProperties} role="landlord" />
      <ProtectedRoute path="/landlord/tenants" component={LandlordTenants} role="landlord" />
      <ProtectedRoute path="/landlord/finances" component={Finances} role="landlord" />
      <ProtectedRoute path="/landlord/maintenance" component={Maintenance} role="landlord" />
      <ProtectedRoute path="/landlord/messages" component={Messages} role="landlord" />
      <ProtectedRoute path="/landlord/documents" component={Documents} role="landlord" />
      <ProtectedRoute path="/landlord/document-management" component={DocumentManagement} role="landlord" />

      <ProtectedRoute path="/landlord/market-intelligence" component={MarketIntelligence} role="landlord" />
      
      {/* Add routes for payments and other potential subpages */}
      <ProtectedRoute path="/landlord/payments/record" component={Finances} role="landlord" />
      <ProtectedRoute path="/landlord/finances/transactions" component={Finances} role="landlord" />
      <ProtectedRoute path="/landlord/messages/tenant/:id" component={Messages} role="landlord" />
      <ProtectedRoute path="/landlord/documents/tenant/:id" component={Documents} role="landlord" />
      <ProtectedRoute path="/landlord/leases/:id" component={DocumentManagement} role="landlord" />
      <ProtectedRoute path="/landlord/settings" component={LandlordSettings} role="landlord" />
      
      {/* Agency routes */}
      <ProtectedRoute path="/agency/dashboard" component={AgencyDashboard} role="agency" />
      <ProtectedRoute path="/agency/properties" component={AgencyProperties} role="agency" />
      <ProtectedRoute path="/agency/properties/:id" component={AgencyPropertyDetail} role="agency" />
      <ProtectedRoute path="/agency/property-listings" component={PropertyListings} role="agency" />
      <ProtectedRoute path="/agency/leads-management" component={LeadsManagement} role="agency" />
      <ProtectedRoute path="/agency/commission-tracker" component={CommissionTracker} role="agency" />
      <ProtectedRoute path="/agency/expiring-leases" component={ExpiringLeases} role="agency" />
      <ProtectedRoute path="/agency/tenants" component={Tenants} role="agency" />
      <ProtectedRoute path="/agency/messages" component={Messages} role="agency" />
      <ProtectedRoute path="/agency/documents" component={Documents} role="agency" />
      <ProtectedRoute path="/agency/settings" component={AgencySettings} role="agency" />
      
      {/* Maintenance routes */}
      <ProtectedRoute path="/maintenance/dashboard" component={MaintenanceDashboard} role="maintenance" />
      <ProtectedRoute path="/maintenance/jobs" component={Maintenance} role="maintenance" />
      <ProtectedRoute path="/maintenance/messages" component={Messages} role="maintenance" />
      <ProtectedRoute path="/maintenance/documents" component={Documents} role="maintenance" />
      <ProtectedRoute path="/maintenance/settings" component={MaintenanceSettings} role="maintenance" />
      
      {/* Maintenance Marketplace - accessible by all users */}
      <ProtectedRoute path="/maintenance/marketplace" component={MaintenanceMarketplace} />
      
      {/* Profile Pages - accessible to appropriate roles */}
      <ProtectedRoute path="/landlord/:id" component={LandlordProfile} />
      <ProtectedRoute path="/tenant/:id" component={TenantProfile} />
      <ProtectedRoute path="/agency/:id" component={AgencyProfile} />
      <ProtectedRoute path="/maintenance/:id" component={MaintenanceProfile} />
      
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
