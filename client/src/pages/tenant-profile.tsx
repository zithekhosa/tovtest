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
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RatingForm } from '@/components/rating/RatingForm';
import RatingCard from '@/components/rating/RatingCard';
import { User, TenantRating, Lease, Property } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

export default function TenantProfile() {
  const [, params] = useRoute('/tenant/:id');
  const [, navigate] = useLocation();
  const tenantId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const { user } = useAuth();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  // Fetch tenant profile
  const {
    data: tenant,
    isLoading: isLoadingTenant,
    error: tenantError
  } = useQuery({
    queryKey: ['/api/users', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const res = await fetch(`/api/users/${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch tenant');
      return res.json() as Promise<User>;
    },
    enabled: !!tenantId
  });

  // Fetch tenant's leases
  const {
    data: leases,
    isLoading: isLoadingLeases
  } = useQuery({
    queryKey: ['/api/leases/tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const res = await fetch(`/api/leases/tenant/${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch leases');
      return res.json() as Promise<Lease[]>;
    },
    enabled: !!tenantId
  });

  // Fetch tenant's properties (derived from leases)
  const {
    data: properties,
    isLoading: isLoadingProperties
  } = useQuery({
    queryKey: ['/api/properties/tenant', tenantId],
    queryFn: async () => {
      if (!tenantId || !leases?.length) return [];
      // Get unique property IDs from leases
      const propertyIds = Array.from(new Set(leases.map(lease => lease.propertyId)));
      
      // Fetch each property
      const propertiesPromises = propertyIds.map(async id => {
        const res = await fetch(`/api/properties/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch property ${id}`);
        return res.json();
      });
      
      return Promise.all(propertiesPromises) as Promise<Property[]>;
    },
    enabled: !!tenantId && !!leases?.length
  });

  // Fetch tenant ratings
  const {
    data: ratings,
    isLoading: isLoadingRatings,
    refetch: refetchRatings
  } = useQuery({
    queryKey: ['/api/tenant-ratings/tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const res = await fetch(`/api/tenant-ratings/tenant/${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch ratings');
      return res.json() as Promise<TenantRating[]>;
    },
    enabled: !!tenantId
  });

  // Handle errors
  useEffect(() => {
    if (tenantError) {
      toast({
        title: 'Error',
        description: 'Could not load tenant profile',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [tenantError, toast, navigate]);

  if (isLoadingTenant || !tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isTenant = tenant.role === 'tenant';
  if (!isTenant) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-heading-2 mb-4">User is not a tenant</h1>
        <p>The requested user is not a tenant.</p>
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
  
  const avgPayment = ratings?.length && ratings.some(r => r.paymentRating !== null)
    ? ratings.reduce((acc, r) => acc + (r.paymentRating || 0), 0) / 
      ratings.filter(r => r.paymentRating !== null).length
    : 0;
  
  const avgPropertyRespect = ratings?.length && ratings.some(r => r.propertyRespectRating !== null)
    ? ratings.reduce((acc, r) => acc + (r.propertyRespectRating || 0), 0) / 
      ratings.filter(r => r.propertyRespectRating !== null).length
    : 0;
  
  const avgCommunication = ratings?.length && ratings.some(r => r.communicationRating !== null)
    ? ratings.reduce((acc, r) => acc + (r.communicationRating || 0), 0) / 
      ratings.filter(r => r.communicationRating !== null).length
    : 0;

  // Check if the current user can rate this tenant
  // Only landlords who are not viewing their own profile can rate
  const canRate = user && (user.role === 'landlord' || user.role === 'agency') && user.id !== tenantId;

  // Determine if this tenant has any history with the current landlord
  const hasHistoryWithCurrentUser = leases?.some(lease => {
    const property = properties?.find(p => p.id === lease.propertyId);
    return property?.landlordId === user?.id;
  });

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Tenant Profile Section */}
        <div className="md:w-1/3">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={tenant.profileImage || undefined} alt={tenant.username} />
                <AvatarFallback className="text-3xl">
                  {tenant.firstName?.[0]}{tenant.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">
                {tenant.firstName} {tenant.lastName}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 text-base">
                <Badge>Tenant</Badge>
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
                  <p className="text-sm">{tenant.email}</p>
                  {tenant.phone && <p className="text-sm">{tenant.phone}</p>}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Member Since</h3>
                  <p className="text-sm">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Rental Statistics</h3>
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
              {canRate && hasHistoryWithCurrentUser && (
                <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Rate This Tenant</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Rate {tenant.firstName} {tenant.lastName}</DialogTitle>
                      <DialogDescription>
                        Share your experience with this tenant to help other landlords.
                      </DialogDescription>
                    </DialogHeader>
                    <RatingForm
                      type="tenant"
                      targetId={tenantId!}
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
              {canRate && !hasHistoryWithCurrentUser && (
                <Button className="w-full" variant="outline" disabled>
                  No rental history with this tenant
                </Button>
              )}
              {!canRate && (user?.role === 'landlord' || user?.role === 'agency') && (
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
                    <span>Payment Timeliness</span>
                    <span>{avgPayment.toFixed(1)}</span>
                  </div>
                  <Progress value={avgPayment * 20} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Property Respect</span>
                    <span>{avgPropertyRespect.toFixed(1)}</span>
                  </div>
                  <Progress value={avgPropertyRespect * 20} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Communication</span>
                    <span>{avgCommunication.toFixed(1)}</span>
                  </div>
                  <Progress value={avgCommunication * 20} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Content Tabs (Properties & Reviews) */}
        <div className="md:w-2/3">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="properties">Rental History</TabsTrigger>
              <TabsTrigger value="reviews">Reviews & Ratings</TabsTrigger>
            </TabsList>
            
            {/* Properties Tab */}
            <TabsContent value="properties" className="mt-4">
              <h2 className="text-heading-3 mb-4">Rental History</h2>
              {isLoadingLeases || isLoadingProperties ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !leases?.length ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <h3 className="text-body-large mb-2">No Rental History</h3>
                    <p className="text-muted-foreground">
                      This tenant doesn't have any rental history yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {leases.map(lease => {
                    const property = properties?.find(p => p.id === lease.propertyId);
                    
                    return (
                      <Card key={lease.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-4">
                            <h3 className="font-semibold text-lg">
                              {property?.title || 'Property'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {property?.address}, {property?.city}, {property?.state}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-sm font-medium">Lease Period</p>
                                <p className="text-sm">
                                  {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Monthly Rent</p>
                                <p className="text-sm">
                                  {lease.rentAmount.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'BWP',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Status</p>
                                <Badge variant={lease.active ? "default" : "secondary"}>
                                  {lease.active ? 'Active' : 'Expired'}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Landlord</p>
                                <p className="text-sm">
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-sm"
                                    onClick={() => navigate(`/landlord/${property?.landlordId}`)}
                                  >
                                    View Landlord
                                  </Button>
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
                      This tenant hasn't received any reviews yet.
                    </p>
                    {canRate && hasHistoryWithCurrentUser && (
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
                      type="tenant"
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