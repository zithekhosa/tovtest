import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

import { 
  Building, 
  Users, 
  Wrench, 
  DollarSign, 
  CalendarDays,
  Home,
  ThumbsUp,
  MessageCircle,
  Share,
  Plus,
  MessageSquare 
} from "lucide-react";

export default function TestFacebookDashboard() {
  // Format initials for avatar
  const getInitials = (firstName: string = 'Test', lastName: string = 'User') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Quick stats for the top of feed
  const quickStats = [
    { 
      label: 'Properties', 
      value: 5,
      icon: <Building className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    { 
      label: 'Tenants', 
      value: 12,
      icon: <Users className="h-4 w-4" />,
      color: 'text-green-600'
    },
    { 
      label: 'Monthly Income', 
      value: 'P24,500',
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-purple-600'
    },
  ];
  
  const occupancyRate = 90;

  return (
    <div className="pb-16 md:pb-0">
      {/* Stories/Highlights Section */}
      <div className="bg-white dark:bg-gray-900 py-3 border-b border-gray-200 dark:border-gray-800 mb-3">
        <div className="mx-auto px-4 max-w-[600px]">
          <div className="flex overflow-x-auto gap-3 pb-2 tov-hide-scrollbar">
            {/* Create Story Button */}
            <div className="flex flex-col items-center space-y-1 shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-primary">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs">Add Post</span>
            </div>

            {/* Quick Stat Cards */}
            {quickStats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center space-y-1 shrink-0">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center shadow-sm">
                  <div className={cn("flex items-center justify-center", stat.color)}>
                    {stat.icon}
                  </div>
                  <div className="text-sm font-semibold mt-1">
                    {typeof stat.value === 'number' && stat.value < 1000 ? stat.value : stat.value}
                  </div>
                </div>
                <span className="text-xs">{stat.label}</span>
              </div>
            ))}

            {/* Occupancy Rate */}
            <div className="flex flex-col items-center space-y-1 shrink-0">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center shadow-sm">
                <div className="text-amber-600 flex items-center justify-center">
                  <Home className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold mt-1">{occupancyRate}%</div>
              </div>
              <span className="text-xs">Occupied</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Post Card */}
      <div className="w-full mx-auto px-4 max-w-[600px]">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <button className="w-full text-left bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 text-gray-500 dark:text-gray-400">
                What's on your mind?
              </button>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-around">
            <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              <Plus className="h-4 w-4" />
              <span>Property</span>
            </Button>
            <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              <MessageSquare className="h-4 w-4" />
              <span>Update</span>
            </Button>
            <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              <Building className="h-4 w-4" />
              <span>Listing</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Feed - Post 1 */}
      <div className="w-full max-w-[600px] mx-auto">
        {/* Post 1 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 overflow-hidden">
          <div className="flex flex-row items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
              <div className="text-primary">
                <Building className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold leading-none tracking-tight truncate">Your Property Portfolio</h3>
              <p className="text-sm text-muted-foreground mt-1 truncate">Today</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="space-y-4">
              <p>You currently manage 5 properties with 90% occupancy rate, generating P24,500 in monthly rental income.</p>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/landlord/properties">
                    Manage Properties
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex justify-around">
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <ThumbsUp className="h-4 w-4" />
                <span>Like</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <MessageCircle className="h-4 w-4" />
                <span>Comment</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Post 2 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 overflow-hidden">
          <div className="flex flex-row items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-orange-100">
              <div className="text-orange-600">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold leading-none tracking-tight truncate">Maintenance Requests Need Attention</h3>
              <p className="text-sm text-muted-foreground mt-1 truncate">Yesterday</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="space-y-4">
              <p>You have 3 pending maintenance requests that require your attention.</p>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/landlord/maintenance">
                    View Requests
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex justify-around">
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <ThumbsUp className="h-4 w-4" />
                <span>Like</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <MessageCircle className="h-4 w-4" />
                <span>Comment</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Post 3 with image */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 overflow-hidden">
          <div className="flex flex-row items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-cyan-100">
              <div className="text-cyan-600">
                <Home className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold leading-none tracking-tight truncate">Property at Gaborone Main Street</h3>
              <p className="text-sm text-muted-foreground mt-1 truncate">2 days ago</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="space-y-4">
              <p>3 bedroom, 2 bathroom property located in Gaborone. Currently occupied.</p>
              <div className="w-full aspect-video rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=2070" 
                  alt="Property" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/landlord/properties/1">
                    View Property
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex justify-around">
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <ThumbsUp className="h-4 w-4" />
                <span>Like</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <MessageCircle className="h-4 w-4" />
                <span>Comment</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Post 4 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 overflow-hidden">
          <div className="flex flex-row items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-100">
              <div className="text-purple-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold leading-none tracking-tight truncate">Leases Expiring Soon</h3>
              <p className="text-sm text-muted-foreground mt-1 truncate">3 days ago</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="space-y-4">
              <p>You have 2 leases expiring in the next 60 days. Plan for renewals or new tenants.</p>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/landlord/leases">
                    Review Leases
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex justify-around">
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <ThumbsUp className="h-4 w-4" />
                <span>Like</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <MessageCircle className="h-4 w-4" />
                <span>Comment</span>
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Facebook-style Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex justify-around items-center py-1">
          <Link
            href="/"
            className="flex flex-col items-center px-2 py-1 rounded-md relative text-primary"
          >
            <Home className="h-6 w-6 mb-0.5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link
            href="/landlord/properties"
            className="flex flex-col items-center px-2 py-1 rounded-md relative text-gray-500 dark:text-gray-400"
          >
            <Building className="h-6 w-6 mb-0.5" />
            <span className="text-[10px] font-medium">Properties</span>
          </Link>
          <Link
            href="/landlord/tenants"
            className="flex flex-col items-center px-2 py-1 rounded-md relative text-gray-500 dark:text-gray-400"
          >
            <Users className="h-6 w-6 mb-0.5" />
            <span className="text-[10px] font-medium">Tenants</span>
          </Link>
          <Link
            href="/landlord/messages"
            className="flex flex-col items-center px-2 py-1 rounded-md relative text-gray-500 dark:text-gray-400"
          >
            <MessageSquare className="h-6 w-6 mb-0.5" />
            <span className="text-[10px] font-medium">Messages</span>
            <span className="absolute top-0 right-1/4 bg-red-500 text-white text-[10px] font-medium min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
              2
            </span>
          </Link>
          <Link
            href="/landlord/maintenance"
            className="flex flex-col items-center px-2 py-1 rounded-md relative text-gray-500 dark:text-gray-400"
          >
            <Wrench className="h-6 w-6 mb-0.5" />
            <span className="text-[10px] font-medium">Maintenance</span>
            <span className="absolute top-0 right-1/4 bg-red-500 text-white text-[10px] font-medium min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
              3
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}