import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, UserRole } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useLocation } from "wouter";

// Login schema: username and password only
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Register schema (unchanged)
export const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["tenant", "landlord", "agency", "maintenance"]),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
  emergencyContactId: z.number().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AuthContextType = {
  user: Omit<User, "password"> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, z.infer<typeof loginSchema>>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, z.infer<typeof registerSchema>>;
  userRoles: typeof UserRole;
  authBypassMode: boolean;
  bypassLogin: (role: string) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading while checking localStorage
  const [error, setError] = useState<Error | null>(null);
  const [authBypassMode, setAuthBypassMode] = useState(true); // Temporary bypass mode

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('tov-user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('tov-user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('tov-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tov-user');
    }
  }, [user]);

  // Local login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof loginSchema>) => {
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/auth/login", {
          username: credentials.username,
          password: credentials.password
        });
        const userData = {
          id: response.id,
          email: response.email || "",
          firstName: response.firstName || response.username,
          lastName: response.lastName || "",
          role: response.role || "tenant",
          username: response.username,
          phone: response.phone || "",
          profileImage: response.profileImage || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(userData);
        localStorage.setItem('tov-user', JSON.stringify(userData));
        setIsLoading(false);
        // Redirect to dashboard based on role
        const roleRedirectMap: Record<string, string> = {
          tenant: "/tenant/dashboard",
          landlord: "/landlord/dashboard",
          agency: "/agency/dashboard",
          maintenance: "/maintenance/dashboard"
        };
        navigate(roleRedirectMap[userData.role] || "/");
        return userData;
      } catch (err: any) {
        setIsLoading(false);
        throw new Error(err.message || "Login failed");
      }
    },
    onSuccess: (user) => {
      toast({
        title: "Logged in successfully",
        description: `Welcome back!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation (clears user and localStorage)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      setUser(null);
      localStorage.removeItem('tov-user');
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
      });
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof registerSchema>) => {
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/auth/register", {
          username: credentials.username,
          password: credentials.password,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          email: credentials.email,
          role: credentials.role,
          phone: credentials.phone
        });
        const userData = {
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role,
          username: response.username,
          phone: response.phone || "",
          profileImage: response.profileImage || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(userData);
        localStorage.setItem('tov-user', JSON.stringify(userData));
        setIsLoading(false);
        // Redirect to dashboard based on role
        const roleRedirectMap: Record<string, string> = {
          tenant: "/tenant/dashboard",
          landlord: "/landlord/dashboard",
          agency: "/agency/dashboard",
          maintenance: "/maintenance/dashboard"
        };
        navigate(roleRedirectMap[userData.role] || "/");
        return userData;
      } catch (err: any) {
        setIsLoading(false);
        throw new Error(err.message || "Registration failed");
      }
    },
    onSuccess: (user) => {
      toast({
        title: "Registration successful",
        description: `Welcome ${user.firstName}! Your account has been created.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bypass login function for temporary access
  const bypassLogin = async (role: string) => {
    // Use realistic user IDs that match test data
    const userIdMap: Record<string, number> = {
      tenant: 4,      // Tumelo Ndaba
      landlord: 17,   // eliad khosa - updated to match current user
      agency: 13,     // Agency user
      maintenance: 15  // Maintenance user
    };
    
    const userId = userIdMap[role] || 1;
    
    try {
      // First, call the backend to establish session
      console.log('🔧 bypassLogin: Setting up session for user ID:', userId);
      await apiRequest("POST", "/api/auth/bypass-login", { userId, role });
      
      // Then get the actual user data from the backend
      const userData = await apiRequest("GET", "/api/user");
      console.log('🔧 bypassLogin: Got user data from backend:', userData);
      
      setUser(userData);
    } catch (error) {
      console.error('❌ bypassLogin: Failed to establish session, using fallback:', error);
      
      // Fallback to mock user if backend call fails
      const mockUser = {
        id: userId,
        email: `demo@${role}.com`,
        firstName: "Demo",
        lastName: "User",
        role: role,
        username: `demo_${role}`,
        phone: "",
        profileImage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('🔧 bypassLogin: Using mock user:', mockUser);
      setUser(mockUser);
    }
    
    // Redirect to dashboard based on role
    const roleRedirectMap: Record<string, string> = {
      tenant: "/tenant/dashboard",
      landlord: "/landlord/dashboard",
      agency: "/agency/dashboard",
      maintenance: "/maintenance/dashboard"
    };
    
    toast({
      title: "Access granted",
      description: `Logged in as ${role} (demo mode)`,
    });
    
    navigate(roleRedirectMap[role] || "/");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        userRoles: UserRole,
        authBypassMode,
        bypassLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
