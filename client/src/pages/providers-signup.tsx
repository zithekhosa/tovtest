import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Home, Wrench, Calendar, Clock, UserPlus, LogIn } from "lucide-react";
import { UserRoleType } from "@shared/schema";

// Service categories
const serviceCategories = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Carpentry",
  "Painting",
  "Appliance Repair",
  "Cleaning",
  "Landscaping",
  "General"
];

// Registration schema for providers and agents
const providerRegisterSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  specialtyPrimary: z.string().optional(),
  specialtySecondary: z.string().optional(),
  hourlyRate: z.string().optional(),
  bio: z.string().max(300, "Bio should not exceed 300 characters").optional(),
  serviceArea: z.string().optional(),
  availability: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  licenseNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Login schema is simpler
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ProvidersSignup() {
  const [activeTab, setActiveTab] = useState<'provider' | 'agency'>('provider');
  const [formTab, setFormTab] = useState<'signup' | 'login'>('signup');
  const { registerMutation, loginMutation } = useAuth();
  const [location, navigate] = useLocation();

  // Create registration form
  const registerForm = useForm<z.infer<typeof providerRegisterSchema>>({
    resolver: zodResolver(providerRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: activeTab === 'provider' ? 'maintenance' : 'agency',
      specialtyPrimary: "",
      specialtySecondary: "",
      hourlyRate: "",
      bio: "",
      serviceArea: "",
      availability: "",
      companyName: "",
      companyAddress: "",
      licenseNumber: ""
    },
  });

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle role change
  const handleRoleChange = (role: 'provider' | 'agency') => {
    setActiveTab(role);
    registerForm.setValue('role', role === 'provider' ? 'maintenance' : 'agency');
  };

  // Handle register submission
  const onRegisterSubmit = (data: z.infer<typeof providerRegisterSchema>) => {
    // Extract only the fields needed for user registration
    const userInfo = {
      username: data.username,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      confirmPassword: data.confirmPassword // Add confirmPassword to conform to schema
    };
    
    // Register with backend
    registerMutation.mutate(userInfo, {
      onSuccess: () => {
        // Auto login after registration
        loginMutation.mutate({
          email: data.email,
          password: data.password,
        });
      }
    });
  };

  // Handle login submission
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-white">
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
              <Button variant="ghost" onClick={() => navigate("/auth")}>Login as User</Button>
              <Button variant="ghost" onClick={() => navigate("/maintenance/marketplace")}>Marketplace</Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4 max-w-5xl">
        <div className="flex flex-col space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {formTab === 'signup' ? "Join TOV Property Management Platform" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-gray-600">
              {formTab === 'signup' 
                ? "Register as a service provider or property management agency" 
                : "Login to your maintenance provider or agency account"}
            </p>
          </div>

          <Tabs value={formTab} onValueChange={(value) => setFormTab(value as 'signup' | 'login')} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="signup" className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </TabsTrigger>
                <TabsTrigger value="login" className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="signup">
              <div className="mx-auto max-w-3xl">
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <Card 
                    className={`flex-1 cursor-pointer border-2 transition-all ${activeTab === 'provider' ? 'border-primary' : 'border-gray-200'}`}
                    onClick={() => handleRoleChange('provider')}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Wrench className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle>Maintenance Provider</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">Register as a maintenance professional to offer your services to property managers and tenants</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`flex-1 cursor-pointer border-2 transition-all ${activeTab === 'agency' ? 'border-primary' : 'border-gray-200'}`}
                    onClick={() => handleRoleChange('agency')}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle>Property Agency</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">Register as a property management agency to manage properties and connect with tenants and maintenance providers</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{activeTab === 'provider' ? 'Maintenance Provider Registration' : 'Property Agency Registration'}</CardTitle>
                    <CardDescription>Fill in your details to create your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-body-large">Account Information</h3>
                            
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
                            
                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={registerForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="First name" {...field} />
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
                                      <Input placeholder="Last name" {...field} />
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
                                    <Input type="email" placeholder="Your email address" {...field} />
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
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Phone number" 
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                      value={typeof field.value === 'string' ? field.value : ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-3">
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
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-body-large">
                              {activeTab === 'provider' ? 'Professional Information' : 'Agency Information'}
                            </h3>
                            
                            {activeTab === 'provider' ? (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <FormField
                                    control={registerForm.control}
                                    name="specialtyPrimary"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Primary Specialty</FormLabel>
                                        <Select
                                          value={field.value}
                                          onValueChange={field.onChange}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select specialty" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {serviceCategories.map(category => (
                                              <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={registerForm.control}
                                    name="specialtySecondary"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Secondary Specialty</FormLabel>
                                        <Select
                                          value={field.value}
                                          onValueChange={field.onChange}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select specialty" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {serviceCategories.map(category => (
                                              <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <FormField
                                  control={registerForm.control}
                                  name="hourlyRate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Hourly Rate (BWP)</FormLabel>
                                      <FormControl>
                                        <Input type="number" placeholder="e.g. 200" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="availability"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Availability</FormLabel>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select availability" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Available Now">Available Now</SelectItem>
                                          <SelectItem value="Available Tomorrow">Available Tomorrow</SelectItem>
                                          <SelectItem value="Available This Week">Available This Week</SelectItem>
                                          <SelectItem value="Available Next Week">Available Next Week</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="serviceArea"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Service Area</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g. Gaborone, Francistown" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="licenseNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>License Number (optional)</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Professional license number" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </>
                            ) : (
                              <>
                                <FormField
                                  control={registerForm.control}
                                  name="companyName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Agency/Company Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Your company name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="companyAddress"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Company Address</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Company address" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="licenseNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Business License Number</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Business registration number" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="serviceArea"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Service Areas</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Areas you operate in" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </>
                            )}
                            
                            <FormField
                              control={registerForm.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {activeTab === 'provider' ? 'Professional Bio' : 'Company Description'}
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder={activeTab === 'provider' 
                                        ? "Brief description of your skills and experience" 
                                        : "Brief description of your agency"
                                      } 
                                      {...field} 
                                      className="min-h-[100px]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end">
                          <Button 
                            type="submit" 
                            size="lg"
                            disabled={registerMutation.isPending}
                            className="min-w-[150px]"
                          >
                            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="login">
              <div className="mx-auto max-w-md">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to Your Account</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Your username" {...field} />
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
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? "Logging in..." : "Login"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 TOV Property Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}