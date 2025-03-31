import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Property } from "@shared/schema";
import { Search, SlidersHorizontal, X } from "lucide-react";
import PropertyCard from "./PropertyCard";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import { cn } from "@/lib/utils";

interface PropertySearchComponentProps {
  initialQuery?: string;
  initialPropertyType?: string;
  standalone?: boolean;
  onPropertySelect?: (property: Property) => void;
  onPropertyRequest?: (property: Property) => void;
  onPropertyApply?: (property: Property) => void;
  className?: string;
}

export default function PropertySearchComponent({
  initialQuery = "",
  initialPropertyType = "any",
  standalone = true,
  onPropertySelect,
  onPropertyRequest,
  onPropertyApply,
  className
}: PropertySearchComponentProps) {
  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [propertyType, setPropertyType] = useState<string>(initialPropertyType);
  const [minBedrooms, setMinBedrooms] = useState<number | undefined>(undefined);
  const [maxBedrooms, setMaxBedrooms] = useState<number | undefined>(undefined);
  const [minBathrooms, setMinBathrooms] = useState<number | undefined>(undefined);
  const [maxBathrooms, setMaxBathrooms] = useState<number | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Format the price as BWP
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BW', {
      style: 'currency',
      currency: 'BWP',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Search API query
  const { data: properties, isLoading, refetch } = useQuery<Property[]>({
    queryKey: ['/api/public/properties/search'],
    enabled: false, // Don't run on mount
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (query) params.append('query', query);
      if (propertyType && propertyType !== 'any') params.append('propertyType', propertyType);
      if (minBedrooms !== undefined) params.append('minBedrooms', minBedrooms.toString());
      if (maxBedrooms !== undefined) params.append('maxBedrooms', maxBedrooms.toString());
      if (minBathrooms !== undefined) params.append('minBathrooms', minBathrooms.toString());
      if (maxBathrooms !== undefined) params.append('maxBathrooms', maxBathrooms.toString());
      if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
      if (priceRange[1] < 100000) params.append('maxPrice', priceRange[1].toString());
      
      const response = await fetch(`/api/public/properties/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      return response.json();
    }
  });

  // Handle search form submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchSubmitted(true);
    refetch();
  };

  // Reset filters
  const resetFilters = () => {
    setQuery(initialQuery);
    setPropertyType(initialPropertyType);
    setMinBedrooms(undefined);
    setMaxBedrooms(undefined);
    setMinBathrooms(undefined);
    setMaxBathrooms(undefined);
    setPriceRange([0, 100000]);
    setShowFilters(false);
    refetch();
  };

  // Handle property click
  const handlePropertyClick = (property: Property) => {
    if (onPropertySelect) {
      onPropertySelect(property);
    } else {
      setSelectedProperty(property);
      setIsDialogOpen(true);
    }
  };

  // Run initial search with defaults if standalone mode
  useEffect(() => {
    if (standalone) {
      handleSearch();
    }
  }, [standalone]);

  return (
    <div className={cn("w-full", className)}>
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search by location, property name, or keyword"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="whitespace-nowrap"
              >
                Search
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Property Type */}
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select
                      value={propertyType}
                      onValueChange={setPropertyType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any type</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Bedrooms */}
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <div className="flex gap-2">
                      <Select
                        value={minBedrooms?.toString() || "any"}
                        onValueChange={(val) => setMinBedrooms(val === "any" ? undefined : parseInt(val))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={maxBedrooms?.toString() || "any"}
                        onValueChange={(val) => setMaxBedrooms(val === "any" ? undefined : parseInt(val))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Max" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Bathrooms */}
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <div className="flex gap-2">
                      <Select
                        value={minBathrooms?.toString() || "any"}
                        onValueChange={(val) => setMinBathrooms(val === "any" ? undefined : parseInt(val))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={maxBathrooms?.toString() || "any"}
                        onValueChange={(val) => setMaxBathrooms(val === "any" ? undefined : parseInt(val))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Max" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Price Range */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Price Range</Label>
                      <span className="text-sm text-gray-500">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    <Slider
                      defaultValue={priceRange}
                      min={0}
                      max={100000}
                      step={1000}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="py-4"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="ml-2"
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
      
      {/* Search results */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : searchSubmitted && properties && properties.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No properties found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
          <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
        </div>
      ) : (
        <>
          {searchSubmitted && properties && (
            <div className="mb-4">
              <p className="text-gray-600">Found {properties.length} properties</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => handlePropertyClick(property)}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Property details dialog */}
      <PropertyDetailsDialog
        property={selectedProperty}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRequestToViewProperty={(property) => {
          if (onPropertyRequest) {
            onPropertyRequest(property);
          } else {
            // Default behavior if no handler provided
            console.log('Request viewing for property:', property.id);
          }
          setIsDialogOpen(false);
        }}
        onApplyForProperty={(property) => {
          if (onPropertyApply) {
            onPropertyApply(property);
          } else {
            // Default behavior if no handler provided
            console.log('Apply for property:', property.id);
          }
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}