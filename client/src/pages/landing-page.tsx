import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Star,
  Heart,
  LogIn,
  Menu,
  Building,
  Home,
  Wrench,
  TrendingUp,
  ArrowRight,
  Eye,
  MessageCircle
} from "lucide-react";

export default function LandingPage() {


  const [location, navigate] = useLocation();
  const { user } = useAuth();

  // Redirect to appropriate dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      const roleRoutes = {
        tenant: "/tenant/dashboard",
        landlord: "/landlord/dashboard",
        agency: "/agency/dashboard",
        maintenance: "/maintenance/dashboard"
      };
      navigate(roleRoutes[user.role] || "/");
    }
  }, [user, navigate]);



  // Fetch real properties from database
  const { data: allProperties = [], isLoading: propertiesLoading, error: propertiesError } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/properties");
        if (!response.ok) throw new Error('Failed to fetch properties');
        return response.json();
      } catch (error) {
        console.error('Error fetching properties:', error);
        return []; // Return empty array on error
      }
    },
    retry: 1, // Only retry once
    staleTime: 30000
  });

  // Fetch real agents from database
  const { data: allAgents = [], isLoading: agentsLoading, error: agentsError } = useQuery<any[]>({
    queryKey: ["/api/users/agents"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/users/agents");
        if (!response.ok) throw new Error('Failed to fetch agents');
        return response.json();
      } catch (error) {
        console.error('Error fetching agents:', error);
        return []; // Return empty array on error
      }
    },
    retry: 1, // Only retry once
    staleTime: 30000
  });

  // Filter for available properties only and limit to 6 for featured section
  const displayProperties = (allProperties || [])
    .filter(property => property?.available === true)
    .slice(0, 6);

  // Limit to 3 agents for featured section, with fallback data if no agents exist
  const displayAgents = (allAgents || []).length > 0 ? (allAgents || []).slice(0, 3) : [
    {
      id: 1,
      name: "Sarah Johnson",
      agency: "Premier Properties",
      rating: 4.9,
      reviews: 127,
      properties: 45,
      avgResponseTime: "< 2 hours",
      specialties: ["Luxury Homes", "First Time Buyers", "Investment Properties"]
    },
    {
      id: 2,
      name: "Michael Chen",
      agency: "Urban Living Realty",
      rating: 4.8,
      reviews: 98,
      properties: 32,
      avgResponseTime: "< 1 hour",
      specialties: ["Apartments", "Commercial", "Student Housing"]
    },
    {
      id: 3,
      name: "Aisha Mokoena",
      agency: "Heritage Properties",
      rating: 4.7,
      reviews: 156,
      properties: 67,
      avgResponseTime: "< 3 hours",
      specialties: ["Family Homes", "Rentals", "Property Management"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src="/tov-logo.png"
                alt="TOV Property Management"
                className="h-10 w-auto"
              />
              <div>
                <p className="text-xs text-muted-foreground">Property OS</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" size="sm">Properties</Button>
              <Button variant="ghost" size="sm">Services</Button>
              <Button variant="ghost" size="sm">About</Button>
              <Button variant="ghost" size="sm">Contact</Button>
            </nav>

            {/* Enhanced User Type Navigation */}
            <div className="flex items-center space-x-2">
              <div className="hidden lg:flex items-center space-x-1 mr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth?role=agent")}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  For Agents
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth?role=landlord")}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Building className="h-4 w-4 mr-1" />
                  For Landlords
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth?role=maintenance")}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  For Providers
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="hidden sm:flex"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Your Perfect
              <span className="text-primary"> Home</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover amazing properties in Botswana. From modern apartments to family homes,
              find your ideal living space with our AI-powered search.
            </p>
          </div>

          {/* TOV Advertisement Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mr-4">
                  <span className="text-primary-foreground font-bold text-2xl">TOV</span>
                </div>
                <div className="text-left">
                  <h2 className="text-heading-2 text-foreground">TOV Property Management</h2>
                  <p className="text-muted-foreground">Your Complete Property Operating System</p>
                </div>
              </div>

              <p className="text-lg text-foreground mb-6 max-w-2xl mx-auto">
                Experience the future of property management with transparent maintenance tracking,
                AI-powered matching, and seamless communication between tenants, landlords, and service providers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/properties")}
                  className="font-semibold px-8"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Browse All Properties
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="font-semibold px-8"
                >
                  Get Started Today
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Featured Properties
              </h2>
              <p className="text-muted-foreground">
                Discover properties with maintenance transparency and role-specific insights
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden md:flex"
              onClick={() => navigate("/properties")}
            >
              View All Properties
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Property Grid */}
          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse mb-3" />
                    <div className="flex gap-4 mb-3">
                      <div className="h-3 bg-muted rounded animate-pulse flex-1" />
                      <div className="h-3 bg-muted rounded animate-pulse flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={property.images?.[0] || "/placeholder-property.jpg"}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80";
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                      {property.isPromoted && (
                        <Badge className="bg-primary text-primary-foreground">
                          Promoted
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                      <Badge variant="secondary">
                        <Building className="h-3 w-3 mr-1" />
                        {property.city}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.address}
                    </p>

                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <BedDouble className="h-4 w-4 mr-1" />
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms}
                      </span>
                      <span className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {property.squareMeters} m²
                      </span>
                    </div>

                    {/* Maintenance Transparency Info */}
                    <div className="mb-3 p-2 bg-muted rounded-lg border border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="flex items-center">
                          <Wrench className="h-3 w-3 mr-1" />
                          Fast Response
                        </span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          4.8/5 Rating
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-primary">
                        BWP {property.rentAmount.toLocaleString()}/month
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-primary mr-1" />
                        4.5 (12 reviews)
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(property.amenities || []).slice(0, 3).map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate("/properties")}
                      >
                        View More Properties
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/properties")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No properties available at the moment</p>
              <p className="text-sm text-muted-foreground">Check back soon for new listings!</p>
            </div>
          )}
        </div>
      </section>



      {/* Featured Agents Showcase */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Real Estate Agents</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with top-rated agents who specialize in maintenance-transparent properties
            </p>
          </div>

          {agentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayAgents.map((agent, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80&seed=${agent.id}`}
                      alt={agent.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.agency}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-primary mr-1" />
                        <span className="text-sm font-medium">{agent.rating}</span>
                        <span className="text-sm text-muted-foreground ml-1">({agent.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Properties Listed:</span>
                      <span className="font-medium">{agent.properties}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Response:</span>
                      <span className="font-medium text-primary">{agent.avgResponseTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {(agent.specialties || []).slice(0, 3).map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {(!agent.specialties || agent.specialties.length === 0) && (
                      <Badge variant="secondary" className="text-xs">
                        General Properties
                      </Badge>
                    )}
                  </div>

                  <Button className="w-full" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Agent
                  </Button>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center">
            <Button variant="outline" size="lg">
              View All Agents
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Maintenance Transparency Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Maintenance Transparency Promise</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every property listing includes detailed maintenance information so you know exactly what to expect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Response Times</h3>
              <p className="text-muted-foreground text-sm">See average maintenance response times for each property</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Landlord Ratings</h3>
              <p className="text-muted-foreground text-sm">Real tenant reviews and ratings for every landlord</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Maintenance History</h3>
              <p className="text-muted-foreground text-sm">View frequency and types of maintenance requests</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Communication</h3>
              <p className="text-muted-foreground text-sm">Direct communication channels with landlords and agents</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Complete Property Ecosystem</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for property management, from tenant portals to maintenance services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Tenants</h3>
              <p className="text-muted-foreground text-sm">Find and apply for properties, pay rent, and request maintenance</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Landlords</h3>
              <p className="text-muted-foreground text-sm">Manage properties, track finances, and communicate with tenants</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Agencies</h3>
              <p className="text-muted-foreground text-sm">List properties, manage leads, and track commissions</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Maintenance</h3>
              <p className="text-muted-foreground text-sm">Find jobs, bid on projects, and build your reputation</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-primary">
                  TOV Property OS
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Revolutionizing property management in Africa with cutting-edge technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">For Tenants</a></li>
                <li><a href="#" className="hover:text-primary">For Landlords</a></li>
                <li><a href="#" className="hover:text-primary">For Agencies</a></li>
                <li><a href="#" className="hover:text-primary">For Maintenance</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">Twitter</Button>
                <Button variant="outline" size="sm">LinkedIn</Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 TOV Property Operating System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}