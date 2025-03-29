import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { User } from "@shared/schema";
import { Search, Wrench, Star, MessageSquare, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Maintenance service categories
const serviceCategories = [
  "All",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Carpentry",
  "Painting",
  "Appliance Repair",
  "Cleaning",
  "Landscaping",
  "General"
];

// Example maintenance providers with services
interface ServiceProvider {
  id: number;
  user: User;
  specialty: string[];
  rating: number;
  hourlyRate: number;
  description: string;
  availability: string;
  completedJobs: number;
  image: string;
}

export default function MaintenanceMarketplace() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceCategory, setServiceCategory] = useState("All");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("providers");

  // Fetch maintenance providers
  const { data: maintenanceProviders = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/maintenance"],
    enabled: !!user,
  });

  // Format the providers with additional service information
  // In a real implementation, this data would come from the backend
  const providers: ServiceProvider[] = maintenanceProviders.map((provider, index) => ({
    id: provider.id,
    user: provider,
    specialty: [
      ["Plumbing", "Electrical"][index % 2],
      ["HVAC", "Carpentry", "Painting", "Appliance Repair", "Cleaning", "Landscaping"][index % 6]
    ],
    rating: 4 + (index % 2) * 0.5,
    hourlyRate: 200 + (index * 50),
    description: "Experienced maintenance professional specializing in residential property repairs and maintenance.",
    availability: ["Available Now", "Available Tomorrow", "Busy - Available Next Week"][index % 3],
    completedJobs: 15 + (index * 7),
    image: "/placeholder-avatar.svg"
  }));

  // Filter providers based on search and category
  const filteredProviders = providers.filter(provider => 
    (provider.user.firstName.toLowerCase() + " " + provider.user.lastName.toLowerCase()).includes(searchTerm.toLowerCase()) &&
    (serviceCategory === "All" || provider.specialty.includes(serviceCategory))
  );

  // Handle booking a provider
  const handleBookProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setDialogOpen(true);
  };

  return (
    <DashLayout>
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Maintenance Marketplace</h1>
            <p className="text-gray-500 mt-1">Find and book qualified maintenance professionals</p>
          </div>
        </header>

        <Tabs defaultValue="providers" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="providers">Service Providers</TabsTrigger>
            <TabsTrigger value="bookings">Your Bookings</TabsTrigger>
            <TabsTrigger value="history">Service History</TabsTrigger>
          </TabsList>

          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <CardTitle>Find Service Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={serviceCategory} onValueChange={setServiceCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Service Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredProviders.length > 0 ? (
                filteredProviders.map((provider) => (
                  <Card key={provider.id} className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div className="relative p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {provider.user.profileImage ? (
                              <img 
                                src={provider.user.profileImage} 
                                alt={provider.user.firstName} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Wrench className="h-8 w-8 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{provider.user.firstName} {provider.user.lastName}</h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span>{provider.rating.toFixed(1)} ({provider.completedJobs} jobs)</span>
                            </div>
                            <div className="flex flex-wrap mt-2 gap-1">
                              {provider.specialty.map((spec) => (
                                <Badge key={spec} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{formatCurrency(provider.hourlyRate)} / hour</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className={
                              provider.availability.includes("Available Now") 
                                ? "text-green-600" 
                                : provider.availability.includes("Tomorrow")
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }>
                              {provider.availability}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {provider.description}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-sm"
                            asChild
                          >
                            <Link href={`/messages/${provider.id}`}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Link>
                          </Button>
                          
                          <Button 
                            size="sm" 
                            className="text-sm"
                            onClick={() => handleBookProvider(provider)}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No service providers found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search or category filters</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Your Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No upcoming bookings</h3>
                  <p className="text-gray-500 mt-1">Book a maintenance provider to schedule a service</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No service history</h3>
                  <p className="text-gray-500 mt-1">Your completed maintenance services will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Maintenance Service</DialogTitle>
            <DialogDescription>
              {selectedProvider && `Schedule a maintenance service with ${selectedProvider.user.firstName} ${selectedProvider.user.lastName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProvider && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedProvider.user.firstName} {selectedProvider.user.lastName}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <span>{selectedProvider.rating.toFixed(1)} · {selectedProvider.completedJobs} jobs completed</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Service Details</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">Rate: {formatCurrency(selectedProvider.hourlyRate)} / hour</p>
                  <p className="text-sm">Specialties: {selectedProvider.specialty.join(", ")}</p>
                  <p className="text-sm">Availability: {selectedProvider.availability}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Select a Property</h4>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property-1">Main Street Apartment</SelectItem>
                    <SelectItem value="property-2">Riverside Condo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Service Date & Time</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="date" placeholder="Date" min={new Date().toISOString().split('T')[0]} />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Service Description</h4>
                <Input placeholder="Briefly describe the issue..." />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit">Book Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashLayout>
  );
}