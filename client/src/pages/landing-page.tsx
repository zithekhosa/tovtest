import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import tovLogo from "@/assets/images/tov-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { 
  Building, 
  Home, 
  Users, 
  Wrench, 
  Search, 
  ArrowRight, 
  MapPin, 
  BedDouble, 
  Bath, 
  Square,
  Star,
  MessageSquare,
  HelpCircle,
  Shield,
  CreditCard,
  UserPlus,
  Calendar,
  Menu
} from "lucide-react";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  // Redirect to appropriate dashboard if user is already logged in
  if (user) {
    const roleRoutes = {
      tenant: "/tenant/dashboard",
      landlord: "/landlord/dashboard",
      agency: "/agency/dashboard",
      maintenance: "/maintenance/dashboard"
    };
    navigate(roleRoutes[user.role] || "/");
    return null;
  }

  // Sample featured properties data
  const featuredProperties = [
    {
      id: 1,
      title: "Luxury Apartment in CBD",
      location: "Gaborone, Main Mall",
      price: 15000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1470&auto=format&fit=crop",
      type: "apartment"
    },
    {
      id: 2,
      title: "Family Home in Phakalane",
      location: "Phakalane Golf Estate",
      price: 25000,
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1475&auto=format&fit=crop",
      type: "house"
    },
    {
      id: 3,
      title: "Modern Office Space",
      location: "Gaborone, Fairgrounds",
      price: 35000,
      bedrooms: null,
      bathrooms: 2,
      area: 300,
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1469&auto=format&fit=crop",
      type: "commercial"
    }
  ];

  // Sample featured service providers data
  const featuredProviders = [
    {
      id: 1,
      name: "Quick Fix Plumbing",
      specialty: "Plumbing",
      rating: 4.8,
      reviewCount: 124,
      image: "https://images.unsplash.com/photo-1534190239940-9ba8944ea261?q=80&w=1469&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Spark Electrical",
      specialty: "Electrical",
      rating: 4.6,
      reviewCount: 89,
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1469&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Comfort HVAC Systems",
      specialty: "HVAC",
      rating: 4.9,
      reviewCount: 76,
      image: "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?q=80&w=1470&auto=format&fit=crop",
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Airbnb-style Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 py-5 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={tovLogo} alt="TOV Logo" className="h-10 w-auto" />
            </div>
            
            {/* Centered Search Bar for Desktop - Airbnb Style */}
            <div className="hidden lg:flex items-center shadow-sm border border-gray-200 dark:border-gray-700 rounded-full h-12 pl-6 pr-2">
              <div className="flex items-center divide-x divide-gray-200 dark:divide-gray-700">
                <div className="pr-4">
                  <span className="text-sm font-medium">Location</span>
                </div>
                <div className="px-4">
                  <span className="text-sm font-medium">Property Type</span>
                </div>
                <div className="pl-4 pr-2">
                  <span className="text-sm font-medium">Price Range</span>
                </div>
              </div>
              <Button size="sm" className="rounded-full ml-2 p-2 h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#properties" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">Properties</a>
              <a href="#services" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">Services</a>
              <ThemeSwitcher />
              <div className="relative group">
                <Button variant="outline" className="flex items-center gap-2 rounded-full h-10">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only">Menu</span>
                </Button>
                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 hidden group-hover:block border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" onClick={() => navigate("/auth")} className="justify-start">
                      Sign In / Register
                    </Button>
                    <Button variant="ghost" onClick={() => navigate("/providers-signup")} className="justify-start">
                      Join as Provider
                    </Button>
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <a href="#about" className="text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">About TOV</a>
                    <a href="#contact" className="text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Contact Us</a>
                  </div>
                </div>
              </div>
            </nav>
            
            <div className="flex items-center space-x-2 md:hidden">
              <ThemeSwitcher />
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Airbnb-style Hero Section with large background image */}
        <section className="relative bg-white dark:bg-gray-900 overflow-hidden">
          <div className="relative h-[80vh] max-h-[600px] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1473&auto=format&fit=crop" 
              alt="Beautiful property in Botswana" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-4xl mx-auto text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                  Find Your Perfect Place in Botswana
                </h1>
                <p className="text-xl text-white mb-8 drop-shadow-md max-w-2xl mx-auto">
                  TOV connects tenants, landlords, agencies, and service providers in one seamless platform
                </p>
              </div>
            </div>
          </div>
          
          {/* Airbnb-style Search Box - Floating above image at bottom */}
          <div className="container mx-auto px-4 relative -mt-24">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-3xl mx-auto">
              <Tabs defaultValue="rent" className="mb-4">
                <TabsList className="grid w-full grid-cols-3 p-1 mb-4">
                  <TabsTrigger value="rent" className="rounded-full text-sm">Rent</TabsTrigger>
                  <TabsTrigger value="buy" className="rounded-full text-sm">Buy</TabsTrigger>
                  <TabsTrigger value="services" className="rounded-full text-sm">Services</TabsTrigger>
                </TabsList>
                <TabsContent value="rent" className="mt-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search by location or property name..."
                        className="pl-10 rounded-full border-gray-300 h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select 
                      value={propertyType}
                      onValueChange={setPropertyType}
                    >
                      <SelectTrigger className="w-full md:w-40 rounded-full h-12">
                        <SelectValue placeholder="Property Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="rounded-full h-12 px-6">
                      Search
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="buy" className="mt-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search properties for sale..."
                        className="pl-10 rounded-full border-gray-300 h-12"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full md:w-40 rounded-full h-12">
                        <SelectValue placeholder="Property Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="rounded-full h-12 px-6">
                      Search
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="services" className="mt-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search for maintenance services..."
                        className="pl-10 rounded-full border-gray-300 h-12"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full md:w-40 rounded-full h-12">
                        <SelectValue placeholder="Service Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="rounded-full h-12 px-6">
                      Find
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Platform Stats */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Badge variant="outline" className="text-sm py-1.5 px-4 rounded-full bg-white dark:bg-gray-800">
                <Star className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                200+ Properties
              </Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-4 rounded-full bg-white dark:bg-gray-800">
                <Users className="h-3.5 w-3.5 mr-1 text-blue-500" />
                50+ Service Providers
              </Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-4 rounded-full bg-white dark:bg-gray-800">
                <MapPin className="h-3.5 w-3.5 mr-1 text-green-500" />
                Botswana Focused
              </Badge>
            </div>
            
            {/* Quick Login Options - Cleaner Design */}
            <div className="mt-12 mb-16">
              <h3 className="text-lg font-medium mb-4 text-center">Quick Sign In Options</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto">
                <Button variant="outline" onClick={() => navigate("/auth")} 
                  className="p-4 h-auto rounded-xl flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Home className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Tenant</span>
                </Button>
                <Button variant="outline" onClick={() => navigate("/auth")} 
                  className="p-4 h-auto rounded-xl flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Building className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Landlord</span>
                </Button>
                <Button variant="outline" onClick={() => navigate("/auth")} 
                  className="p-4 h-auto rounded-xl flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Agency</span>
                </Button>
                <Button variant="outline" onClick={() => navigate("/auth")} 
                  className="p-4 h-auto rounded-xl flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Maintenance</span>
                </Button>
              </div>
              <div className="text-center mt-4">
                <Button variant="link" onClick={() => navigate("/providers-signup")} className="text-sm">
                  New provider? Sign up here
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* User Paths Section */}

        {/* Featured Properties Section - Airbnb-Style */}
        <section id="properties" className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Featured Properties in Botswana</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Discover handpicked properties available for rent</p>
              </div>
              <Button variant="outline" className="flex items-center gap-2 rounded-full px-5">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Airbnb-style property cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {featuredProperties.map((property) => (
                <div key={property.id} className="group cursor-pointer">
                  {/* Image container with larger aspect ratio and rounded corners */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Favorite button */}
                    <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                          stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Property information with clean typography */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{property.title}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                        <span className="text-sm font-medium">4.9</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">{property.location}</span>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {property.type === 'apartment' ? 'Apartment' : 
                       property.type === 'house' ? 'House' : 'Commercial Space'}
                    </p>
                    
                    <div className="flex items-center text-sm gap-x-4 pt-1">
                      {property.bedrooms !== null && (
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <BedDouble className="h-4 w-4 mr-1.5" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      
                      {property.bathrooms !== null && (
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Bath className="h-4 w-4 mr-1.5" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Square className="h-4 w-4 mr-1.5" />
                        <span>{property.area} m²</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 flex justify-between items-center">
                      <p className="font-semibold">{property.price.toLocaleString()} <span className="text-gray-500 font-normal">BWP/month</span></p>
                      <Button variant="outline" size="sm" className="text-xs rounded-full h-8 px-3">
                        {property.type === 'commercial' ? 'Inquire' : 'Apply Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View more button for mobile */}
            <div className="mt-10 text-center md:hidden">
              <Button className="rounded-full px-8">View More Properties</Button>
            </div>
          </div>
        </section>

        {/* Maintenance Services Section - Airbnb Style */}
        <section id="services" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Top-rated Service Providers</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Verified maintenance professionals for your property needs</p>
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 rounded-full px-5"
                onClick={() => navigate("/maintenance/marketplace")}
              >
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Airbnb-style service provider cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {featuredProviders.map((provider) => (
                <div key={provider.id} className="group cursor-pointer">
                  {/* Image container with rounded corners */}
                  <div className="relative aspect-[5/3] rounded-xl overflow-hidden mb-3">
                    <img 
                      src={provider.image} 
                      alt={provider.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Specialty badge */}
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-white dark:bg-gray-800 text-primary font-medium px-3 py-1">
                        {provider.specialty}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Provider information with clean typography */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">{provider.name}</h3>
                      <div className="flex items-center bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-current mr-1" />
                        <span className="text-sm font-medium">{provider.rating}</span>
                      </div>
                    </div>
                    
                    <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                      <span>{provider.reviewCount} verified reviews</span>
                      <span className="mx-2">•</span>
                      <span>Available now</span>
                    </div>
                    
                    <div className="flex items-center pt-1 space-x-2">
                      <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" className="mr-1">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                        Verified
                      </span>
                      <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" className="mr-1">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4l3 3"></path>
                        </svg>
                        Fast response
                      </span>
                    </div>
                    
                    <div className="pt-2 flex justify-between items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Starting from <span className="font-semibold text-gray-900 dark:text-white">P350/hour</span>
                      </p>
                      <Button size="sm" className="rounded-full px-4">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View more button for mobile */}
            <div className="mt-10 text-center md:hidden">
              <Button className="rounded-full px-8">View More Providers</Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything You Need in One Platform</h2>
              <p className="text-gray-600 text-lg">
                TOV brings together all aspects of property management into a single, 
                easy-to-use platform for landlords, tenants, agencies and service providers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Seamless Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Direct messaging, notifications, and document sharing all in one place.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Financial Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Track rent, commissions, maintenance expenses and more with ease.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Scheduling & Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Organize viewings, maintenance visits and important deadlines.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Peace of Mind</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Secure transactions, verified service providers, and data protection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        {/* User Paths Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How TOV Works For You</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Tenant Path */}
              <Card className="border-2 hover:border-primary transition-all">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>For Tenants</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Find and apply for your ideal rental</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Manage rent payments online</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Request maintenance services</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Communicate with landlord/agency</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                    Find a Home
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Landlord Path */}
              <Card className="border-2 hover:border-primary transition-all">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>For Landlords</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>List and manage your properties</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Screen and approve tenants</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Collect rent automatically</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Track maintenance and expenses</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                    List Property
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Agent Path */}
              <Card className="border-2 hover:border-primary transition-all">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>For Agencies</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Market properties for landlords</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Manage client portfolios</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Track commissions and leads</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Streamline tenant placement</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/providers-signup")}>
                    Join as Agency
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Maintenance Path */}
              <Card className="border-2 hover:border-primary transition-all">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>For Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Find new maintenance jobs</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Showcase your services</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Manage appointments</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                      <span>Get paid through the platform</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/providers-signup")}>
                    Offer Services
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl opacity-90 mb-8">
                Join TOV today and experience a better way to manage properties, 
                find rentals, or offer services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-white border-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img src={tovLogo} alt="TOV Logo" className="h-10 w-auto bg-white p-1 rounded-md" />
              </div>
              <p className="mb-4 text-gray-400">
                The complete property operating system for Botswana, connecting landlords, tenants, 
                agencies and service providers.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#properties" className="hover:text-white">Properties</a></li>
                <li><a href="#services" className="hover:text-white">Services</a></li>
                <li><a href="#" className="hover:text-white">Sign In</a></li>
                <li><a href="#" className="hover:text-white">Register</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">For Users</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Landlords</a></li>
                <li><a href="#" className="hover:text-white">Tenants</a></li>
                <li><a href="#" className="hover:text-white">Agencies</a></li>
                <li><a href="#" className="hover:text-white">Service Providers</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5" />
                  <span>Gaborone, Botswana</span>
                </li>
                <li className="flex items-start">
                  <MessageSquare className="h-5 w-5 mr-2 mt-0.5" />
                  <span>info@tovproperties.com</span>
                </li>
                <li className="flex items-start">
                  <HelpCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <span>Support: +267 123 4567</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 TOV Property Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}