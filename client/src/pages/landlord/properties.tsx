import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import { Link } from "wouter";
import { StandardLayout } from "@/components/layout/StandardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Plus, 
  Search, 
  Building, 
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Filter,
  ChevronRight
} from "lucide-react";

export default function LandlordProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState("all");

  // Fetch landlord properties
  const { 
    data: properties,
    isLoading: isLoadingProperties,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties/landlord"],
  });

  const isLoading = isLoadingProperties;

  // Filter properties based on search term and filter
  const filteredProperties = properties?.filter(property => {
    const matchesSearch = searchTerm === "" || 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.zipCode.includes(searchTerm) ||
      property.title.toLowerCase().includes(searchTerm.toLowerCase());

    if (propertyStatus === "all") return matchesSearch;
    if (propertyStatus === "available") return matchesSearch && property.available;
    if (propertyStatus === "occupied") return matchesSearch && !property.available;
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <StandardLayout title="Properties">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout
      title="Properties"
      subtitle="Manage your rental properties"
    >
      {/* Search */}
      <div className="grid gap-4 md:grid-cols-[2fr,1fr] mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by address, city or property name..."
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
          <Button className="h-12 flex-1" onClick={() => toast({
            title: "Coming Soon",
            description: "Add property functionality is coming soon",
          })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Filters */}
      {filterOpen && (
        <Card className="mb-6 border bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={propertyStatus === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPropertyStatus("all")}
                className="rounded-full"
              >
                All Properties
              </Button>
              <Button 
                variant={propertyStatus === "occupied" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPropertyStatus("occupied")}
                className="rounded-full"
              >
                Occupied
              </Button>
              <Button 
                variant={propertyStatus === "available" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPropertyStatus("available")}
                className="rounded-full"
              >
                Vacant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Grid */}
      {filteredProperties && filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Link href={`/landlord/properties/${property.id}`} key={property.id}>
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white dark:bg-gray-900">
                <div className="h-44 bg-gray-200 dark:bg-gray-800 relative">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Badge 
                    className={`absolute top-3 right-3 ${
                      property.available 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {property.available ? 'Vacant' : 'Occupied'}
                  </Badge>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg line-clamp-1">{property.title}</h3>
                      <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{property.address}, {property.city}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-primary font-semibold">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span>{property.rentAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 my-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-center">
                      <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                        <Bed className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{property.bedrooms} beds</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-center">
                      <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                        <Bath className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{property.bathrooms} baths</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-center">
                      <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-1">
                        <Square className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{property.squareFootage || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {property.propertyType}
                    </span>
                    <Button variant="ghost" size="sm" className="font-normal p-0 h-auto">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-white dark:bg-gray-900 text-center p-8 my-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Properties Found</h3>
          {searchTerm || propertyStatus !== "all" ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                No properties match your current filters. Try changing your search criteria or filters.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setPropertyStatus('all');
              }}>
                Reset Filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't added any properties to your portfolio yet. Add your first property to get started.
              </p>
              <Button onClick={() => toast({
                title: "Coming Soon",
                description: "Add property functionality is coming soon",
              })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </>
          )}
        </Card>
      )}
    </StandardLayout>
  );
}
