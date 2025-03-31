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
  ListFilter
} from "lucide-react";

// Sample commission data - In a real app, this would come from an API
const sampleCommissionDeals = [
  {
    id: 1,
    propertyAddress: "Plot 5419, Queens Road, Gaborone",
    propertyType: "Apartment",
    clientName: "Mpho Khumalo",
    dealType: "Lease",
    dealValue: 4500 * 12, // Annual lease value
    commissionRate: 8.5, // Percentage
    commissionAmount: 4500 * 12 * 0.085,
    status: "pending",
    dueDate: new Date(2023, 10, 30),
    closingDate: new Date(2023, 10, 15)
  },
  {
    id: 2,
    propertyAddress: "Plot 12364, Phakalane Golf Estate, Gaborone",
    propertyType: "House",
    clientName: "Tebogo Moilwa",
    dealType: "Lease",
    dealValue: 8500 * 12, // Annual lease value
    commissionRate: 8.5,
    commissionAmount: 8500 * 12 * 0.085,
    status: "paid",
    dueDate: new Date(2023, 10, 10),
    closingDate: new Date(2023, 9, 25),
    paymentDate: new Date(2023, 10, 5)
  },
  {
    id: 3,
    propertyAddress: "Plot 1243, Main Mall, Gaborone",
    propertyType: "Commercial",
    clientName: "Kagiso Molefe",
    dealType: "Lease",
    dealValue: 12000 * 12, // Annual lease value
    commissionRate: 10, // Higher commission for commercial
    commissionAmount: 12000 * 12 * 0.1,
    status: "paid",
    dueDate: new Date(2023, 9, 30),
    closingDate: new Date(2023, 9, 5),
    paymentDate: new Date(2023, 9, 20)
  },
  {
    id: 4,
    propertyAddress: "Plot 7389, Extension 9, Gaborone",
    propertyType: "Apartment",
    clientName: "Naledi Phiri",
    dealType: "Lease",
    dealValue: 3200 * 12, // Annual lease value
    commissionRate: 8.5,
    commissionAmount: 3200 * 12 * 0.085,
    status: "pending",
    dueDate: new Date(2023, 11, 15),
    closingDate: new Date(2023, 10, 20)
  },
  {
    id: 5,
    propertyAddress: "Plot 9876, Block 6, Gaborone",
    propertyType: "House",
    clientName: "Kgosi Sebina",
    dealType: "Sale",
    dealValue: 1250000, // Sale price
    commissionRate: 5, // Lower percentage for sale
    commissionAmount: 1250000 * 0.05,
    status: "paid",
    dueDate: new Date(2023, 8, 30),
    closingDate: new Date(2023, 8, 15),
    paymentDate: new Date(2023, 8, 25)
  },
  {
    id: 6,
    propertyAddress: "Plot 4532, Phase 2, Gaborone",
    propertyType: "House",
    clientName: "Masego Tau",
    dealType: "Sale",
    dealValue: 950000, // Sale price
    commissionRate: 5,
    commissionAmount: 950000 * 0.05,
    status: "pending",
    dueDate: new Date(2023, 11, 10),
    closingDate: new Date(2023, 10, 25)
  },
  {
    id: 7,
    propertyAddress: "Plot 3421, Block 8, Gaborone",
    propertyType: "Apartment",
    clientName: "Thato Mokgosi",
    dealType: "Lease",
    dealValue: 5800 * 12, // Annual lease value
    commissionRate: 8.5,
    commissionAmount: 5800 * 12 * 0.085,
    status: "overdue",
    dueDate: new Date(2023, 9, 15),
    closingDate: new Date(2023, 8, 30)
  },
  {
    id: 8,
    propertyAddress: "Plot 6789, Phakalane, Gaborone",
    propertyType: "Villa",
    clientName: "Kefilwe Ndlovu",
    dealType: "Sale",
    dealValue: 1850000, // Sale price
    commissionRate: 5,
    commissionAmount: 1850000 * 0.05,
    status: "paid",
    dueDate: new Date(2023, 7, 25),
    closingDate: new Date(2023, 7, 10),
    paymentDate: new Date(2023, 7, 20)
  }
];

// Sample landlords data
const sampleLandlords = [
  {
    id: 1,
    name: "Kgosi Sebina",
    propertiesCount: 3,
    totalCommissions: 125000
  },
  {
    id: 2,
    name: "Masego Tau",
    propertiesCount: 2,
    totalCommissions: 75000
  },
  {
    id: 3,
    name: "Boitumelo Ndlovu",
    propertiesCount: 1,
    totalCommissions: 32000
  },
  {
    id: 4,
    name: "Thabo Moremi",
    propertiesCount: 4,
    totalCommissions: 156000
  }
];

// Sample commission history data by month
const monthlyCommissionData = [
  { month: 'Jan', amount: 45000, target: 50000 },
  { month: 'Feb', amount: 52000, target: 50000 },
  { month: 'Mar', amount: 48000, target: 50000 },
  { month: 'Apr', amount: 61000, target: 60000 },
  { month: 'May', amount: 58000, target: 60000 },
  { month: 'Jun', amount: 63000, target: 60000 },
  { month: 'Jul', amount: 69000, target: 70000 },
  { month: 'Aug', amount: 73000, target: 70000 },
  { month: 'Sep', amount: 79000, target: 70000 },
  { month: 'Oct', amount: 82000, target: 80000 },
  { month: 'Nov', amount: 76000, target: 80000 },
  { month: 'Dec', amount: 91000, target: 80000 }
];

// Commission by property type
const commissionByPropertyType = [
  { name: 'Apartments', value: 35 },
  { name: 'Houses', value: 40 },
  { name: 'Commercial', value: 15 },
  { name: 'Villas', value: 10 }
];

// Deal type schema for the form
const dealSchema = z.object({
  propertyAddress: z.string().min(5, "Property address is required"),
  propertyType: z.string().min(1, "Property type is required"),
  clientName: z.string().min(2, "Client name is required"),
  dealType: z.string().min(1, "Deal type is required"),
  dealValue: z.number().min(1, "Deal value is required"),
  commissionRate: z.number().min(0.1).max(100, "Rate must be between 0.1 and 100"),
  closingDate: z.date(),
  dueDate: z.date(),
  status: z.string()
});

type DealFormValues = z.infer<typeof dealSchema>;

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700'
};

export default function CommissionTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [deals, setDeals] = useState(sampleCommissionDeals);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form for adding/editing deals
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      propertyAddress: "",
      propertyType: "Apartment",
      clientName: "",
      dealType: "Lease",
      dealValue: 0,
      commissionRate: 8.5,
      closingDate: new Date(),
      dueDate: new Date(),
      status: "pending"
    }
  });

  // Calculate commissions summary
  const totalCommission = deals.reduce((sum, deal) => sum + deal.commissionAmount, 0);
  const pendingCommission = deals
    .filter(deal => deal.status === "pending")
    .reduce((sum, deal) => sum + deal.commissionAmount, 0);
  const paidCommission = deals
    .filter(deal => deal.status === "paid")
    .reduce((sum, deal) => sum + deal.commissionAmount, 0);
  const overdueCommission = deals
    .filter(deal => deal.status === "overdue")
    .reduce((sum, deal) => sum + deal.commissionAmount, 0);

  // Filter deals by status
  const filteredDeals = deals.filter(deal => {
    if (filterStatus === "all") return true;
    return deal.status === filterStatus;
  });

  // Filter deals by tab
  const tabFilteredDeals = filteredDeals.filter(deal => {
    if (activeTab === "all") return true;
    return deal.dealType.toLowerCase() === activeTab.toLowerCase();
  });

  // Handle adding a new deal
  const handleAddDeal = () => {
    setCurrentDeal(null);
    form.reset({
      propertyAddress: "",
      propertyType: "Apartment",
      clientName: "",
      dealType: "Lease",
      dealValue: 0,
      commissionRate: 8.5,
      closingDate: new Date(),
      dueDate: new Date(),
      status: "pending"
    });
    setIsAddDialogOpen(true);
  };

  // Handle editing a deal
  const handleEditDeal = (deal: any) => {
    setCurrentDeal(deal);
    form.reset({
      propertyAddress: deal.propertyAddress,
      propertyType: deal.propertyType,
      clientName: deal.clientName,
      dealType: deal.dealType,
      dealValue: deal.dealValue,
      commissionRate: deal.commissionRate,
      closingDate: new Date(deal.closingDate),
      dueDate: new Date(deal.dueDate),
      status: deal.status
    });
    setIsEditDialogOpen(true);
  };

  // Handle deleting a deal
  const handleDeleteDeal = (id: number) => {
    setDeals(deals.filter(deal => deal.id !== id));
    toast({
      title: "Deal removed",
      description: "The commission record has been deleted",
    });
  };

  // Handle form submission
  const onSubmit = (data: DealFormValues) => {
    // Calculate commission amount
    const commissionAmount = 
      data.dealType === "Lease" 
        ? data.dealValue * (data.commissionRate / 100)  // For lease: annual value * rate
        : data.dealValue * (data.commissionRate / 100); // For sale: sale price * rate

    if (currentDeal) {
      // Edit existing deal
      setDeals(deals.map(deal => 
        deal.id === currentDeal.id 
          ? { 
              ...deal, 
              ...data, 
              commissionAmount
            } 
          : deal
      ));
      toast({
        title: "Deal updated",
        description: "The commission details have been updated successfully",
      });
      setIsEditDialogOpen(false);
    } else {
      // Add new deal
      const newDeal = {
        id: deals.length + 1,
        ...data,
        commissionAmount
      };
      setDeals([newDeal, ...deals]);
      toast({
        title: "Deal added",
        description: "New commission record has been created",
      });
      setIsAddDialogOpen(false);
    }
  };

  // Mark a deal as paid
  const markAsPaid = (id: number) => {
    setDeals(deals.map(deal => 
      deal.id === id 
        ? { ...deal, status: 'paid', paymentDate: new Date() } 
        : deal
    ));
    toast({
      title: "Status updated",
      description: "Commission marked as paid",
    });
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-sm text-green-600">{`Commission: ${formatCurrency(payload[0].value)}`}</p>
          {payload[1] && (
            <p className="text-sm text-blue-600">{`Target: ${formatCurrency(payload[1].value)}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <DashLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Commission Tracker</h1>
            <p className="text-muted-foreground">Track and analyze your commission earnings</p>
          </div>
          <Button onClick={handleAddDeal}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Deal
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground text-sm">Total Commission</span>
                <span className="text-2xl font-bold">{formatCurrency(totalCommission)}</span>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  <span>15% from last year</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground text-sm">Pending Commission</span>
                <span className="text-2xl font-bold">{formatCurrency(pendingCommission)}</span>
                <Progress 
                  value={(pendingCommission / totalCommission) * 100} 
                  className="h-1.5 mt-1.5" 
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round((pendingCommission / totalCommission) * 100)}% of total
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground text-sm">Paid Commission</span>
                <span className="text-2xl font-bold">{formatCurrency(paidCommission)}</span>
                <Progress 
                  value={(paidCommission / totalCommission) * 100} 
                  className="h-1.5 mt-1.5 [&>div]:bg-green-500" 
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round((paidCommission / totalCommission) * 100)}% of total
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground text-sm">Overdue Commission</span>
                <span className="text-2xl font-bold">{formatCurrency(overdueCommission)}</span>
                <Progress 
                  value={(overdueCommission / totalCommission) * 100} 
                  className="h-1.5 mt-1.5 [&>div]:bg-red-500" 
                />
                <span className="text-xs text-muted-foreground">
                  {Math.round((overdueCommission / totalCommission) * 100)}% of total
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Monthly Commission Performance</CardTitle>
              <CardDescription>Track your commission against monthly targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyCommissionData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => `${value/1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      name="Commission" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="target" 
                      name="Target" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.1} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Commission by Property Type</CardTitle>
              <CardDescription>Distribution of earnings by sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={commissionByPropertyType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {commissionByPropertyType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deals List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <CardTitle className="text-lg font-medium">Commission Deals</CardTitle>
              
              <div className="flex gap-2">
                <Select defaultValue="all" onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Deals</TabsTrigger>
                <TabsTrigger value="lease">Leases</TabsTrigger>
                <TabsTrigger value="sale">Sales</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-0 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Deal Value</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabFilteredDeals.length > 0 ? (
                    tabFilteredDeals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{deal.propertyAddress.split(",")[0]}</div>
                            <div className="text-xs text-muted-foreground">
                              {deal.propertyType} • {deal.dealType}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{deal.clientName}</TableCell>
                        <TableCell>{formatCurrency(deal.dealValue)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatCurrency(deal.commissionAmount)}</div>
                            <div className="text-xs text-muted-foreground">{deal.commissionRate}% rate</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[deal.status as keyof typeof STATUS_COLORS]}>
                            {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{formatDate(deal.dueDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditDeal(deal)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit details
                              </DropdownMenuItem>
                              {deal.status !== 'paid' && (
                                <DropdownMenuItem onClick={() => markAsPaid(deal.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as paid
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                View contract
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteDeal(deal.id)}>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <div className="flex flex-col items-center">
                          <DollarSign className="h-8 w-8 text-muted-foreground opacity-40 mb-2" />
                          <p className="text-muted-foreground">No commission deals found</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={handleAddDeal}>
                            <Plus className="h-4 w-4 mr-2 shrink-0" />
                            Add your first deal
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Tabs>
        </Card>

        {/* Top Performing Landlords */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Top Landlord Clients</CardTitle>
            <CardDescription>Landlords providing the most commission</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleLandlords.map((landlord) => (
                <div key={landlord.id} className="flex items-center">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarFallback>{landlord.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium leading-none">{landlord.name}</p>
                        <p className="text-xs text-muted-foreground">{landlord.propertiesCount} properties</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(landlord.totalCommissions)}</p>
                        <p className="text-xs text-muted-foreground">total commission</p>
                      </div>
                    </div>
                    <Progress 
                      value={(landlord.totalCommissions / sampleLandlords[0].totalCommissions) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Deal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
            <DialogDescription>
              Enter the details of the new commission deal.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Plot 1234, Example Street, Gaborone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
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
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="House">House</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="Office">Office Space</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Type</FormLabel>
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
                          <SelectItem value="Lease">Lease</SelectItem>
                          <SelectItem value="Sale">Sale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Client's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dealValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch('dealType') === 'Lease' ? 'Monthly Rent (BWP)' : 'Sale Price (BWP)'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {form.watch('dealType') === 'Lease' ? 'Commission calculated on annual value' : 'Commission calculated on sale price'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="closingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {currentDeal ? 'Update Deal' : 'Add Deal'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Deal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Update the details of this commission deal.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Plot 1234, Example Street, Gaborone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
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
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="House">House</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="Office">Office Space</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Type</FormLabel>
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
                          <SelectItem value="Lease">Lease</SelectItem>
                          <SelectItem value="Sale">Sale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Client's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dealValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch('dealType') === 'Lease' ? 'Monthly Rent (BWP)' : 'Sale Price (BWP)'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {form.watch('dealType') === 'Lease' ? 'Commission calculated on annual value' : 'Commission calculated on sale price'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="closingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Update Deal</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashLayout>
  );
}