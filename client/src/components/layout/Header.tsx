import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="font-bold text-xl">TOV</span>
              </a>
            </Link>
          </div>

          {/* Desktop Nav - will be hidden on mobile */}
          <nav className="hidden md:flex space-x-8">
            {user?.role === 'tenant' && (
              <>
                <Link href="/tenant/dashboard">
                  <a className={`px-3 py-2 font-medium ${location === '/tenant/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/tenant/maintenance">
                  <a className={`px-3 py-2 font-medium ${location === '/tenant/maintenance' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                    Maintenance
                  </a>
                </Link>
              </>
            )}
            
            {user?.role === 'landlord' && (
              <>
                <Link href="/landlord/dashboard">
                  <a className={`px-3 py-2 font-medium ${location === '/landlord/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/landlord/properties">
                  <a className={`px-3 py-2 font-medium ${location === '/landlord/properties' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                    Properties
                  </a>
                </Link>
              </>
            )}
            
            {user?.role === 'agency' && (
              <Link href="/agency/dashboard">
                <a className={`px-3 py-2 font-medium ${location === '/agency/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                  Dashboard
                </a>
              </Link>
            )}
            
            {user?.role === 'maintenance' && (
              <Link href="/maintenance/dashboard">
                <a className={`px-3 py-2 font-medium ${location === '/maintenance/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
                  Dashboard
                </a>
              </Link>
            )}
          </nav>

          {/* User menu & notifications */}
          <div className="flex items-center">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none">
                  <Bell className="h-6 w-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications?.length > 0 ? (
                  notifications.map((notification, index) => (
                    <DropdownMenuItem key={index}>
                      {/* Notification content would go here */}
                      Notification
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User dropdown */}
            <div className="ml-4 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback>{user && getInitials(user.firstName, user.lastName)}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
