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
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="container-wide py-6">
          {children}
        </main>
      </div>
    </div>
  );
}