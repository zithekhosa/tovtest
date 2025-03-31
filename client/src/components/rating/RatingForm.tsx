import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Star rating component
const StarRating = ({ value, onChange, disabled = false }: { 
  value: number; 
  onChange: (value: number) => void;
  disabled?: boolean;
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`p-1 ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          disabled={disabled}
        >
          <Star 
            className={`h-6 w-6 ${
              (hoverRating ? star <= hoverRating : star <= value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`} 
          />
        </button>
      ))}
    </div>
  );
};

// Define form schemas for different rating types
const landlordRatingSchema = z.object({
  rating: z.number().min(1, "Please provide an overall rating").max(5),
  review: z.string().optional(),
  communicationRating: z.number().min(1, "Please rate communication").max(5),
  maintenanceRating: z.number().min(1, "Please rate maintenance").max(5),
  valueRating: z.number().min(1, "Please rate value for money").max(5),
});

const tenantRatingSchema = z.object({
  rating: z.number().min(1, "Please provide an overall rating").max(5),
  review: z.string().optional(),
  communicationRating: z.number().min(1, "Please rate communication").max(5),
  paymentRating: z.number().min(1, "Please rate payment timeliness").max(5),
  propertyRespectRating: z.number().min(1, "Please rate property respect").max(5),
});

type RatingFormProps = {
  type: 'landlord' | 'tenant';
  targetId: number;
  propertyId?: number;
  onSuccess?: () => void;
  existingRating?: any; // For editing existing ratings
};

export function RatingForm({ 
  type, 
  targetId, 
  propertyId, 
  onSuccess, 
  existingRating 
}: RatingFormProps) {
  const { toast } = useToast();
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<number | undefined>(propertyId);
  
  // Define form based on type
  const schema = type === 'landlord' ? landlordRatingSchema : tenantRatingSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: existingRating || {
      rating: 0,
      review: '',
      communicationRating: 0,
      ...(type === 'landlord' 
        ? { maintenanceRating: 0, valueRating: 0 } 
        : { paymentRating: 0, propertyRespectRating: 0 })
    },
  });
  
  // Create rating mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      if (!selectedPropertyId) {
        throw new Error("Please select a property");
      }
      
      const endpoint = type === 'landlord' 
        ? '/api/landlord-ratings'
        : '/api/tenant-ratings';
        
      const data = {
        ...values,
        [type === 'landlord' ? 'landlordId' : 'tenantId']: targetId,
        propertyId: selectedPropertyId
      };
      
      const res = await apiRequest('POST', endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit rating',
        variant: 'destructive'
      });
    }
  });
  
  // Update rating mutation
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      if (!existingRating?.id) {
        throw new Error("Rating ID is required for updating");
      }
      
      const endpoint = type === 'landlord' 
        ? `/api/landlord-ratings/${existingRating.id}`
        : `/api/tenant-ratings/${existingRating.id}`;
        
      const res = await apiRequest('PUT', endpoint, values);
      return res.json();
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update rating',
        variant: 'destructive'
      });
    }
  });
  
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  
  function onSubmit(values: z.infer<typeof schema>) {
    if (existingRating?.id) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* This would be a property selector if propertyId wasn't provided */}
        {!propertyId && !existingRating?.propertyId && (
          <div className="mb-4">
            <FormLabel>Property</FormLabel>
            <p className="text-sm text-muted-foreground mb-2">
              For this demo, we're assuming property ID 1 since property selection UI would require fetching all properties.
            </p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setSelectedPropertyId(1)}
              className={`${selectedPropertyId === 1 ? 'border-primary' : ''}`}
            >
              Select Sample Property (ID: 1)
            </Button>
          </div>
        )}
      
        {/* Overall Rating */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Rating</FormLabel>
              <FormControl>
                <StarRating 
                  value={field.value || 0} 
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Review text */}
        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience..."
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Your honest feedback helps others make informed decisions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Communication Rating */}
        <FormField
          control={form.control}
          name="communicationRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication</FormLabel>
              <FormControl>
                <StarRating 
                  value={field.value || 0} 
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Type-specific ratings */}
        {type === 'landlord' ? (
          <>
            {/* Maintenance Rating */}
            <FormField
              control={form.control}
              name="maintenanceRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance & Repairs</FormLabel>
                  <FormControl>
                    <StarRating 
                      value={field.value || 0} 
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Value Rating */}
            <FormField
              control={form.control}
              name="valueRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value for Money</FormLabel>
                  <FormControl>
                    <StarRating 
                      value={field.value || 0} 
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            {/* Payment Rating */}
            <FormField
              control={form.control}
              name="paymentRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Timeliness</FormLabel>
                  <FormControl>
                    <StarRating 
                      value={field.value || 0} 
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Property Respect Rating */}
            <FormField
              control={form.control}
              name="propertyRespectRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Respect</FormLabel>
                  <FormControl>
                    <StarRating 
                      value={field.value || 0} 
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || (!propertyId && !selectedPropertyId && !existingRating?.propertyId)}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existingRating?.id ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </form>
    </Form>
  );
}