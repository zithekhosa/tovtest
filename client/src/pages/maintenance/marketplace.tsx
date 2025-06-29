import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Star,
  MapPin,
  Clock,
  Shield,
  ThumbsUp,
  Filter,
  Heart,
  Share,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  ChevronDown,
  Sparkles,
  Wrench,
  Paintbrush,
  Zap,
  Droplets,
  Home,
  ArrowRight,
  DollarSign
} from "lucide-react";
import { MaintenanceJob } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { StandardLayout } from "@/components/layout/StandardLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceProvider {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  level: "Level 1" | "Level 2" | "Top Rated" | "Pro";
  title: string;
  description: string;
  startingPrice: number;
  deliveryTime: string;
  gallery: string[];
  skills: string[];
  completedJobs: number;
  responseTime: string;
  isOnline: boolean;
  isFavorite?: boolean;
  categories: string[];
}

export default function MaintenanceMarketplace() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [deliveryTime, setDeliveryTime] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  // Mock service providers data (Fiverr-style)
  const serviceProviders: ServiceProvider[] = [
    {
      id: 1,
      name: "Thabo Molefi",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      rating: 4.9,
      reviews: 127,
      level: "Top Rated",
      title: "I will fix all your plumbing problems professionally",
      description: "Professional plumber with 8+ years experience. I handle everything from leaky faucets to complete bathroom installations.",
      startingPrice: 150,
      deliveryTime: "Same day",
      gallery: [
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300"
      ],
      skills: ["Plumbing", "Emergency Repairs", "Installation"],
      completedJobs: 245,
      responseTime: "1 hour",
      isOnline: true,
      categories: ["plumbing", "emergency"]
    },
    {
      id: 2,
      name: "Grace Seretse",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150",
      rating: 5.0,
      reviews: 89,
      level: "Pro",
      title: "I will paint your home interior and exterior beautifully",
      description: "Expert painter specializing in residential properties. Quality work with premium materials and attention to detail.",
      startingPrice: 200,
      deliveryTime: "2-3 days",
      gallery: [
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300",
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300",
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300"
      ],
      skills: ["Interior Painting", "Exterior Painting", "Color Consultation"],
      completedJobs: 156,
      responseTime: "30 mins",
      isOnline: true,
      categories: ["painting", "interior"]
    },
    {
      id: 3,
      name: "Kebonye Mogale",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      rating: 4.8,
      reviews: 203,
      level: "Level 2",
      title: "I will handle all your electrical repairs and installations",
      description: "Licensed electrician providing safe and reliable electrical services. From simple repairs to complete rewiring.",
      startingPrice: 180,
      deliveryTime: "1-2 days",
      gallery: [
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300",
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300"
      ],
      skills: ["Electrical Repairs", "Wiring", "Safety Inspections"],
      completedJobs: 178,
      responseTime: "2 hours",
      isOnline: false,
      categories: ["electrical", "installation"]
    },
    {
      id: 4,
      name: "Neo Morake",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
      rating: 4.7,
      reviews: 95,
      level: "Level 1",
      title: "I will clean and maintain your HVAC systems efficiently",
      description: "HVAC specialist keeping your home comfortable year-round. Maintenance, repairs, and energy efficiency optimization.",
      startingPrice: 120,
      deliveryTime: "Same day",
      gallery: [
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300",
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300"
      ],
      skills: ["HVAC Maintenance", "Air Conditioning", "Heating"],
      completedJobs: 87,
      responseTime: "3 hours",
      isOnline: true,
      categories: ["hvac", "maintenance"]
    },
    {
      id: 5,
      name: "Boitumelo Tlhale",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      rating: 4.9,
      reviews: 164,
      level: "Top Rated",
      title: "I will renovate and upgrade your home professionally",
      description: "General contractor specializing in home renovations. From kitchen remodels to complete property makeovers.",
      startingPrice: 300,
      deliveryTime: "1-2 weeks",
      gallery: [
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300",
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300",
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300",
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300"
      ],
      skills: ["Home Renovation", "Kitchen Remodel", "Bathroom Upgrade"],
      completedJobs: 312,
      responseTime: "1 hour",
      isOnline: true,
      isFavorite: true,
      categories: ["renovation", "general"]
    },
    {
      id: 6,
      name: "Lebo Mokoena",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      rating: 4.6,
      reviews: 73,
      level: "Level 1",
      title: "I will install and repair your flooring perfectly",
      description: "Flooring specialist with expertise in tiles, hardwood, and vinyl. Quality installation and repair services.",
      startingPrice: 250,
      deliveryTime: "3-5 days",
      gallery: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300"
      ],
      skills: ["Tile Installation", "Hardwood Flooring", "Repairs"],
      completedJobs: 91,
      responseTime: "4 hours",
      isOnline: true,
      categories: ["flooring", "installation"]
    }
  ];

  const categories = [
    { id: "all", name: "All Services", icon: Home, count: 247 },
    { id: "plumbing", name: "Plumbing", icon: Droplets, count: 45 },
    { id: "electrical", name: "Electrical", icon: Zap, count: 38 },
    { id: "painting", name: "Painting", icon: Paintbrush, count: 52 },
    { id: "hvac", name: "HVAC", icon: Home, count: 23 },
    { id: "renovation", name: "Renovation", icon: Wrench, count: 34 },
    { id: "flooring", name: "Flooring", icon: Home, count: 28 },
    { id: "emergency", name: "Emergency", icon: Shield, count: 67 }
  ];

  const filteredProviders = serviceProviders.filter(provider => {
    const matchesSearch = provider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || provider.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Top Rated": return "bg-gradient-to-r from-yellow-500 to-orange-500";
      case "Pro": return "bg-gradient-to-r from-purple-500 to-blue-500";
      case "Level 2": return "bg-gradient-to-r from-green-500 to-teal-500";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  return (
    <StandardLayout 
      title="Maintenance Marketplace" 
      subtitle="Find expert maintenance professionals for your property"
    >
      <div className="space-y-6">
        {/* Hero Search Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Find the Perfect Maintenance Professional
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Connect with top-rated experts for all your property maintenance needs
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for services (e.g., plumbing, painting, electrical...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white text-gray-900 border-0 focus:ring-2 focus:ring-white/30"
                />
              </div>
              <Button 
                size="lg" 
                className="h-12 px-8 bg-white text-blue-600 hover:bg-gray-50"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Categories & Filters */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Categories */}
          <div className="lg:w-80">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Browse by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Budget</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Budget</SelectItem>
                      <SelectItem value="0-200">BWP 0 - 200</SelectItem>
                      <SelectItem value="200-500">BWP 200 - 500</SelectItem>
                      <SelectItem value="500+">BWP 500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Delivery Time</label>
                  <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="same-day">Same Day</SelectItem>
                      <SelectItem value="1-3-days">1-3 Days</SelectItem>
                      <SelectItem value="1-week">Up to 1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Pro Services</h4>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Top Rated Sellers</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Online Now</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Local Providers</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredProviders.length} services available
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="rating">Best Rating</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="delivery">Fastest Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Service Providers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => (
                <Card key={provider.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-lg">
                  <div className="relative">
                    <img
                      src={provider.gallery[0]}
                      alt={provider.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={`${getLevelColor(provider.level)} text-white border-0`}>
                        {provider.level}
                      </Badge>
                      {provider.isOnline && (
                        <Badge className="bg-green-500 text-white">
                          Online
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`bg-white/90 hover:bg-white ${provider.isFavorite ? 'text-red-500' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${provider.isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/90 hover:bg-white"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={provider.avatar} alt={provider.name} />
                        <AvatarFallback>{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{provider.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-gray-900">{provider.rating}</span>
                          <span className="text-gray-500 text-sm">({provider.reviews})</span>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {provider.title}
                    </h4>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {provider.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {provider.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{provider.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{provider.completedJobs} completed</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Starting at</p>
                        <p className="text-xl font-bold text-gray-900">
                          BWP {provider.startingPrice}
                        </p>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="px-8">
                Load More Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StandardLayout>
  );
}