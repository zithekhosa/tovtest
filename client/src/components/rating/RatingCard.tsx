import { useState } from 'react';
import { Star, Edit, Trash2, User, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { RatingForm } from './RatingForm';
import { formatDistanceToNow } from 'date-fns';

interface RatingCardProps {
  rating: any; // Use LandlordRating | TenantRating here once types are available
  type: 'landlord' | 'tenant';
  onUpdate: () => void;
}

export default function RatingCard({ rating, type, onUpdate }: RatingCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = type === 'landlord' 
    ? user?.id === rating.tenantId 
    : user?.id === rating.landlordId;
  
  // Format dates
  const formattedDate = rating.createdAt 
    ? formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })
    : '';
  
  // Delete rating
  const handleDelete = async () => {
    try {
      const endpoint = type === 'landlord' 
        ? `/api/landlord-ratings/${rating.id}` 
        : `/api/tenant-ratings/${rating.id}`;
      
      const response = await apiRequest('DELETE', endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to delete rating');
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/${type}-ratings`] });
      
      toast({
        title: 'Rating Deleted',
        description: 'Your rating has been successfully deleted.',
      });
      
      onUpdate();
      setIsDeleting(false);
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rating. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Calculate detailed rating items based on type
  const detailedRatings = type === 'landlord' 
    ? [
        { name: 'Communication', value: rating.communicationRating },
        { name: 'Maintenance', value: rating.maintenanceRating },
        { name: 'Value for Money', value: rating.valueRating },
      ]
    : [
        { name: 'Communication', value: rating.communicationRating },
        { name: 'Payment Reliability', value: rating.paymentRating },
        { name: 'Property Respect', value: rating.propertyRespectRating },
      ];
  
  const handleEditComplete = () => {
    setIsEditing(false);
    onUpdate();
  };
  
  return (
    <>
      <Card className="tov-card mb-4 w-full">
        <CardHeader className="pb-2">
          <div className="tov-flex-between">
            <div className="tov-flex-start gap-2 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                {rating.userProfileImage && <AvatarImage src={rating.userProfileImage} alt="User" />}
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-base tov-card-title">
                  {type === 'landlord' ? rating.tenantName : rating.landlordName}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              </div>
            </div>
            <div className="tov-flex-center shrink-0">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <Badge variant="outline" className="text-xs">
                {rating.rating}/5
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="tov-card-content">
          {rating.review ? (
            <p className="text-sm tov-text-wrap tov-line-clamp-3">{rating.review}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No written review provided.</p>
          )}
          
          <div className="mt-4 space-y-2">
            {detailedRatings.map((item) => (
              item.value ? (
                <div key={item.name} className="space-y-1">
                  <div className="tov-flex-between text-xs">
                    <span>{item.name}</span>
                    <span>{item.value}/5</span>
                  </div>
                  <Progress value={item.value * 20} className="h-1" />
                </div>
              ) : null
            ))}
          </div>
          
          {rating.propertyAddress && (
            <>
              <Separator className="my-3" />
              <div className="text-xs text-muted-foreground">
                <span className="tov-truncate-text">Property: {rating.propertyAddress}</span>
              </div>
            </>
          )}
        </CardContent>
        
        {isOwner && (
          <CardFooter className="pt-0 tov-flex-between gap-2">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-3.5 w-3.5 mr-1 shrink-0" />
                Edit
              </Button>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Edit your rating</DialogTitle>
                </DialogHeader>
                <RatingForm 
                  type={type} 
                  targetId={type === 'landlord' ? rating.landlordId : rating.tenantId} 
                  propertyId={rating.propertyId}
                  existingRating={rating}
                  onSuccess={handleEditComplete}
                />
              </DialogContent>
            </Dialog>
            
            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-destructive"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1 shrink-0" />
                Delete
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your rating. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>
    </>
  );
}