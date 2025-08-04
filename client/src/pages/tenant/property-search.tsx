import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import DashLayout from "@/components/layout/DashLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";

export default function PropertySearch() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to the dedicated properties page for full browsing experience
  useEffect(() => {
    navigate("/properties");
  }, [navigate]);

  return (
    <DashLayout>
      <div className="space-y-6">
        <DashboardHeader
          title="Find Property"
          subtitle="Search and browse available rental properties"
        />
        
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Search className="h-16 w-16 text-gray-400" />
          <h3 className="text-body-large text-gray-900">Redirecting to Property Browser</h3>
          <p className="text-gray-600 text-center max-w-md">
            You're being redirected to our dedicated property browsing page where you can search and filter through all available properties.
          </p>
          <Button 
            onClick={() => navigate("/properties")}
            className="mt-4"
          >
            Browse Properties
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </DashLayout>
  );
}