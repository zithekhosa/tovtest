import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Property } from "@shared/schema";
import { DashLayout } from "@/layout/dash-layout";
import { PropertyCard } from "@/components/dashboard/property-card";
import { Button } from "@/components/ui/button";
import { Plus, Building, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Properties() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  
  // Fetch properties
  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties/user"],
    enabled: user?.role === "landlord" || user?.role === "agency",
  });

  // For tenants, we'd fetch their specific rental property
  const isTenant = user?.role === "tenant";
  const { data: tenantProperty, isLoading: isLoadingTenantProperty } = useQuery<Property>({
    queryKey: ["/api/properties/tenant"],
    enabled: isTenant,
  });

  // States for property filtering (could be expanded)
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter properties based on search term
  const filteredProperties = properties.filter(property => 
    (property.title ? property.title.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (property.address ? property.address.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (property.city ? property.city.toLowerCase().includes(searchTerm.toLowerCase()) : false)
  );

  if (isLoading || isLoadingTenantProperty) {
    return (
      <DashLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading properties...</p>
        </div>
      </DashLayout>
    );
  }

  if (error) {
    return (
      <DashLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-red-800 font-medium">Error loading properties</h2>
          <p className="text-red-600 mt-1">{(error as Error).message}</p>
        </div>
      </DashLayout>
    );
  }

  // Different view for tenant
  if (isTenant) {
    return (
      <DashLayout>
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Rental</h1>
          <p className="text-gray-500 mt-1">View details about your rented property</p>
        </header>
        
        {tenantProperty ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">{tenantProperty.title}</h2>
              <p className="text-gray-600 mt-1">{tenantProperty.address}, {tenantProperty.city}, {tenantProperty.state} {tenantProperty.zipCode}</p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-900">Landlord Contact</h3>
                  <p className="text-gray-600 mt-1">Contact your landlord for any questions</p>
                  <Button className="mt-2" variant="outline">Contact Landlord</Button>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-900">Rental Details</h3>
                  <p className="text-gray-600 mt-1">View your lease and payment information</p>
                  <Button className="mt-2" variant="outline">View Details</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No rental information found</h3>
            <p className="text-gray-500 mb-4">No property is currently associated with your account</p>
          </div>
        )}
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage your real estate portfolio</p>
        </div>
        {(user?.role === "landlord" || user?.role === "agency") && (
          <Link href="/properties/new">
            <Button className="mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        )}
      </header>
      
      {/* Search and filter */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Properties grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard
              key={property.id}
              id={property.id}
              name={property.title || ''}
              address={`${property.address || ''}, ${property.city || ''}`}
              imageUrl={(property.images && property.images.length > 0) ? property.images[0] : ""}
              units={property.bedrooms || 0}
              tenants={0} // This would be calculated in a real implementation
              income={`${property.rentAmount || 0} BWP/mo`}
              status={property.available ? 'Vacant' : 'Fully Occupied'}
              onClick={() => navigate(`/properties/${property.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No properties found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No properties match your search criteria" : "Get started by adding your first property"}
          </p>
          {!searchTerm && (user?.role === "landlord" || user?.role === "agency") && (
            <Link href="/properties/new">
              <Button>Add Your First Property</Button>
            </Link>
          )}
        </div>
      )}
    </DashLayout>
  );
}
