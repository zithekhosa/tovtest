import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Upload,
  X,
  MapPin,
  Home,
  User,
  Phone,
  MessageSquare,
  DollarSign,
  CreditCard
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MaintenanceRequest } from "@shared/schema";

// Maintenance request form schema
const maintenanceRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.string().min(1, "Category is required"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  contactPhone: z.string().min(10, "Phone number is required"),
  allowEntry: z.boolean().default(true),
  images: z.array(z.string()).default([]),
  paymentPreference: z.enum(["tenant", "landlord"]).default("landlord"),
  isEmergency: z.boolean().default(false)
});

type MaintenanceRequestFormData = z.infer<typeof maintenanceRequestSchema>;

interface MaintenanceRequestFormProps {
  request?: MaintenanceRequest;
  onSubmit: (data: MaintenanceRequestFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const maintenanceCategories = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliances",
  "Structural",
  "Pest Control",
  "Landscaping",
  "Cleaning",
  "Security",
  "Other"
];

const timeSlots = [
  "Morning (8AM - 12PM)",
  "Afternoon (12PM - 4PM)",
  "Evening (4PM - 8PM)",
  "Flexible"
];

export function MaintenanceRequestForm({ 
  request, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: MaintenanceRequestFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(request?.images || []);

  const form = useForm<MaintenanceRequestFormData>({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      title: request?.title || "",
      description: request?.description || "",
      priority: (request?.priority as "medium" | "high" | "low" | "urgent") || "medium",
      category: request?.category || "",
      preferredDate: "",
      preferredTime: "",
      contactPhone: "",
      allowEntry: true,
      images: request?.images || [],
      paymentPreference: (request?.paymentPreference as "tenant" | "landlord") || "landlord",
      isEmergency: request?.isEmergency || false
    }
  });

  // Emergency detection based on form content
  const detectEmergency = (title: string, description: string, category: string, priority: string): boolean => {
    const searchText = `${title} ${description} ${category}`.toLowerCase();
    
    const emergencyKeywords = [
      'fire', 'smoke', 'gas leak', 'carbon monoxide', 'electrical shock', 
      'flood', 'burst pipe', 'no heat', 'no power', 'break in', 'security breach',
      'structural damage', 'ceiling collapse', 'emergency', 'urgent help',
      'water leak', 'heating not working', 'air conditioning broken', 'hot water',
      'electrical problem', 'plumbing emergency', 'lock broken', 'safety issue'
    ];
    
    return priority === 'urgent' || emergencyKeywords.some(keyword => searchText.includes(keyword));
  };

  // Watch form values for emergency detection
  const watchedTitle = form.watch("title");
  const watchedDescription = form.watch("description");
  const watchedCategory = form.watch("category");
  const watchedPriority = form.watch("priority");
  
  // Auto-detect emergency status
  const isDetectedEmergency = detectEmergency(watchedTitle, watchedDescription, watchedCategory, watchedPriority);
  
  // Update emergency status when detection changes
  useEffect(() => {
    form.setValue("isEmergency", isDetectedEmergency);
  }, [isDetectedEmergency, form]);

  const handleSubmit = (data: MaintenanceRequestFormData) => {
    const formData = {
      ...data,
      images: uploadedImages
    };
    onSubmit(formData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive text-destructive-foreground border-destructive/30";
      case "high": return "bg-warning text-warning-foreground border-orange-200";
      case "medium": return "bg-warning text-warning-foreground border-warning";
      case "low": return "bg-success text-success-foreground border-success/30";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-2">
            {request ? "Edit Maintenance Request" : "Submit Maintenance Request"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {request ? "Update your maintenance request details" : "Report an issue that needs attention"}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Emergency Alert */}
      {isDetectedEmergency && (
        <Card className="border-destructive/30 bg-destructive/10 dark:bg-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive-foreground dark:text-red-100">
                  🚨 Emergency Request Detected
                </h3>
                <p className="text-sm text-destructive-foreground dark:text-red-300 mt-1">
                  Based on your description, this appears to be an emergency maintenance request. 
                  Emergency requests receive immediate attention and may be auto-approved for faster response.
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-destructive-foreground dark:text-red-300">
                    <Clock className="h-4 w-4" />
                    <span>Expected response time: 15-30 minutes for critical issues</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-destructive-foreground dark:text-red-300">
                    <Phone className="h-4 w-4" />
                    <span>Emergency providers will be notified immediately</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-destructive-foreground dark:text-red-300">
                    <MessageSquare className="h-4 w-4" />
                    <span>Landlord and emergency contacts will receive priority notifications</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Request Details</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="media">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Issue Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Issue Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Leaking faucet in kitchen"
                      {...form.register("title")}
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive-foreground">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={form.watch("category")}
                      onValueChange={(value) => form.setValue("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-sm text-destructive-foreground">{form.formState.errors.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide a detailed description of the issue, including when it started, any relevant details, and how it's affecting you..."
                    rows={4}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive-foreground">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level *</Label>
                    <Select
                      value={form.watch("priority")}
                      onValueChange={(value) => form.setValue("priority", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Minor issue, not urgent</SelectItem>
                        <SelectItem value="medium">Medium - Standard maintenance</SelectItem>
                        <SelectItem value="high">High - Important, needs attention</SelectItem>
                        <SelectItem value="urgent">Urgent - Critical issue, immediate attention needed</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.priority && (
                      <p className="text-sm text-destructive-foreground">{form.formState.errors.priority.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+267 71234567"
                      {...form.register("contactPhone")}
                    />
                    {form.formState.errors.contactPhone && (
                      <p className="text-sm text-destructive-foreground">{form.formState.errors.contactPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowEntry"
                    checked={form.watch("allowEntry")}
                    onChange={(e) => form.setValue("allowEntry", e.target.checked)}
                    className="rounded"
                    aria-label="Allow maintenance staff to enter when I'm not home"
                  />
                  <Label htmlFor="allowEntry">Allow maintenance staff to enter when I'm not home</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Responsibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Who should pay for this maintenance?</Label>
                  
                  <RadioGroup
                    value={form.watch("paymentPreference")}
                    onValueChange={(value) => form.setValue("paymentPreference", value as "tenant" | "landlord")}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg btn-premium-ghost dark:hover:bg-gray-800 transition-colors">
                      <RadioGroupItem value="landlord" id="landlord-pays" />
                      <Label htmlFor="landlord-pays" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Home className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">Landlord should pay for this</div>
                            <div className="text-sm text-gray-500">
                              The property owner will handle the cost of this maintenance
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg btn-premium-ghost dark:hover:bg-gray-800 transition-colors">
                      <RadioGroupItem value="tenant" id="tenant-pays" />
                      <Label htmlFor="tenant-pays" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-success-foreground" />
                          <div>
                            <div className="font-medium">I'll pay for this</div>
                            <div className="text-sm text-gray-500">
                              I will cover the cost of this maintenance myself
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="bg-warning/10 dark:bg-amber-900/20 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900 dark:text-amber-100">Payment Policy</h4>
                        <p className="text-sm text-warning-foreground dark:text-amber-300 mt-1">
                          Your payment preference will be reviewed based on your lease agreement and the landlord's maintenance policy. 
                          The final payment responsibility will be determined according to these terms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduling Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">Preferred Date *</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      {...form.register("preferredDate")}
                    />
                    {form.formState.errors.preferredDate && (
                      <p className="text-sm text-destructive-foreground">{form.formState.errors.preferredDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Preferred Time *</Label>
                    <Select
                      value={form.watch("preferredTime")}
                      onValueChange={(value) => form.setValue("preferredTime", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(slot => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.preferredTime && (
                      <p className="text-sm text-destructive-foreground">{form.formState.errors.preferredTime.message}</p>
                    )}
                  </div>
                </div>

                <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-primary dark:text-blue-100">Response Time</h4>
                      <p className="text-sm text-primary dark:text-blue-300 mt-1">
                        We typically respond to maintenance requests within 24-48 hours. 
                        Urgent requests are prioritized and may receive faster response times.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Photos & Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-primary hover:text-primary">Click to upload</span> or drag and drop
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Issue photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : (request ? "Update Request" : "Submit Request")}
          </Button>
        </div>
      </form>
    </div>
  );
}
