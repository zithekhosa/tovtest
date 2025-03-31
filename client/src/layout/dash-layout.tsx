import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

interface DashLayoutProps {
  children: ReactNode;
}

export function DashLayout({ children }: DashLayoutProps) {
  const { user, userRoles } = useAuth();

  if (!user) return null;
  
  // Ensure the role is a valid UserRoleType
  const role = (Object.values(userRoles).includes(user.role) ? user.role : userRoles.TENANT) as any;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar role={role} />
      <MobileNav role={role} />
      <main className="flex-1 overflow-auto pt-4 pb-5 md:ml-64">
        <div className="px-4 md:px-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
