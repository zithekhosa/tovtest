import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Star, MessageCircle, Wrench, Clock, ThumbsUp, Award } from 'lucide-react';
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
import { User, MaintenanceRequest, MaintenanceJob } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

// Mock maintenance job and rating types
// These would ideally be in your schema.ts
type MaintenanceRating = {
  id: number;
  maintenanceProviderId: number;
  clientId: number; // landlord or tenant id
  requestId: number;
  rating: number;
  review?: string;
  timeliness?: number;
  quality?: number;
  communication?: number;
  createdAt: string;
  updatedAt?: string;
};

export default function MaintenanceProfile() {
  const [, params] = useRoute('/maintenance/:id');
  const [, navigate] = useLocation();
  const providerId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const { user } = useAuth();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  // Fetch provider profile
  const {
    data: provider,
    isLoading: isLoadingProvider,
    error: providerError
  } = useQuery({
    queryKey: ['/api/users', providerId],
    queryFn: async () => {
      if (!providerId) return null;
      const res = await fetch(`/api/users/${providerId}`);
      if (!res.ok) throw new Error('Failed to fetch maintenance provider');
      return res.json() as Promise<User>;
    },
    enabled: !!providerId
  });

  // Fetch provider's maintenance requests/jobs
  const {
    data: jobs,
    isLoading: isLoadingJobs
  } = useQuery({
    queryKey: ['/api/maintenance/provider', providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const res = await fetch(`/api/maintenance/provider/${providerId}`);
      if (!res.ok) throw new Error('Failed to fetch maintenance jobs');
      return res.json() as Promise<MaintenanceRequest[]>;
    },
    enabled: !!providerId
  });

  // In a full implementation, you'd have dedicated maintenance ratings
  // For this demo, we'll use a placeholder
  const {
    data: ratings,
    isLoading: isLoadingRatings,
    refetch: refetchRatings
  } = useQuery({
    queryKey: ['/api/maintenance-ratings/provider', providerId],
    queryFn: async () => {
      if (!providerId) return [];
      try {
        const res = await fetch(`/api/maintenance-ratings/provider/${providerId}`);
        if (!res.ok) return []; // If endpoint doesn't exist, return empty array
        return res.json() as Promise<MaintenanceRating[]>;
      } catch (error) {
        console.log('Maintenance ratings endpoint not implemented yet');
        return [];
      }
    },
    enabled: !!providerId
  });

  // Handle errors
  useEffect(() => {
    if (providerError) {
      toast({
        title: 'Error',
        description: 'Could not load maintenance provider profile',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [providerError, toast, navigate]);

  if (isLoadingProvider || !provider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isMaintenanceProvider = provider.role === 'maintenance';
  if (!isMaintenanceProvider) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">User is not a maintenance provider</h1>
        <p>The requested user is not a maintenance service provider.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  // Use provider's skills if available, otherwise show placeholder
  const skills = provider.skills || ['Plumbing', 'Electrical', 'Carpentry', 'HVAC'];

  // Calculate average ratings if available
  const avgRating = ratings?.length 
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length 
    : 4.7; // Placeholder rating
  
  const avgTimeliness = ratings?.length && ratings.some(r => r.timeliness !== undefined)
    ? ratings.reduce((acc, r) => acc + (r.timeliness || 0), 0) / 
      ratings.filter(r => r.timeliness !== undefined).length
    : 4.5; // Placeholder
  
  const avgQuality = ratings?.length && ratings.some(r => r.quality !== undefined)
    ? ratings.reduce((acc, r) => acc + (r.quality || 0), 0) / 
      ratings.filter(r => r.quality !== undefined).length
    : 4.8; // Placeholder
  
  const avgCommunication = ratings?.length && ratings.some(r => r.communication !== undefined)
    ? ratings.reduce((acc, r) => acc + (r.communication || 0), 0) / 
      ratings.filter(r => r.communication !== undefined).length
    : 4.6; // Placeholder

  // Completed jobs count
  const completedJobs = jobs?.filter(job => job.status === 'completed').length || 0;

  // Check if the current user can rate this provider
  // Only landlords or tenants who have had work done by this provider can rate
  const canRate = user && (user.role === 'landlord' || user.role === 'tenant' || user.role === 'agency') && user.id !== providerId;

  // In a full implementation, you'd check if the user has actually had work done by this provider
  const hasWorkHistory = true; // This would check for jobs completed for the current user

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Provider Profile Section */}
        <div className="md:w-1/3">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={provider.profileImage || undefined} alt={provider.username} />
                <AvatarFallback className="text-3xl">
                  {provider.firstName?.[0]}{provider.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">
                {provider.firstName} {provider.lastName}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 text-base">
                <Badge>Maintenance Provider</Badge>
                <span className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {avgRating.toFixed(1)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                  <p className="text-sm">{provider.email}</p>
                  {provider.phone && <p className="text-sm">{provider.phone}</p>}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Member Since</h3>
                  <p className="text-sm">
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Provider Statistics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {isLoadingJobs 
                          ? <Loader2 className="h-3 w-3 animate-spin" /> 
                          : `${completedJobs} Completed Jobs`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {isLoadingJobs 
                          ? <Loader2 className="h-3 w-3 animate-spin" /> 
                          : `${jobs?.length || 0} Total Jobs`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {canRate && hasWorkHistory && (
                <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Rate This Provider</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Rate {provider.firstName} {provider.lastName}</DialogTitle>
                      <DialogDescription>
                        Share your experience with this maintenance provider.
                      </DialogDescription>
                    </DialogHeader>
                    {/* In a full implementation, you would create a maintenance-specific rating form */}
                    <div className="text-center py-8">
                      <p>Maintenance rating functionality coming soon</p>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {!canRate && (user?.role === 'landlord' || user?.role === 'tenant' || user?.role === 'agency') && user.id === providerId && (
                <Button className="w-full" variant="outline" disabled>
                  You cannot rate yourself
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Ratings Summary */}
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
                  <span>Timeliness</span>
                  <span>{avgTimeliness.toFixed(1)}</span>
                </div>
                <Progress value={avgTimeliness * 20} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Work Quality</span>
                  <span>{avgQuality.toFixed(1)}</span>
                </div>
                <Progress value={avgQuality * 20} className="h-2" />
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
          
          {/* Skills */}
          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Content Tabs (Jobs & Reviews) */}
        <div className="md:w-2/3">
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jobs">Past Jobs</TabsTrigger>
              <TabsTrigger value="reviews">Reviews & Ratings</TabsTrigger>
            </TabsList>
            
            {/* Jobs Tab */}
            <TabsContent value="jobs" className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Completed Maintenance Jobs</h2>
              {isLoadingJobs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !jobs?.length ? (
                <Card className="bg-muted/50">
                  <CardContent className="py-8 text-center">
                    <h3 className="text-lg font-medium mb-2">No Jobs Completed</h3>
                    <p className="text-muted-foreground">
                      This provider hasn't completed any maintenance jobs yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <Card key={job.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">
                          {job.description?.substring(0, 150)}{job.description?.length > 150 ? '...' : ''}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Date</p>
                            <p>{new Date(job.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-medium">Property</p>
                            <p>Property #{job.propertyId}</p>
                          </div>
                          <div>
                            <p className="font-medium">Requested By</p>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto" 
                              onClick={() => {
                                if (job.tenantId) {
                                  navigate(`/tenant/${job.tenantId}`);
                                } else if (job.landlordId) {
                                  navigate(`/landlord/${job.landlordId}`);
                                }
                              }}
                            >
                              {job.tenantId ? 'Tenant' : 'Landlord'} #{job.tenantId || job.landlordId}
                            </Button>
                          </div>
                          <div>
                            <p className="font-medium">Priority</p>
                            <p>{job.priority}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Reviews & Ratings</h2>
              <div className="py-8 text-center">
                <h3 className="text-lg font-medium mb-2">Maintenance Ratings Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  The maintenance rating system is currently under development.
                </p>
                {canRate && hasWorkHistory && (
                  <Button onClick={() => setRatingDialogOpen(true)}>
                    Rate This Provider
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}