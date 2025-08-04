import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashLayout from "@/components/layout/DashLayout";
import { useToast } from "@/hooks/use-toast";
import { ApplicationScreener } from "@/components/agency/ApplicationScreener";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, FileText, PlusCircle } from "lucide-react";

export default function PropertyListings() {
  const { toast } = useToast();
  const [mainTab, setMainTab] = useState("listings");

  // Fetch applications data
  const { data: applications = [], refetch: refetchApplications } = useQuery({
    queryKey: ['/api/applications/agency'],
    queryFn: async () => {
      const response = await fetch('/api/applications/agency');
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    },
  });

  return (
    <DashLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-heading-2 tracking-tight">Property Management</h1>
            <p className="text-muted-foreground">Manage listings and screen rental applications</p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property Listings
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Application Screening
              {applications.filter((app: any) => app.status === 'pending').length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-destructive text-destructive-foreground">
                  {applications.filter((app: any) => app.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Property Listings Tab Content */}
          <TabsContent value="listings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Property listings functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Application Screening Tab Content */}
          <TabsContent value="applications" className="space-y-6 mt-6">
            <ApplicationScreener 
              applications={applications} 
              onApplicationUpdate={refetchApplications}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashLayout>
  );
}