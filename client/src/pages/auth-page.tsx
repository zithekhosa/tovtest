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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Home, Users, Wrench } from "lucide-react";
import { UserRoleType } from "@shared/schema";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 ml-2">TOV</h1>
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
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <section className="text-center mb-16">
              <h1 className="text-4xl font-bold mb-4">Simplify Your Property Management</h1>
              <p className="text-xl mb-8">Streamline your property management tasks with our all-in-one solution</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card>
                <CardHeader>
                  <CardTitle>Property Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Easily manage all your properties in one place</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Financial Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Streamline rent collection and expense management</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Document Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Centralize all your important documents</p>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="flex-1 max-w-md mx-auto">
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
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
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
        <div className="container mx-auto text-center">
          <p>&copy; 2024 TOV Property Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}