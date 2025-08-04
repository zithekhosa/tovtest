import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import DashLayout from "@/components/layout/DashLayout";
import { AgencyPropertyCard } from "@/components/agency/AgencyPropertyCard";
import { 
  Search, 
  Building, 
  Loader2, 
  SlidersHorizontal,
  PlusCircle,
  ArrowUpDown,
  TrendingUp,
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock marketing stats generator (would come from real data in a real implementation)
const generateMarketingStats = (propertyId: number) => {
  // Use property ID to seed random generation but make it deterministic
  const seed = propertyId * 13;
  
  return {
    views: 50 + (seed % 150),
    calls: 2 + (seed % 15),
    inquiries: 5 + (seed % 10),
    leadConversionRate: Math.floor(5 + (seed % 20)),
    daysListed: 1 + (seed % 60),
    scheduledViewings: Math.floor(seed % 6),
  };
};

export default function AgencyProperties() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("engagement");
  const [propertyType, setPropertyType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch properties for the agency
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/agency"],
    enabled: user?.role === "agency",
  });
  
  // Fetch performance metrics (this would be a real API call in production)
  const { data: performanceMetrics = {
    totalViews: 3240,
    totalInquiries: 86,
    conversionRate: 15,
    averageDaysListed: 23,
  }, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["/api/agency/metrics"],
    enabled: user?.role === "agency",
  });
  
  // Apply filters and sorting
  const filteredProperties = properties.filter(property => {
    // Text search filter
    const matchesSearch = 
      !searchTerm || 
      (property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       property.city?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Property type filter
    const matchesType = 
      propertyType === "all" || 
      property.propertyType === propertyType;
    
    // Tab filter (all, active, pending)
    const matchesTab = activeTab === "all" || 
                       (activeTab === "active" && property.available) ||
                       (activeTab === "pending" && !property.available);
    
    return matchesSearch && matchesType && matchesTab;
  });
  
  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    const statsA = generateMarketingStats(a.id);
    const statsB = generateMarketingStats(b.id);
    
    switch (sortBy) {
      case "engagement":
        // Sort by total engagement (views + calls)
        return (statsB.views + statsB.calls) - (statsA.views + statsA.calls);
      case "price_asc":
        return (a.rentAmount || 0) - (b.rentAmount || 0);
      case "price_desc":
        return (b.rentAmount || 0) - (a.rentAmount || 0);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "views":
        return statsB.views - statsA.views;
      default:
        return 0;
    }
  });
  
  if (isLoading || isLoadingMetrics) {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading properties...</p>
        </div>
      </DashLayout>
    );
  }
  
  return (
    <DashLayout>
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Properties</h1>
            <p className="text-gray-500 mt-1">Manage listings and marketing performance</p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => navigate("/properties/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Listing
          </Button>
        </div>
      </header>

      <Tabs defaultValue="marketing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marketing">Marketing Performance</TabsTrigger>
          <TabsTrigger value="listings">Property Listings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="marketing" className="space-y-6">
      
      {/* Performance overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-heading-2">{performanceMetrics.totalViews}</p>
            <p className="text-sm text-success-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-heading-2">{performanceMetrics.totalInquiries}</p>
            <p className="text-sm text-success-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-heading-2">{performanceMetrics.conversionRate}%</p>
            <p className="text-sm text-success-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.5% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Days Listed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-heading-2">{performanceMetrics.averageDaysListed}</p>
            <p className="text-sm text-success-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              -3 days from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and tabs */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All Properties</TabsTrigger>
              <TabsTrigger value="active">Active Listings</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
            
            <div className="flex mt-4 md:mt-0 space-x-2">
              <div className="relative w-full md:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  className="pl-9 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-[160px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartments</SelectItem>
                  <SelectItem value="house">Houses</SelectItem>
                  <SelectItem value="office">Offices</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[160px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort By
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("engagement")}>
                    Highest Engagement
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price_asc")}>
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price_desc")}>
                    Price: High to Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("views")}>
                    Most Views
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {renderPropertyGrid(sortedProperties)}
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            {renderPropertyGrid(sortedProperties.filter(p => p.available))}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            {renderPropertyGrid(sortedProperties.filter(p => !p.available))}
          </TabsContent>
        </Tabs>
      </div>
        </TabsContent>
        
        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Listings Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-body-large mb-2">Listings Management</h3>
                <p className="text-gray-500 mb-4">Manage your property listings and availability</p>
                <Button asChild>
                  <a href="/agency/property-listings" className="inline-flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    View All Listings
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashLayout>
  );
  
  function renderPropertyGrid(properties: Property[]) {
    if (properties.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-body-large">No properties found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No properties match your search criteria" : "Get started by adding your first property"}
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate("/properties/create")}>
              Add Your First Property
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <AgencyPropertyCard
            key={property.id}
            property={property}
            marketingStats={generateMarketingStats(property.id)}
            onClick={() => navigate(`/agency/properties/${property.id}`)}
          />
        ))}
      </div>
    );
  }
}