import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashLayout } from "@/layout/dash-layout";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, Search, Filter, MoreHorizontal, Mail, Phone, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

// Sample tenant data structure (would come from the API)
interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  property: string;
  unit: string;
  leaseEnd: string;
  status: "active" | "pending" | "past";
  rentStatus: "paid" | "pending" | "overdue";
}

export default function Tenants() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // This would come from the API
  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    enabled: user?.role === "landlord",
    // Mocked for now - in real implementation this would use the API
    queryFn: async () => {
      return [
        {
          id: 1,
          name: "Jason Cooper",
          email: "jason@example.com",
          phone: "(123) 456-7890",
          property: "Riverside Heights",
          unit: "5B",
          leaseEnd: "Dec 31, 2023",
          status: "active",
          rentStatus: "paid"
        },
        {
          id: 2,
          name: "Sarah Williams",
          email: "sarah@example.com",
          phone: "(123) 456-7891",
          property: "Cedar Apartments",
          unit: "12",
          leaseEnd: "Jan 15, 2024",
          status: "active",
          rentStatus: "pending"
        },
        {
          id: 3,
          name: "Daniel Smith",
          email: "daniel@example.com",
          phone: "(123) 456-7892",
          property: "Maple Grove",
          unit: "3A",
          leaseEnd: "Nov 30, 2023",
          status: "active",
          rentStatus: "overdue"
        }
      ] as Tenant[];
    }
  });

  if (user?.role !== "landlord") {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </div>
      </DashLayout>
    );
  }

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading tenants...</p>
        </div>
      </DashLayout>
    );
  }

  // Filter tenants based on search term and active tab
  const filteredTenants = tenants.filter(tenant => {
    const searchMatch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tenant.property.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return searchMatch;
    if (activeTab === "active") return searchMatch && tenant.status === "active";
    if (activeTab === "overdue") return searchMatch && tenant.rentStatus === "overdue";
    
    return searchMatch;
  });

  return (
    <DashLayout>
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">Manage your tenant relationships</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </header>
      
      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <TabsList>
                <TabsTrigger value="all">All Tenants</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="overdue">Overdue Rent</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search tenants..."
                    className="pl-8 w-full md:w-[240px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Property & Unit</TableHead>
                  <TableHead>Lease Ends</TableHead>
                  <TableHead>Rent Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>
                        {tenant.property}, Unit {tenant.unit}
                      </TableCell>
                      <TableCell>{tenant.leaseEnd}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${tenant.rentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                            tenant.rentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {tenant.rentStatus.charAt(0).toUpperCase() + tenant.rentStatus.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" title={`Email ${tenant.name}`}>
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title={`Call ${tenant.name}`}>
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Tenant</DropdownMenuItem>
                            <DropdownMenuItem>Manage Lease</DropdownMenuItem>
                            <DropdownMenuItem>View Payment History</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <UserPlus className="h-8 w-8 text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium text-gray-900">No tenants found</h3>
                        <p className="text-gray-500 mt-1">
                          {searchTerm ? "No tenants match your search criteria" : "Get started by adding your first tenant"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            Showing <strong>{filteredTenants.length}</strong> of <strong>{tenants.length}</strong> tenants
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </DashLayout>
  );
}
