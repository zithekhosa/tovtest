import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import tovLogo from "@/assets/images/tov-logo.png";
import Sidebar from "./Sidebar";
import { NotificationBell } from "@/components/notifications/NotificationCenter";

interface TopBarProps {
  role: "landlord" | "tenant" | "agency" | "maintenance";
}

export default function TopBar({ role }: TopBarProps) {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <>
      {/* Mobile TopBar */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center">
          <img src={tovLogo} alt="TOV Logo" className="h-8 w-auto" />
          <span className="font-medium text-gray-700 dark:text-gray-200 ml-2">Property OS</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <NotificationBell 
            userId={user.id} 
            userRole={role}
          />
          
          <ProfileAvatar userRole={role} size="sm" />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}