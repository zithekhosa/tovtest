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
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <Sidebar role={role} />
      <MobileNav role={role} />
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="px-3 md:px-5 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
