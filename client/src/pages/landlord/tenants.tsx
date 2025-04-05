import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { User, Lease, Property } from "@shared/schema";
import { format } from "date-fns";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { 
  Loader2, 
  Search, 
  Plus, 
  MessageSquare, 
  FileText, 
  User as UserIcon,
  Phone, 
  Mail, 
  Home,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

export default function TenantsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch tenants
  const { data: tenants, isLoading: isLoadingTenants } = useQuery<User[]>({
    queryKey: ["/api/users/tenants"],
  });

  // Fetch leases
  const { data: leases, isLoading: isLoadingLeases } = useQuery<Lease[]>({
    queryKey: ["/api/leases/landlord"],
  });
  
  // Fetch properties
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties/landlord"],
  });

  const isLoading = isLoadingTenants || isLoadingLeases || isLoadingProperties;

  // Filter tenants based on search term and filter type
  const filteredTenants = tenants?.filter(tenant => {
    const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.phone && tenant.phone.includes(searchTerm));

    if (activeFilter === "all") return matchesSearch;
    
    // Find leases for this tenant
    const tenantLeases = leases?.filter(lease => lease.tenantId === tenant.id) || [];
    const hasPendingPayment = tenantLeases.some(lease => lease.status === "pending");
    const hasActiveLeases = tenantLeases.some(lease => lease.active);
    
    if (activeFilter === "active" && hasActiveLeases) return matchesSearch;
    if (activeFilter === "pending" && hasPendingPayment) return matchesSearch;
    
    return false;
  });

  // Get tenant status
  const getTenantStatus = (tenantId: number) => {
    const tenantLeases = leases?.filter(lease => lease.tenantId === tenantId) || [];
    
    if (tenantLeases.some(lease => lease.status === "pending")) {
      return { label: "Payment Due", icon: <Clock className="h-3 w-3 mr-1" />, color: "text-amber-500" };
    }
    
    if (tenantLeases.some(lease => lease.active)) {
      return { label: "Active", icon: <CheckCircle className="h-3 w-3 mr-1" />, color: "text-emerald-500" };
    }

    return { label: "Inactive", icon: <XCircle className="h-3 w-3 mr-1" />, color: "text-gray-400" };
  };

  // Get tenant's property
  const getTenantProperty = (tenantId: number) => {
    const lease = leases?.find(lease => lease.tenantId === tenantId && lease.active);
    if (!lease) return null;
    
    return properties?.find(p => p.id === lease.propertyId);
  };

  // Get tenant's rent amount
  const getTenantRent = (tenantId: number) => {
    const lease = leases?.find(lease => lease.tenantId === tenantId && lease.active);
    return lease?.rentAmount || 0;
  };

  if (isLoading) {
    return (
      <StandardLayout title="Tenants">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout title="Tenants">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tenants..."
            className="pl-9 h-10 w-full bg-white dark:bg-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-md overflow-hidden border h-10">
            <button 
              className={`px-3 text-sm ${activeFilter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-3 text-sm ${activeFilter === 'active' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'}`}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button 
              className={`px-3 text-sm ${activeFilter === 'pending' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'}`}
              onClick={() => setActiveFilter('pending')}
            >
              Payment Due
            </button>
          </div>
          <Button className="h-10">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Tenant List */}
      {filteredTenants && filteredTenants.length > 0 ? (
        <div className="space-y-3">
          {filteredTenants.map((tenant) => {
            const status = getTenantStatus(tenant.id);
            const property = getTenantProperty(tenant.id);
            const rentAmount = getTenantRent(tenant.id);
            
            return (
              <div 
                key={tenant.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-900 rounded-lg p-4 hover:shadow-sm cursor-pointer"
                onClick={() => setSelectedTenant(tenant)}
              >
                <div className="flex items-center mb-3 sm:mb-0">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{tenant.firstName} {tenant.lastName}</div>
                    <div className="flex items-center text-xs mt-0.5">
                      <span className={`flex items-center ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                      {property && (
                        <span className="text-gray-500 dark:text-gray-400 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                          {property.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                  {rentAmount > 0 && (
                    <div className="flex items-center mb-2 sm:mb-0">
                      <Badge className="bg-primary/10 text-primary border-0 whitespace-nowrap font-normal py-1">
                        P{rentAmount.toLocaleString()}/mo
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/landlord/messages/tenant/${tenant.id}`} onClick={(e) => e.stopPropagation()}>
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/landlord/documents/tenant/${tenant.id}`} onClick={(e) => e.stopPropagation()}>
                        <FileText className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/landlord/payments/record?tenant=${tenant.id}`} onClick={(e) => e.stopPropagation()}>
                        <DollarSign className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
          <UserIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Tenants Found</h3>
          {searchTerm || activeFilter !== "all" ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                No tenants match your current search or filter.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                Add your first tenant to get started.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            </>
          )}
        </div>
      )}

      {/* Tenant Profile Dialog */}
      {selectedTenant && (
        <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
          <DialogContent className="max-w-sm p-6 overflow-auto max-h-[90vh]">
            <div className="text-center mb-6">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {selectedTenant.firstName?.charAt(0)}{selectedTenant.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-medium">{selectedTenant.firstName} {selectedTenant.lastName}</h2>
              <div className={`flex items-center justify-center mt-1 ${getTenantStatus(selectedTenant.id).color}`}>
                {getTenantStatus(selectedTenant.id).icon}
                <span className="text-sm">{getTenantStatus(selectedTenant.id).label}</span>
              </div>
            </div>
            
            <div className="space-y-5">
              {/* Contact Information */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="text-sm">{selectedTenant.email}</span>
                </div>
                <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="text-sm">{selectedTenant.phone || "Not provided"}</span>
                </div>
              </div>
              
              {/* Property Information */}
              {(() => {
                const property = getTenantProperty(selectedTenant.id);
                const rentAmount = getTenantRent(selectedTenant.id);
                
                if (!property) {
                  return (
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <Home className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">No active lease</p>
                    </div>
                  );
                }
                
                return (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium text-sm">{property.title}</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-0">
                        P{rentAmount.toLocaleString()}/mo
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {property.address}, {property.city}
                    </div>
                  </div>
                );
              })()}
              
              {/* Recent Payments */}
              <div className="border-t pt-5 mt-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Recent Payments</h3>
                  <Link href={`/landlord/finances?tenant=${selectedTenant.id}`} className="text-xs text-primary">
                    View All
                  </Link>
                </div>
                
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="text-sm">{format(new Date(2025, 3-i-1, 1), "MMMM yyyy")}</div>
                      <Badge variant="outline" className="font-normal">
                        Paid
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/landlord/messages/tenant/${selectedTenant.id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href={`/landlord/payments/record?tenant=${selectedTenant.id}`}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </StandardLayout>
  );
}