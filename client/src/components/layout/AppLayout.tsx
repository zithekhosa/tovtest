import { useAuth } from "@/hooks/use-auth";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { UserRoleType } from "@shared/schema";

interface AppLayoutProps {
  children: React.ReactNode;
  role: UserRoleType;
}

export default function AppLayout({ children, role }: AppLayoutProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    // Redirect is handled by ProtectedRoute, this is a fallback
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <TopBar role={role} />
      <Sidebar />
      
      <main className="md:ml-64 pt-0 md:pt-5 pb-20">
        <div className="px-4 md:px-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}