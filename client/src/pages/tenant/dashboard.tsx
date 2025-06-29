import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  DollarSign,
  FileText,
  Wrench,
  Calendar,
  CreditCard,
  Download,
  Clock,
  CheckCircle,
  Bell,
  Search,
  MapPin,
  Star,
  Plus,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Building
} from "lucide-react";
import { Property, Payment, Lease, Document } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { StandardLayout } from "@/components/layout/StandardLayout";

export default function TenantDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch tenant data
  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: ["/api/tenant/property"],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/tenant/payments"],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/tenant/documents"],
  });

  const { data: lease, isLoading: leaseLoading } = useQuery<Lease>({
    queryKey: ["/api/tenant/lease"],
  });

  // Calculate next payment due
  const nextPaymentDue = new Date();
  nextPaymentDue.setDate(nextPaymentDue.getDate() + 7);

  // Recent payments for display
  const recentPayments = payments.slice(0, 3);

  if (propertyLoading || paymentsLoading || leaseLoading) {
    return (
      <StandardLayout title="Dashboard" subtitle="Welcome back">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-8 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout 
      title="Tenant Dashboard" 
      subtitle={`Welcome back, ${user?.firstName || user?.username}`}
    >
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Current Rent</p>
                  <p className="text-2xl font-bold">
                    BWP {property?.rentAmount?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <Home className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Next Payment</p>
                  <p className="text-2xl font-bold">
                    {nextPaymentDue.toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Paid</p>
                  <p className="text-2xl font-bold">
                    BWP {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Information & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Property */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                My Current Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              {property ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{property.title}</h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {property.address}, {property.city}
                      </p>
                    </div>
                    <Badge variant="secondary">Active Lease</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Bedrooms</p>
                      <p className="font-medium">{property.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bathrooms</p>
                      <p className="font-medium">{property.bathrooms}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Size</p>
                      <p className="font-medium">{property.squareFootage}m²</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Monthly Rent</p>
                      <p className="font-medium">BWP {property.rentAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Lease
                    </Button>
                    <Button size="sm" variant="outline">
                      <Wrench className="h-4 w-4 mr-2" />
                      Request Maintenance
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Lease</h3>
                  <p className="text-gray-500 mb-4">You don't have an active lease at the moment</p>
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Rent
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Wrench className="h-4 w-4 mr-2" />
                Maintenance Request
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Lease
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment History & Important Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Link href="/tenant/payments">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.length > 0 ? recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">BWP {payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-green-600">
                      {payment.status}
                    </Badge>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No payments yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Important Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Important Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Rent Due Soon</p>
                    <p className="text-sm text-blue-700">
                      Your next rent payment is due on {nextPaymentDue.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Maintenance Complete</p>
                    <p className="text-sm text-green-700">
                      Kitchen faucet repair was completed yesterday
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Property Inspection</p>
                    <p className="text-sm text-orange-700">
                      Annual inspection scheduled for next week
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Looking for a New Place?
            </CardTitle>
            <CardDescription>
              Browse available properties in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by location, property type, or amenities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                <Search className="h-4 w-4 mr-2" />
                Search Properties
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                <MapPin className="h-3 w-3 mr-1" />
                Gaborone
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                <Home className="h-3 w-3 mr-1" />
                2+ Bedrooms
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                Under BWP 8,000
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
}