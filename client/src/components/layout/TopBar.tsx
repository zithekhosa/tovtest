import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import tovLogo from "@/assets/images/tov-logo.png";
import Sidebar from "./Sidebar";

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
          <Link href={`/${role}/messages`}>
            <Button variant="ghost" size="icon" className="relative">
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                2
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </Button>
          </Link>
          
          <ProfileAvatar userRole={role} size="sm" />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar role={role} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}