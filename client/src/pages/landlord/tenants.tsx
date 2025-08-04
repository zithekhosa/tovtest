import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { User, Lease, Property } from "@shared/schema";
import { format, addMonths } from "date-fns";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/utils";
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
  Clock,
  AlertTriangle,
  UserX,
  Scale,
  Calendar,
  Edit,
  Eye,
  RefreshCw,
  FileText as FileContract
} from "lucide-react";

export default function TenantsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Eviction dialog state
  const [evictionDialogOpen, setEvictionDialogOpen] = useState(false);
  const [evictionTenant, setEvictionTenant] = useState<User | null>(null);
  const [evictionReason, setEvictionReason] = useState("");
  const [evictionNotes, setEvictionNotes] = useState("");
  
  // Remove tenant dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTenant, setRemoveTenant] = useState<User | null>(null);
  const [isVoluntaryRemoval, setIsVoluntaryRemoval] = useState(false);
  
  // Lease management state
  const [leaseDialogOpen, setLeaseDialogOpen] = useState(false);
  const [selectedLeaseAction, setSelectedLeaseAction] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedTenantForLease, setSelectedTenantForLease] = useState<User | null>(null);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  
  // Lease form data
  const [leaseFormData, setLeaseFormData] = useState({
    propertyId: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    securityDeposit: '',
    leaseDuration: 12,
    terms: ''
  });
  
  // Eviction mutation
  const evictionMutation = useMutation({
    mutationFn: async ({ tenantId, reason, notes }: { tenantId: number; reason: string; notes: string }) => {
      const response = await apiRequest("POST", `/api/tenants/${tenantId}/eviction`, {
        reason,
        notes
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/tenants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leases/landlord"] });
      setEvictionDialogOpen(false);
      setEvictionTenant(null);
      setEvictionReason("");
      setEvictionNotes("");
      toast({
        title: "Eviction Notice Issued",
        description: "Legal eviction process has been initiated. The tenant will be notified.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate eviction process. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove tenant mutation (for immediate removal)
  const removeTenantMutation = useMutation({
    mutationFn: async ({ tenantId, isVoluntary }: { tenantId: number; isVoluntary: boolean }) => {
      const response = await apiRequest("POST", `/api/tenants/${tenantId}/remove`, {
        isVoluntary
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/tenants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leases/landlord"] });
      setRemoveDialogOpen(false);
      setRemoveTenant(null);
      setIsVoluntaryRemoval(false);
      toast({
        title: "Tenant Removed",
        description: "Tenant has been successfully removed from the property.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove tenant. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Create lease mutation
  const createLeaseMutation = useMutation({
    mutationFn: async (leaseData: any) => {
      const response = await apiRequest("POST", "/api/leases", leaseData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/tenants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leases/landlord"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/landlord"] });
      setLeaseDialogOpen(false);
      resetLeaseForm();
      toast({
        title: "Lease Created",
        description: "New lease has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create lease. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update lease mutation
  const updateLeaseMutation = useMutation({
    mutationFn: async ({ leaseId, leaseData }: { leaseId: number; leaseData: any }) => {
      const response = await apiRequest("PUT", `/api/leases/${leaseId}`, leaseData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/tenants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leases/landlord"] });
      setLeaseDialogOpen(false);
      resetLeaseForm();
      toast({
        title: "Lease Updated",
        description: "Lease has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lease. Please try again.",
        variant: "destructive",
      });
    },
  });

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
  
  // Get tenant's lease
  const getTenantLease = (tenantId: number) => {
    return leases?.find(lease => lease.tenantId === tenantId && lease.active);
  };
  
  // Get available properties for lease creation
  const getAvailableProperties = () => {
    return properties?.filter(p => p.available) || [];
  };
  
  // Helper functions for lease management
  const resetLeaseForm = () => {
    setLeaseFormData({
      propertyId: '',
      startDate: '',
      endDate: '',
      rentAmount: '',
      securityDeposit: '',
      leaseDuration: 12,
      terms: ''
    });
    setSelectedLeaseAction(null);
    setSelectedTenantForLease(null);
    setSelectedLease(null);
  };
  
  const openCreateLeaseDialog = (tenant: User) => {
    setSelectedTenantForLease(tenant);
    setSelectedLeaseAction('create');
    setLeaseDialogOpen(true);
  };
  
  const openEditLeaseDialog = (tenant: User, lease: Lease) => {
    setSelectedTenantForLease(tenant);
    setSelectedLease(lease);
    setSelectedLeaseAction('edit');
    setLeaseFormData({
      propertyId: lease.propertyId.toString(),
      startDate: format(new Date(lease.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(lease.endDate), 'yyyy-MM-dd'),
      rentAmount: lease.rentAmount.toString(),
      securityDeposit: lease.securityDeposit?.toString() || '',
      leaseDuration: 12,
      terms: lease.terms || ''
    });
    setLeaseDialogOpen(true);
  };
  
  const openViewLeaseDialog = (tenant: User, lease: Lease) => {
    setSelectedTenantForLease(tenant);
    setSelectedLease(lease);
    setSelectedLeaseAction('view');
    setLeaseDialogOpen(true);
  };
  
  const handleLeaseSubmit = () => {
    if (!selectedTenantForLease) return;
    
    const leaseData = {
      tenantId: selectedTenantForLease.id,
      propertyId: parseInt(leaseFormData.propertyId),
      startDate: new Date(leaseFormData.startDate),
      endDate: new Date(leaseFormData.endDate),
      rentAmount: parseInt(leaseFormData.rentAmount),
      securityDeposit: parseInt(leaseFormData.securityDeposit) || 0,
      terms: leaseFormData.terms,
      status: 'active',
      active: true
    };
    
    if (selectedLeaseAction === 'create') {
      createLeaseMutation.mutate(leaseData);
    } else if (selectedLeaseAction === 'edit' && selectedLease) {
      updateLeaseMutation.mutate({ leaseId: selectedLease.id, leaseData });
    }
  };
  
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setLeaseFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate end date when start date changes
      if (field === 'startDate' && value) {
        const startDate = new Date(value);
        const endDate = addMonths(startDate, prev.leaseDuration);
        updated.endDate = format(endDate, 'yyyy-MM-dd');
      }
      
      return updated;
    });
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
          <Button 
            className="h-10"
            onClick={() => {
              // Create lease for first tenant if any exist
              if (filteredTenants && filteredTenants.length > 0) {
                openCreateLeaseDialog(filteredTenants[0]);
              }
            }}
          >
            <FileContract className="h-4 w-4 mr-2" />
            Create Lease
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
            const lease = getTenantLease(tenant.id);
            
            // Debug logging
            console.log(`Tenant ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.id}):`, {
              hasLease: !!lease,
              lease: lease,
              property: property
            });
            
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
                    
                    {/* Lease Management Actions */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50" 
                      onClick={(e) => {
                        e.stopPropagation();
                        const lease = getTenantLease(tenant.id);
                        if (lease) {
                          openViewLeaseDialog(tenant, lease);
                        } else {
                          openCreateLeaseDialog(tenant);
                        }
                      }}
                      title={lease ? "View Lease" : "Create Lease"}
                    >
                      {lease ? <Eye className="h-4 w-4" /> : <FileContract className="h-4 w-4" />}
                    </Button>
                    
                    {lease && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditLeaseDialog(tenant, lease);
                        }}
                        title="Edit Lease"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Eviction Actions */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEvictionTenant(tenant);
                        setEvictionDialogOpen(true);
                      }}
                    >
                      <Scale className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setRemoveTenant(tenant);
                        setRemoveDialogOpen(true);
                      }}
                    >
                      <UserX className="h-4 w-4" />
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
          <h3 className="text-body-large mb-2">No Tenants Found</h3>
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
                    <div className="text-caption">
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

      {/* Lease Management Dialog */}
      <Dialog open={leaseDialogOpen} onOpenChange={setLeaseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileContract className="h-5 w-5 mr-2 text-purple-600" />
              {selectedLeaseAction === 'create' && 'Create New Lease'}
              {selectedLeaseAction === 'edit' && 'Edit Lease'}
              {selectedLeaseAction === 'view' && 'View Lease Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedLeaseAction === 'create' && `Create a new lease agreement for ${selectedTenantForLease?.firstName} ${selectedTenantForLease?.lastName}`}
              {selectedLeaseAction === 'edit' && `Modify the lease agreement for ${selectedTenantForLease?.firstName} ${selectedTenantForLease?.lastName}`}
              {selectedLeaseAction === 'view' && `View lease details for ${selectedTenantForLease?.firstName} ${selectedTenantForLease?.lastName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedLeaseAction !== 'view' ? (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Details</TabsTrigger>
                  <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="property">Property</Label>
                      <Select 
                        value={leaseFormData.propertyId} 
                        onValueChange={(value) => setLeaseFormData(prev => ({ ...prev, propertyId: value }))}
                        disabled={selectedLeaseAction === 'edit'}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedLeaseAction === 'create' ? 
                            getAvailableProperties().map((property) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                {property.title} - P{property.rentAmount.toLocaleString()}/mo
                              </SelectItem>
                            )) :
                            (properties || []).map((property) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                {property.title} - P{property.rentAmount.toLocaleString()}/mo
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Lease Duration (months)</Label>
                      <Select 
                        value={leaseFormData.leaseDuration.toString()} 
                        onValueChange={(value) => {
                          const duration = parseInt(value);
                          setLeaseFormData(prev => ({ ...prev, leaseDuration: duration }));
                          if (prev.startDate) {
                            const startDate = new Date(prev.startDate);
                            const endDate = addMonths(startDate, duration);
                            setLeaseFormData(prev => ({ ...prev, endDate: format(endDate, 'yyyy-MM-dd') }));
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="18">18 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={leaseFormData.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={leaseFormData.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rentAmount">Monthly Rent (BWP)</Label>
                      <Input
                        id="rentAmount"
                        type="number"
                        placeholder="8000"
                        value={leaseFormData.rentAmount}
                        onChange={(e) => setLeaseFormData(prev => ({ ...prev, rentAmount: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="securityDeposit">Security Deposit (BWP)</Label>
                      <Input
                        id="securityDeposit"
                        type="number"
                        placeholder="8000"
                        value={leaseFormData.securityDeposit}
                        onChange={(e) => setLeaseFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="terms" className="space-y-4">
                  <div>
                    <Label htmlFor="terms">Lease Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      placeholder="Enter special terms, conditions, and clauses for this lease agreement..."
                      value={leaseFormData.terms}
                      onChange={(e) => setLeaseFormData(prev => ({ ...prev, terms: e.target.value }))}
                      className="mt-1 min-h-[200px]"
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Standard Terms Include:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Monthly rent payment due on the 1st of each month</li>
                      <li>• Security deposit refundable upon lease termination</li>
                      <li>• 30-day notice required for lease termination</li>
                      <li>• Property maintenance responsibilities</li>
                      <li>• Compliance with Botswana rental laws</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              // View mode
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lease Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Property</Label>
                        <p className="text-sm">{properties?.find(p => p.id === selectedLease?.propertyId)?.title || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Monthly Rent</Label>
                        <p className="text-sm font-semibold">P{selectedLease?.rentAmount.toLocaleString()}/month</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <p className="text-sm">{selectedLease ? format(new Date(selectedLease.startDate), 'MMM dd, yyyy') : 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">End Date</Label>
                        <p className="text-sm">{selectedLease ? format(new Date(selectedLease.endDate), 'MMM dd, yyyy') : 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Security Deposit</Label>
                        <p className="text-sm">P{selectedLease?.securityDeposit?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={selectedLease?.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {selectedLease?.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedLease?.terms && (
                      <div>
                        <Label className="text-sm font-medium">Special Terms</Label>
                        <p className="text-sm bg-gray-50 p-3 rounded mt-1">{selectedLease.terms}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLeaseDialogOpen(false)}
            >
              {selectedLeaseAction === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {selectedLeaseAction !== 'view' && (
              <Button
                onClick={handleLeaseSubmit}
                disabled={
                  !leaseFormData.propertyId || 
                  !leaseFormData.startDate || 
                  !leaseFormData.endDate || 
                  !leaseFormData.rentAmount ||
                  createLeaseMutation.isPending ||
                  updateLeaseMutation.isPending
                }
                className="bg-purple-600 hover:bg-purple-700"
              >
                {createLeaseMutation.isPending || updateLeaseMutation.isPending 
                  ? 'Processing...' 
                  : selectedLeaseAction === 'create' 
                    ? 'Create Lease' 
                    : 'Update Lease'
                }
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Eviction Dialog */}
      <Dialog open={evictionDialogOpen} onOpenChange={setEvictionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <Scale className="h-5 w-5 mr-2" />
              Initiate Eviction Process
            </DialogTitle>
            <DialogDescription>
              Start the legal eviction process for {evictionTenant?.firstName} {evictionTenant?.lastName}. 
              This action will generate a formal eviction notice according to Botswana rental law.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Eviction Reason</label>
              <Select value={evictionReason} onValueChange={setEvictionReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select eviction reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non_payment">Non-payment of rent (7 days notice)</SelectItem>
                  <SelectItem value="lease_violation">Lease violation (30 days notice)</SelectItem>
                  <SelectItem value="property_damage">Property damage (14 days notice)</SelectItem>
                  <SelectItem value="illegal_activity">Illegal activity (7 days notice)</SelectItem>
                  <SelectItem value="end_of_lease">End of lease term (30 days notice)</SelectItem>
                  <SelectItem value="owner_occupation">Owner wants to occupy (90 days notice)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                placeholder="Provide specific details about the eviction reason..."
                value={evictionNotes}
                onChange={(e) => setEvictionNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Legal Notice Period</p>
                  <p>This will initiate a formal eviction process with the appropriate notice period according to Botswana law. The tenant will receive official documentation and have legal rights to respond.</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEvictionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (evictionTenant && evictionReason) {
                  evictionMutation.mutate({
                    tenantId: evictionTenant.id,
                    reason: evictionReason,
                    notes: evictionNotes
                  });
                }
              }}
              disabled={!evictionReason || evictionMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {evictionMutation.isPending ? 'Initiating...' : 'Initiate Eviction Process'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Tenant Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <UserX className="h-5 w-5 mr-2" />
              Remove Tenant
            </DialogTitle>
            <DialogDescription>
              Immediately remove {removeTenant?.firstName} {removeTenant?.lastName} from their property. 
              This action will terminate their lease and remove them from the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="voluntary"
                checked={isVoluntaryRemoval}
                onCheckedChange={(checked) => setIsVoluntaryRemoval(checked === true)}
              />
              <label htmlFor="voluntary" className="text-sm">
                This is a voluntary removal (tenant agreed to leave)
              </label>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-xs text-red-800">
                  <p className="font-medium mb-1">Warning: Immediate Action</p>
                  <p>This will immediately terminate the lease and remove the tenant from the property. Use this only for voluntary departures or after completing the legal eviction process.</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (removeTenant) {
                  removeTenantMutation.mutate({
                    tenantId: removeTenant.id,
                    isVoluntary: isVoluntaryRemoval
                  });
                }
              }}
              disabled={removeTenantMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeTenantMutation.isPending ? 'Removing...' : 'Remove Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardLayout>
  );
}