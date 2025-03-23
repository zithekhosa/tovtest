import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AuthForms } from "@/components/auth/auth-forms";
import { Building, Shield, User, Tool, MessageSquare } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Auth Form Column */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">T</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TOV Platform</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome</h2>
            <p className="text-gray-500 mt-2">
              Sign in to your account or create a new one to get started.
            </p>
          </div>
          
          <AuthForms />
        </div>
      </div>
      
      {/* Hero Column */}
      <div className="hidden md:flex md:w-1/2 bg-primary-50 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Modern Property Management Made Simple
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Property Management</h3>
                <p className="text-gray-600 mt-1">
                  Efficiently manage your properties, units, and leases in one place.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tenant Portal</h3>
                <p className="text-gray-600 mt-1">
                  Pay rent, submit maintenance requests, and access documents easily.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Tool className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Maintenance Management</h3>
                <p className="text-gray-600 mt-1">
                  Streamline maintenance requests and connect with service providers.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Communication</h3>
                <p className="text-gray-600 mt-1">
                  Seamless communication between landlords, tenants, and service providers.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              TOV is a complete property management solution designed for landlords,
              tenants, property agencies, and maintenance providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
