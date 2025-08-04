import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PropertyBrowser } from "@/components/property/PropertyBrowser";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";

export default function PropertiesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Browse Properties - TOV Property Management</title>
        <meta 
          name="description" 
          content="Browse and search through available properties for rent and sale. Find your perfect home or commercial space with advanced filtering options." 
        />
        <meta name="keywords" content="properties, rent, sale, apartments, houses, commercial, Botswana, Gaborone" />
        <meta property="og:title" content="Browse Properties - TOV Property Management" />
        <meta 
          property="og:description" 
          content="Browse and search through available properties for rent and sale. Find your perfect home or commercial space." 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/properties" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="container-wide">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Brand */}
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TOV</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-base hidden sm:block">
                    TOV Property Management
                  </span>
                </div>
              </Link>

              {/* Navigation Actions */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth">
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Following successful pattern */}
        <div className="container-wide p-6 space-y-6">
          {/* Page Header */}
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Properties</h1>
            <p className="text-gray-500 mt-1">Discover your perfect home or commercial space from our extensive collection of properties.</p>
          </header>

          {/* Property Browser Component */}
          <PropertyBrowser 
            useUrlFilters={true}
            showViewToggle={true}
            onPropertySelect={(property) => {
              navigate(`/property/${property.id}`);
            }}
            className="!p-0 !py-0"
          />
        </div>
      </div>
    </>
  );
}