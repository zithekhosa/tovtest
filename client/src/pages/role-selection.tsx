import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, User, Building, Wrench } from "lucide-react";
import { UserRoleType } from "@shared/schema";
import { useLocation } from "wouter";

const DEMO_CREDENTIALS = {
  landlord: { username: "demo-landlord", password: "password123" },
  tenant: { username: "demo-tenant", password: "password123" },
  agency: { username: "demo-agency", password: "password123" },
  maintenance: { username: "demo-maintenance", password: "password123" },
};

const roleConfig = {
  landlord: {
    icon: Home,
    title: "Continue as Landlord",
    description: "Manage your properties, tenants, and rental income",
    color: "bg-blue-500",
    credentials: DEMO_CREDENTIALS.landlord,
  },
  tenant: {
    icon: User,
    title: "Continue as Tenant",
    description: "View your rentals, make payments, and submit maintenance requests",
    color: "bg-green-500",
    credentials: DEMO_CREDENTIALS.tenant,
  },
  agency: {
    icon: Building,
    title: "Continue as Real Estate Agent",
    description: "Manage property listings, leads, and client relationships",
    color: "bg-purple-500",
    credentials: DEMO_CREDENTIALS.agency,
  },
  maintenance: {
    icon: Wrench,
    title: "Continue as Maintenance Professional",
    description: "View and bid on maintenance jobs, manage your services",
    color: "bg-orange-500",
    credentials: DEMO_CREDENTIALS.maintenance,
  },
};

export default function RoleSelectionPage() {
  const [_, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<UserRoleType | null>(null);

  const handleRoleSelect = (role: UserRoleType) => {
    setSelectedRole(role);
    // For now, redirect to auth page with demo credentials
    navigate(`/auth?demo=${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to TOV Property Management</h2>
          <p className="mt-2 text-gray-600">
            Choose your role to explore the platform. Demo accounts are pre-configured for easy testing.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(roleConfig).map(([roleKey, config]) => {
            const Icon = config.icon;
            const role = roleKey as UserRoleType;
            
            return (
              <Card 
                key={role}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  selectedRole === role ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleRoleSelect(role)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 ${config.color} rounded-lg mx-auto flex items-center justify-center mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {config.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className="space-y-2 mb-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <div><strong>Username:</strong> {config.credentials.username}</div>
                    <div><strong>Password:</strong> {config.credentials.password}</div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect(role);
                    }}
                  >
                    Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Multi-Role Feature (Coming Soon)</h3>
            <p className="text-sm text-blue-700">
              Soon you'll be able to log in with one account and switch between multiple roles. 
              For example, if you're both a landlord and a tenant, you can manage properties and pay rent from the same account.
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>
              Need help? Contact{" "}
              <span className="text-blue-600 cursor-pointer hover:text-blue-500">
                support@tovproperty.com
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}