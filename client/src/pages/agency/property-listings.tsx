import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashLayout } from "@/layout/dash-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

import {
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from "recharts";

import { 
  Loader2, 
  Building, 
  Home, 
  DollarSign, 
  Users, 
  Calendar,
  MessageSquare, 
  CheckCircle, 
  Filter,
  BarChart3,
  FileText,
  Clock,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  EyeIcon,
  Plus,
  Search,
  CalendarDays,
  LayoutDashboard,
  ChevronRight,
  MoreHorizontal,
  PlusCircle,
  Phone,
  Mail,
  Trash,
  Edit,
  Bell,
  Download,
  CalendarPlus,
  Briefcase,
  User,
  ListFilter,
  Upload,
  Image,
  MapPin,
  Bed,
  Bath,
  Square,
  Tag,
  Maximize,
  Award,
  Star,
  Menu,
  Share2,
  Heart,
  Camera,
  ArrowUp,
  Info
} from "lucide-react";

// Sample property listings
const sampleListings = [
  {
    id: 1,
    title: "Luxury Apartment in CBD",
    description: "Modern 2-bedroom apartment with stunning city views, fully furnished with modern amenities, 24-hour security, and reserved parking.",
    address: "Plot 5419, Queens Road, CBD, Gaborone",
    type: "Apartment",
    listingType: "Rent",
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    price: 4500,
    featured: true,
    status: "active",
    publicVisible: true,
    dateAdded: new Date(2023, 10, 15),
    landlordId: 1,
    landlordName: "Kgosi Sebina",
    amenities: ["Security", "Parking", "Swimming Pool", "Gym", "Furnished"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
    ],
    stats: {
      views: 247,
      inquiries: 12,
      saves: 34
    }
  },
  {
    id: 2,
    title: "Family Home in Phakalane",
    description: "Spacious 4-bedroom family home in the prestigious Phakalane Golf Estate, featuring a large garden, swimming pool, and modern finishes throughout.",
    address: "Plot 12364, Phakalane Golf Estate, Gaborone",
    type: "House",
    listingType: "Rent",
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2500,
    price: 8500,
    featured: true,
    status: "active",
    publicVisible: true,
    dateAdded: new Date(2023, 10, 2),
    landlordId: 2,
    landlordName: "Masego Tau",
    amenities: ["Garden", "Swimming Pool", "Security", "Garage", "Servant Quarters"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
    ],
    stats: {
      views: 189,
      inquiries: 8,
      saves: 22
    }
  },
  {
    id: 3,
    title: "Office Space in Main Mall",
    description: "Prime commercial office space in the heart of Gaborone's Main Mall. Open plan layout with meeting rooms and reception area.",
    address: "Plot 1243, Main Mall, Gaborone",
    type: "Commercial",
    listingType: "Rent",
    bedrooms: 0,
    bathrooms: 2,
    squareFeet: 1800,
    price: 12000,
    featured: false,
    status: "active",
    publicVisible: true,
    dateAdded: new Date(2023, 10, 10),
    landlordId: 3,
    landlordName: "Boitumelo Ndlovu",
    amenities: ["Air Conditioning", "Parking", "Security", "Elevator", "Reception"],
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      "https://images.unsplash.com/photo-1497366216548-37526070297c"
    ],
    stats: {
      views: 103,
      inquiries: 5,
      saves: 9
    }
  },
  {
    id: 4,
    title: "Bachelor Pad in Extension 9",
    description: "Cozy 1-bedroom apartment perfect for singles or couples. Conveniently located near shopping centers and public transport.",
    address: "Plot 7389, Extension 9, Gaborone",
    type: "Apartment",
    listingType: "Rent",
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 650,
    price: 3200,
    featured: false,
    status: "active",
    publicVisible: true,
    dateAdded: new Date(2023, 10, 5),
    landlordId: 4,
    landlordName: "Thabo Moremi",
    amenities: ["Furnished", "Security", "Parking", "Internet"],
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb",
      "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d"
    ],
    stats: {
      views: 156,
      inquiries: 9,
      saves: 17
    }
  },
  {
    id: 5,
    title: "Modern Villa in Block 10",
    description: "Exquisite 5-bedroom villa featuring high-end finishes, private garden, and swimming pool. Perfect for diplomatic missions or executive living.",
    address: "Plot 2345, Block 10, Gaborone",
    type: "Villa",
    listingType: "Sale",
    bedrooms: 5,
    bathrooms: 4.5,
    squareFeet: 3500,
    price: 4500000,
    featured: true,
    status: "active",
    publicVisible: true,
    dateAdded: new Date(2023, 9, 20),
    landlordId: 1,
    landlordName: "Kgosi Sebina",
    amenities: ["Swimming Pool", "Garden", "Garage", "Security", "Smart Home", "Solar Power"],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b"
    ],
    stats: {
      views: 210,
      inquiries: 7,
      saves: 29
    }
  },
  {
    id: 6,
    title: "Student Accommodation near UB",
    description: "Safe and affordable student housing with all utilities included. Located within walking distance to the University of Botswana.",
    address: "Plot 8765, Block 3, Gaborone",
    type: "Apartment",
    listingType: "Rent",
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 450,
    price: 2500,
    featured: false,
    status: "pending",
    publicVisible: false,
    dateAdded: new Date(2023, 10, 18),
    landlordId: 2,
    landlordName: "Masego Tau",
    amenities: ["Furnished", "Internet", "Water Included", "Electricity Included", "Study Area"],
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
      "https://images.unsplash.com/photo-1622542796254-5b9b45d653b0",
      "https://images.unsplash.com/photo-1626885930974-0c27784d7ce8"
    ],
    stats: {
      views: 0,
      inquiries: 0,
      saves: 0
    }
  }
];

// Sample property engagement data
const engagementData = [
  { day: '1', views: 45, inquiries: 2, saves: 5 },
  { day: '2', views: 52, inquiries: 3, saves: 7 },
  { day: '3', views: 48, inquiries: 1, saves: 4 },
  { day: '4', views: 61, inquiries: 4, saves: 9 },
  { day: '5', views: 55, inquiries: 2, saves: 6 },
  { day: '6', views: 67, inquiries: 5, saves: 8 },
  { day: '7', views: 73, inquiries: 3, saves: 11 }
];

// Property listing schema for form validation
const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  address: z.string().min(5, "Address is required"),
  type: z.string().min(1, "Property type is required"),
  listingType: z.string().min(1, "Listing type is required"),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  squareFeet: z.number().min(0),
  price: z.number().min(1, "Price is required"),
  featured: z.boolean().default(false),
  publicVisible: z.boolean().default(true),
  landlordId: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional()
});

type PropertyFormValues = z.infer<typeof propertySchema>;

// Property types
const propertyTypes = [
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Commercial", label: "Commercial" },
  { value: "Villa", label: "Villa" },
  { value: "Office", label: "Office Space" },
  { value: "Land", label: "Land" },
  { value: "Townhouse", label: "Townhouse" },
  { value: "Studio", label: "Studio" }
];

// Property amenities
const propertyAmenities = [
  { value: "Furnished", label: "Furnished" },
  { value: "Security", label: "Security" },
  { value: "Parking", label: "Parking" },
  { value: "Swimming Pool", label: "Swimming Pool" },
  { value: "Garden", label: "Garden" },
  { value: "Gym", label: "Gym" },
  { value: "Air Conditioning", label: "Air Conditioning" },
  { value: "Internet", label: "Internet" },
  { value: "Garage", label: "Garage" },
  { value: "Servant Quarters", label: "Servant Quarters" },
  { value: "Solar Power", label: "Solar Power" },
  { value: "Water Borehole", label: "Water Borehole" },
  { value: "Balcony", label: "Balcony" },
  { value: "Elevator", label: "Elevator" },
  { value: "CCTV", label: "CCTV" }
];

// Promotion packages
const promotionPackages = [
  {
    id: 1,
    name: "Premium",
    price: 500,
    duration: 30,
    features: [
      "Featured at the top of search",
      "Highlighted with Premium badge",
      "Included in newsletter",
      "Social media promotion",
      "Professional photography included"
    ],
    color: "bg-amber-50 border-amber-200"
  },
  {
    id: 2,
    name: "Enhanced",
    price: 300,
    duration: 30,
    features: [
      "Featured in search results",
      "Highlighted with Enhanced badge",
      "Larger photos in listings",
      "More detailed description space"
    ],
    color: "bg-blue-50 border-blue-200"
  },
  {
    id: 3,
    name: "Basic Boost",
    price: 100,
    duration: 14,
    features: [
      "Higher ranking in search",
      "Standard listing with Boosted badge"
    ],
    color: "bg-green-50 border-green-200"
  }
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border">
        <p className="font-medium">{`Day ${label}`}</p>
        <div className="space-y-1 mt-1">
          <p className="text-sm text-blue-600">{`Views: ${payload[0].value}`}</p>
          <p className="text-sm text-amber-600">{`Inquiries: ${payload[1].value}`}</p>
          <p className="text-sm text-green-600">{`Saves: ${payload[2].value}`}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function PropertyListings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [properties, setProperties] = useState(sampleListings);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isViewStatsOpen, setIsViewStatsOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Form for adding/editing properties
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      type: "Apartment",
      listingType: "Rent",
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 0,
      price: 0,
      featured: false,
      publicVisible: true,
      amenities: [],
      images: []
    }
  });

  // Filter properties based on active tab
  const filteredProperties = properties.filter(property => {
    if (activeTab === "all") return true;
    if (activeTab === "sale") return property.listingType === "Sale";
    if (activeTab === "rent") return property.listingType === "Rent";
    if (activeTab === "featured") return property.featured;
    if (activeTab === "draft") return !property.publicVisible;
    return true;
  });

  // Handle adding a new property
  const handleAddProperty = () => {
    setSelectedProperty(null);
    setSelectedAmenities([]);
    setUploadedImages([]);
    form.reset({
      title: "",
      description: "",
      address: "",
      type: "Apartment",
      listingType: "Rent",
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 0,
      price: 0,
      featured: false,
      publicVisible: true,
      amenities: [],
      images: []
    });
    setIsAddDialogOpen(true);
  };

  // Handle editing a property
  const handleEditProperty = (property: any) => {
    setSelectedProperty(property);
    setSelectedAmenities(property.amenities || []);
    setUploadedImages(property.images || []);
    form.reset({
      title: property.title,
      description: property.description,
      address: property.address,
      type: property.type,
      listingType: property.listingType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.squareFeet,
      price: property.price,
      featured: property.featured,
      publicVisible: property.publicVisible,
      amenities: property.amenities,
      images: property.images
    });
    setIsEditDialogOpen(true);
  };

  // Handle property promotion
  const handlePromoteProperty = (property: any) => {
    setSelectedProperty(property);
    setIsPromoteDialogOpen(true);
  };

  // Handle viewing property stats
  const handleViewStats = (property: any) => {
    setSelectedProperty(property);
    setIsViewStatsOpen(true);
  };

  // Handle deleting a property
  const handleDeleteProperty = (id: number) => {
    setProperties(properties.filter(property => property.id !== id));
    toast({
      title: "Property deleted",
      description: "The property listing has been removed",
    });
  };

  // Toggle property visibility
  const toggleVisibility = (id: number) => {
    setProperties(properties.map(property => 
      property.id === id 
        ? { ...property, publicVisible: !property.publicVisible } 
        : property
    ));
    
    const targetProperty = properties.find(p => p.id === id);
    if (targetProperty) {
      toast({
        title: targetProperty.publicVisible ? "Property hidden" : "Property published",
        description: targetProperty.publicVisible 
          ? "The listing is now hidden from public view" 
          : "The listing is now visible to the public",
      });
    }
  };

  // Toggle featured status
  const toggleFeatured = (id: number) => {
    setProperties(properties.map(property => 
      property.id === id 
        ? { ...property, featured: !property.featured } 
        : property
    ));
    
    const targetProperty = properties.find(p => p.id === id);
    if (targetProperty) {
      toast({
        title: targetProperty.featured ? "Removed from featured" : "Added to featured",
        description: targetProperty.featured 
          ? "The property is no longer featured" 
          : "The property is now featured",
      });
    }
  };

  // Handle buying a promotion package
  const purchasePromotion = (packageId: number) => {
    // In a real app, this would process payment and update the property status
    const package_ = promotionPackages.find(p => p.id === packageId);
    
    if (selectedProperty && package_) {
      setProperties(properties.map(property => 
        property.id === selectedProperty.id 
          ? { 
              ...property, 
              featured: true,
              promotionPackage: package_.name,
              promotionExpiryDate: new Date(Date.now() + package_.duration * 24 * 60 * 60 * 1000)
            } 
          : property
      ));
      
      toast({
        title: "Promotion purchased",
        description: `The ${package_.name} promotion has been applied to ${selectedProperty.title}`,
      });
      
      setIsPromoteDialogOpen(false);
    }
  };

  // Handle form submission
  const onSubmit = (data: PropertyFormValues) => {
    // Add amenities and images to the form data
    const formData = {
      ...data,
      amenities: selectedAmenities,
      images: uploadedImages
    };

    if (selectedProperty) {
      // Edit existing property
      setProperties(properties.map(property => 
        property.id === selectedProperty.id 
          ? { 
              ...property, 
              ...formData,
              dateUpdated: new Date()
            } 
          : property
      ));
      toast({
        title: "Property updated",
        description: "The listing has been updated successfully",
      });
      setIsEditDialogOpen(false);
    } else {
      // Add new property
      const newProperty = {
        id: properties.length + 1,
        ...formData,
        status: "pending",
        dateAdded: new Date(),
        landlordId: 1, // In a real app, this would be dynamically set
        landlordName: "Kgosi Sebina", // In a real app, this would be dynamically set
        stats: {
          views: 0,
          inquiries: 0,
          saves: 0
        }
      };
      setProperties([newProperty, ...properties]);
      toast({
        title: "Property added",
        description: "New listing has been created successfully",
      });
      setIsAddDialogOpen(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would upload to a server
    // For demo, we'll use the Unsplash sample images
    const sampleImageUrls = [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      "https://images.unsplash.com/photo-1494526585095-c41746248156",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
    ];
    
    // Randomly select an image URL to simulate upload
    const randomUrl = sampleImageUrls[Math.floor(Math.random() * sampleImageUrls.length)];
    setUploadedImages([...uploadedImages, randomUrl]);
    
    toast({
      title: "Image uploaded",
      description: "The image has been added to the listing",
    });
  };

  // Remove an image from the uploaded images
  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  // Toggle amenity selection
  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Calculate property metrics
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === "active").length;
  const featuredProperties = properties.filter(p => p.featured).length;
  const pendingProperties = properties.filter(p => p.status === "pending").length;
  
  // Calculate engagement metrics
  const totalViews = properties.reduce((sum, p) => sum + p.stats.views, 0);
  const totalInquiries = properties.reduce((sum, p) => sum + p.stats.inquiries, 0);
  const totalSaves = properties.reduce((sum, p) => sum + p.stats.saves, 0);
  
  // Calculate conversion rate
  const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : "0";

  return (
    <DashLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Property Listings</h1>
            <p className="text-muted-foreground">Manage and market your property portfolio</p>
          </div>
          <Button onClick={handleAddProperty}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Listings</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold">{totalProperties}</p>
                    <p className="text-sm text-muted-foreground ml-2">listings</p>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 rounded-full">
                  <Home className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {activeProperties} Active
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {pendingProperties} Pending
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {featuredProperties} Featured
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Views</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold">{totalViews}</p>
                    <p className="text-sm text-muted-foreground ml-2">views</p>
                  </div>
                </div>
                <div className="p-2 bg-amber-50 rounded-full">
                  <EyeIcon className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  <span>12% increase from last week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Inquiries</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold">{totalInquiries}</p>
                    <p className="text-sm text-muted-foreground ml-2">inquiries</p>
                  </div>
                </div>
                <div className="p-2 bg-green-50 rounded-full">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs flex justify-between">
                  <span className="text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium">{conversionRate}%</span>
                </div>
                <Progress 
                  value={parseFloat(conversionRate)} 
                  max={10}
                  className="h-1.5 mt-1" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Saved by Users</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold">{totalSaves}</p>
                    <p className="text-sm text-muted-foreground ml-2">saves</p>
                  </div>
                </div>
                <div className="p-2 bg-purple-50 rounded-full">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs flex justify-between">
                  <span className="text-muted-foreground">Save Rate</span>
                  <span className="font-medium">{totalViews > 0 ? ((totalSaves / totalViews) * 100).toFixed(1) : "0"}%</span>
                </div>
                <Progress 
                  value={totalViews > 0 ? ((totalSaves / totalViews) * 100) : 0} 
                  max={20}
                  className="h-1.5 mt-1" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Property Engagement - Last 7 Days</CardTitle>
            <CardDescription>Track views, inquiries, and saved listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={engagementData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    name="Views" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="inquiries" 
                    name="Inquiries" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="saves" 
                    name="Saves" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Property Listings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Property Listings</CardTitle>
          </CardHeader>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="rent">For Rent</TabsTrigger>
                <TabsTrigger value="sale">For Sale</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                      <div className="relative">
                        <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0]} 
                              alt={property.title} 
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Image className="h-12 w-12 text-muted-foreground opacity-20" />
                            </div>
                          )}
                          {property.listingType === "Rent" ? (
                            <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-700 border-blue-200">
                              For Rent
                            </Badge>
                          ) : (
                            <Badge className="absolute top-2 left-2 bg-purple-100 text-purple-700 border-purple-200">
                              For Sale
                            </Badge>
                          )}
                          {property.featured && (
                            <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-700 border-amber-200">
                              <Award className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {!property.publicVisible && (
                            <Badge className="absolute top-2 right-2 bg-slate-100 text-slate-700 border-slate-200">
                              Draft
                            </Badge>
                          )}
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              <span className="truncate">{property.address.split(",")[0]}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="font-bold text-xl">
                                {property.listingType === "Rent" 
                                  ? `${formatCurrency(property.price)}/mo` 
                                  : formatCurrency(property.price)
                                }
                              </div>
                              <div className="flex space-x-2">
                                {property.bedrooms > 0 && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Bed className="h-3.5 w-3.5 mr-1" />
                                    <span>{property.bedrooms}</span>
                                  </div>
                                )}
                                {property.bathrooms > 0 && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Bath className="h-3.5 w-3.5 mr-1" />
                                    <span>{property.bathrooms}</span>
                                  </div>
                                )}
                                {property.squareFeet > 0 && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Square className="h-3.5 w-3.5 mr-1" />
                                    <span>{property.squareFeet} sq.ft</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {property.amenities && property.amenities.slice(0, 3).map((amenity, index) => (
                                <Badge key={index} variant="outline" className="text-xs font-normal">
                                  {amenity}
                                </Badge>
                              ))}
                              {property.amenities && property.amenities.length > 3 && (
                                <Badge variant="outline" className="text-xs font-normal">
                                  +{property.amenities.length - 3} more
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <EyeIcon className="h-3 w-3 mr-1" />
                                <span>{property.stats.views} views</span>
                              </div>
                              <div className="flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                <span>{property.stats.inquiries} inquiries</span>
                              </div>
                              <div className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                <span>{property.stats.saves} saves</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between p-4 pt-0 gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Menu className="h-4 w-4 mr-1" />
                                <span>Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditProperty(property)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit listing
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewStats(property)}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View stats
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePromoteProperty(property)}>
                                <ArrowUp className="h-4 w-4 mr-2" />
                                Promote listing
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleFeatured(property.id)}>
                                {property.featured ? (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Remove from featured
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Add to featured
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleVisibility(property.id)}>
                                {property.publicVisible ? (
                                  <>
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Hide from public
                                  </>
                                ) : (
                                  <>
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Make public
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete property
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <Button variant="outline" size="sm" onClick={() => handlePromoteProperty(property)}>
                            <ArrowUp className="h-4 w-4 mr-1" />
                            <span>Promote</span>
                          </Button>
                        </CardFooter>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <Home className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <h3 className="text-lg font-medium">No properties found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === "draft" 
                        ? "You don't have any draft listings"
                        : activeTab === "featured"
                          ? "You don't have any featured listings"
                          : activeTab === "rent"
                            ? "You don't have any rental listings"
                            : activeTab === "sale"
                              ? "You don't have any properties for sale"
                              : "You don't have any property listings yet"
                      }
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={handleAddProperty}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first property
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Add Property Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Enter the details of the new property listing.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Modern Apartment in CBD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Rent">For Rent</SelectItem>
                          <SelectItem value="Sale">For Sale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Plot 1234, Queens Road, CBD, Gaborone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="squareFeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Feet</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("listingType") === "Rent" ? "Monthly Rent (BWP)" : "Sale Price (BWP)"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the property" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-2">
                  {propertyAmenities.map((amenity) => (
                    <div key={amenity.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`amenity-${amenity.value}`}
                        checked={selectedAmenities.includes(amenity.value)}
                        onCheckedChange={() => toggleAmenity(amenity.value)}
                      />
                      <label
                        htmlFor={`amenity-${amenity.value}`}
                        className="text-sm leading-none cursor-pointer"
                      >
                        {amenity.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Property Images</Label>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={image} 
                        alt={`Property image ${index + 1}`} 
                        className="h-full w-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                        type="button"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="aspect-square flex items-center justify-center rounded-md border border-dashed">
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 10 images. First image will be used as the main image.
                </p>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={form.watch("featured")}
                    onCheckedChange={(checked: boolean) => 
                      form.setValue("featured", checked === true ? true : false)
                    }
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm leading-none cursor-pointer"
                  >
                    Mark as featured
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="publicVisible"
                    checked={form.watch("publicVisible")}
                    onCheckedChange={(checked: boolean) => 
                      form.setValue("publicVisible", checked === true ? true : false)
                    }
                  />
                  <label
                    htmlFor="publicVisible"
                    className="text-sm leading-none cursor-pointer"
                  >
                    Visible to public
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Property</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update the details of this property listing.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Modern Apartment in CBD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Rent">For Rent</SelectItem>
                          <SelectItem value="Sale">For Sale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Plot 1234, Queens Road, CBD, Gaborone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="squareFeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Feet</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("listingType") === "Rent" ? "Monthly Rent (BWP)" : "Sale Price (BWP)"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the property" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-2">
                  {propertyAmenities.map((amenity) => (
                    <div key={amenity.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`amenity-edit-${amenity.value}`}
                        checked={selectedAmenities.includes(amenity.value)}
                        onCheckedChange={() => toggleAmenity(amenity.value)}
                      />
                      <label
                        htmlFor={`amenity-edit-${amenity.value}`}
                        className="text-sm leading-none cursor-pointer"
                      >
                        {amenity.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Property Images</Label>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={image} 
                        alt={`Property image ${index + 1}`} 
                        className="h-full w-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                        type="button"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="aspect-square flex items-center justify-center rounded-md border border-dashed">
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 10 images. First image will be used as the main image.
                </p>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured-edit"
                    checked={form.watch("featured")}
                    onCheckedChange={(checked: boolean) => 
                      form.setValue("featured", checked === true ? true : false)
                    }
                  />
                  <label
                    htmlFor="featured-edit"
                    className="text-sm leading-none cursor-pointer"
                  >
                    Mark as featured
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="publicVisible-edit"
                    checked={form.watch("publicVisible")}
                    onCheckedChange={(checked: boolean) => 
                      form.setValue("publicVisible", checked === true ? true : false)
                    }
                  />
                  <label
                    htmlFor="publicVisible-edit"
                    className="text-sm leading-none cursor-pointer"
                  >
                    Visible to public
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Property</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Property Promotion Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Promote Property Listing</DialogTitle>
            <DialogDescription>
              Enhance visibility of your listing with our premium promotion packages.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            {selectedProperty && (
              <div className="flex gap-4 items-start border rounded-lg p-3">
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  <img 
                    src={selectedProperty.images[0]} 
                    alt={selectedProperty.title}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center">
                    <Home className="h-8 w-8 text-slate-300" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{selectedProperty.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProperty.address.split(",")[0]}</p>
                  <p className="text-sm mt-1">
                    {selectedProperty.listingType === "Rent" 
                      ? `${formatCurrency(selectedProperty.price)}/mo` 
                      : formatCurrency(selectedProperty.price)}
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid gap-4">
              {promotionPackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`rounded-lg border p-4 ${pkg.color}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{pkg.name} Package</h3>
                      <p className="text-sm text-muted-foreground">{pkg.duration} days promotion</p>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(pkg.price)}</p>
                  </div>
                  
                  <ul className="mt-3 space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => purchasePromotion(pkg.id)}
                  >
                    Select {pkg.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Property Stats Dialog */}
      <Dialog open={isViewStatsOpen} onOpenChange={setIsViewStatsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Property Performance</DialogTitle>
            <DialogDescription>
              {selectedProperty && selectedProperty.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            {selectedProperty && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <EyeIcon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold">{selectedProperty.stats.views}</div>
                    <div className="text-xs text-muted-foreground">Total Views</div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg text-center">
                    <MessageSquare className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold">{selectedProperty.stats.inquiries}</div>
                    <div className="text-xs text-muted-foreground">Inquiries</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <Heart className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold">{selectedProperty.stats.saves}</div>
                    <div className="text-xs text-muted-foreground">Saved</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Daily Performance - Last 7 Days</h4>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={engagementData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          name="Views" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.3} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="inquiries" 
                          name="Inquiries" 
                          stroke="#f59e0b" 
                          fill="#f59e0b" 
                          fillOpacity={0.3} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="saves" 
                          name="Saves" 
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.3} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <Accordion type="single" collapsible>
                  <AccordionItem value="inquiries">
                    <AccordionTrigger>Recent Inquiries</AccordionTrigger>
                    <AccordionContent>
                      {selectedProperty.stats.inquiries > 0 ? (
                        <div className="space-y-3">
                          {[...Array(Math.min(selectedProperty.stats.inquiries, 3))].map((_, i) => (
                            <div key={i} className="flex gap-3 border-b pb-3">
                              <Avatar>
                                <AvatarFallback>{["MK", "TN", "LB"][i]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{["Mpho Khumalo", "Tebogo Ndlovu", "Lesego Baipidi"][i]}</div>
                                <div className="text-sm text-muted-foreground">
                                  {["Is this property still available?", "I'd like to schedule a viewing", "What utilities are included?"][i]}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatDate(new Date(Date.now() - (i + 1) * 86400000))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No inquiries yet.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="suggestions">
                    <AccordionTrigger>Improvement Suggestions</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex gap-2 items-start">
                          <Camera className="h-4 w-4 text-blue-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium">Add more photos</p>
                            <p className="text-xs text-muted-foreground">
                              Listings with 5+ photos get 70% more inquiries
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 items-start">
                          <Info className="h-4 w-4 text-amber-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium">Enhance description</p>
                            <p className="text-xs text-muted-foreground">
                              Add more details about nearby amenities and schools
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 items-start">
                          <ArrowUp className="h-4 w-4 text-green-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium">Promote your listing</p>
                            <p className="text-xs text-muted-foreground">
                              Featured listings receive 3x more views
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashLayout>
  );
}