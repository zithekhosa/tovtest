import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashLayout from "@/components/layout/DashLayout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/utils";
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
  Lock,
  Unlock,
  Star,
  UserPlus,
  MapPin,
  Bed,
  Bath,
  Square,
  Info,
  HelpCircle,
  Timer,
  AlertTriangle,
  Crown,
  SendHorizonal
} from "lucide-react";

// Sample expiring leases data
const expiringLeases = [
  {
    id: 1,
    propertyAddress: "Plot 5419, Queens Road, CBD, Gaborone",
    propertyType: "Apartment",
    landlordId: 1,
    landlordName: "Kgosi Sebina",
    tenantId: 5,
    tenantName: "Mpho Khumalo",
    tenantPhone: "71234567",
    tenantEmail: "mpho.k@example.com",
    rentAmount: 4500,
    startDate: new Date(2023, 0, 15),
    endDate: new Date(2023, 11, 15), // Expiring in about a month
    status: "active",
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    unlocked: true, // Premium feature: unlocked lease details
    previousAgent: "None", // First time listing
    renewalLikelihood: "high"
  },
  {
    id: 2,
    propertyAddress: "Plot 12364, Phakalane Golf Estate, Gaborone",
    propertyType: "House",
    landlordId: 2,
    landlordName: "Masego Tau",
    tenantId: 6,
    tenantName: "Tebogo Moilwa",
    tenantPhone: "72345678",
    tenantEmail: "tebogo.m@example.com",
    rentAmount: 8500,
    startDate: new Date(2022, 5, 1),
    endDate: new Date(2023, 11, 30), // Expiring in about a month and a half
    status: "active",
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2500,
    unlocked: true, // Premium feature: unlocked lease details
    previousAgent: "BW Properties", // Previously managed by another agency
    renewalLikelihood: "medium"
  },
  {
    id: 3,
    propertyAddress: "Plot 1243, Main Mall, Gaborone",
    propertyType: "Commercial",
    landlordId: 3,
    landlordName: "Boitumelo Ndlovu",
    tenantId: 7,
    tenantName: "Kagiso Molefe",
    tenantPhone: "73456789",
    tenantEmail: "kagiso.m@example.com",
    rentAmount: 12000,
    startDate: new Date(2022, 11, 1),
    endDate: new Date(2023, 11, 1), // Expiring very soon
    status: "active",
    bedrooms: 0,
    bathrooms: 2,
    squareFeet: 1800,
    unlocked: false, // Premium feature: locked lease details (needs to be purchased)
    previousAgent: "Capital Property Services",
    renewalLikelihood: "low"
  },
  {
    id: 4,
    propertyAddress: "Plot 7389, Extension 9, Gaborone",
    propertyType: "Apartment",
    landlordId: 4,
    landlordName: "Thabo Moremi",
    tenantId: 8,
    tenantName: "Naledi Phiri",
    tenantPhone: "74567890",
    tenantEmail: "naledi.p@example.com",
    rentAmount: 3200,
    startDate: new Date(2023, 3, 15),
    endDate: new Date(2024, 0, 15), // Expiring in about 2 months
    status: "active",
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 650,
    unlocked: false, // Premium feature: locked lease details (needs to be purchased)
    previousAgent: "None",
    renewalLikelihood: "high"
  },
  {
    id: 5,
    propertyAddress: "Plot 3421, Block 8, Gaborone",
    propertyType: "Apartment",
    landlordId: 1,
    landlordName: "Kgosi Sebina",
    tenantId: 9,
    tenantName: "Thato Mokgosi",
    tenantPhone: "75678901",
    tenantEmail: "thato.m@example.com",
    rentAmount: 5800,
    startDate: new Date(2023, 1, 1),
    endDate: new Date(2024, 1, 1), // Expiring in about 3 months
    status: "active",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    unlocked: false, // Premium feature: locked lease details (needs to be purchased)
    previousAgent: "Pula Realty",
    renewalLikelihood: "medium"
  },
  {
    id: 6,
    propertyAddress: "Plot 6789, Phase 2, Gaborone",
    propertyType: "House",
    landlordId: 2,
    landlordName: "Masego Tau",
    tenantId: 10,
    tenantName: "Kefilwe Ndlovu",
    tenantPhone: "76789012",
    tenantEmail: "kefilwe.n@example.com",
    rentAmount: 7200,
    startDate: new Date(2023, 2, 15),
    endDate: new Date(2024, 2, 15), // Expiring in about 4 months
    status: "active",
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1800,
    unlocked: false, // Premium feature: locked lease details (needs to be purchased)
    previousAgent: "None",
    renewalLikelihood: "high"
  }
];

// Subscription plans
const subscriptionPlans = [
  {
    id: 1,
    name: "Premium Access",
    price: 1500,
    duration: 30, // days
    features: [
      "Full access to all expiring lease data",
      "Automated tenant contact details",
      "Priority notifications 90 days before expiry",
      "Renewal likelihood prediction",
      "Previous agent information",
      "Landlord contact details",
      "Unlimited lease unlocks"
    ],
    recommended: true,
    color: "bg-warning/10 border-amber-200"
  },
  {
    id: 2,
    name: "Basic Access",
    price: 600,
    duration: 30, // days
    features: [
      "Access to lease expiry dates",
      "Limited property details",
      "10 lease unlocks per month",
      "Notifications 30 days before expiry"
    ],
    recommended: false,
    color: "bg-primary/10 border-primary"
  },
  {
    id: 3,
    name: "Pay Per View",
    price: 150,
    duration: null, // No duration, pay per view
    features: [
      "Unlock individual lease details",
      "One-time access to tenant contact details",
      "Basic property information",
      "No subscription required"
    ],
    recommended: false,
    color: "bg-success/10 border-success/30"
  }
];

// Calculate days until lease expiry
const getDaysUntilExpiry = (endDate: Date) => {
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Get expiry status color
const getExpiryStatusColor = (days: number) => {
  if (days <= 15) return "bg-destructive text-destructive-foreground border-destructive/30";
  if (days <= 30) return "bg-warning/20 text-warning-foreground border-amber-200";
  if (days <= 60) return "bg-primary/10 text-primary border-primary";
  return "bg-success text-success-foreground border-success/30";
};

// Get renewal likelihood icon and color
const getRenewalLikelihoodDetails = (likelihood: string) => {
  if (likelihood === "high") {
    return { 
      icon: <CheckCircle className="h-4 w-4 text-success-foreground" />, 
      text: "text-success-foreground",
      label: "High" 
    };
  }
  if (likelihood === "medium") {
    return { 
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, 
      text: "text-warning-foreground",
      label: "Medium" 
    };
  }
  return { 
    icon: <Timer className="h-4 w-4 text-destructive-foreground" />, 
    text: "text-destructive-foreground",
    label: "Low" 
  };
};

export default function ExpiringLeases() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [leases, setLeases] = useState(expiringLeases);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remainingUnlocks, setRemainingUnlocks] = useState(0);
  const [filterDays, setFilterDays] = useState<string>("all");

  // Filter leases based on active tab and expiry filter
  const filteredLeases = leases.filter(lease => {
    // Apply tab filter
    if (activeTab === "unlocked" && !lease.unlocked) return false;
    if (activeTab === "locked" && lease.unlocked) return false;

    // Apply days filter
    const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
    if (filterDays === "15" && daysUntilExpiry > 15) return false;
    if (filterDays === "30" && daysUntilExpiry > 30) return false;
    if (filterDays === "60" && daysUntilExpiry > 60) return false;
    if (filterDays === "90" && daysUntilExpiry > 90) return false;

    return true;
  });

  // Subscribe to a plan
  const subscribeToPlan = (planId: number) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    
    if (plan) {
      // Handle subscription
      setIsSubscribed(true);
      
      // Set unlocks based on plan
      if (plan.name === "Premium Access") {
        setRemainingUnlocks(-1); // Unlimited unlocks
        
        // Unlock all leases for premium
        const updatedLeases = leases.map(lease => ({
          ...lease,
          unlocked: true
        }));
        setLeases(updatedLeases);
        
      } else if (plan.name === "Basic Access") {
        setRemainingUnlocks(10); // 10 unlocks per month
      }
      
      toast({
        title: "Subscription successful",
        description: `You have subscribed to the ${plan.name} plan`,
        variant: "default",
      });
      
      setIsSubscriptionDialogOpen(false);
    }
  };

  // Unlock a single lease (Pay-Per-View)
  const unlockLease = (id: number) => {
    // If unlocks are remaining or unlimited (-1)
    if (remainingUnlocks !== 0) {
      const updatedLeases = leases.map(lease => 
        lease.id === id ? { ...lease, unlocked: true } : lease
      );
      
      setLeases(updatedLeases);
      
      // Decrement remaining unlocks if not unlimited
      if (remainingUnlocks > 0) {
        setRemainingUnlocks(remainingUnlocks - 1);
      }
      
      toast({
        title: "Lease unlocked",
        description: "You now have access to the tenant details",
        variant: "default",
      });
      
      setIsUnlockDialogOpen(false);
    } else {
      toast({
        title: "No unlocks remaining",
        description: "Please subscribe to unlock more leases",
        variant: "destructive",
      });
    }
  };

  // Handle viewing tenant contact details
  const viewContactDetails = (lease: any) => {
    setSelectedLease(lease);
    setIsContactDialogOpen(true);
  };

  // Handle unlock lease dialog
  const handleUnlockDialog = (lease: any) => {
    setSelectedLease(lease);
    setIsUnlockDialogOpen(true);
  };

  // Calculate analytics
  const totalLeases = leases.length;
  const expiringIn30Days = leases.filter(lease => getDaysUntilExpiry(lease.endDate) <= 30).length;
  const expiringIn60Days = leases.filter(lease => getDaysUntilExpiry(lease.endDate) <= 60).length;
  const expiringIn90Days = leases.filter(lease => getDaysUntilExpiry(lease.endDate) <= 90).length;
  
  // Success rate for previous properties
  const successRate = 65; // In a real app, this would be calculated based on real data
  
  // Calculate potential commission (based on one month's rent as commission)
  const potentialCommission = leases.reduce((sum, lease) => sum + lease.rentAmount, 0);
  
  // Handle sending message to tenant
  const handleSendMessage = (tenantId: number, email: string) => {
    toast({
      title: "Message sent",
      description: `Your message has been sent to ${email}`,
    });
    setIsContactDialogOpen(false);
  };

  return (
    <DashLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-heading-2 tracking-tight">Expiring Leases</h1>
            <p className="text-muted-foreground">Find and contact tenants with expiring leases</p>
          </div>
          
          {isSubscribed ? (
            <Badge className="bg-success text-success-foreground border-success/30 gap-1 px-3 py-1 text-xs">
              <Crown className="h-3.5 w-3.5" />
              <span>Premium Subscriber</span>
            </Badge>
          ) : (
            <Button
              onClick={() => setIsSubscriptionDialogOpen(true)}
              className="gap-1"
            >
              <Star className="h-4 w-4" />
              <span>Subscribe for Premium Access</span>
            </Button>
          )}
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Expiring Leases</p>
                  <div className="flex items-baseline">
                    <p className="text-heading-2">{totalLeases}</p>
                    <p className="text-sm text-muted-foreground ml-2">leases</p>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs flex justify-between">
                  <span className="text-muted-foreground">Unlocked leases</span>
                  <span className="font-medium">{leases.filter(l => l.unlocked).length} of {totalLeases}</span>
                </div>
                <Progress 
                  value={(leases.filter(l => l.unlocked).length / totalLeases) * 100} 
                  className="h-1.5 mt-1" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Expiring in 30 Days</p>
                  <div className="flex items-baseline">
                    <p className="text-heading-2">{expiringIn30Days}</p>
                    <p className="text-sm text-muted-foreground ml-2">urgent</p>
                  </div>
                </div>
                <div className="p-2 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs flex justify-between">
                  <span className="text-muted-foreground">Percentage of total</span>
                  <span className="font-medium">{Math.round((expiringIn30Days / totalLeases) * 100)}%</span>
                </div>
                <Progress 
                  value={(expiringIn30Days / totalLeases) * 100} 
                  className="h-1.5 mt-1 [&>div]:bg-destructive" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Potential Commission</p>
                  <div className="flex items-baseline">
                    <p className="text-heading-2">{formatCurrency(potentialCommission)}</p>
                  </div>
                </div>
                <div className="p-2 bg-success/10 rounded-full">
                  <DollarSign className="h-5 w-5 text-success-foreground" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs flex justify-between">
                  <span className="text-muted-foreground">Based on one month's rent</span>
                  <span className="font-medium">{totalLeases} properties</span>
                </div>
                <div className="text-xs text-success-foreground flex items-center mt-1">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  <span>High potential earnings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Success Rate</p>
                  <div className="flex items-baseline">
                    <p className="text-heading-2">{successRate}%</p>
                    <p className="text-sm text-muted-foreground ml-2">conversion</p>
                  </div>
                </div>
                <div className="p-2 bg-accent/10 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs flex justify-between">
                  <span className="text-muted-foreground">Based on historical data</span>
                </div>
                <Progress 
                  value={successRate} 
                  className="h-1.5 mt-1 [&>div]:bg-accent" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription CTA for non-subscribers */}
        {!isSubscribed && (
          <Card className="bg-gradient-to-r from-primary/10 to-purple-50 border-primary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-2">
                  <h3 className="text-body-large text-primary">Unlock Premium Lease Data</h3>
                  <p className="text-sm text-primary">
                    Subscribe to get full access to tenant contact information, renewal predictions, and property details.
                  </p>
                </div>
                <Button 
                  className="bg-primary hover:bg-primary"
                  onClick={() => setIsSubscriptionDialogOpen(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtering Options */}
        <div className="flex justify-between items-center">
          <Select value={filterDays} onValueChange={setFilterDays}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by expiry date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Expiring Leases</SelectItem>
              <SelectItem value="15">Expiring within 15 days</SelectItem>
              <SelectItem value="30">Expiring within 30 days</SelectItem>
              <SelectItem value="60">Expiring within 60 days</SelectItem>
              <SelectItem value="90">Expiring within 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-sm text-muted-foreground">
            {remainingUnlocks > 0 ? (
              <span>{remainingUnlocks} unlocks remaining</span>
            ) : remainingUnlocks === -1 ? (
              <span>Unlimited access</span>
            ) : (
              <span>No unlocks available</span>
            )}
          </div>
        </div>

        {/* Lease List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-body-large">Expiring Leases</CardTitle>
          </CardHeader>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Leases</TabsTrigger>
                <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
                <TabsTrigger value="locked">Locked</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-0 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Rent (BWP)</TableHead>
                    <TableHead>Expires In</TableHead>
                    <TableHead>Renewal</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeases.length > 0 ? (
                    filteredLeases.map((lease) => {
                      const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
                      const expiryStatusColor = getExpiryStatusColor(daysUntilExpiry);
                      const renewalDetails = getRenewalLikelihoodDetails(lease.renewalLikelihood);
                      
                      return (
                        <TableRow key={lease.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{lease.propertyAddress.split(",")[0]}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                <span className="flex items-center">
                                  <Home className="h-3.5 w-3.5 mr-1" />
                                  {lease.propertyType}
                                </span>
                                
                                {lease.bedrooms > 0 && (
                                  <span className="flex items-center">
                                    <Bed className="h-3.5 w-3.5 mr-1" />
                                    {lease.bedrooms}
                                  </span>
                                )}
                                
                                {lease.bathrooms > 0 && (
                                  <span className="flex items-center">
                                    <Bath className="h-3.5 w-3.5 mr-1" />
                                    {lease.bathrooms}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {lease.unlocked ? (
                              <div>
                                <div className="font-medium">{lease.tenantName}</div>
                                <div className="text-xs text-muted-foreground flex flex-col mt-1">
                                  <span className="flex items-center">
                                    <Phone className="h-3.5 w-3.5 mr-1" />
                                    {lease.tenantPhone}
                                  </span>
                                  <span className="flex items-center mt-0.5">
                                    <Mail className="h-3.5 w-3.5 mr-1" />
                                    {lease.tenantEmail}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">Locked</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(lease.rentAmount)}</div>
                            <div className="text-xs text-muted-foreground">monthly</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={expiryStatusColor}>
                              {daysUntilExpiry} days
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDate(lease.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lease.unlocked ? (
                              <div className="flex items-center">
                                {renewalDetails.icon}
                                <span className={`ml-1.5 ${renewalDetails.text}`}>
                                  {renewalDetails.label}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">Locked</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {lease.unlocked ? (
                              <Button variant="outline" size="sm" onClick={() => viewContactDetails(lease)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Contact Tenant
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleUnlockDialog(lease)}>
                                <Unlock className="h-4 w-4 mr-2" />
                                Unlock Details
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-muted-foreground opacity-40 mb-2" />
                          <p className="text-muted-foreground">No expiring leases found</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try changing your filter criteria
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Tabs>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-body-large">Frequently Asked Questions</CardTitle>
            <CardDescription>Learn more about the Expiring Leases feature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                  How is this data collected?
                </h3>
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  Our system monitors property leases across the market, identifying those nearing expiration. We use a combination of public records and proprietary data collection methods, all compliant with privacy regulations.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                  How accurate is the renewal likelihood prediction?
                </h3>
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  Our predictions are based on historical tenant behavior, property condition, rental market trends, and tenant payment history. While not guaranteed, our model has an accuracy rate of approximately 75% based on historical data.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                  Can landlords see that I'm contacting their tenants?
                </h3>
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  No, we maintain confidentiality in your tenant outreach efforts. However, we encourage ethical business practices and clear communication with prospective clients.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                  What happens when I "unlock" a property?
                </h3>
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  Unlocking a property provides you with tenant contact information, detailed property specifications, renewal likelihood assessment, and the ability to reach out directly to discuss potential representation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subscribe to Premium Access</DialogTitle>
            <DialogDescription>
              Gain exclusive access to expiring lease data before your competitors
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            <div className="bg-primary/10 p-4 rounded-md flex gap-3 border border-primary">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary">
                <p className="font-medium">Why subscribe?</p>
                <p className="mt-1">
                  Agencies with premium access contact tenants on average 47 days before competitors, resulting in 3.5x higher client acquisition rates.
                </p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {subscriptionPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`rounded-lg border p-4 ${plan.color} ${plan.recommended ? 'ring-2 ring-amber-300' : ''}`}
                >
                  {plan.recommended && (
                    <div className="flex justify-end -mt-4 -mr-4">
                      <Badge className="bg-warning/20 text-warning-foreground border-amber-200">
                        Recommended
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-body-large">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.duration ? `${plan.duration}-day access` : 'One-time purchase'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(plan.price)}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.duration ? `${formatCurrency(plan.price / plan.duration)} per day` : 'Per lease'}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success-foreground mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => subscribeToPlan(plan.id)}
                  >
                    {plan.duration ? 'Subscribe Now' : 'Purchase Credits'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unlock Lease Dialog */}
      <Dialog open={isUnlockDialogOpen} onOpenChange={setIsUnlockDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Unlock Lease Details</DialogTitle>
            <DialogDescription>
              Get access to tenant contact information and property details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            {selectedLease && (
              <>
                <div className="flex gap-4 items-start border rounded-lg p-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedLease.propertyAddress.split(",")[0]}</h3>
                    <p className="text-sm text-muted-foreground">{selectedLease.propertyType} • {selectedLease.bedrooms} bed • {selectedLease.bathrooms} bath</p>
                    <div className="mt-1 flex items-center">
                      <Badge className={getExpiryStatusColor(getDaysUntilExpiry(selectedLease.endDate))}>
                        Expires in {getDaysUntilExpiry(selectedLease.endDate)} days
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="bg-warning/10 p-4 rounded-md border border-amber-200">
                  <h3 className="font-medium flex items-center text-warning-foreground">
                    <Lock className="h-4 w-4 mr-2" />
                    Locked Information
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-warning-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success-foreground" />
                      Tenant contact details
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success-foreground" />
                      Renewal likelihood assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success-foreground" />
                      Previous property management information
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success-foreground" />
                      Property specifications and details
                    </li>
                  </ul>
                </div>
                
                {remainingUnlocks === 0 && !isSubscribed ? (
                  <div className="bg-primary/10 p-4 rounded-md border border-primary">
                    <h3 className="font-medium text-primary">No unlocks remaining</h3>
                    <p className="text-sm text-primary mt-1">
                      Subscribe to a plan to unlock more lease details or purchase individual lease access.
                    </p>
                    <Button 
                      className="mt-3 w-full"
                      onClick={() => {
                        setIsUnlockDialogOpen(false);
                        setIsSubscriptionDialogOpen(true);
                      }}
                    >
                      View Subscription Options
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button onClick={() => unlockLease(selectedLease.id)}>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock Lease Details
                      {remainingUnlocks > 0 && (
                        <span className="text-xs ml-2">
                          ({remainingUnlocks} remaining)
                        </span>
                      )}
                    </Button>
                    
                    {!isSubscribed && (
                      <Button variant="outline" onClick={() => {
                        setIsUnlockDialogOpen(false);
                        setIsSubscriptionDialogOpen(true);
                      }}>
                        View Subscription Options
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Tenant Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Tenant</DialogTitle>
            <DialogDescription>
              Reach out about the expiring lease
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            {selectedLease && (
              <>
                <div className="flex gap-4 items-start">
                  <Avatar>
                    <AvatarFallback>{selectedLease.tenantName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedLease.tenantName}</h3>
                    <div className="text-sm text-muted-foreground flex flex-col mt-1">
                      <span className="flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        {selectedLease.tenantPhone}
                      </span>
                      <span className="flex items-center mt-0.5">
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        {selectedLease.tenantEmail}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="property">Property</Label>
                  <Input id="property" value={selectedLease.propertyAddress} readOnly className="bg-muted mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    defaultValue={`Your lease at ${selectedLease.propertyAddress.split(',')[0]} is expiring soon`} 
                    className="mt-1" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    className="mt-1 min-h-[120px]" 
                    defaultValue={`Dear ${selectedLease.tenantName},

I noticed that your lease at ${selectedLease.propertyAddress.split(',')[0]} is expiring on ${formatDate(selectedLease.endDate)}. 

I'd like to discuss your future housing plans and how I might be able to assist you, whether you're looking to renew, move to a new property, or explore other options.

Would you be available for a quick call to discuss this further?

Best regards,
[Your Name]
[Your Agency]`} 
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => handleSendMessage(selectedLease.tenantId, selectedLease.tenantEmail)}
                  >
                    <SendHorizonal className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Tenant
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashLayout>
  );
}