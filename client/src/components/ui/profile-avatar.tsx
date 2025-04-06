import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { UserRoleType } from "@shared/schema";

// Profile picture URLs for demo accounts
const DEMO_PROFILE_IMAGES = {
  landlord: [
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/75.jpg",
  ],
  tenant: [
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/men/22.jpg",
    "https://randomuser.me/api/portraits/women/17.jpg",
  ],
  agency: [
    "https://randomuser.me/api/portraits/men/55.jpg",
    "https://randomuser.me/api/portraits/women/89.jpg",
    "https://randomuser.me/api/portraits/men/41.jpg",
  ],
  maintenance: [
    "https://randomuser.me/api/portraits/men/13.jpg",
    "https://randomuser.me/api/portraits/women/28.jpg",
    "https://randomuser.me/api/portraits/men/80.jpg",
  ],
};

interface ProfileAvatarProps {
  userId?: number;
  userRole?: UserRoleType;
  firstName?: string;
  lastName?: string;
  username?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProfileAvatar({
  userId,
  userRole,
  firstName,
  lastName,
  username,
  className = "",
  size = "md",
}: ProfileAvatarProps) {
  const { user } = useAuth();
  
  // Use provided info or fallback to logged in user
  const id = userId || user?.id;
  const role = userRole || user?.role;
  const fName = firstName || user?.firstName;
  const lName = lastName || user?.lastName;
  const uName = username || user?.username;
  
  if (!id || !role) return null;
  
  const getInitials = (first?: string, last?: string, name?: string) => {
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    } else if (name) {
      return name.substring(0, 2).toUpperCase();
    }
    return "U";
  };
  
  // Get a deterministic profile image based on user ID
  const getProfileImage = (userId: number, role: UserRoleType) => {
    const images = DEMO_PROFILE_IMAGES[role];
    const index = userId % images.length;
    return images[index];
  };
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage 
        src={getProfileImage(id, role)} 
        alt={`${fName || ''} ${lName || ''}`} 
      />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getInitials(fName, lName, uName)}
      </AvatarFallback>
    </Avatar>
  );
}