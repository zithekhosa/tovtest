import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "./hooks/use-auth";
import ErrorBoundary from "./components/debug/ErrorBoundary";
// Direct imports for components that need to be available immediately
const EvictionNotifications = lazy(() => import('./pages/tenant/eviction-notifications'));
const TenantLeaseRenewalManagement = lazy(() => import('./pages/tenant/lease-renewal-management'));
const AppointmentBooking = lazy(() => import('./pages/tenant/appointment-booking'));
const RatingReviews = lazy(() => import('./pages/tenant/rating-reviews'));
const MaintenanceAppointmentManagement = lazy(() => import('./pages/maintenance/appointment-management'));
const EmergencyJobs = lazy(() => import('./pages/maintenance/emergency-jobs'));
const QualityAssurance = lazy(() => import('./pages/maintenance/quality-assurance'));

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Lazy load all page components for better performance
const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const ProvidersSignup = lazy(() => import("@/pages/providers-signup"));
const LandingPage = lazy(() => import("@/pages/landing-page"));
const PropertySearchPage = lazy(() => import("@/pages/property-search-page"));
const PropertyApplication = lazy(() => import("@/pages/property-application"));
const PropertyDetails = lazy(() => import("@/pages/property-details"));

// Shared pages
const Documents = lazy(() => import("@/pages/documents"));
const Messages = lazy(() => import("@/pages/messages"));
// Removed old Maintenance component - using role-specific dashboards
const Tenants = lazy(() => import("@/pages/tenants"));
const Properties = lazy(() => import("@/pages/properties"));

// Profile pages
const LandlordProfile = lazy(() => import("@/pages/landlord-profile"));
const TenantProfile = lazy(() => import("@/pages/tenant-profile"));
const AgencyProfile = lazy(() => import("@/pages/agency-profile"));
const MaintenanceProfile = lazy(() => import("@/pages/maintenance-profile"));
const TestFacebookDashboard = lazy(() => import("@/pages/test-facebook-dashboard"));

// Tenant pages
const TenantDashboard = lazy(() => import("@/pages/tenant/dashboard"));
// Removed old TenantMaintenance - using TenantMaintenanceDashboard
const TenantMaintenanceDashboard = lazy(() => import("@/pages/tenant/maintenance-dashboard"));
const TenantPayments = lazy(() => import("@/pages/tenant/payments"));
const TenantApplications = lazy(() => import("@/pages/tenant/applications"));
const TenantPropertySearch = lazy(() => import("@/pages/tenant/property-search"));
const TenantMarketplace = lazy(() => import("@/pages/tenant/marketplace"));
const TenantLeaseHistory = lazy(() => import("@/pages/tenant/lease-history"));
const TenantSettings = lazy(() => import("@/pages/tenant/settings"));
const TenantCommunications = lazy(() => import("@/pages/tenant/communications"));
const TenantProperties = lazy(() => import("@/pages/tenant/properties"));
const TenantLeasing = lazy(() => import("@/pages/tenant/leasing"));

// Landlord pages
const LandlordDashboard = lazy(() => import("@/pages/landlord/dashboard"));
const FacebookLandlordDashboard = lazy(() => import("@/pages/landlord/facebook-dashboard"));
const LandlordMaintenanceDashboard = lazy(() => import("@/pages/landlord/maintenance-dashboard"));
const LandlordProperties = lazy(() => import("@/pages/landlord/properties"));
const PropertyEdit = lazy(() => import("@/pages/landlord/property-edit"));
const PropertyAdd = lazy(() => import("@/pages/landlord/property-add"));
const LandlordApplications = lazy(() => import("@/pages/landlord/applications"));
const LandlordTenants = lazy(() => import("@/pages/landlord/tenants"));
const Finances = lazy(() => import("@/pages/landlord/finances"));
const LandlordSettings = lazy(() => import("@/pages/landlord/settings"));
const DocumentManagement = lazy(() => import("@/pages/landlord/document-management"));
const MarketIntelligence = lazy(() => import("@/pages/landlord/market-intelligence"));
const LandlordAnalytics = lazy(() => import("@/pages/landlord/analytics"));
const LandlordAgentManagement = lazy(() => import("@/pages/landlord/agent-management"));
const LeaseTemplates = lazy(() => import("@/pages/landlord/lease-templates"));

// Agency pages
const AgencyDashboard = lazy(() => import("@/pages/agency/dashboard"));
const LeadsManagement = lazy(() => import("@/pages/agency/leads-management"));
const CommissionTracker = lazy(() => import("@/pages/agency/commission-tracker"));
const PropertyListings = lazy(() => import("@/pages/agency/property-listings"));
const ExpiringLeases = lazy(() => import("@/pages/agency/expiring-leases"));
const AgencySettings = lazy(() => import("@/pages/agency/settings"));
const AgencyProperties = lazy(() => import("@/pages/agency/properties"));
const AgencyPropertyDetail = lazy(() => import("@/pages/agency/property-detail"));
const AgencyLandlordManagement = lazy(() => import("@/pages/agency/landlord-management"));

// Phase 3: Agency Portal Enhancements
const EvictionManagement = lazy(() => import("@/pages/agency/eviction-management"));
const LeaseRenewalManagement = lazy(() => import("@/pages/agency/lease-renewal-management"));
const AppointmentManagement = lazy(() => import("@/pages/agency/appointment-management"));
const CommissionManagement = lazy(() => import("@/pages/agency/commission-management"));

// Phase 4: Agency Portal Consolidation
const AgencyLeads = lazy(() => import("@/pages/agency/leads"));
const AgencyLeases = lazy(() => import("@/pages/agency/leases"));
const AgencyCommissions = lazy(() => import("@/pages/agency/commissions"));
const AgencyMarketplace = lazy(() => import("@/pages/agency/marketplace"));

// Admin pages
const AdminVerification = lazy(() => import("@/pages/admin/verification"));

// Maintenance pages
const MaintenanceDashboard = lazy(() => import("@/pages/maintenance/dashboard"));
// Removed MaintenanceMarketplace - service marketplace not needed
const MaintenanceSettings = lazy(() => import("@/pages/maintenance/settings"));
const MaintenanceEarnings = lazy(() => import("@/pages/maintenance/earnings"));
const MaintenanceSchedule = lazy(() => import("@/pages/maintenance/schedule"));
const ContactPage = lazy(() => import("@/pages/contact"));
const SupabaseTest = lazy(() => import("@/components/SupabaseTest"));

// Wrapper component for lazy-loaded pages with error boundary
const LazyPage = ({ component: Component }: { component: React.ComponentType }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={() => <LazyPage component={LandingPage} />} />
        <Route path="/auth" component={() => <LazyPage component={AuthPage} />} />
        <Route path="/providers-signup" component={() => <LazyPage component={ProvidersSignup} />} />
        <Route path="/properties/search" component={() => <LazyPage component={PropertySearchPage} />} />
        <Route path="/property-application" component={() => <LazyPage component={PropertyApplication} />} />
        <Route path="/property/:id" component={() => <LazyPage component={PropertyDetails} />} />
        <Route path="/test-facebook" component={() => <LazyPage component={TestFacebookDashboard} />} />
        
        {/* Dashboard route - redirect to appropriate dashboard based on role */}
        <ProtectedRoute path="/dashboard" component={(props) => {
          const user = props?.user;
          if (!user) return null;
          if (user?.role === 'landlord') return <LazyPage component={LandlordDashboard} />;
          if (user?.role === 'tenant') return <LazyPage component={TenantDashboard} />;
          if (user?.role === 'agency') return <LazyPage component={AgencyDashboard} />;
          if (user?.role === 'maintenance') return <LazyPage component={MaintenanceDashboard} />;
          return <LazyPage component={TenantDashboard} />;
        }} />
        <ProtectedRoute path="/messages" component={() => <LazyPage component={Messages} />} />
        <ProtectedRoute path="/documents" component={() => <LazyPage component={Documents} />} />
        <ProtectedRoute path="/maintenance" component={() => {
          const { user } = useAuth();
          if (user?.role === 'tenant') return <LazyPage component={TenantMaintenanceDashboard} />;
          if (user?.role === 'landlord') return <LazyPage component={LandlordMaintenanceDashboard} />;
          if (user?.role === 'maintenance') return <LazyPage component={MaintenanceDashboard} />;
          return <LazyPage component={MaintenanceDashboard} />; // Default fallback
        }} />
        <ProtectedRoute path="/tenants" component={() => <LazyPage component={Tenants} />} />
        <Route path="/properties" component={() => <LazyPage component={Properties} />} />
        
        {/* Tenant routes */}
        <ProtectedRoute path="/tenant/dashboard" component={() => <LazyPage component={TenantDashboard} />} role="tenant" />
        <ProtectedRoute path="/tenant/maintenance" component={() => <LazyPage component={TenantMaintenanceDashboard} />} role="tenant" />
        <ProtectedRoute path="/tenant/payments" component={() => <LazyPage component={TenantPayments} />} role="tenant" />
        <ProtectedRoute path="/tenant/applications" component={() => <LazyPage component={TenantApplications} />} role="tenant" />
        <ProtectedRoute path="/tenant/property-search" component={() => <LazyPage component={TenantPropertySearch} />} role="tenant" />
        <ProtectedRoute path="/tenant/marketplace" component={() => <LazyPage component={TenantMarketplace} />} role="tenant" />
        <ProtectedRoute path="/tenant/lease-history" component={() => <LazyPage component={TenantLeaseHistory} />} role="tenant" />
        <ProtectedRoute path="/tenant/messages" component={() => <LazyPage component={Messages} />} role="tenant" />
        <ProtectedRoute path="/tenant/documents" component={() => <LazyPage component={Documents} />} role="tenant" />
        <ProtectedRoute path="/tenant/properties" component={() => <LazyPage component={TenantProperties} />} role="tenant" />
        <ProtectedRoute path="/tenant/settings" component={() => <LazyPage component={TenantSettings} />} role="tenant" />
        <ProtectedRoute path="/tenant/eviction-notifications" component={() => <LazyPage component={EvictionNotifications} />} role="tenant" />
        <ProtectedRoute path="/tenant/lease-renewal-management" component={() => <LazyPage component={TenantLeaseRenewalManagement} />} role="tenant" />
        <ProtectedRoute path="/tenant/appointment-booking" component={() => <LazyPage component={AppointmentBooking} />} role="tenant" />
        <ProtectedRoute path="/tenant/rating-reviews" component={() => <LazyPage component={RatingReviews} />} role="tenant" />
        
        {/* PHASE 3: Consolidated tenant communications page */}
        <ProtectedRoute path="/tenant/communications" component={() => <LazyPage component={TenantCommunications} />} role="tenant" />
        {/* PHASE 3: Consolidated tenant leasing page */}
        <ProtectedRoute path="/tenant/leasing" component={() => <LazyPage component={TenantLeasing} />} role="tenant" />
        {/* PHASE 3: Tenant Inbox (Messages + Notifications + Communications) */}
        <ProtectedRoute path="/tenant/inbox" component={() => <LazyPage component={Messages} />} role="tenant" />
        {/* PHASE 3: Tenant History (Activity/Transaction tracking) */}
        <ProtectedRoute path="/tenant/history" component={() => <LazyPage component={TenantLeaseHistory} />} role="tenant" />
        
        {/* Landlord routes */}
        <ProtectedRoute path="/landlord/dashboard" component={() => <LazyPage component={LandlordDashboard} />} role="landlord" />
        <ProtectedRoute path="/landlord/facebook-dashboard" component={() => <LazyPage component={FacebookLandlordDashboard} />} role="landlord" />
        <ProtectedRoute path="/landlord/properties" component={() => <LazyPage component={LandlordProperties} />} role="landlord" />
        <ProtectedRoute path="/landlord/properties/add" component={() => <LazyPage component={PropertyAdd} />} role="landlord" />
        <ProtectedRoute path="/landlord/properties/:id/edit" component={() => <LazyPage component={PropertyEdit} />} role="landlord" />
        <ProtectedRoute path="/landlord/applications" component={() => <LazyPage component={LandlordApplications} />} role="landlord" />
        <ProtectedRoute path="/landlord/tenants" component={() => <LazyPage component={LandlordTenants} />} role="landlord" />
        <ProtectedRoute path="/landlord/finances" component={() => <LazyPage component={Finances} />} role="landlord" />
        <ProtectedRoute path="/landlord/maintenance" component={() => <LazyPage component={LandlordMaintenanceDashboard} />} role="landlord" />
        <ProtectedRoute path="/landlord/messages" component={() => <LazyPage component={Messages} />} role="landlord" />
        <ProtectedRoute path="/landlord/inbox" component={() => <LazyPage component={Messages} />} role="landlord" />
        <ProtectedRoute path="/landlord/documents" component={() => <LazyPage component={Documents} />} role="landlord" />
        <ProtectedRoute path="/landlord/document-management" component={() => <LazyPage component={DocumentManagement} />} role="landlord" />
        <ProtectedRoute path="/landlord/market-intelligence" component={() => <LazyPage component={MarketIntelligence} />} role="landlord" />
        <ProtectedRoute path="/landlord/analytics" component={() => <LazyPage component={LandlordAnalytics} />} role="landlord" />
        <ProtectedRoute path="/landlord/agent-management" component={() => <LazyPage component={LandlordAgentManagement} />} role="landlord" />
        <ProtectedRoute path="/landlord/lease-templates" component={() => <LazyPage component={LeaseTemplates} />} role="landlord" />
        
        {/* Add routes for landlord action pages */}
        <ProtectedRoute path="/landlord/tenants/add" component={() => <LazyPage component={LandlordTenants} />} role="landlord" />
        <ProtectedRoute path="/landlord/documents/upload" component={() => <LazyPage component={Documents} />} role="landlord" />
        <ProtectedRoute path="/landlord/maintenance/request" component={() => <LazyPage component={LandlordMaintenanceDashboard} />} role="landlord" />
        <ProtectedRoute path="/landlord/payments/overdue" component={() => <LazyPage component={Finances} />} role="landlord" />
        <ProtectedRoute path="/landlord/activity" component={() => <LazyPage component={LandlordAnalytics} />} role="landlord" />
        
        {/* Property management routes */}
        <ProtectedRoute path="/landlord/property-add" component={() => <LazyPage component={PropertyAdd} />} role="landlord" />
        <ProtectedRoute path="/landlord/properties/add" component={() => <LazyPage component={PropertyAdd} />} role="landlord" />
        <ProtectedRoute path="/landlord/properties/:id/edit" component={() => <LazyPage component={PropertyEdit} />} role="landlord" />
        <ProtectedRoute path="/property-details/:id" component={() => <LazyPage component={PropertyDetails} />} />
        
        <ProtectedRoute path="/landlord/properties/:id" component={() => <LazyPage component={LandlordProperties} />} role="landlord" />
        <ProtectedRoute path="/landlord/tenants/:id" component={() => <LazyPage component={LandlordTenants} />} role="landlord" />
        <ProtectedRoute path="/landlord/maintenance/:id" component={() => <LazyPage component={LandlordMaintenanceDashboard} />} role="landlord" />
        
        {/* Add routes for payments and other potential subpages */}
        <ProtectedRoute path="/landlord/payments/record" component={() => <LazyPage component={Finances} />} role="landlord" />
        <ProtectedRoute path="/landlord/finances/transactions" component={() => <LazyPage component={Finances} />} role="landlord" />
        <ProtectedRoute path="/landlord/messages/tenant/:id" component={() => <LazyPage component={Messages} />} role="landlord" />
        <ProtectedRoute path="/landlord/documents/tenant/:id" component={() => <LazyPage component={Documents} />} role="landlord" />
        <ProtectedRoute path="/landlord/leases/:id" component={() => <LazyPage component={DocumentManagement} />} role="landlord" />
        <ProtectedRoute path="/landlord/settings" component={() => <LazyPage component={LandlordSettings} />} role="landlord" />
        
        {/* Agency routes */}
        <ProtectedRoute path="/agency/dashboard" component={() => <LazyPage component={AgencyDashboard} />} role="agency" />
        <ProtectedRoute path="/agency/properties" component={() => <LazyPage component={AgencyProperties} />} role="agency" />
        <ProtectedRoute path="/agency/properties/:id" component={() => <LazyPage component={AgencyPropertyDetail} />} role="agency" />
        <ProtectedRoute path="/agency/property-listings" component={() => <LazyPage component={PropertyListings} />} role="agency" />
        <ProtectedRoute path="/agency/leads-management" component={() => <LazyPage component={LeadsManagement} />} role="agency" />
        <ProtectedRoute path="/agency/commission-tracker" component={() => <LazyPage component={CommissionTracker} />} role="agency" />
        <ProtectedRoute path="/agency/landlord-management" component={() => <LazyPage component={AgencyLandlordManagement} />} role="agency" />
        <ProtectedRoute path="/agency/eviction-management" component={() => <LazyPage component={EvictionManagement} />} role="agency" />
        <ProtectedRoute path="/agency/lease-renewal-management" component={() => <LazyPage component={LeaseRenewalManagement} />} role="agency" />
        <ProtectedRoute path="/agency/appointment-management" component={() => <LazyPage component={AppointmentManagement} />} role="agency" />
        <ProtectedRoute path="/agency/commission-management" component={() => <LazyPage component={CommissionManagement} />} role="agency" />
        <ProtectedRoute path="/agency/expiring-leases" component={() => <LazyPage component={ExpiringLeases} />} role="agency" />
        <ProtectedRoute path="/agency/tenants" component={() => <LazyPage component={Tenants} />} role="agency" />
        <ProtectedRoute path="/agency/landlords" component={() => <LazyPage component={Tenants} />} role="agency" />
        <ProtectedRoute path="/agency/messages" component={() => <LazyPage component={Messages} />} role="agency" />
        <ProtectedRoute path="/agency/documents" component={() => <LazyPage component={Documents} />} role="agency" />
        <ProtectedRoute path="/agency/settings" component={() => <LazyPage component={AgencySettings} />} role="agency" />
        
        {/* Phase 4: Agency Portal Consolidated Routes */}
        <ProtectedRoute path="/agency/leads" component={() => <LazyPage component={AgencyLeads} />} role="agency" />
        <ProtectedRoute path="/agency/leases" component={() => <LazyPage component={AgencyLeases} />} role="agency" />
        <ProtectedRoute path="/agency/commissions" component={() => <LazyPage component={AgencyCommissions} />} role="agency" />
        <ProtectedRoute path="/agency/appointments" component={() => <LazyPage component={AppointmentManagement} />} role="agency" />
        <ProtectedRoute path="/agency/marketplace" component={() => <LazyPage component={AgencyMarketplace} />} role="agency" />
        
        {/* Admin routes (using agency role for now as TOV staff) */}
        <ProtectedRoute path="/admin/verification" component={() => <LazyPage component={AdminVerification} />} role="agency" />
        
        {/* Maintenance routes */}
        <ProtectedRoute path="/maintenance/dashboard" component={() => <LazyPage component={MaintenanceDashboard} />} role="maintenance" />
        <ProtectedRoute path="/maintenance/jobs" component={() => <LazyPage component={MaintenanceDashboard} />} role="maintenance" />
        <ProtectedRoute path="/maintenance/messages" component={() => <LazyPage component={Messages} />} role="maintenance" />
        <ProtectedRoute path="/maintenance/documents" component={() => <LazyPage component={Documents} />} role="maintenance" />
        <ProtectedRoute path="/maintenance/earnings" component={() => <LazyPage component={MaintenanceEarnings} />} role="maintenance" />
        <ProtectedRoute path="/maintenance/schedule" component={() => <LazyPage component={MaintenanceSchedule} />} role="maintenance" />
        <ProtectedRoute path="/maintenance/settings" component={() => <LazyPage component={MaintenanceSettings} />} role="maintenance" />
        <ProtectedRoute path="/maintenance/appointment-management" component={() => <LazyPage component={MaintenanceAppointmentManagement} />} role="maintenance" />
        <ProtectedRoute path="/maintenance/emergency-jobs" component={() => <LazyPage component={EmergencyJobs} />} role="maintenance" />
        <ProtectedRoute path="/maintenance/quality-assurance" component={() => <LazyPage component={QualityAssurance} />} role="maintenance" />
        
        {/* Removed maintenance marketplace - not needed */}
        
        {/* Contact/Support - accessible by all users */}
        <ProtectedRoute path="/contact" component={() => <LazyPage component={ContactPage} />} />
        
        {/* Profile routes */}
        <ProtectedRoute path="/profile/landlord" component={() => <LazyPage component={LandlordProfile} />} role="landlord" />
        <ProtectedRoute path="/profile/tenant" component={() => <LazyPage component={TenantProfile} />} role="tenant" />
        <ProtectedRoute path="/profile/agency" component={() => <LazyPage component={AgencyProfile} />} role="agency" />
        <ProtectedRoute path="/profile/maintenance" component={() => <LazyPage component={MaintenanceProfile} />} role="maintenance" />
        
        {/* Test routes */}
        <ProtectedRoute path="/test/supabase" component={() => <LazyPage component={SupabaseTest} />} />
        
        {/* 404 route */}
        <Route component={() => <LazyPage component={NotFound} />} />
      </Switch>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router />
      <Toaster />
    </ErrorBoundary>
  );
}
