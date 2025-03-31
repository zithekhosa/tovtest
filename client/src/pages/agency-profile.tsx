import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Star, MessageCircle, Home, Building, DollarSign, Users, MapPin } from 'lucide-react';
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

export default function AgencyProfile() {
  const [, params] = useRoute('/agency/:id');
  const [, navigate] = useLocation();
  const agencyId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const { user } = useAuth();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  // Fetch agency profile
  const {
    data: agency,
    isLoading: isLoadingAgency,
    error: agencyError
  } = useQuery({
    queryKey: ['/api/users', agencyId],
    queryFn: async () => {
      if (!agencyId) return null;
      const res = await fetch(`/api/users/${agencyId}`);
      if (!res.ok) throw new Error('Failed to fetch agency');
      return res.json() as Promise<User>;
    },
    enabled: !!agencyId
  });

  // Fetch agency's properties
  const {
    data: properties,
    isLoading: isLoadingProperties
  } = useQuery({
    queryKey: ['/api/properties/agency', agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const res = await fetch(`/api/properties/agency/${agencyId}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json() as Promise<Property[]>;
    },
    enabled: !!agencyId
  });

  // Fetch agency ratings (using landlord ratings)
  const {
    data: ratings,
    isLoading: isLoadingRatings,
    refetch: refetchRatings
  } = useQuery({
    queryKey: ['/api/landlord-ratings/landlord', agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const res = await fetch(`/api/landlord-ratings/landlord/${agencyId}`);
      if (!res.ok) throw new Error('Failed to fetch ratings');
      return res.json() as Promise<LandlordRating[]>;
    },
    enabled: !!agencyId
  });

  // Handle errors
  useEffect(() => {
    if (agencyError) {
      toast({
        title: 'Error',
        description: 'Could not load agency profile',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [agencyError, toast, navigate]);

  if (isLoadingAgency || !agency) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAgency = agency.role === 'agency';
  if (!isAgency) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">User is not an agency</h1>
        <p>The requested user is not a real estate agency.</p>
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

  // Check if the current user can rate this agency
  // Only tenants who are not viewing their own profile can rate
  const canRate = user && user.role === 'tenant' && user.id !== agencyId;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Agency Profile Section */}
        <div className="md:w-1/3">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={agency.profileImage || undefined} alt={agency.username} />
                <AvatarFallback className="text-3xl">
                  {agency.firstName?.[0]}{agency.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">
                {agency.firstName} {agency.lastName}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 text-base">
                <Badge variant="outline">Agency</Badge>
                {ratings?.length && avgRating ? (
                  <span className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    {avgRating.toFixed(1)}
                  </span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                  <p className="text-sm">{agency.email}</p>
                  {agency.phone && <p className="text-sm">{agency.phone}</p>}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Member Since</h3>
                  <p className="text-sm">
                    {new Date(agency.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Agency Statistics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" />
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
                    <Button className="w-full">Rate This Agency</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Rate {agency.firstName} {agency.lastName}</DialogTitle>
                      <DialogDescription>
                        Share your experience with this agency to help other clients.
                      </DialogDescription>
                    </DialogHeader>
                    <RatingForm
                      type="landlord"
                      targetId={agencyId!}
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
              {!canRate && user?.role === 'tenant' && user.id === agencyId && (
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
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 ml-1" />
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
                    <span>Property Management</span>
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
              <h2 className="text-xl font-semibold mb-4">Properties Managed by {agency.firstName} {agency.lastName}</h2>
              {isLoadingProperties ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !properties?.length ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <h3 className="text-lg font-medium mb-2">No Properties Listed</h3>
                    <p className="text-muted-foreground">
                      This agency doesn't have any properties listed currently.
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
              <h2 className="text-xl font-semibold mb-4">Reviews & Ratings</h2>
              {isLoadingRatings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !ratings?.length ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground">
                      This agency hasn't received any reviews yet.
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