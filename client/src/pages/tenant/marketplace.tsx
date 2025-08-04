import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashLayout from "@/components/layout/DashLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MaintenanceRequest } from "@shared/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { 
  Loader2, 
  Wrench, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Clock, 
  User, 
  Send, 
  MessageSquare,
  Filter,
  Search,
  Building,
  Zap,
  Paintbrush,
  Hammer,
  WrenchIcon,
  Leaf,
  Shield,
  Droplet,
  Lightbulb,
  DollarSign
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const serviceCategories = [
  { name: "Plumbing", icon: Droplet },
  { name: "Electrical", icon: Zap },
  { name: "Painting", icon: Paintbrush },
  { name: "Carpentry", icon: Hammer },
  { name: "General Repair", icon: WrenchIcon },
  { name: "Gardening", icon: Leaf },
  { name: "Security", icon: Shield },
  { name: "Cleaning", icon: Lightbulb },
];

export default function MaintenanceMarketplace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Create job form state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobCategory, setJobCategory] = useState("General Repair");
  const [jobBudget, setJobBudget] = useState("");
  const [jobDeadline, setJobDeadline] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Fetch marketplace listings
  const {
    data: marketplaceListings,
    isLoading,
    error
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/marketplace"],
  });

  // Fetch tenant's own listings
  const {
    data: ownListings,
    isLoading: isLoadingOwn,
    error: ownError
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/tenant"],
  });

  // Filter marketplace listings based on search and category
  const filteredListings = () => {
    if (!marketplaceListings) return [];
    
    return marketplaceListings.filter(listing => {
      const matchesSearch = searchQuery 
        ? listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
        
      const matchesCategory = categoryFilter
        ? listing.category === categoryFilter
        : true;
        
      return matchesSearch && matchesCategory;
    });
  };

  // Get open jobs posted by the tenant
  const getOpenJobs = () => {
    if (!ownListings) return [];
    return ownListings.filter(job => job.status === "open_for_bids");
  };

  // Get jobs with bids
  const getJobsWithBids = () => {
    if (!ownListings) return [];
    return ownListings.filter(job => 
      job.status === "open_for_bids" && 
      (job as any).bids && (job as any).bids.length > 0
    );
  };

  // View job details
  const handleViewJob = (job: MaintenanceRequest) => {
    setSelectedRequest(job);
    setIsDetailsOpen(true);
  };

  // Open bid dialog
  const handleBid = (job: MaintenanceRequest) => {
    setSelectedRequest(job);
    setIsBidOpen(true);
  };

  // Submit bid
  const handleSubmitBid = async () => {
    if (!selectedRequest || !bidAmount.trim() || !bidMessage.trim()) return;
    
    try {
      // In a real app, this would submit the bid to the API
      alert(`Bid of ${formatCurrency(Number(bidAmount))} submitted for job: ${selectedRequest.title}`);
      setBidAmount("");
      setBidMessage("");
      setIsBidOpen(false);
    } catch (error) {
      console.error("Error submitting bid:", error);
    }
  };

  // Create new job
  const handleCreateJob = async () => {
    if (!jobTitle.trim() || !jobDescription.trim() || !jobBudget.trim()) return;
    
    try {
      // In a real app, this would create a new job via API
      alert(`New job "${jobTitle}" created and listed on the marketplace`);
      setJobTitle("");
      setJobDescription("");
      setJobCategory("General Repair");
      setJobBudget("");
      setJobDeadline("");
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  if (isLoading || isLoadingOwn) {
    return (
      <DashLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashLayout>
    );
  }

  if (error || ownError) {
    return (
      <DashLayout>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive-foreground mx-auto mb-4" />
          <h2 className="text-heading-3 mb-2">Error Loading Marketplace</h2>
          <p className="text-gray-500 mb-4">Failed to load maintenance marketplace. Please try again later.</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div className="space-y-6">
        <DashboardHeader
          title="Maintenance Marketplace"
          subtitle="Find service providers and manage maintenance jobs"
        />

        {/* Category Shortcuts */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {serviceCategories.map((category, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer hover:border-primary transition-colors ${
                categoryFilter === category.name ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setCategoryFilter(
                categoryFilter === category.name ? null : category.name
              )}
            >
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <category.icon className="h-6 w-6 mb-1 text-primary" />
                <p className="text-xs font-medium">{category.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="browse" className="py-2">Browse Jobs</TabsTrigger>
            <TabsTrigger value="my-jobs" className="py-2">My Posted Jobs</TabsTrigger>
            <TabsTrigger value="create" className="py-2">Create Job</TabsTrigger>
          </TabsList>

          {/* Browse Jobs Tab */}
          <TabsContent value="browse" className="mt-4">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter(null);
                }}
                className="gap-1"
              >
                <Filter className="h-4 w-4" />
                Clear
              </Button>
            </div>

            {filteredListings().length > 0 ? (
              <div className="space-y-4">
                {filteredListings().map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-4 flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium truncate">{job.title}</h3>
                            <p className="text-caption">
                              Posted {formatDate(job.createdAt)} • 
                              Category: {job.category || 'General Repair'}
                            </p>
                          </div>
                          <Badge>{(job as any).bids ? `${(job as any).bids.length} Bids` : 'New'}</Badge>
                        </div>
                        
                        <p className="text-body-small line-clamp-2 mb-3">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1 text-gray-500" />
                            <span>Property #{job.propertyId}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                            <span>Budget: {formatCurrency(job.estimatedCost || 0)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span>Status: Open</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 md:w-48 bg-gray-50 flex flex-row md:flex-col md:justify-end items-center gap-2 border-t md:border-t-0 md:border-l">
                        <Button variant="outline" size="sm" onClick={() => handleViewJob(job)}>
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleBid(job)}>
                          Place Bid
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-10 bg-white rounded-lg shadow-sm text-center">
                <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-heading-3 mb-2">No Jobs Found</h2>
                <p className="text-gray-500 mb-4">
                  {categoryFilter || searchQuery 
                    ? 'No jobs matching your filters. Try adjusting your search criteria.'
                    : 'There are no open jobs in the marketplace right now.'}
                </p>
                {(categoryFilter || searchQuery) && (
                  <Button onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter(null);
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* My Posted Jobs Tab */}
          <TabsContent value="my-jobs" className="mt-4">
            {getOpenJobs().length > 0 ? (
              <div className="space-y-6">
                {getJobsWithBids().length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Jobs with Bids</CardTitle>
                      <CardDescription>
                        These jobs have received bids from service providers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getJobsWithBids().map((job) => (
                          <div key={job.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{job.title}</h3>
                              <Badge className="bg-success">{(job as any).bids?.length || 0} Bids</Badge>
                            </div>
                            <p className="text-body-small mb-3 line-clamp-2">
                              {job.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm mb-3">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                <span>Posted {formatDate(job.createdAt)}</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                                <span>Budget: {formatCurrency(job.estimatedCost || 0)}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {((job as any).bids || []).slice(0, 2).map((bid: any, index: number) => (
                                <Card key={index} className="bg-gray-50">
                                  <CardContent className="p-3">
                                    <div className="flex items-center mb-1">
                                      <User className="h-4 w-4 mr-1 text-gray-500" />
                                      <span className="text-sm font-medium">Provider #{bid.providerId}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">{formatCurrency(bid.amount)}</span>
                                      <div className="flex items-center">
                                        <Star className="h-3 w-3 text-primary mr-1" />
                                        <span className="text-xs">{bid.providerRating || '4.5'}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            <div className="mt-3 flex justify-end">
                              <Button size="sm" onClick={() => handleViewJob(job)}>
                                View All Bids
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Open Jobs</CardTitle>
                    <CardDescription>
                      Jobs you've posted that are open for bids
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getOpenJobs().map((job) => (
                        <div key={job.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{job.title}</h3>
                            <Badge>{(job as any).bids?.length || 0} Bids</Badge>
                          </div>
                          <p className="text-body-small mb-3">
                            {job.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm mb-3">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-500" />
                              <span>Posted {formatDate(job.createdAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                              <span>Budget: {formatCurrency(job.estimatedCost || 0)}</span>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewJob(job)}>
                              View Details
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => {
                                if (confirm('Are you sure you want to close this job?')) {
                                  // In a real app, this would call the API to close the job
                                  alert(`Job "${job.title}" closed`);
                                }
                              }}
                            >
                              Close Job
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="p-10 bg-white rounded-lg shadow-sm text-center">
                <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-heading-3 mb-2">No Open Jobs</h2>
                <p className="text-gray-500 mb-4">
                  You haven't posted any maintenance jobs in the marketplace.
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  Post a Job
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Create Job Tab */}
          <TabsContent value="create" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Post a New Maintenance Job</CardTitle>
                <CardDescription>
                  Create a new job listing for service providers to bid on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Job Title</label>
                    <Input 
                      placeholder="e.g., Bathroom Faucet Repair" 
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select 
                      value={jobCategory}
                      onValueChange={setJobCategory}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category, index) => (
                          <SelectItem key={index} value={category.name}>
                            <div className="flex items-center">
                              <category.icon className="h-4 w-4 mr-2 text-primary" />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe the issue in detail..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Budget (BWP)</label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          BWP
                        </span>
                        <Input 
                          type="number" 
                          placeholder="e.g., 500" 
                          className="pl-12"
                          value={jobBudget}
                          onChange={(e) => setJobBudget(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Deadline (Optional)</label>
                      <Input 
                        type="date" 
                        className="mt-1"
                        value={jobDeadline}
                        onChange={(e) => setJobDeadline(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="public-job" 
                      checked={isPublic}
                      onChange={() => setIsPublic(!isPublic)}
                      className="rounded text-primary border-gray-300"
                    />
                    <label htmlFor="public-job" className="text-sm">
                      Make this job visible to all service providers
                    </label>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full"
                      onClick={handleCreateJob}
                      disabled={!jobTitle.trim() || !jobDescription.trim() || !jobBudget.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2 shrink-0" />
                      Post Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Details Dialog */}
      {selectedRequest && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedRequest.title}</DialogTitle>
              <DialogDescription>
                Posted on {formatDate(selectedRequest.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary">
                  {selectedRequest.category || 'General Repair'}
                </Badge>
                <Badge variant="outline" className="border-success text-success-foreground">
                  Budget: {formatCurrency(selectedRequest.estimatedCost || 0)}
                </Badge>
                <Badge variant="outline" className="border-warning text-warning-foreground">
                  {(selectedRequest as any).bids ? `${(selectedRequest as any).bids.length} Bids` : 'No Bids Yet'}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-body-small">
                  {selectedRequest.description}
                </p>
              </div>
              
              <Separator />
              
              {(selectedRequest as any).bids && (selectedRequest as any).bids.length > 0 ? (
                <div>
                  <h3 className="font-medium mb-2">Bids Received</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {(selectedRequest as any).bids.map((bid: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Provider #{bid.providerId}</p>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-primary mr-1" />
                                  <span className="text-xs">{bid.providerRating || '4.5'} (15 reviews)</span>
                                </div>
                              </div>
                            </div>
                            <p className="font-bold text-lg">{formatCurrency(bid.amount)}</p>
                          </div>
                          <p className="text-body-small mb-3">
                            {bid.message || "I can complete this job efficiently and to a high standard."}
                          </p>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            <Button size="sm">
                              Accept Bid
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <AlertCircle className="h-8 w-8 text-warning-foreground mx-auto mb-2" />
                  <h3 className="font-medium">No Bids Yet</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This job hasn't received any bids from service providers yet.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsDetailsOpen(false);
                setIsBidOpen(true);
              }}>
                Place Bid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Place Bid Dialog */}
      {selectedRequest && (
        <Dialog open={isBidOpen} onOpenChange={setIsBidOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Place a Bid</DialogTitle>
              <DialogDescription>
                For: {selectedRequest.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Your Bid Amount (BWP)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    BWP
                  </span>
                  <Input 
                    type="number" 
                    placeholder="Enter your bid amount" 
                    className="pl-12"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                </div>
                <p className="text-caption mt-1">
                  Budget: {formatCurrency(selectedRequest.estimatedCost || 0)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message to Client</label>
                <Textarea
                  placeholder="Describe your expertise and approach to this job..."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-caption">
                  By placing a bid, you agree to complete the work as described if your bid is accepted. 
                  The client will release payment once the work is completed to their satisfaction.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBidOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitBid}
                disabled={!bidAmount.trim() || !bidMessage.trim()}
              >
                Submit Bid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashLayout>
  );
}