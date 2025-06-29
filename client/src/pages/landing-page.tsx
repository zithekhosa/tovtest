import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  MessageCircle,
  Filter,
  TrendingUp,
  ArrowRight,
  X,
  Send,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  const [searchInput, setSearchInput] = useState("");
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI property assistant. Tell me about your dream home - location, lifestyle, budget, or any specific needs. I'll help you find the perfect property!"
    }
  ]);
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

  const handleAiSearch = () => {
    if (!aiMessage.trim()) return;
    
    setChatMessages(prev => [
      ...prev,
      { role: "user", content: aiMessage },
      { 
        role: "assistant", 
        content: `Based on "${aiMessage}", I found several properties that match your lifestyle. Let me show you some options that fit your criteria.`
      }
    ]);
    setAiMessage("");
  };

  const featuredProperties = [
    {
      id: 1,
      title: "Modern Executive Apartment",
      address: "Block 10, Gaborone",
      city: "Gaborone",
      rentAmount: 8500,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1200,
      images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
      isPromoted: true,
      isFeatured: true,
      amenities: ["Pool", "Gym", "Security"]
    },
    {
      id: 2,
      title: "Family House with Garden",
      address: "Extension 15, Gaborone",
      city: "Gaborone",
      rentAmount: 12000,
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 1800,
      images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400"],
      isPromoted: false,
      isFeatured: true,
      amenities: ["Garden", "Garage", "Study Room"]
    },
    {
      id: 3,
      title: "Luxury Penthouse Suite",
      address: "CBD, Gaborone",
      city: "Gaborone",
      rentAmount: 15000,
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1000,
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"],
      isPromoted: true,
      isFeatured: true,
      amenities: ["City View", "Balcony", "Concierge"]
    },
    {
      id: 4,
      title: "Cozy Student Accommodation",
      address: "Near UB, Gaborone",
      city: "Gaborone",
      rentAmount: 3500,
      bedrooms: 1,
      bathrooms: 1,
      squareFootage: 450,
      images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400"],
      isPromoted: false,
      isFeatured: true,
      amenities: ["WiFi", "Study Area", "Transport"]
    },
    {
      id: 5,
      title: "Corporate Housing",
      address: "Broadhurst, Gaborone",
      city: "Gaborone",
      rentAmount: 9500,
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 900,
      images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400"],
      isPromoted: true,
      isFeatured: true,
      amenities: ["Furnished", "Parking", "24/7 Security"]
    },
    {
      id: 6,
      title: "Townhouse with Patio",
      address: "Phakalane, Gaborone",
      city: "Gaborone",
      rentAmount: 11000,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1400,
      images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"],
      isPromoted: false,
      isFeatured: true,
      amenities: ["Patio", "Pet Friendly", "Shopping Center Nearby"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/tov-logo.png" 
                alt="TOV Property Management" 
                className="h-10 w-auto"
              />
              <div>
                <p className="text-xs text-gray-500">Property OS</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" size="sm">Properties</Button>
              <Button variant="ghost" size="sm">Services</Button>
              <Button variant="ghost" size="sm">About</Button>
              <Button variant="ghost" size="sm">Contact</Button>
            </nav>
            
            <div className="flex items-center space-x-3">
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
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
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
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your Perfect
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Home</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover amazing properties in Botswana. From modern apartments to family homes, 
              find your ideal living space with our AI-powered search.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search by location, property type, or neighborhood..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 h-12 text-lg border-0 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="h-12 px-6"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  
                  <Button 
                    size="lg"
                    onClick={() => setIsAiChatOpen(true)}
                    className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Search
                  </Button>
                  
                  <Button 
                    size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    Search
                  </Button>
                </div>
              </div>
              
              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                  <MapPin className="h-3 w-3 mr-1" />
                  Gaborone
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                  <BedDouble className="h-3 w-3 mr-1" />
                  2+ Bedrooms
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Under BWP 10,000
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                  <Building className="h-3 w-3 mr-1" />
                  Apartments
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
              <p className="text-gray-600">Handpicked properties for you</p>
            </div>
            <Button variant="outline" className="hidden md:flex">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <Card key={property.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-lg">
                <div className="relative">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {property.isPromoted && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Promoted
                      </Badge>
                    )}
                    {property.isFeatured && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{property.title}</h3>
                    <p className="text-gray-600 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}, {property.city}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
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
                      {property.squareFootage}m²
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        BWP {property.rentAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">per month</p>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                      View Details
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-4">
                    {property.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Modal */}
      {isAiChatOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Property Assistant</h3>
                  <p className="text-sm text-gray-500">Find your perfect home</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAiChatOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your ideal home..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAiSearch}
                  disabled={!aiMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Property Ecosystem</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for property management, from tenant portals to maintenance services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Tenants</h3>
              <p className="text-gray-600 text-sm">Find and apply for properties, pay rent, and request maintenance</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Landlords</h3>
              <p className="text-gray-600 text-sm">Manage properties, track finances, and communicate with tenants</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Agencies</h3>
              <p className="text-gray-600 text-sm">List properties, manage leads, and track commissions</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">For Maintenance</h3>
              <p className="text-gray-600 text-sm">Find jobs, bid on projects, and build your reputation</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  TOV Property OS
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Revolutionizing property management in Africa with cutting-edge technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">For Tenants</a></li>
                <li><a href="#" className="hover:text-blue-600">For Landlords</a></li>
                <li><a href="#" className="hover:text-blue-600">For Agencies</a></li>
                <li><a href="#" className="hover:text-blue-600">For Maintenance</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">Twitter</Button>
                <Button variant="outline" size="sm">LinkedIn</Button>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 TOV Property Operating System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}