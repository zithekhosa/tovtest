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
  CalendarPlus,
  Briefcase
} from "lucide-react";

// Lead status options
const leadStatusOptions = [
  { value: "new", label: "New Lead", color: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Contacted", color: "bg-purple-100 text-purple-700" },
  { value: "interested", label: "Interested", color: "bg-green-100 text-green-700" },
  { value: "negotiating", label: "Negotiating", color: "bg-amber-100 text-amber-700" },
  { value: "closed", label: "Closed", color: "bg-green-100 text-green-800" },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-700" }
];

// Lead source options
const leadSourceOptions = [
  { value: "website", label: "Website Inquiry" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "property_listing", label: "Property Listing" },
  { value: "phone", label: "Phone Call" },
  { value: "walk_in", label: "Walk-in" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" }
];

// Sample data - In a real application, this would come from an API
const sampleLeads = [
  {
    id: 1,
    name: "Mpho Khumalo",
    phone: "71234567",
    email: "mpho.k@example.com",
    status: "new",
    source: "website",
    propertyInterest: "3-bedroom house in Gaborone",
    budget: 6000,
    notes: "Looking for a family home with a garden",
    createdAt: new Date(2023, 10, 15),
    lastContact: new Date(2023, 10, 15),
    nextFollowUp: new Date(2023, 10, 18),
    assignedAgent: "Lesego Phiri"
  },
  {
    id: 2,
    name: "Tebogo Moilwa",
    phone: "72345678",
    email: "tebogo.m@example.com",
    status: "contacted",
    source: "property_listing",
    propertyInterest: "Office space in CBD",
    budget: 12000,
    notes: "Represents a tech startup looking for office space",
    createdAt: new Date(2023, 10, 12),
    lastContact: new Date(2023, 10, 14),
    nextFollowUp: new Date(2023, 10, 20),
    assignedAgent: "Lesego Phiri"
  },
  {
    id: 3,
    name: "Kagiso Molefe",
    phone: "73456789",
    email: "kagiso.m@example.com",
    status: "interested",
    source: "referral",
    propertyInterest: "2-bedroom apartment near Main Mall",
    budget: 4500,
    notes: "Relocating from Francistown for work",
    createdAt: new Date(2023, 10, 10),
    lastContact: new Date(2023, 10, 13),
    nextFollowUp: new Date(2023, 10, 19),
    assignedAgent: "Lesego Phiri"
  },
  {
    id: 4,
    name: "Naledi Phiri",
    phone: "74567890",
    email: "naledi.p@example.com",
    status: "negotiating",
    source: "social_media",
    propertyInterest: "Luxury villa in Phakalane",
    budget: 15000,
    notes: "Interested in a 2-year lease with option to buy",
    createdAt: new Date(2023, 10, 8),
    lastContact: new Date(2023, 10, 12),
    nextFollowUp: new Date(2023, 10, 17),
    assignedAgent: "Lesego Phiri"
  },
  {
    id: 5,
    name: "Tshepo Sebina",
    phone: "75678901",
    email: "tshepo.s@example.com",
    status: "closed",
    source: "website",
    propertyInterest: "1-bedroom apartment in Block 6",
    budget: 3500,
    notes: "Lease signed for 12 months",
    createdAt: new Date(2023, 10, 5),
    lastContact: new Date(2023, 10, 11),
    nextFollowUp: null,
    assignedAgent: "Lesego Phiri"
  },
  {
    id: 6,
    name: "Boipelo Tau",
    phone: "76789012",
    email: "boipelo.t@example.com",
    status: "lost",
    source: "phone",
    propertyInterest: "Commercial space in Broadhurst",
    budget: 10000,
    notes: "Decided to go with another agency",
    createdAt: new Date(2023, 10, 3),
    lastContact: new Date(2023, 10, 10),
    nextFollowUp: null,
    assignedAgent: "Lesego Phiri"
  }
];

// Interface for a lead
interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: string;
  source: string;
  propertyInterest: string;
  budget: number;
  notes: string;
  createdAt: Date;
  lastContact: Date;
  nextFollowUp: Date | null;
  assignedAgent: string;
}

// Lead schema for form validation

const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Valid phone number required"),
  status: z.string(),
  source: z.string(),
  propertyInterest: z.string().optional(),
  budget: z.number().min(0).optional(),
  notes: z.string().optional(),
  nextFollowUp: z.date().optional().nullable(),
  assignedAgent: z.string().optional()
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function LeadsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [leads, setLeads] = useState(sampleLeads);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);

  // Form for adding/editing leads
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "new",
      source: "website",
      propertyInterest: "",
      budget: 0,
      notes: "",
      nextFollowUp: new Date(),
      assignedAgent: "Lesego Phiri"
    }
  });

  // Filter leads by status and search term
  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.propertyInterest && lead.propertyInterest.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const statusOption = leadStatusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-700";
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusOption = leadStatusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  // Get source label
  const getSourceLabel = (source: string) => {
    const sourceOption = leadSourceOptions.find(option => option.value === source);
    return sourceOption ? sourceOption.label : source;
  };

  // Open edit dialog
  const handleEditLead = (lead: Lead) => {
    setCurrentLead(lead);
    form.reset({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      propertyInterest: lead.propertyInterest || "",
      budget: lead.budget || 0,
      notes: lead.notes || "",
      nextFollowUp: lead.nextFollowUp ? new Date(lead.nextFollowUp) : null,
      assignedAgent: lead.assignedAgent || "Lesego Phiri"
    });
    setIsEditDialogOpen(true);
  };

  // Open add dialog
  const handleAddLead = () => {
    setCurrentLead(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      status: "new",
      source: "website",
      propertyInterest: "",
      budget: 0,
      notes: "",
      nextFollowUp: new Date(),
      assignedAgent: "Lesego Phiri"
    });
    setIsAddDialogOpen(true);
  };

  // Delete lead
  const handleDeleteLead = (id: number) => {
    setLeads(leads.filter(lead => lead.id !== id));
    toast({
      title: "Lead deleted",
      description: "The lead has been removed from your list",
    });
  };

  // Submit form
  const onSubmit = (data: LeadFormValues) => {
    if (currentLead) {
      // Edit existing lead
      setLeads(leads.map(lead => 
        lead.id === currentLead.id ? { 
          ...lead, 
          name: data.name,
          phone: data.phone,
          email: data.email,
          status: data.status,
          source: data.source,
          propertyInterest: data.propertyInterest || lead.propertyInterest,
          budget: data.budget || lead.budget,
          notes: data.notes || lead.notes,
          lastContact: new Date(),
          nextFollowUp: data.nextFollowUp || lead.nextFollowUp,
          assignedAgent: data.assignedAgent || lead.assignedAgent
        } : lead
      ));
      toast({
        title: "Lead updated",
        description: "The lead information has been updated successfully",
      });
      setIsEditDialogOpen(false);
    } else {
      // Add new lead
      const newLead: Lead = {
        id: leads.length + 1,
        name: data.name,
        phone: data.phone,
        email: data.email,
        status: data.status,
        source: data.source,
        propertyInterest: data.propertyInterest || "",
        budget: data.budget || 0,
        notes: data.notes || "",
        createdAt: new Date(),
        lastContact: new Date(),
        nextFollowUp: data.nextFollowUp || null,
        assignedAgent: data.assignedAgent || ""
      };
      setLeads([newLead, ...leads]);
      toast({
        title: "Lead added",
        description: "New lead has been added to your list",
      });
      setIsAddDialogOpen(false);
    }
  };

  // Lead counts by status for statistics
  const statusCounts = leadStatusOptions.reduce((acc, status) => {
    acc[status.value] = leads.filter(lead => lead.status === status.value).length;
    return acc;
  }, {} as Record<string, number>);

  // Count leads with follow-ups due today
  const todayFollowUps = leads.filter(lead => {
    if (!lead.nextFollowUp) return false;
    const followUpDate = new Date(lead.nextFollowUp);
    const today = new Date();
    return followUpDate.toDateString() === today.toDateString();
  }).length;

  return (
    <DashLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
            <p className="text-muted-foreground">Track and manage your potential clients</p>
          </div>
          <Button onClick={handleAddLead}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-700 mb-2">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <h3 className="text-2xl font-bold">{leads.length}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-green-100 text-green-700 mb-2">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <h3 className="text-2xl font-bold">
                {leads.length ? Math.round((statusCounts.closed / leads.length) * 100) : 0}%
              </h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-700 mb-2">
                <Briefcase className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">Active Deals</p>
              <h3 className="text-2xl font-bold">
                {statusCounts.interested + statusCounts.negotiating || 0}
              </h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-700 mb-2">
                <CalendarPlus className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">Today's Follow-ups</p>
              <h3 className="text-2xl font-bold">{todayFollowUps}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-green-100 text-green-700 mb-2">
                <DollarSign className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">Closed Deals</p>
              <h3 className="text-2xl font-bold">{statusCounts.closed || 0}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Status Progress Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {leadStatusOptions.map((status) => (
                  <Badge key={status.value} className={status.color} variant="outline">
                    {status.label}: {statusCounts[status.value] || 0}
                  </Badge>
                ))}
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                {leadStatusOptions.map((status) => {
                  const percentage = leads.length 
                    ? (statusCounts[status.value] || 0) / leads.length * 100 
                    : 0;
                  return percentage > 0 ? (
                    <div 
                      key={status.value}
                      className={`${status.color.replace('bg-', 'bg-')} h-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  ) : null;
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Pipeline distribution of leads across different stages
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filtering & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select defaultValue="all" onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {leadStatusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Next Follow-up</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.name}
                        <div className="text-xs text-muted-foreground">
                          Added {formatDate(lead.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm flex items-center">
                            <Mail className="h-3 w-3 mr-1" /> {lead.email}
                          </span>
                          <span className="text-sm flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" /> {lead.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(lead.status)}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{lead.propertyInterest}</div>
                          {lead.budget && (
                            <div className="text-xs text-muted-foreground">
                              Budget: {formatCurrency(lead.budget)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.nextFollowUp ? (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{formatDate(lead.nextFollowUp)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No follow-up set</span>
                        )}
                      </TableCell>
                      <TableCell>{getSourceLabel(lead.source)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CalendarPlus className="h-4 w-4 mr-2" />
                              Schedule follow-up
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteLead(lead.id)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Delete lead
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
                        <Users className="h-8 w-8 text-muted-foreground opacity-40 mb-2" />
                        <p className="text-muted-foreground">No leads found</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={handleAddLead}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add your first lead
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the details of the new potential client.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="71234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
                          {leadStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leadSourceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="propertyInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Interest</FormLabel>
                    <FormControl>
                      <Input placeholder="3-bedroom house in Gaborone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (BWP)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="5000" 
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
                  name="nextFollowUp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Follow-up</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional details about the lead" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Lead</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update the details of this lead.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="71234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
                          {leadStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leadSourceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="propertyInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Interest</FormLabel>
                    <FormControl>
                      <Input placeholder="3-bedroom house in Gaborone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (BWP)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="5000" 
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
                  name="nextFollowUp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Follow-up</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional details about the lead" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Update Lead</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashLayout>
  );
}