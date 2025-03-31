import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { formatCurrency } from "@/lib/utils";
import { Property } from "@shared/schema";
import PropertyDetailsDialog from "@/components/property/PropertyDetailsDialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Search, 
  Home, 
  Building, 
  MapPin, 
  Bed, 
  Bath, 
  DollarSign, 
  Square, 
  Filter, 
  XCircle,
  ChevronsUpDown,
  BadgeCheck,
  Heart,
  ArrowUpDown,
  SquareIcon,
  LocateIcon
} from "lucide-react";

export default function PropertySearch() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string | null>(null);
  const [bedroomsFilter, setBedroomsFilter] = useState<Set<number>>(new Set());
  const [bathroomsFilter, setBathroomsFilter] = useState<Set<number>>(new Set());
  const [cityFilter, setCityFilter] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Fetch available properties
  const {
    data: properties,
    isLoading,
    error,
  } = useQuery<Property[]>({
    queryKey: ["/api/properties/available"],
  });

  useEffect(() => {
    if (properties) {
      let filtered = [...properties];

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (property) =>
            property.address.toLowerCase().includes(query) ||
            property.description?.toLowerCase().includes(query) ||
            property.city.toLowerCase().includes(query) ||
            property.state.toLowerCase().includes(query) ||
            property.propertyType.toLowerCase().includes(query)
        );
      }

      // Filter by property type
      if (propertyTypeFilter && propertyTypeFilter !== 'all') {
        filtered = filtered.filter(
          (property) => property.propertyType === propertyTypeFilter
        );
      }

      // Filter by bedrooms
      if (bedroomsFilter.size > 0) {
        filtered = filtered.filter((property) =>
          bedroomsFilter.has(property.bedrooms)
        );
      }

      // Filter by bathrooms
      if (bathroomsFilter.size > 0) {
        filtered = filtered.filter((property) =>
          bathroomsFilter.has(property.bathrooms)
        );
      }

      // Filter by city
      if (cityFilter.size > 0) {
        filtered = filtered.filter((property) =>
          cityFilter.has(property.city)
        );
      }

      // Filter by price range
      filtered = filtered.filter(
        (property) =>
          property.rentAmount >= minPrice && property.rentAmount <= maxPrice
      );

      // Sort properties
      switch (sortBy) {
        case "price_low":
          filtered.sort((a, b) => a.rentAmount - b.rentAmount);
          break;
        case "price_high":
          filtered.sort((a, b) => b.rentAmount - a.rentAmount);
          break;
        case "newest":
          // Assuming newer properties have higher IDs
          filtered.sort((a, b) => b.id - a.id);
          break;
        case "bedrooms":
          filtered.sort((a, b) => b.bedrooms - a.bedrooms);
          break;
        default:
          break;
      }

      setFilteredProperties(filtered);
    }
  }, [
    properties,
    searchQuery,
    propertyTypeFilter,
    bedroomsFilter,
    bathroomsFilter,
    cityFilter,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  // Get unique cities for filter
  const getCities = () => {
    if (!properties) return [];
    const cities = new Set<string>();
    properties.forEach((property) => {
      cities.add(property.city);
    });
    return Array.from(cities);
  };

  // Get unique property types for filter
  const getPropertyTypes = () => {
    if (!properties) return [];
    const types = new Set<string>();
    properties.forEach((property) => {
      types.add(property.propertyType);
    });
    return Array.from(types);
  };

  // Toggle filter values
  const toggleBedrooms = (value: number) => {
    const newFilter = new Set(bedroomsFilter);
    if (newFilter.has(value)) {
      newFilter.delete(value);
    } else {
      newFilter.add(value);
    }
    setBedroomsFilter(newFilter);
  };

  const toggleBathrooms = (value: number) => {
    const newFilter = new Set(bathroomsFilter);
    if (newFilter.has(value)) {
      newFilter.delete(value);
    } else {
      newFilter.add(value);
    }
    setBathroomsFilter(newFilter);
  };

  const toggleCity = (value: string) => {
    const newFilter = new Set(cityFilter);
    if (newFilter.has(value)) {
      newFilter.delete(value);
    } else {
      newFilter.add(value);
    }
    setCityFilter(newFilter);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setPropertyTypeFilter(null);
    setBedroomsFilter(new Set());
    setBathroomsFilter(new Set());
    setCityFilter(new Set());
    setMinPrice(0);
    setMaxPrice(10000);
    setSortBy("newest");
  };

  // View property details
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  // Apply for a property
  const handleApplyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  // Get highest price for slider
  const getMaxPropertyPrice = () => {
    if (!properties) return 10000;
    return Math.max(...properties.map((p) => p.rentAmount)) + 1000;
  };

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Properties</h2>
          <p className="text-gray-500 mb-4">Failed to load available properties. Please try again later.</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="space-y-6">
        <DashboardHeader
          title="Find Your Next Home"
          subtitle="Browse available properties and apply for your next rental"
        />

        {/* Search and Filters Area */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          {/* Main Search */}
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by location, property type, features..."
                className="pl-10 pr-16"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort by</SelectLabel>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => {
              const filterPanel = document.getElementById("filter-panel");
              if (filterPanel) {
                filterPanel.classList.toggle("hidden");
                filterPanel.classList.toggle("md:flex");
              }
            }}
          >
            <Filter className="h-4 w-4 mr-2 shrink-0" />
            Filters
            <Badge className="ml-2 bg-primary text-white" hidden={!(
              propertyTypeFilter || 
              bedroomsFilter.size > 0 || 
              bathroomsFilter.size > 0 || 
              cityFilter.size > 0 || 
              minPrice > 0 || 
              maxPrice < getMaxPropertyPrice()
            )}>
              {(propertyTypeFilter ? 1 : 0) + 
                bedroomsFilter.size + 
                bathroomsFilter.size + 
                cityFilter.size + 
                (minPrice > 0 || maxPrice < getMaxPropertyPrice() ? 1 : 0)}
            </Badge>
          </Button>
        </div>

        {/* Filter Panel */}
        <div 
          id="filter-panel" 
          className="hidden md:flex flex-col md:flex-row p-4 bg-gray-50 rounded-md space-y-4 md:space-y-0 md:space-x-6"
        >
          {/* Property Type */}
          <div className="md:w-1/5">
            <h3 className="font-medium mb-2">Property Type</h3>
            <Select value={propertyTypeFilter || ""} onValueChange={(value) => setPropertyTypeFilter(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getPropertyTypes().map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bedrooms */}
          <div className="md:w-1/5">
            <h3 className="font-medium mb-2">Bedrooms</h3>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Badge
                  key={num}
                  variant={bedroomsFilter.has(num) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleBedrooms(num)}
                >
                  {num} {num === 1 ? "Bed" : "Beds"}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div className="md:w-1/5">
            <h3 className="font-medium mb-2">Bathrooms</h3>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((num) => (
                <Badge
                  key={num}
                  variant={bathroomsFilter.has(num) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleBathrooms(num)}
                >
                  {num} {num === 1 ? "Bath" : "Baths"}
                </Badge>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="md:w-1/5">
            <h3 className="font-medium mb-2">City</h3>
            <div className="flex flex-col space-y-1 max-h-32 overflow-y-auto">
              {getCities().map((city) => (
                <div key={city} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`city-${city}`} 
                    checked={cityFilter.has(city)}
                    onCheckedChange={() => toggleCity(city)}
                  />
                  <label htmlFor={`city-${city}`} className="text-sm">
                    {city}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="md:w-1/5">
            <h3 className="font-medium mb-2">Price Range</h3>
            <div className="px-2">
              <Slider
                min={0}
                max={getMaxPropertyPrice()}
                step={100}
                value={[minPrice, maxPrice]}
                onValueChange={(values) => {
                  setMinPrice(values[0]);
                  setMaxPrice(values[1]);
                }}
                className="mb-4"
              />
              <div className="flex justify-between">
                <div className="text-sm">
                  <span className="text-gray-500">Min:</span> {formatCurrency(minPrice)}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Max:</span> {formatCurrency(maxPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="md:w-[100px] flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-gray-500">
            Showing {filteredProperties.length} 
            {filteredProperties.length === 1 ? " property" : " properties"}
          </p>
        </div>

        {/* Property Listings */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card 
                key={property.id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePropertyClick(property)}
              >
                <div className="aspect-video bg-gray-100 relative">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.address}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  {property.available && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-500">Available</Badge>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="font-bold text-white">{formatCurrency(property.rentAmount)}<span className="text-sm font-normal"> / month</span></h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1 line-clamp-1">{property.address}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {property.city}, {property.state}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm border-t pt-3">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}</span>
                    </div>
                    <div className="flex items-center">
                      <SquareIcon className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{property.squareFootage || "-"} sqft</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 px-4 pb-4">
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyClick(property);
                    }}
                  >
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-lg">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Properties Found</h2>
            <p className="text-gray-500 mb-4">
              We couldn't find any properties matching your search criteria. Try adjusting your filters.
            </p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Property Details Dialog */}
      {selectedProperty && (
        <PropertyDetailsDialog
          property={selectedProperty}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}
    </DashLayout>
  );
}