import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema, registerSchema } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Eye, EyeOff, Home, Users, Wrench } from "lucide-react";
import { UserRoleType } from "@shared/schema";
// TOV logo is now served from public directory

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState<UserRoleType>("tenant");
  const { user, loginMutation, registerMutation, userRoles } = useAuth();
  const [location, navigate] = useLocation();

  // Create form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // If user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      const roleRedirectMap: Record<string, string> = {
        tenant: "/tenant/dashboard",
        landlord: "/landlord/dashboard",
        agency: "/agency/dashboard",
        maintenance: "/maintenance/dashboard"
      };
      navigate(roleRedirectMap[user.role] || "/");
    }
  }, [user, navigate]);

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    // Combine username with role to support role-specific login
    const username = data.username;
    // If no username is provided, use the role as username (for demo accounts)
    const usernameToUse = username.trim() ? username : userRole;
    loginMutation.mutate({
      username: usernameToUse,
      password: data.password
    });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/tov-logo.png" alt="TOV Property Management" className="h-10 w-auto" />
            </div>
            <nav className="hidden md:flex space-x-4">
              <Button variant="ghost" onClick={() => navigate("/maintenance/marketplace")}>Marketplace</Button>
              <Button variant="ghost" onClick={() => navigate("/providers-signup")}>Provider Signup</Button>
              <Button variant="ghost">About</Button>
              <Button variant="ghost">Contact</Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="flex flex-col justify-center items-center">
          <div className="w-full max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormLabel>Login as</FormLabel>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button 
                          type="button"
                          variant={userRole === "tenant" ? "default" : "outline"}
                          className={`flex items-center justify-center gap-2 ${userRole === "tenant" ? "border-2 border-primary" : ""}`}
                          onClick={() => setUserRole("tenant")}
                        >
                          <Home className="h-4 w-4" />
                          <span>Tenant</span>
                        </Button>
                        <Button 
                          type="button"
                          variant={userRole === "landlord" ? "default" : "outline"}
                          className={`flex items-center justify-center gap-2 ${userRole === "landlord" ? "border-2 border-primary" : ""}`}
                          onClick={() => setUserRole("landlord")}
                        >
                          <Building className="h-4 w-4" />
                          <span>Landlord</span>
                        </Button>
                        <Button 
                          type="button"
                          variant={userRole === "agency" ? "default" : "outline"}
                          className={`flex items-center justify-center gap-2 ${userRole === "agency" ? "border-2 border-primary" : ""}`}
                          onClick={() => setUserRole("agency")}
                        >
                          <Users className="h-4 w-4" />
                          <span>Agency</span>
                        </Button>
                        <Button 
                          type="button"
                          variant={userRole === "maintenance" ? "default" : "outline"}
                          className={`flex items-center justify-center gap-2 ${userRole === "maintenance" ? "border-2 border-primary" : ""}`}
                          onClick={() => setUserRole("maintenance")}
                        >
                          <Wrench className="h-4 w-4" />
                          <span>Maintenance</span>
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Login"}
                    </Button>
                    
                    <div className="text-center mt-4 space-y-2">
                      <div className="p-3 bg-primary/5 rounded-md border border-primary/20 mb-3">
                        <h4 className="font-medium text-sm mb-1">Demo Login Credentials</h4>
                        <p className="text-xs text-gray-600 mb-1">
                          All demo accounts use: <span className="font-semibold">password123</span>
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-left">
                          <p>Tenant: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">demo-tenant</span></p>
                          <p>Landlord: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">demo-landlord</span></p>
                          <p>Agency: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">demo-agency</span></p>
                          <p>Maintenance: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">demo-maintenance</span></p>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          <p>You can also use <span className="font-mono">tenant</span>, <span className="font-mono">landlord</span>, <span className="font-mono">agency</span>, <span className="font-mono">maintenance</span></p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Don't have an account? Contact your property manager to create one.
                      </p>
                      <p className="text-sm text-gray-600">
                        Are you a service provider or agency? <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary" 
                          onClick={() => navigate("/providers-signup")}
                        >
                          Sign up here
                        </Button>
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/tov-logo.png" alt="TOV Property Management" className="h-8 w-auto" />
              <span className="ml-2 text-gray-600">&copy; 2024 TOV Property Management. All rights reserved.</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">Terms</Button>
              <Button variant="ghost" size="sm">Privacy</Button>
              <Button variant="ghost" size="sm">Contact</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}