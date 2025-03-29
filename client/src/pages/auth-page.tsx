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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRoleType } from "@shared/schema";

type AuthTab = "login" | "register";
type UserTab = "tenant" | "landlord" | "agency" | "maintenance";

export default function AuthPage() {
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [userTab, setUserTab] = useState<UserTab>("tenant");
  const { user, loginMutation, registerMutation, userRoles } = useAuth();
  const [location, navigate] = useLocation();

  // Create forms
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      role: userTab as UserRoleType,
      phone: "",
      profileImage: "",
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

  // Update the role in register form when user tab changes
  useEffect(() => {
    registerForm.setValue("role", userTab as UserRoleType);
  }, [userTab, registerForm]);

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
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
              <Button variant="ghost">Features</Button>
              <Button variant="ghost">Pricing</Button>
              <Button variant="ghost">About</Button>
              <Button variant="ghost">Contact</Button>
            </nav>
            <div className="flex space-x-2">
              <Button 
                variant={userTab === "tenant" ? "default" : "outline"} 
                onClick={() => {
                  setUserTab('tenant');
                  setAuthTab('login');
                }}
              >
                Tenant Login
              </Button>
              <Button 
                variant={userTab === "landlord" ? "default" : "outline"} 
                onClick={() => {
                  setUserTab('landlord');
                  setAuthTab('login');
                }}
              >
                Landlord Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Information */}
          <div className="flex-1">
            <section className="text-center mb-16">
              <h1 className="text-4xl font-bold mb-4">Simplify Your Property Management</h1>
              <p className="text-xl mb-8">Streamline your property management tasks with our all-in-one solution</p>
              <div className="flex justify-center space-x-4">
                <Button 
                  size="lg" 
                  onClick={() => {
                    setUserTab('landlord');
                    setAuthTab('register');
                  }}
                >
                  Get Started as Landlord
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => {
                    setUserTab('tenant');
                    setAuthTab('register');
                  }}
                >
                  Get Started as Tenant
                </Button>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-2">Property Management</h3>
                <p className="text-gray-600">Easily manage all your properties in one place</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-2">Financial Tracking</h3>
                <p className="text-gray-600">Streamline rent collection and expense management</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-2">Document Management</h3>
                <p className="text-gray-600">Centralize all your important documents</p>
              </div>
            </section>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold mb-6">
                {authTab === "login" ? "Sign in" : "Create an account"}
              </h2>
              
              {/* Tabs for Login/Register */}
              <Tabs defaultValue="login" value={authTab} onValueChange={(value) => setAuthTab(value as AuthTab)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                {/* User Type Selection */}
                <div className="flex mb-6 border-b border-gray-200">
                  <button 
                    className={`px-4 py-2 font-medium ${userTab === 'tenant' ? 'text-primary relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' : 'text-gray-500'}`} 
                    onClick={() => setUserTab('tenant')}
                  >
                    Tenant
                  </button>
                  <button 
                    className={`px-4 py-2 font-medium ${userTab === 'landlord' ? 'text-primary relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' : 'text-gray-500'}`} 
                    onClick={() => setUserTab('landlord')}
                  >
                    Landlord
                  </button>
                  <button 
                    className={`px-4 py-2 font-medium ${userTab === 'agency' ? 'text-primary relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' : 'text-gray-500'}`} 
                    onClick={() => setUserTab('agency')}
                  >
                    Agency
                  </button>
                  <button 
                    className={`px-4 py-2 font-medium ${userTab === 'maintenance' ? 'text-primary relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' : 'text-gray-500'}`} 
                    onClick={() => setUserTab('maintenance')}
                  >
                    Maintenance
                  </button>
                </div>
          
                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
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
                            <div className="flex items-center justify-between">
                              <FormLabel>Password</FormLabel>
                              <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                                Forgot password?
                              </a>
                            </div>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign in"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
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
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">
                  {authTab === "login" ? "Don't have an account?" : "Already have an account?"}
                </span>
                <button 
                  className="ml-1 text-sm font-medium text-primary hover:text-primary/80"
                  onClick={() => setAuthTab(authTab === "login" ? "register" : "login")}
                >
                  {authTab === "login" ? "Sign up" : "Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 TOV Property Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}