import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Star, MessageCircle, Home, Calendar, DollarSign, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import PropertyCard from '@/components/property/PropertyCard';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RatingForm } from '@/components/rating/RatingForm';
import RatingCard from '@/components/rating/RatingCard';
import { User, Property, LandlordRating } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

export default function LandlordProfile() {
  const [, params] = useRoute('/landlord/:id');
  const [, navigate] = useLocation();
  const landlordId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const { user } = useAuth();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  // Fetch landlord profile
  const {
    data: landlord,
    isLoading: isLoadingLandlord,
    error: landlordError
  } = useQuery({
    queryKey: ['/api/users', landlordId],
    queryFn: async () => {
      if (!landlordId) return null;
      const res = await fetch(`/api/users/${landlordId}`);
      if (!res.ok) throw new Error('Failed to fetch landlord');
      return res.json() as Promise<User>;
    },
    enabled: !!landlordId
  });

  // Fetch landlord's properties
  const {
    data: properties,
    isLoading: isLoadingProperties
  } = useQuery({
    queryKey: ['/api/properties/landlord', landlordId],
    queryFn: async () => {
      if (!landlordId) return [];
      const res = await fetch(`/api/properties/landlord/${landlordId}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json() as Promise<Property[]>;
    },
    enabled: !!landlordId
  });

  // Fetch landlord ratings
  const {
    data: ratings,
    isLoading: isLoadingRatings,
    refetch: refetchRatings
  } = useQuery({
    queryKey: ['/api/landlord-ratings/landlord', landlordId],
    queryFn: async () => {
      if (!landlordId) return [];
      const res = await fetch(`/api/landlord-ratings/landlord/${landlordId}`);
      if (!res.ok) throw new Error('Failed to fetch ratings');
      return res.json() as Promise<LandlordRating[]>;
    },
    enabled: !!landlordId
  });

  // Handle errors
  useEffect(() => {
    if (landlordError) {
      toast({
        title: 'Error',
        description: 'Could not load landlord profile',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [landlordError, toast, navigate]);

  if (isLoadingLandlord || !landlord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLandlord = landlord.role === 'landlord' || landlord.role === 'agency';
  if (!isLandlord) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-heading-2 mb-4">User is not a landlord</h1>
        <p>The requested user is not a landlord or agency.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  // Calculate average ratings
  const avgRating = ratings?.length 
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length 
    : 0;
  
  const avgCommunication = ratings?.length && ratings.some(r => r.communicationRating !== null)
    ? ratings.reduce((acc, r) => acc + (r.communicationRating || 0), 0) / 
      ratings.filter(r => r.communicationRating !== null).length
    : 0;
  
  const avgMaintenance = ratings?.length && ratings.some(r => r.maintenanceRating !== null)
    ? ratings.reduce((acc, r) => acc + (r.maintenanceRating || 0), 0) / 
      ratings.filter(r => r.maintenanceRating !== null).length
    : 0;
  
  const avgValue = ratings?.length && ratings.some(r => r.valueRating !== null)
    ? ratings.reduce((acc, r) => acc + (r.valueRating || 0), 0) / 
      ratings.filter(r => r.valueRating !== null).length
    : 0;

  // Check if the current user can rate this landlord
  // Only tenants who are not viewing their own profile can rate
  const canRate = user && user.role === 'tenant' && user.id !== landlordId;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Landlord Profile Section */}
        <div className="md:w-1/3">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={landlord.profileImage || undefined} alt={landlord.username} />
                <AvatarFallback className="text-3xl">
                  {landlord.firstName?.[0]}{landlord.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">
                {landlord.firstName} {landlord.lastName}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 text-base">
                <Badge variant={landlord.role === 'agency' ? 'outline' : 'default'}>
                  {landlord.role === 'agency' ? 'Agency' : 'Landlord'}
                </Badge>
                {ratings?.length && avgRating ? (
                  <span className="flex items-center">
                    <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                    {avgRating.toFixed(1)}
                  </span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                  <p className="text-sm">{landlord.email}</p>
                  {landlord.phone && <p className="text-sm">{landlord.phone}</p>}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Member Since</h3>
                  <p className="text-sm">
                    {new Date(landlord.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Property Statistics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {isLoadingProperties 
                          ? <Loader2 className="h-3 w-3 animate-spin" /> 
                          : `${properties?.length || 0} Properties`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {isLoadingRatings 
                          ? <Loader2 className="h-3 w-3 animate-spin" /> 
                          : `${ratings?.length || 0} Reviews`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {canRate && (
                <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Rate This Landlord</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Rate {landlord.firstName} {landlord.lastName}</DialogTitle>
                      <DialogDescription>
                        Share your experience with this landlord to help other tenants.
                      </DialogDescription>
                    </DialogHeader>
                    <RatingForm
                      type="landlord"
                      targetId={landlordId!}
                      onSuccess={() => {
                        setRatingDialogOpen(false);
                        refetchRatings();
                        toast({
                          title: 'Thank you!',
                          description: 'Your rating has been submitted successfully.',
                        });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
              {!canRate && user?.role === 'tenant' && (
                <Button className="w-full" variant="outline" disabled>
                  You cannot rate yourself
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Ratings Summary */}
          {ratings && ratings.length > 0 && (
            <Card className="mt-6 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Rating Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Rating</span>
                    <span className="flex items-center">
                      {avgRating.toFixed(1)}
                      <Star className="h-4 w-4 fill-primary text-primary ml-1" />
                    </span>
                  </div>
                  <Progress value={avgRating * 20} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Communication</span>
                    <span>{avgCommunication.toFixed(1)}</span>
                  </div>
                  <Progress value={avgCommunication * 20} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Maintenance</span>
                    <span>{avgMaintenance.toFixed(1)}</span>
                  </div>
                  <Progress value={avgMaintenance * 20} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Value for Money</span>
                    <span>{avgValue.toFixed(1)}</span>
                  </div>
                  <Progress value={avgValue * 20} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Content Tabs (Properties & Reviews) */}
        <div className="md:w-2/3">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="reviews">Reviews & Ratings</TabsTrigger>
            </TabsList>
            
            {/* Properties Tab */}
            <TabsContent value="properties" className="mt-4">
              <h2 className="text-heading-3 mb-4">Properties by {landlord.firstName} {landlord.lastName}</h2>
              {isLoadingProperties ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !properties?.length ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <h3 className="text-body-large mb-2">No Properties Listed</h3>
                    <p className="text-muted-foreground">
                      This landlord doesn't have any properties listed currently.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-4">
              <h2 className="text-heading-3 mb-4">Reviews & Ratings</h2>
              {isLoadingRatings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !ratings?.length ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <h3 className="text-body-large mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground">
                      This landlord hasn't received any reviews yet.
                    </p>
                    {canRate && (
                      <Button 
                        className="mt-4" 
                        onClick={() => setRatingDialogOpen(true)}
                      >
                        Be the First to Review
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {ratings.map(rating => (
                    <RatingCard 
                      key={rating.id}
                      rating={rating} 
                      type="landlord"
                      onUpdate={refetchRatings}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}