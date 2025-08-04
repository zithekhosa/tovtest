import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { BidSubmissionForm } from "@/components/maintenance/BidSubmissionForm";
import { WorkflowStatusTracker } from "@/components/maintenance/WorkflowStatusTracker";
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
  DollarSign,
  Briefcase,
  AlertTriangle,
  Calendar,
  User,
  Camera
} from "lucide-react";
import { MaintenanceJob, MaintenanceRequest } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface MaintenanceRequestWithDetails extends MaintenanceRequest {
  tenant?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  property?: {
    id: number;
    title: string;
    address: string;
    city: string;
  };
}

export default function MaintenanceMarketplace() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [deliveryTime, setDeliveryTime] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [activeTab, setActiveTab] = useState("providers");
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequestWithDetails | null>(null);
  const [showBidForm, setShowBidForm] = useState(false);

  // Fetch available maintenance requests for bidding (for maintenance providers)
  const { data: availableRequests = [], isLoading: requestsLoading } = useQuery<MaintenanceRequestWithDetails[]>({
    queryKey: ['/api/maintenance-requests/available'],
    enabled: !!user && user.role === 'maintenance',
  });

  // Submit bid mutation
  const submitBidMutation = useMutation({
    mutationFn: async (bidData: any) => {
      const response = await fetch('/api/maintenance-bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bidData,
          requestId: selectedRequest?.id,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit bid');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance-requests/available'] });
      setShowBidForm(false);
      setSelectedRequest(null);
    },
  });

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
      case "Top Rated": return "bg-gradient-to-r from-warning to-warning";
      case "Pro": return "bg-gradient-to-r from-primary to-primary";
      case "Level 2": return "bg-gradient-to-r from-success to-success";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground border-destructive/30';
      case 'high': return 'bg-warning text-warning-foreground border-orange-200';
      case 'medium': return 'bg-warning text-warning-foreground border-warning';
      case 'low': return 'bg-success text-success-foreground border-success/30';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBidOnRequest = (request: MaintenanceRequestWithDetails) => {
    setSelectedRequest(request);
    setShowBidForm(true);
  };

  const handleSubmitBid = (bidData: any) => {
    submitBidMutation.mutate(bidData);
  };

  const handleCancelBid = () => {
    setShowBidForm(false);
    setSelectedRequest(null);
  };

  // Filter available requests by category and search
  const filteredRequests = availableRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           (request.category && request.category.toLowerCase() === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Show bid form if selected
  if (showBidForm && selectedRequest) {
    return (
      <StandardLayout 
        title="Submit Bid" 
        subtitle="Provide your quote for this maintenance request"
      >
        <BidSubmissionForm
          request={selectedRequest}
          onSubmit={handleSubmitBid}
          onCancel={handleCancelBid}
          isLoading={submitBidMutation.isPending}
        />
      </StandardLayout>
    );
  }

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
                className="h-12 px-8 bg-white text-primary btn-premium-ghost"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Service Providers
            </TabsTrigger>
            {user?.role === 'maintenance' && (
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Available Jobs
                {filteredRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filteredRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Service Providers Tab */}
          <TabsContent value="providers">
            <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Categories */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Category Navigation */}
            <div className="premium-card p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-2 text-sm text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-700 btn-premium-ghost'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-caption">
                        ({category.count})
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Filters */}
            <div className="premium-card p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Budget</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select budget" />
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
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="same-day">Same Day</SelectItem>
                      <SelectItem value="1-3-days">1-3 Days</SelectItem>
                      <SelectItem value="1-week">Up to 1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Pro Services</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      <span>Top Rated Sellers</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      <span>Online Now</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      <span>Local Providers</span>
                    </label>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedCategory("all");
                    setPriceRange("all");
                    setDeliveryTime("all");
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredProviders.length} services available
              </p>
              <div className="flex items-center gap-4">
                <span className="text-body-small">Sort by:</span>
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

            {/* Service Providers Grid - Enhanced Fiverr Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProviders.map((provider) => (
                <Card key={provider.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-200 bg-white cursor-pointer">
                  {/* Service Image */}
                  <div className="relative">
                    <img
                      src={provider.gallery[0]}
                      alt={provider.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={`${getLevelColor(provider.level)} text-white border-0 text-sm font-bold px-3 py-1`}>
                        {provider.level}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`bg-white/90 hover:bg-white p-2 h-9 w-9 rounded-full ${provider.isFavorite ? 'text-destructive-foreground' : 'text-gray-600'}`}
                      >
                        <Heart className={`h-5 w-5 ${provider.isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    {/* Online Status Indicator */}
                    {provider.isOnline && (
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center gap-2 bg-success text-white px-3 py-1 rounded-full text-xs font-medium">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          Online
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Provider Info */}
                  <CardContent className="p-6">
                    {/* Provider Details */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={provider.avatar} alt={provider.name} />
                        <AvatarFallback className="text-sm font-semibold">{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-base">{provider.name}</p>
                        <p className="text-body-small">Professional Seller</p>
                      </div>
                    </div>
                    
                    {/* Service Title */}
                    <h3 className="font-semibold text-gray-900 text-lg mb-3 line-clamp-2 leading-snug min-h-[3.5rem]">
                      {provider.title}
                    </h3>
                    
                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {provider.skills.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                          {skill}
                        </Badge>
                      ))}
                      {provider.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          +{provider.skills.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-bold text-gray-900">{provider.rating}</span>
                      </div>
                      <span className="text-gray-500 text-sm">({provider.reviews} reviews)</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600 text-sm">{provider.completedJobs} orders</span>
                    </div>
                    
                    {/* Response Time & Delivery */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1 text-body-small">
                        <Clock className="h-4 w-4" />
                        <span>{provider.responseTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-body-small">
                        <Shield className="h-4 w-4" />
                        <span>{provider.deliveryTime}</span>
                      </div>
                    </div>
                    
                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-caption uppercase tracking-wide mb-1">Starting at</p>
                        <p className="text-heading-2 text-gray-900">
                          BWP {provider.startingPrice}
                        </p>
                      </div>
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
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
          </TabsContent>

          {/* Available Jobs Tab (for maintenance providers) */}
          {user?.role === 'maintenance' && (
            <TabsContent value="jobs">
              <div className="space-y-6">
                {/* Filters for Jobs */}
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="painting">Painting</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="renovation">Renovation</SelectItem>
                        <SelectItem value="flooring">Flooring</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="text-gray-600">
                    {filteredRequests.length} jobs available for bidding
                  </p>
                </div>

                {/* Available Jobs Grid */}
                {requestsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading available jobs...</p>
                    </div>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Available</h3>
                      <p className="text-gray-500 text-center">
                        There are currently no maintenance requests available for bidding in your selected category.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRequests.map((request) => (
                      <Card key={request.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPriorityColor(request.priority)}>
                                  {request.priority.toUpperCase()}
                                </Badge>
                                {request.isEmergency && (
                                  <Badge variant="destructive">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    EMERGENCY
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-lg mb-2">{request.title}</CardTitle>
                              <p className="text-body-small">
                                Category: {request.category || 'General'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-caption">Request #{request.id}</p>
                              <p className="text-caption">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Property and Tenant Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-1 text-gray-600 mb-1">
                                <Home className="h-3 w-3" />
                                <span className="font-medium">Property</span>
                              </div>
                              <p className="text-gray-900">{request.property?.title || 'Unknown Property'}</p>
                              {request.property?.address && (
                                <p className="text-gray-500 text-xs">
                                  {request.property.address}, {request.property.city}
                                </p>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-gray-600 mb-1">
                                <User className="h-3 w-3" />
                                <span className="font-medium">Client</span>
                              </div>
                              <p className="text-gray-900">
                                {request.tenant ? `${request.tenant.firstName} ${request.tenant.lastName}` : 'Unknown Client'}
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <p className="text-sm text-gray-900 line-clamp-3">
                              {request.description}
                            </p>
                          </div>

                          {/* Workflow Status Tracker */}
                          <WorkflowStatusTracker 
                            request={request}
                            showProgressBar={false}
                            showDetails={false}
                            compact={true}
                            userRole="maintenance"
                          />

                          {/* Photos */}
                          {request.images && request.images.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1 text-gray-600 mb-2">
                                <Camera className="h-3 w-3" />
                                <span className="text-xs font-medium">{request.images.length} photos</span>
                              </div>
                              <div className="flex gap-2">
                                {request.images.slice(0, 3).map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`Issue photo ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                ))}
                                {request.images.length > 3 && (
                                  <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                    <span className="text-caption">+{request.images.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Payment Info */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-success-foreground" />
                              <span className="text-sm font-medium">
                                {request.paymentPreference === 'landlord' ? 'Landlord Pays' : 'Client Pays'}
                              </span>
                            </div>
                            <Button 
                              onClick={() => handleBidOnRequest(request)}
                              className="bg-success hover:bg-success"
                            >
                              Submit Bid
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </StandardLayout>
  );
}