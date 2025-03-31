import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User, Lease } from "@shared/schema";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Plus, MessageSquare, Ban, FileText, User as UserIcon } from "lucide-react";

export default function TenantsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<User | null>(null);
  const [tenantFilter, setTenantFilter] = useState("all");

  // Fetch tenants
  const { data: tenants, isLoading: isLoadingTenants } = useQuery<User[]>({
    queryKey: ["/api/users/tenants"],
  });

  // Fetch leases
  const { data: leases, isLoading: isLoadingLeases } = useQuery<Lease[]>({
    queryKey: ["/api/leases/landlord"],
  });

  const isLoading = isLoadingTenants || isLoadingLeases;

  // Filter tenants based on search term and filter type
  const filteredTenants = tenants?.filter(tenant => {
    const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.phone && tenant.phone.includes(searchTerm));

    if (tenantFilter === "all") return matchesSearch;
    
    // Find leases for this tenant
    const tenantLeases = leases?.filter(lease => lease.tenantId === tenant.id) || [];
    const hasPendingPayment = tenantLeases.some(lease => lease.status === "pending");
    const hasActiveLeases = tenantLeases.some(lease => lease.active);
    
    if (tenantFilter === "active" && hasActiveLeases) return matchesSearch;
    if (tenantFilter === "pending" && hasPendingPayment) return matchesSearch;
    
    return false;
  });

  // Get tenant status for display
  const getTenantStatusBadge = (tenantId: number) => {
    const tenantLeases = leases?.filter(lease => lease.tenantId === tenantId) || [];
    
    if (tenantLeases.some(lease => lease.status === "pending")) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
    }
    
    if (tenantLeases.some(lease => lease.active)) {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Active</Badge>;
    }

    return <Badge variant="outline" className="bg-gray-100 text-gray-600">Inactive</Badge>;
  };

  // Get lease information for a tenant
  const getTenantLeaseInfo = (tenantId: number) => {
    const tenantLeases = leases?.filter(lease => lease.tenantId === tenantId) || [];
    const activeLeases = tenantLeases.filter(lease => lease.active);
    
    if (activeLeases.length === 0) {
      return "No active leases";
    }
    
    // Just show info for the first active lease if there are multiple
    const lease = activeLeases[0];
    const property = lease.propertyId ? "Property #" + lease.propertyId : "Unknown property";
    const endDate = lease.endDate ? format(new Date(lease.endDate), "MMM d, yyyy") : "N/A";
    
    return `${property} · Ends ${endDate}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Tenants</h1>
          <p className="text-gray-500">Manage your tenant relationships</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2 shrink-0" />
          Add Tenant
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tenants..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" value={tenantFilter} onValueChange={setTenantFilter} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 min-w-[240px]">
                <TabsTrigger value="all" className="px-4 py-2">All</TabsTrigger>
                <TabsTrigger value="active" className="px-4 py-2">Active</TabsTrigger>
                <TabsTrigger value="pending" className="px-4 py-2">Pending</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Tenant</TableHead>
                  <TableHead className="w-[150px]">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Lease Information</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants && filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                            <UserIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div>{tenant.firstName} {tenant.lastName}</div>
                            <div className="text-sm text-gray-500">{tenant.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTenantStatusBadge(tenant.id)}</TableCell>
                      <TableCell className="hidden md:table-cell text-gray-500">
                        {getTenantLeaseInfo(tenant.id)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedTenant(tenant)}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MessageSquare className="h-4 w-4" />
                            <span className="sr-only">Message</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {searchTerm ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <p className="text-gray-500 mb-2">No tenants match your search criteria.</p>
                          <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                            Clear Search
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <p className="text-gray-500 mb-2">You don't have any tenants yet.</p>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Your First Tenant
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Details Dialog */}
      {selectedTenant && (
        <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tenant Details</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedTenant.firstName} {selectedTenant.lastName}</h3>
                  <p className="text-gray-500">{selectedTenant.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{selectedTenant.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">{getTenantStatusBadge(selectedTenant.id)}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Lease Information</p>
                  <Card className="bg-gray-50">
                    <CardContent className="p-3">
                      <p className="text-sm">{getTenantLeaseInfo(selectedTenant.id)}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline">View Documents</Button>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}