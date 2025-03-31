import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import { UserRoleType } from "@shared/schema";

interface DashLayoutProps {
  children: React.ReactNode;
}

// Performance-optimized dashboard layout with responsive design
export default function DashLayout({ children }: DashLayoutProps) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/auth";
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={user.role as UserRoleType} />
      <div className="flex-1 overflow-auto">
        <main className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}