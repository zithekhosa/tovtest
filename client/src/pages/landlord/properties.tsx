import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyDetails from "@/components/property/PropertyDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Plus, 
  Search, 
  Building, 
  CheckCircle2, 
  X 
} from "lucide-react";

export default function LandlordProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyFilter, setPropertyFilter] = useState("all");

  // Fetch landlord properties
  const { 
    data: properties,
    isLoading: isLoadingProperties,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties/landlord"],
  });

  const isLoading = isLoadingProperties;

  const handlePropertyEdit = () => {
    toast({
      title: "Coming Soon",
      description: "Property editing functionality is coming soon",
    });
  };

  // Filter properties based on search term and filter
  const filteredProperties = properties?.filter(property => {
    const matchesSearch = 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.zipCode.includes(searchTerm);

    if (propertyFilter === "all") return matchesSearch;
    if (propertyFilter === "available") return matchesSearch && property.available;
    if (propertyFilter === "occupied") return matchesSearch && !property.available;
    
    return matchesSearch;
  });

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
          <h1 className="text-2xl font-bold mb-1">Your Properties</h1>
          <p className="text-gray-500">Manage your rental properties</p>
        </div>
        <Button onClick={() => toast({
          title: "Coming Soon",
          description: "Add property functionality is coming soon",
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" value={propertyFilter} onValueChange={setPropertyFilter} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="occupied">Occupied</TabsTrigger>
                <TabsTrigger value="available">Vacant</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Property List */}
      {filteredProperties && filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => setSelectedProperty(property)}
              showActions={true}
              actionLabel={property.available ? "List Property" : "View Details"}
              onAction={() => setSelectedProperty(property)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-card text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
          {searchTerm ? (
            <p className="text-gray-500 mb-4">No properties match your search criteria. Try a different search.</p>
          ) : (
            <p className="text-gray-500 mb-4">You haven't added any properties yet.</p>
          )}
          <Button onClick={() => toast({
            title: "Coming Soon",
            description: "Add property functionality is coming soon",
          })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Property
          </Button>
        </div>
      )}

      {/* Property Details Dialog */}
      <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
        {selectedProperty && (
          <DialogContent className="max-w-3xl">
            <PropertyDetails 
              property={selectedProperty} 
              isLandlord={true}
              onEdit={handlePropertyEdit}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
