import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import tovLogo from "@/assets/images/tov-logo.png";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MapPin, 
  BedDouble, 
  Bath, 
  Square,
  Star,
  Globe,
  Heart,
  LogIn,
  Menu,
  Building,
  Home,
  Wrench
} from "lucide-react";

export default function LandingPage() {
  const [searchInput, setSearchInput] = useState("");
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

  // Sample featured properties data - simplified
  const featuredProperties = [
    {
      id: 1,
      title: "Luxury Apartment in CBD",
      location: "Gaborone, Main Mall",
      price: 15000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1470&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Family Home in Phakalane",
      location: "Phakalane Golf Estate",
      price: 25000,
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1475&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Modern Office Space",
      location: "Gaborone, Fairgrounds",
      price: 35000,
      bedrooms: null,
      bathrooms: 2,
      area: 300,
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1469&auto=format&fit=crop"
    }
  ];

  // Sample categories for simplified navigation
  const categories = [
    { name: "Apartments", icon: "🏢" },
    { name: "Houses", icon: "🏠" },
    { name: "Commercial", icon: "🏪" },
    { name: "Short-term", icon: "🔑" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Super simple Airbnb-style Header */}
      <header className="py-4 px-4 md:px-6 lg:px-8 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <img src={tovLogo} alt="TOV Logo" className="h-8 w-auto" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm font-medium gap-1.5 rounded-full"
            onClick={() => navigate("/auth")}
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </Button>
          <Button
            size="sm"
            className="text-sm font-medium rounded-full hidden sm:flex"
            onClick={() => navigate("/auth")}
          >
            Sign up
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section - Ultra simplified */}
        <section className="pt-6 pb-12 md:pt-10 md:pb-16 px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Find Your Perfect Place in Botswana
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Simple property management for tenants, landlords, and service providers
            </p>
            
            {/* Simplified Search */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-1 shadow-sm">
                <div className="flex-1 pl-4 pr-1">
                  <input
                    type="text"
                    placeholder="Where are you looking?"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm py-2"
                  />
                </div>
                <Button size="sm" className="rounded-full px-4">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            
            {/* Quick Category Filters */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-full text-sm transition-colors"
                >
                  <span className="mr-2">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Properties - Simplified Airbnb Style */}
        <section className="px-4 md:px-6 lg:px-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Featured Properties
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {featuredProperties.map((property) => (
                <div key={property.id} className="group cursor-pointer">
                  {/* Property image */}
                  <div className="aspect-[4/3] relative overflow-hidden rounded-lg mb-3">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Property details */}
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 dark:text-white">{property.title}</h3>
                      <div className="flex items-center">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-current mr-1" />
                        <span className="text-sm font-medium">4.9</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{property.location}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {property.bedrooms && (
                        <span className="flex items-center">
                          <BedDouble className="h-3.5 w-3.5 mr-1" />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center">
                          <Bath className="h-3.5 w-3.5 mr-1" />
                          {property.bathrooms}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Square className="h-3.5 w-3.5 mr-1" />
                        {property.area}m²
                      </span>
                    </div>
                    
                    <p className="font-medium text-gray-900 dark:text-white mt-2">
                      {property.price.toLocaleString()} <span className="text-gray-500 font-normal">BWP/month</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button variant="outline" className="rounded-full px-6">
                Show more properties
              </Button>
            </div>
          </div>
        </section>
        
        {/* Simple User Type Selection */}
        <section className="px-4 md:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Choose your path
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-10">
              Sign in to TOV based on your role
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="p-4 h-auto rounded-lg flex flex-col items-center gap-2 hover:bg-primary/5"
                onClick={() => navigate("/auth")}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <span>Tenant</span>
                <span className="text-xs text-gray-500">Find and rent properties</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="p-4 h-auto rounded-lg flex flex-col items-center gap-2 hover:bg-primary/5"
                onClick={() => navigate("/auth")}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <span>Landlord</span>
                <span className="text-xs text-gray-500">Manage your properties</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="p-4 h-auto rounded-lg flex flex-col items-center gap-2 hover:bg-primary/5"
                onClick={() => navigate("/auth")}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <span>Agency</span>
                <span className="text-xs text-gray-500">List client properties</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="p-4 h-auto rounded-lg flex flex-col items-center gap-2 hover:bg-primary/5"
                onClick={() => navigate("/auth")}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <span>Maintenance</span>
                <span className="text-xs text-gray-500">Offer service providers</span>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Simple Footer */}
        <footer className="px-4 md:px-6 lg:px-8 py-8 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src={tovLogo} alt="TOV Logo" className="h-6 w-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Simple property management for Botswana
              </p>
            </div>
            
            <div className="flex gap-6">
              <Button variant="link" size="sm" className="text-gray-500">About</Button>
              <Button variant="link" size="sm" className="text-gray-500">Terms</Button>
              <Button variant="link" size="sm" className="text-gray-500">Privacy</Button>
              <Button variant="link" size="sm" className="text-gray-500">Contact</Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}