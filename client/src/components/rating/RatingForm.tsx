import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RatingFormProps {
  type: 'landlord' | 'tenant';
  targetId: number;
  propertyId?: number;
  existingRating?: any; // The existing rating to edit if any
  onSuccess: () => void;
}

// Rating form schema
const landlordRatingSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  communicationRating: z.number().min(1).max(5).optional(),
  maintenanceRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  propertyId: z.number(),
});

const tenantRatingSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  communicationRating: z.number().min(1).max(5).optional(),
  paymentRating: z.number().min(1).max(5).optional(),
  propertyRespectRating: z.number().min(1).max(5).optional(),
  propertyId: z.number(),
});

export function RatingForm({ type, targetId, propertyId, existingRating, onSuccess }: RatingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(propertyId);
  
  // Determine if editing or creating
  const isEditing = !!existingRating;
  
  // Get schema based on rating type
  const ratingSchema = type === 'landlord' ? landlordRatingSchema : tenantRatingSchema;
  
  // Get properties for dropdown
  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async ({ signal }) => {
      const url = type === 'landlord' 
        ? `/api/properties/tenant/${user?.id}`
        : `/api/properties/landlord/${user?.id}`;
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error("Failed to fetch properties");
      return await response.json();
    },
    enabled: !propertyId && !!user,
  });
  
  // Initialize form
  const form = useForm<z.infer<typeof ratingSchema>>({
    resolver: zodResolver(ratingSchema),
    defaultValues: existingRating
      ? {
          rating: existingRating.rating || 3,
          review: existingRating.review || "",
          communicationRating: existingRating.communicationRating || 3,
          ...(type === 'landlord'
            ? {
                maintenanceRating: existingRating.maintenanceRating || 3,
                valueRating: existingRating.valueRating || 3,
              }
            : {
                paymentRating: existingRating.paymentRating || 3,
                propertyRespectRating: existingRating.propertyRespectRating || 3,
              }),
          propertyId: existingRating.propertyId,
        }
      : {
          rating: 3,
          review: "",
          communicationRating: 3,
          ...(type === 'landlord'
            ? {
                maintenanceRating: 3,
                valueRating: 3,
              }
            : {
                paymentRating: 3,
                propertyRespectRating: 3,
              }),
          propertyId: propertyId || 0,
        },
  });

  // Update property ID when it's provided or selected
  useEffect(() => {
    if (propertyId) {
      form.setValue('propertyId', propertyId);
      setSelectedPropertyId(propertyId);
    }
  }, [propertyId, form]);
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof ratingSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a rating.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let url = "";
      let method = "POST";
      
      // Prepare request URL and method based on rating type and whether editing
      if (type === 'landlord') {
        if (isEditing) {
          url = `/api/landlord-ratings/${existingRating.id}`;
          method = "PATCH";
        } else {
          url = "/api/landlord-ratings";
        }
      } else {
        if (isEditing) {
          url = `/api/tenant-ratings/${existingRating.id}`;
          method = "PATCH";
        } else {
          url = "/api/tenant-ratings";
        }
      }
      
      // Prepare rating data
      const ratingData = {
        ...data,
        [type === 'landlord' ? 'landlordId' : 'tenantId']: targetId,
        [type === 'landlord' ? 'tenantId' : 'landlordId']: user.id,
      };
      
      // Submit the rating
      const response = await apiRequest(method, url, ratingData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit rating');
      }
      
      // Success handling
      toast({
        title: isEditing ? "Rating Updated" : "Rating Submitted",
        description: isEditing 
          ? "Your rating has been successfully updated." 
          : "Your rating has been successfully submitted.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/${type}-ratings`] });
      
      // Call success callback
      onSuccess();
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit rating",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingProperties && !propertyId) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Property selection if not provided and options are available */}
        {!propertyId && properties && properties.length > 0 && (
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Property</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                    setSelectedPropertyId(parseInt(value));
                  }}
                  defaultValue={field.value?.toString() || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.title || property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the property this rating is for.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Main rating */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Rating</FormLabel>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between pl-1 pr-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span key={num} className="text-xs">{num}</span>
                  ))}
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[field.value]}
                    onValueChange={(values) => field.onChange(values[0])}
                    className="w-full"
                  />
                </FormControl>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Poor</span>
                  <span className="text-xs text-muted-foreground">Excellent</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Written review */}
        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your review here..." 
                  {...field} 
                  className="min-h-24 resize-y"
                />
              </FormControl>
              <FormDescription>
                Provide details about your experience. This will help others make informed decisions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Communication rating */}
        <FormField
          control={form.control}
          name="communicationRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication</FormLabel>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between pl-1 pr-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span key={num} className="text-xs">{num}</span>
                  ))}
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[field.value || 3]}
                    onValueChange={(values) => field.onChange(values[0])}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription className="flex justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Poor</span>
                  <span className="text-xs text-muted-foreground">Excellent</span>
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Type-specific rating fields */}
        {type === 'landlord' ? (
          // Landlord-specific ratings
          <>
            <FormField
              control={form.control}
              name="maintenanceRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance & Repairs</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between pl-1 pr-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span key={num} className="text-xs">{num}</span>
                      ))}
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value || 3]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Poor</span>
                      <span className="text-xs text-muted-foreground">Excellent</span>
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="valueRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value for Money</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between pl-1 pr-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span key={num} className="text-xs">{num}</span>
                      ))}
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value || 3]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Poor</span>
                      <span className="text-xs text-muted-foreground">Excellent</span>
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          // Tenant-specific ratings
          <>
            <FormField
              control={form.control}
              name="paymentRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Reliability</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between pl-1 pr-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span key={num} className="text-xs">{num}</span>
                      ))}
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value || 3]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Poor</span>
                      <span className="text-xs text-muted-foreground">Excellent</span>
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="propertyRespectRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Care & Respect</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between pl-1 pr-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span key={num} className="text-xs">{num}</span>
                      ))}
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value || 3]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Poor</span>
                      <span className="text-xs text-muted-foreground">Excellent</span>
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Submitting..."}
            </>
          ) : (
            isEditing ? "Update Rating" : "Submit Rating"
          )}
        </Button>
      </form>
    </Form>
  );
}