import { useAuth } from "@/hooks/use-auth";
import PropertySearchComponent from "@/components/property/PropertySearchComponent";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { Home, Search, Building, ArrowRight, MapPin, Info, HelpCircle, User } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function PropertySearchPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handlePropertyRequest = (property: Property) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or register to request property viewings.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    // If user is authenticated, they can request a viewing
    toast({
      title: "Request Sent",
      description: "Your request to view this property has been sent. A representative will contact you shortly.",
    });
  };

  const handlePropertyApply = (property: Property) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or register to apply for properties.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    // If user is authenticated and a tenant, they can apply
    if (user.role === "tenant") {
      navigate(`/tenant/applications?propertyId=${property.id}`);
    } else {
      toast({
        title: "Tenant Account Required",
        description: "You need a tenant account to apply for properties.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 pt-10 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">Find Your Perfect Property in Botswana</h1>
              <p className="text-lg text-gray-600 mb-8">
                Discover residential and commercial properties across Gaborone, Francistown, Maun and other cities throughout Botswana.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="#property-search">
                    <Search className="mr-2 h-5 w-5" /> Search Properties
                  </Link>
                </Button>
                {!user && (
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/auth">
                      <User className="mr-2 h-5 w-5" /> Sign Up / Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-full h-full bg-primary/10 rounded-lg"></div>
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1473&auto=format&fit=crop"
                  alt="Modern Property in Botswana" 
                  className="w-full h-auto rounded-lg shadow-lg relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property type quick links */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="#property-search" onClick={() => document.getElementById('property-search')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center p-3 btn-premium-ghost rounded-md transition duration-200">
            <Home className="h-8 w-8 text-primary mb-2" />
            <span className="font-medium">Houses</span>
          </Link>
          <Link href="#property-search" onClick={() => document.getElementById('property-search')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center p-3 btn-premium-ghost rounded-md transition duration-200">
            <Building className="h-8 w-8 text-primary mb-2" />
            <span className="font-medium">Apartments</span>
          </Link>
          <Link href="#property-search" onClick={() => document.getElementById('property-search')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center p-3 btn-premium-ghost rounded-md transition duration-200">
            <Info className="h-8 w-8 text-primary mb-2" />
            <span className="font-medium">Commercial</span>
          </Link>
          <Link href="#property-search" onClick={() => document.getElementById('property-search')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center p-3 btn-premium-ghost rounded-md transition duration-200">
            <MapPin className="h-8 w-8 text-primary mb-2" />
            <span className="font-medium">Land</span>
          </Link>
        </div>
      </div>

      {/* Main property search section */}
      <div className="container mx-auto py-12 px-4" id="property-search">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Find Your Dream Property</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use our advanced search tools to find exactly what you're looking for, whether it's a family home, 
            a business location, or an investment opportunity.
          </p>
        </div>

        <PropertySearchComponent 
          onPropertySelect={(property) => {
            console.log("Property selected:", property.id);
          }}
          onPropertyRequest={handlePropertyRequest}
          onPropertyApply={handlePropertyApply}
        />
      </div>

      {/* How it works section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Finding and securing your next property with TOV is simple and streamlined
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Search Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Use our powerful search tools to filter properties by location, type, 
                  size, and budget to find your perfect match.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. Request a Viewing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Schedule a viewing with our property specialists to experience the property 
                  firsthand and get all your questions answered.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Apply and Move In</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Submit your application, sign your lease digitally, and prepare to 
                  move into your new property with our streamlined process.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/auth">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}