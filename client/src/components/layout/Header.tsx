import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Search } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const pageTitle = () => {
    // Base path for determining title (without query params)
    const path = location.split('?')[0];

    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('properties')) return 'Properties';
    if (path.includes('tenants')) return 'Tenants';
    if (path.includes('maintenance')) return 'Maintenance';
    if (path.includes('documents')) return 'Documents';
    if (path.includes('messages')) return 'Messages';
    if (path.includes('settings')) return 'Settings';
    
    return 'TOV Platform';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center md:hidden">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <h1 className="text-xl font-bold">{pageTitle()}</h1>
        </div>
        
        <div className="hidden md:block">
          <h1 className="text-xl font-bold">{pageTitle()}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-500" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 md:mr-2">
            <Search className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}