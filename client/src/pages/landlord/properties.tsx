// Completely Redesigned Properties Page - Analytics Style
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashLayout from "@/components/layout/DashLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import PropertyPublishToggle from "@/components/property/PropertyPublishToggle";
import { 
  Building, 
  DollarSign, 
  Home, 
  Users,
  Search,
  Filter,
  Plus,
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  Edit,
  Loader2,
  Globe,
  EyeOff
} from "lucide-react";

export default function LandlordProperties() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");

  // Fetch properties data
  const { data: propertiesData, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/properties/landlord`],
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('Not authenticated')) {
        return false;
      }
      return failureCount < 3;
    },
    queryFn: async () => {
      console.log('🔍 LandlordProperties: Fetching properties for user:', user);
      
      const response = await fetch(`/api/properties/landlord`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }
      
      const landlordProperties = await response.json();
      console.log('🏠 LandlordProperties: Properties for landlord:', landlordProperties.length, 'User ID:', user?.id);
      
      const result = {
        properties: landlordProperties,
        summary: {
          totalProperties: landlordProperties.length,
          occupiedProperties: landlordProperties.filter(p => !p.available).length,
          vacantProperties: landlordProperties.filter(p => p.available).length,
          publishedProperties: landlordProperties.filter(p => p.isListed).length,
          draftProperties: landlordProperties.filter(p => !p.isListed).length,
          occupancyRate: landlordProperties.length > 0 ? 
            Math.round((landlordProperties.filter(p => !p.available).length / landlordProperties.length) * 100) : 0
        }
      };
      
      console.log('✅ LandlordProperties: Query result:', result);
      return result;
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to get latest data
  });

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading properties...</span>
        </div>
      </DashLayout>
    );
  }

  if (error) {
    console.error('❌ LandlordProperties: Query error:', error);
    return (
      <DashLayout>
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="text-red-500">Error loading properties: {error.message}</div>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </DashLayout>
    );
  }

  if (!propertiesData) {
    console.warn('⚠️ LandlordProperties: No properties data received');
    return (
      <DashLayout>
        <div className="flex justify-center items-center h-64">
          <div>No properties data available</div>
        </div>
      </DashLayout>
    );
  }

  const formatCurrency = (amount: number) => `P${amount.toLocaleString()}`;
  
  // Filter properties based on search, status, and publishing status
  const filteredProperties = propertiesData?.properties?.filter(property => {
    const matchesSearch = (property.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (property.address?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "occupied" && !property.available) ||
                         (filterStatus === "vacant" && property.available);
    const matchesPublishStatus = publishFilter === "all" ||
                                (publishFilter === "published" && property.isListed) ||
                                (publishFilter === "draft" && !property.isListed);
    return matchesSearch && matchesStatus && matchesPublishStatus;
  }) || [];

  return (
    <DashLayout>
      <div className="space-y-6">
        {/* Header - Analytics Style */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Properties</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and monitor your property portfolio
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button asChild>
              <Link href="/landlord/property-add">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards - Analytics Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{propertiesData?.summary?.totalProperties || 0}</div>
              <p className="text-xs text-muted-foreground">
                Properties in portfolio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{propertiesData?.summary?.occupiedProperties || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently rented
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacant</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{propertiesData?.summary?.vacantProperties || 0}</div>
              <p className="text-xs text-muted-foreground">
                Available for rent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(propertiesData?.summary?.monthlyIncome || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Total rental income
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{propertiesData?.summary?.publishedProperties || 0}</div>
              <p className="text-xs text-muted-foreground">
                In property browser
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters - Analytics Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Properties
            </CardTitle>
            <CardDescription>
              Find and filter your properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by property name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "occupied" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("occupied")}
                >
                  Occupied
                </Button>
                <Button
                  variant={filterStatus === "vacant" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("vacant")}
                >
                  Vacant
                </Button>
              </div>
              
              {/* Publishing Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={publishFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPublishFilter("all")}
                >
                  All Status
                </Button>
                <Button
                  variant={publishFilter === "published" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPublishFilter("published")}
                  className="flex items-center gap-1"
                >
                  <Globe className="h-3 w-3" />
                  Published
                </Button>
                <Button
                  variant={publishFilter === "draft" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPublishFilter("draft")}
                  className="flex items-center gap-1"
                >
                  <EyeOff className="h-3 w-3" />
                  Draft
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid - Analytics Style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              {/* Property Image */}
              <div className="h-48 bg-gray-200 dark:bg-gray-800 relative">
                {property.images && property.images[0] ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.title || 'Property'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                    <Home className="h-12 w-12" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  <Badge 
                    className={`${
                      property.available 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {property.available ? 'Vacant' : 'Occupied'}
                  </Badge>
                  
                  <Badge 
                    variant={property.isListed ? "secondary" : "outline"}
                    className={`${
                      property.isListed 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {property.isListed ? 'Published' : 'Draft'}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0" asChild>
                    <Link href={`/property-details/${property.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0" asChild>
                    <Link href={`/landlord/properties/${property.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Property Details */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Title and Address */}
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{property.title || 'Untitled Property'}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{property.address || 'Address not available'}</span>
                    </div>
                  </div>

                  {/* Property Features */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      <span>{property.bedrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      <span>{property.bathrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-3 w-3" />
                      <span>{property.squareMeters || property.squareFootage || 0}m²</span>
                    </div>
                  </div>

                  {/* Rent Amount */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(property.rentAmount || 0)}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                  </div>

                  {/* Publishing Toggle */}
                  <div className="pt-2 border-t">
                    <PropertyPublishToggle
                      propertyId={property.id}
                      isListed={property.isListed || false}
                      onToggle={(newStatus) => {
                        // Update the local state to reflect the change immediately
                        if (propertiesData) {
                          const updatedProperties = propertiesData.properties.map(p => 
                            p.id === property.id ? { ...p, isListed: newStatus } : p
                          );
                          // This would ideally trigger a refetch, but for now we'll update locally
                          console.log(`Property ${property.id} ${newStatus ? 'published' : 'unpublished'}`);
                        }
                      }}
                    />
                  </div>

                  {/* Tenant Info (if occupied) */}
                  {property.occupied && property.tenant && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mt-3">
                      <div className="text-sm">
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                          Tenant: {property.tenant.name}
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">
                          {property.tenant.phone}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No properties found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first property"
                }
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button asChild>
                  <Link href="/landlord/properties/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashLayout>
  );
}