import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { User, Lease, Property } from "@shared/schema";
import { format, differenceInDays } from "date-fns";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Calendar,
  DollarSign,
  Wallet,
  ChevronRight,
  Filter,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

export default function TenantsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<User | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tenantStatus, setTenantStatus] = useState("all");

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

    if (tenantStatus === "all") return matchesSearch;
    
    // Find leases for this tenant
    const tenantLeases = leases?.filter(lease => lease.tenantId === tenant.id) || [];
    const hasPendingPayment = tenantLeases.some(lease => lease.status === "pending");
    const hasActiveLeases = tenantLeases.some(lease => lease.active);
    
    if (tenantStatus === "active" && hasActiveLeases) return matchesSearch;
    if (tenantStatus === "pending" && hasPendingPayment) return matchesSearch;
    
    return false;
  });

  // Get tenant status info
  const getTenantStatus = (tenantId: number) => {
    const tenantLeases = leases?.filter(lease => lease.tenantId === tenantId) || [];
    
    if (tenantLeases.some(lease => lease.status === "pending")) {
      return {
        label: "Payment Pending",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        icon: <Clock className="h-3.5 w-3.5 mr-1.5" />
      };
    }
    
    if (tenantLeases.some(lease => lease.active)) {
      return {
        label: "Active",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
        icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
      };
    }

    return {
      label: "Inactive",
      className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />
    };
  };

  // Get tenant's property and lease info
  const getTenantPropertyInfo = (tenantId: number) => {
    const tenantLeases = leases?.filter(lease => lease.tenantId === tenantId && lease.active) || [];
    
    if (tenantLeases.length === 0) {
      return null;
    }
    
    const lease = tenantLeases[0];
    const property = properties?.find(p => p.id === lease.propertyId);
    
    if (!property) return null;
    
    const daysUntilEnd = lease.endDate ? differenceInDays(new Date(lease.endDate), new Date()) : 0;
    
    return {
      property,
      lease,
      daysUntilEnd
    };
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
    <StandardLayout
      title="Tenants"
      subtitle="Manage your tenant relationships"
    >
      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-[2fr,1fr] mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email or phone..."
            className="pl-9 h-12 bg-white dark:bg-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="h-12 w-full md:w-auto px-4 bg-white dark:bg-gray-900 font-normal"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="h-12 flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Filters */}
      {filterOpen && (
        <Card className="mb-6 border bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={tenantStatus === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTenantStatus("all")}
                className="rounded-full"
              >
                All Tenants
              </Button>
              <Button 
                variant={tenantStatus === "active" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTenantStatus("active")}
                className="rounded-full"
              >
                Active
              </Button>
              <Button 
                variant={tenantStatus === "pending" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTenantStatus("pending")}
                className="rounded-full"
              >
                Payment Pending
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tenants Grid */}
      {filteredTenants && filteredTenants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map((tenant) => {
            const statusInfo = getTenantStatus(tenant.id);
            const propertyInfo = getTenantPropertyInfo(tenant.id);
            
            return (
              <Card 
                key={tenant.id}
                className="overflow-hidden bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTenant(tenant)}
              >
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-base truncate">{tenant.firstName} {tenant.lastName}</h3>
                        <div className="flex items-center mt-0.5">
                          <Badge className={`text-xs px-2 py-0.5 font-normal flex items-center ${statusInfo.className}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                        <span className="truncate">{tenant.email}</span>
                      </div>
                      
                      {tenant.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                          <span>{tenant.phone}</span>
                        </div>
                      )}
                      
                      {propertyInfo ? (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
                          <div className="flex items-center text-sm mb-2">
                            <Home className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="font-medium truncate">{propertyInfo.property.title}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {propertyInfo.daysUntilEnd > 0 
                                  ? `${propertyInfo.daysUntilEnd} days left` 
                                  : "Expired"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-3.5 w-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400">
                                P{propertyInfo.lease.rentAmount.toLocaleString()}/mo
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Home className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                            <span>No active lease</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 py-2 px-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                        <Link href={`/landlord/messages/tenant/${tenant.id}`} onClick={(e) => e.stopPropagation()}>
                          <MessageSquare className="h-4 w-4" />
                          <span className="sr-only">Message</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                        <Link href={`/landlord/documents/tenant/${tenant.id}`} onClick={(e) => e.stopPropagation()}>
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Documents</span>
                        </Link>
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-normal">
                      View Profile
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white dark:bg-gray-900 text-center p-8 my-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Tenants Found</h3>
          {searchTerm || tenantStatus !== "all" ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                No tenants match your current filters. Try changing your search criteria or filters.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setTenantStatus('all');
              }}>
                Reset Filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't added any tenants yet. Add your first tenant to get started.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Tenant
              </Button>
            </>
          )}
        </Card>
      )}

      {/* Tenant Details Dialog */}
      {selectedTenant && (
        <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
          <DialogContent className="sm:max-w-md overflow-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl">Tenant Profile</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              {/* Profile header */}
              <div className="flex items-center mb-6">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                    {selectedTenant.firstName?.charAt(0)}{selectedTenant.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedTenant.firstName} {selectedTenant.lastName}</h3>
                  <div className="flex items-center mt-1">
                    {getTenantStatus(selectedTenant.id).icon}
                    <span className="text-sm">{getTenantStatus(selectedTenant.id).label}</span>
                  </div>
                </div>
              </div>

              {/* Contact information */}
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                      <span>{selectedTenant.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                      <span>{selectedTenant.phone || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lease information */}
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lease Information</h4>
                
                {(() => {
                  const info = getTenantPropertyInfo(selectedTenant.id);
                  
                  if (!info) {
                    return (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <Home className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No active lease</p>
                        <Button variant="outline" size="sm" className="mt-3">
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Add Lease
                        </Button>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium">{info.property.title}</div>
                        <Badge 
                          className={
                            info.daysUntilEnd > 30 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                              : info.daysUntilEnd > 0 
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" 
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {info.daysUntilEnd > 0 ? `${info.daysUntilEnd} days left` : "Expired"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">Monthly Rent</div>
                          <div className="font-semibold">P{info.lease.rentAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">Security Deposit</div>
                          <div className="font-semibold">P{info.lease.securityDeposit.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">Start Date</div>
                          <div>{format(new Date(info.lease.startDate), "MMM d, yyyy")}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">End Date</div>
                          <div>{format(new Date(info.lease.endDate), "MMM d, yyyy")}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/landlord/properties/${info.property.id}`}>
                            <Home className="h-3.5 w-3.5 mr-1.5" />
                            View Property
                          </Link>
                        </Button>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/landlord/leases/${info.lease.id}`}>
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            View Lease
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Financial information */}
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment History</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm font-medium">Recent Payments</div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs font-normal p-0">
                      <Link href={`/landlord/financial-management?tenant=${selectedTenant.id}`}>
                        View All
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm">March 2025 Rent</span>
                      </div>
                      <div className="text-sm font-medium">P3,500</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm">February 2025 Rent</span>
                      </div>
                      <div className="text-sm font-medium">P3,500</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm">January 2025 Rent</span>
                      </div>
                      <div className="text-sm font-medium">P3,500</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
              <Button variant="outline" asChild>
                <Link href={`/landlord/messages/tenant/${selectedTenant.id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/landlord/documents/tenant/${selectedTenant.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/landlord/payments/record?tenant=${selectedTenant.id}`}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </Link>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </StandardLayout>
  );
}