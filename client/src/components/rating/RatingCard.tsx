import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Star, Edit, Trash2, CheckCheck, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { RatingForm } from "./RatingForm";
import type { LandlordRating, TenantRating } from "@shared/schema";

type RatingCardProps = {
  rating: LandlordRating | TenantRating;
  type: 'landlord' | 'tenant';
  onUpdate?: () => void;
  compact?: boolean;
};

export default function RatingCard({ 
  rating, 
  type, 
  onUpdate, 
  compact = false 
}: RatingCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Determine IDs for the type of rating
  const reviewerId = type === 'landlord' 
    ? (rating as LandlordRating).tenantId 
    : (rating as TenantRating).landlordId;
    
  const targetId = type === 'landlord'
    ? (rating as LandlordRating).landlordId
    : (rating as TenantRating).tenantId;
  
  // Fetch reviewer details
  const { data: reviewer } = useQuery({
    queryKey: ['/api/users', reviewerId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${reviewerId}`);
      if (!res.ok) throw new Error('Failed to fetch reviewer');
      return res.json();
    },
  });
  
  // Deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const endpoint = type === 'landlord'
        ? `/api/landlord-ratings/${rating.id}`
        : `/api/tenant-ratings/${rating.id}`;
        
      await apiRequest('DELETE', endpoint);
    },
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      toast({
        title: 'Success',
        description: 'Rating deleted successfully',
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: [type === 'landlord' 
          ? '/api/landlord-ratings/landlord' 
          : '/api/tenant-ratings/tenant', targetId] 
      });
      
      if (onUpdate) onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete rating',
        variant: 'destructive'
      });
    }
  });
  
  // Check if the current user is the one who wrote this review
  const isReviewer = user?.id === reviewerId;
  
  // Format date
  const formattedDate = rating.createdAt 
    ? format(new Date(rating.createdAt), 'PPP')
    : 'Unknown date';
    
  // Calculate overall rating for specific categories
  let categoryRatings: { label: string; value: number }[] = [];
  
  if (type === 'landlord') {
    const landlordRating = rating as LandlordRating;
    categoryRatings = [
      { label: 'Communication', value: landlordRating.communicationRating || 0 },
      { label: 'Maintenance', value: landlordRating.maintenanceRating || 0 },
      { label: 'Value', value: landlordRating.valueRating || 0 }
    ];
  } else {
    const tenantRating = rating as TenantRating;
    categoryRatings = [
      { label: 'Communication', value: tenantRating.communicationRating || 0 },
      { label: 'Payment', value: tenantRating.paymentRating || 0 },
      { label: 'Property Respect', value: tenantRating.propertyRespectRating || 0 }
    ];
  }
  
  return (
    <>
      <Card className={`${compact ? 'bg-muted/50' : ''}`}>
        <CardHeader className={`${compact ? 'p-4' : ''} flex flex-row items-start justify-between`}>
          <div className="flex items-start gap-3">
            {!compact && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={reviewer?.profileImage || undefined} alt={reviewer?.username} />
                <AvatarFallback>
                  {reviewer?.firstName?.[0]}{reviewer?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <CardTitle className={`${compact ? 'text-base' : 'text-lg'} flex items-center gap-2`}>
                {compact ? (
                  <span className="font-medium">Rating:</span>
                ) : (
                  <span>{reviewer?.firstName} {reviewer?.lastName}</span>
                )}
                <div className="flex items-center ml-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1">{rating.rating}</span>
                </div>
              </CardTitle>
              <CardDescription className="space-x-1">
                <span>{formattedDate}</span>
                {type === 'landlord' && compact && (
                  <Badge variant="outline" className="ml-2 text-xs py-0 px-2">
                    Landlord Rating
                  </Badge>
                )}
                {type === 'tenant' && compact && (
                  <Badge variant="outline" className="ml-2 text-xs py-0 px-2">
                    Tenant Rating
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          
          {isReviewer && !compact && (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent className={`${compact ? 'px-4 pt-0 pb-4' : ''}`}>
          {/* Review text */}
          {rating.review && (
            <p className={`${compact ? 'text-sm line-clamp-2' : 'mb-4'}`}>
              {rating.review}
            </p>
          )}
          
          {/* Category ratings */}
          {!compact && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {categoryRatings.map((category, idx) => (
                <div key={idx} className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                  <span className="text-xs text-muted-foreground mb-1">{category.label}</span>
                  <div className="flex items-center">
                    <Star className={`h-4 w-4 ${category.value > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    <span className="ml-1 text-sm">{category.value || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        {isReviewer && compact && (
          <CardFooter className="pt-0 px-4 pb-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-destructive border-destructive hover:bg-destructive/90 hover:text-destructive-foreground"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Edit Rating Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rating</DialogTitle>
            <DialogDescription>
              Update your rating and review.
            </DialogDescription>
          </DialogHeader>
          <RatingForm
            type={type}
            targetId={targetId}
            propertyId={rating.propertyId}
            existingRating={rating}
            onSuccess={() => {
              setIsEditModalOpen(false);
              if (onUpdate) onUpdate();
              toast({
                title: 'Success',
                description: 'Rating updated successfully',
              });
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Rating</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rating? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex items-center justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="gap-1">
                <X className="h-4 w-4" /> Cancel
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="gap-1"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}