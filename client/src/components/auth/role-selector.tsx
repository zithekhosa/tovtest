import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, User, Building, Wrench } from "lucide-react";
import { UserRoleType, UserRole } from "@shared/schema";

interface RoleSelectorProps {
  userRoles: UserRole[];
  onRoleSelect: (role: UserRoleType) => void;
  isLoading?: boolean;
}

const roleConfig = {
  landlord: {
    icon: Home,
    title: "Continue as Landlord",
    description: "Manage your properties, tenants, and rental income",
    color: "bg-blue-500",
  },
  tenant: {
    icon: User,
    title: "Continue as Tenant",
    description: "View your rentals, make payments, and submit maintenance requests",
    color: "bg-green-500",
  },
  agency: {
    icon: Building,
    title: "Continue as Real Estate Agent",
    description: "Manage property listings, leads, and client relationships",
    color: "bg-purple-500",
  },
  maintenance: {
    icon: Wrench,
    title: "Continue as Maintenance Professional",
    description: "View and bid on maintenance jobs, manage your services",
    color: "bg-orange-500",
  },
};

export function RoleSelector({ userRoles, onRoleSelect, isLoading }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRoleType | null>(null);

  const handleRoleSelect = (role: UserRoleType) => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back!</h2>
          <p className="mt-2 text-gray-600">
            You have multiple roles. Please choose how you'd like to continue.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {userRoles.map((userRole) => {
            const config = roleConfig[userRole.role];
            const Icon = config.icon;
            
            return (
              <Card 
                key={userRole.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRole === userRole.role ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleRoleSelect(userRole.role)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 ${config.color} rounded-lg mx-auto flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {config.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className="flex justify-center gap-2 mb-4">
                    <Badge variant={userRole.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                      {userRole.verificationStatus}
                    </Badge>
                    {userRole.isActive && (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                  <Button 
                    className="w-full"
                    disabled={!userRole.isActive || isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect(userRole.role);
                    }}
                  >
                    {isLoading && selectedRole === userRole.role ? 'Loading...' : 'Continue'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need to add another role?{" "}
            <button className="text-blue-600 hover:text-blue-500">
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}