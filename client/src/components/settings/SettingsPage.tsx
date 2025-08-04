import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { UserRoleType } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Globe, Bell, Shield, Palette, UserCircle, CircleDot } from "lucide-react";

interface SettingsPageProps {
  role: UserRoleType;
}

export function SettingsPage({ role }: SettingsPageProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    app: true,
    maintenance: true,
    payments: true,
    documents: true,
    messages: true,
  });
  
  const handleThemeChange = () => {
    toast({
      title: "Theme updated",
      description: "Your theme settings have been saved automatically.",
    });
  };
  
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const roleSpecificSettings = () => {
    switch(role) {
      case "landlord":
        return (
          <TabsContent value="landlord-settings">
            <Card>
              <CardHeader>
                <CardTitle>Landlord Settings</CardTitle>
                <CardDescription>
                  Configure landlord-specific settings for your properties and tenants.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-payment-reminders" className="text-base">Automatic Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send automatic reminders to tenants about upcoming payments</p>
                    </div>
                    <Switch id="auto-payment-reminders" defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lease-expiry-alerts" className="text-base">Lease Expiry Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified 30 days before a lease expires</p>
                    </div>
                    <Switch id="lease-expiry-alerts" defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance-approvals" className="text-base">Maintenance Approvals</Label>
                      <p className="text-sm text-muted-foreground">Require your approval for maintenance requests over a certain amount</p>
                    </div>
                    <Switch id="maintenance-approvals" defaultChecked={true} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Default Currency</Label>
                  <Select defaultValue="BWP">
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BWP">Botswana Pula (BWP)</SelectItem>
                      <SelectItem value="ZAR">South African Rand (ZAR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => toast({ title: "Settings saved", description: "Your landlord settings have been updated." })}>
                  Save Landlord Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        );
        
      case "tenant":
        return (
          <TabsContent value="tenant-settings">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Settings</CardTitle>
                <CardDescription>
                  Configure your tenant preferences and payment methods.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-pay" className="text-base">Enable Autopay</Label>
                      <p className="text-sm text-muted-foreground">Automatically pay rent on due date</p>
                    </div>
                    <Switch id="auto-pay" defaultChecked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="rent-reminders" className="text-base">Rent Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders 3 days before rent is due</p>
                    </div>
                    <Switch id="rent-reminders" defaultChecked={true} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-base">Preferred Payment Method</Label>
                  <Select defaultValue="mzaka">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mzaka">M-Zaka</SelectItem>
                      <SelectItem value="orange">Orange Money</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => toast({ title: "Settings saved", description: "Your tenant settings have been updated." })}>
                  Save Tenant Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        );
        
      case "maintenance":
        return (
          <TabsContent value="maintenance-settings">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Provider Settings</CardTitle>
                <CardDescription>
                  Configure your service areas and availability.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="available-for-work" className="text-base">Available for New Jobs</Label>
                      <p className="text-sm text-muted-foreground">Show your profile in the marketplace for new jobs</p>
                    </div>
                    <Switch id="available-for-work" defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emergency-calls" className="text-base">Accept Emergency Calls</Label>
                      <p className="text-sm text-muted-foreground">Be available for urgent maintenance issues</p>
                    </div>
                    <Switch id="emergency-calls" defaultChecked={true} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-base">Service Area</Label>
                  <Select defaultValue="gaborone">
                    <SelectTrigger>
                      <SelectValue placeholder="Select service area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gaborone">Gaborone</SelectItem>
                      <SelectItem value="francistown">Francistown</SelectItem>
                      <SelectItem value="maun">Maun</SelectItem>
                      <SelectItem value="nationwide">Nationwide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => toast({ title: "Settings saved", description: "Your maintenance provider settings have been updated." })}>
                  Save Maintenance Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        );
        
      case "agency":
        return (
          <TabsContent value="agency-settings">
            <Card>
              <CardHeader>
                <CardTitle>Agency Settings</CardTitle>
                <CardDescription>
                  Configure your agency's listing preferences and commission rates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-listing-renewal" className="text-base">Automatic Listing Renewal</Label>
                      <p className="text-sm text-muted-foreground">Automatically renew property listings when they expire</p>
                    </div>
                    <Switch id="auto-listing-renewal" defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lead-assignments" className="text-base">Automatic Lead Assignment</Label>
                      <p className="text-sm text-muted-foreground">Automatically assign new leads to agents</p>
                    </div>
                    <Switch id="lead-assignments" defaultChecked={true} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-base">Default Commission Rate (%)</Label>
                  <Input type="number" min="0" max="100" defaultValue="10" />
                </div>
                
                <Button onClick={() => toast({ title: "Settings saved", description: "Your agency settings have been updated." })}>
                  Save Agency Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        );
        
      default:
        return null;
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value={`${role}-settings`} className="flex items-center gap-2">
            <CircleDot className="h-4 w-4" />
            <span className="hidden sm:inline capitalize">{role}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user.firstName || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user.lastName || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue={user.phone || ""} />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio" 
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell us a bit about yourself"
                  defaultValue={""}
                />
              </div>
              
              <Button onClick={() => toast({ title: "Profile updated", description: "Your profile information has been saved." })}>
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how TOV Property OS looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Color Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={theme.variant === "tint" ? "default" : "outline"} 
                    className="h-16 justify-start flex-col items-start p-3"
                    onClick={() => setTheme({ ...theme, variant: "tint" })}
                  >
                    <span className="font-semibold">Tint</span>
                    <span className="text-xs text-muted-foreground">Soft, muted colors</span>
                  </Button>
                  <Button 
                    variant={theme.variant === "vibrant" ? "default" : "outline"} 
                    className="h-16 justify-start flex-col items-start p-3"
                    onClick={() => setTheme({ ...theme, variant: "vibrant" })}
                  >
                    <span className="font-semibold">Vibrant</span>
                    <span className="text-xs text-muted-foreground">Bold, colorful theme</span>
                  </Button>
                  <Button 
                    variant={theme.variant === "professional" ? "default" : "outline"} 
                    className="h-16 justify-start flex-col items-start p-3"
                    onClick={() => setTheme({ ...theme, variant: "professional" })}
                  >
                    <span className="font-semibold">Professional</span>
                    <span className="text-xs text-muted-foreground">Clean business look</span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mode">Appearance Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={theme.appearance === "light" ? "default" : "outline"} 
                    className="h-16 justify-start flex-col items-start p-3"
                    onClick={() => setTheme({ ...theme, appearance: "light" })}
                  >
                    <span className="font-semibold">Light</span>
                    <span className="text-xs text-muted-foreground">White background</span>
                  </Button>
                  <Button 
                    variant={theme.appearance === "dark" ? "default" : "outline"} 
                    className="h-16 justify-start flex-col items-start p-3"
                    onClick={() => setTheme({ ...theme, appearance: "dark" })}
                  >
                    <span className="font-semibold">Dark</span>
                    <span className="text-xs text-muted-foreground">Dark background</span>
                  </Button>
                  <Button 
                    variant={theme.appearance === "system" ? "default" : "outline"} 
                    className="h-16 justify-start flex-col items-start p-3"
                    onClick={() => setTheme({ ...theme, appearance: "system" })}
                  >
                    <span className="font-semibold">System</span>
                    <span className="text-xs text-muted-foreground">Follow device</span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  <Button 
                    variant="outline" 
                    className="h-10 bg-primary/10 hover:bg-primary/10 border-primary"
                    onClick={() => setTheme({ ...theme, primary: "hsl(210, 90%, 95%)" })}
                  ></Button>
                  <Button 
                    variant="outline" 
                    className="h-10 bg-success/10 hover:bg-success border-success/30"
                    onClick={() => setTheme({ ...theme, primary: "hsl(142, 76%, 95%)" })}
                  ></Button>
                  <Button 
                    variant="outline" 
                    className="h-10 bg-violet-50 hover:bg-violet-100 border-violet-200"
                    onClick={() => setTheme({ ...theme, primary: "hsl(270, 76%, 95%)" })}
                  ></Button>
                  <Button 
                    variant="outline" 
                    className="h-10 bg-warning/10 hover:bg-warning/20 border-amber-200"
                    onClick={() => setTheme({ ...theme, primary: "hsl(43, 96%, 90%)" })}
                  ></Button>
                  <Button 
                    variant="outline" 
                    className="h-10 bg-destructive/10 hover:bg-destructive border-destructive/30"
                    onClick={() => setTheme({ ...theme, primary: "hsl(0, 96%, 95%)" })}
                  ></Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Corner Roundness</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={theme.radius === 0 ? "default" : "outline"} 
                    className="h-16 justify-start flex-col items-start p-3"
                    onClick={() => setTheme({ ...theme, radius: 0 })}
                  >
                    <span className="font-semibold">Square</span>
                    <span className="text-xs text-muted-foreground">No rounding</span>
                  </Button>
                  <Button 
                    variant={theme.radius === 0.5 ? "default" : "outline"} 
                    className="h-16 justify-start flex-col items-start p-3"
                    onClick={() => setTheme({ ...theme, radius: 0.5 })}
                  >
                    <span className="font-semibold">Rounded</span>
                    <span className="text-xs text-muted-foreground">Medium corners</span>
                  </Button>
                  <Button 
                    variant={theme.radius === 1 ? "default" : "outline"} 
                    className="h-16 justify-start flex-col items-start p-3"
                    onClick={() => setTheme({ ...theme, radius: 1 })}
                  >
                    <span className="font-semibold">Smooth</span>
                    <span className="text-xs text-muted-foreground">Full rounding</span>
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleThemeChange}
              >
                Save Appearance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Notification Channels</Label>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-sm">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications" className="text-sm">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive text messages for important updates</p>
                    </div>
                    <Switch 
                      id="sms-notifications" 
                      checked={notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange('sms', checked)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="app-notifications" className="text-sm">In-App Notifications</Label>
                      <p className="text-xs text-muted-foreground">Show notifications in the app</p>
                    </div>
                    <Switch 
                      id="app-notifications" 
                      checked={notifications.app}
                      onCheckedChange={(checked) => handleNotificationChange('app', checked)} 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base">Notification Types</Label>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance-notifications" className="text-sm">Maintenance Updates</Label>
                      <p className="text-xs text-muted-foreground">Notifications about maintenance requests</p>
                    </div>
                    <Switch 
                      id="maintenance-notifications" 
                      checked={notifications.maintenance}
                      onCheckedChange={(checked) => handleNotificationChange('maintenance', checked)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payment-notifications" className="text-sm">Payment Activities</Label>
                      <p className="text-xs text-muted-foreground">Notifications about rent payments and billing</p>
                    </div>
                    <Switch 
                      id="payment-notifications"
                      checked={notifications.payments}
                      onCheckedChange={(checked) => handleNotificationChange('payments', checked)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="document-notifications" className="text-sm">Document Updates</Label>
                      <p className="text-xs text-muted-foreground">Notifications when documents are shared with you</p>
                    </div>
                    <Switch 
                      id="document-notifications" 
                      checked={notifications.documents}
                      onCheckedChange={(checked) => handleNotificationChange('documents', checked)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="message-notifications" className="text-sm">Messages</Label>
                      <p className="text-xs text-muted-foreground">Notifications for new messages</p>
                    </div>
                    <Switch 
                      id="message-notifications" 
                      checked={notifications.messages}
                      onCheckedChange={(checked) => handleNotificationChange('messages', checked)} 
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={() => toast({ title: "Notification settings saved", description: "Your notification preferences have been updated." })}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security and login details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Change Password</Label>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                
                <Button onClick={() => toast({ title: "Password updated", description: "Your password has been changed successfully." })}>
                  Update Password
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base">Two-Factor Authentication</Label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Enable two-factor authentication for additional security</p>
                  </div>
                  <Switch id="tfa" defaultChecked={false} />
                </div>
                
                <div className="space-y-4">
                  <Label className="text-base">Session Management</Label>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">End all other active sessions</p>
                    </div>
                    <Button variant="destructive" size="sm">Sign Out All Devices</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {roleSpecificSettings()}
      </Tabs>
    </div>
  );
}