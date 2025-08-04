import { ExtendedProperty } from '@/types/propertyExtensions';
import { usePropertyTypes } from '@/hooks/usePropertyTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Eye, 
  Phone, 
  FileText, 
  MapPin,
  BedDouble,
  Bath,
  Square,
  Star,
  Building2,
  Home,
  Building,
  Store,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PropertyImage } from '@/components/ui/PropertyImage';

interface PropertyCardProps {
  property: ExtendedProperty;
  onAction?: (property: ExtendedProperty, action: string) => void;
  viewMode?: 'grid' | 'list';
  showMaintenanceStats?: boolean;
}

export function PropertyCard({ 
  property, 
  onAction, 
  viewMode = 'grid',
  showMaintenanceStats = false 
}: PropertyCardProps) {
  const { getConfig, getDisplayConfig, getFormattedPrice, getPropertyMetrics } = usePropertyTypes();
  
  const config = getConfig(property.propertyType);
  const displayConfig = getDisplayConfig(property);
  const metrics = getPropertyMetrics(property);
  
  const handleAction = (action: string) => {
    console.log('PropertyCard: Button clicked', { action, propertyId: property.id, propertyTitle: property.title });
    if (onAction) {
      onAction(property, action);
    } else {
      console.log('PropertyCard: No onAction handler provided');
    }
  };

  const getPropertyTypeIcon = () => {
    switch (config.icon) {
      case 'Home': return <Home className="h-4 w-4" />;
      case 'Building2': return <Building2 className="h-4 w-4" />;
      case 'Building': return <Building className="h-4 w-4" />;
      case 'Store': return <Store className="h-4 w-4" />;
      case 'Square': return <Square className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getPropertyTypeBadge = () => {
    return (
      <Badge className={config.color} variant="secondary">
        {getPropertyTypeIcon()}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getListingTypeBadge = () => {
    if (property.listingType === 'sale') {
      return (
        <Badge variant="outline" className="bg-accent/10 text-primary border-purple-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          For Sale
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
        <Calendar className="h-3 w-3 mr-1" />
        For Rent
      </Badge>
    );
  };

  const getPriceDisplay = () => {
    const formattedPrice = getFormattedPrice(property);
    const priceColor = property.listingType === 'sale' ? 'text-primary' : 'text-primary';
    
    return (
      <div className={`text-lg font-bold ${priceColor}`}>
        <DollarSign className="h-4 w-4 inline mr-1" />
        {formattedPrice}
      </div>
    );
  };

  const getMetricIcon = (iconName?: string) => {
    switch (iconName) {
      case 'BedDouble': return <BedDouble className="h-4 w-4 mr-1" />;
      case 'Bath': return <Bath className="h-4 w-4 mr-1" />;
      case 'Square': return <Square className="h-4 w-4 mr-1" />;
      case 'MapPin': return <MapPin className="h-4 w-4 mr-1" />;
      case 'Car': return <Car className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const getMaintenanceStatsDisplay = () => {
    if (!showMaintenanceStats || !property.maintenanceStats) return null;

    return (
      <div className="mb-3 p-2 bg-success/10 rounded-lg border border-success/30">
        <div className="flex items-center justify-between text-xs text-success-foreground mb-1">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Avg Response: {property.maintenanceStats.averageResponseTime}h
          </span>
          <span className="flex items-center">
            <Star className="h-3 w-3 mr-1" />
            {property.maintenanceStats.landlordRating}/5
          </span>
        </div>
        <div className="text-xs text-success-foreground">
          Last maintenance: {property.maintenanceStats.lastMaintenanceDate ? new Date(property.maintenanceStats.lastMaintenanceDate).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-48 sm:h-32 bg-gray-200 relative flex-shrink-0">
            <PropertyImage
              src={property.images?.[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <Badge variant={property.available ? "default" : "secondary"} className="text-xs">
                {property.available ? "Available" : "Rented"}
              </Badge>
              {getListingTypeBadge()}
            </div>
          </div>
          
          <CardContent className="flex-1 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
              <h3 className="font-semibold text-base sm:text-lg line-clamp-2 sm:line-clamp-1">{property.title}</h3>
              <div className="flex gap-2 flex-shrink-0">
                {getPropertyTypeBadge()}
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 flex items-center">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{property.address}</span>
            </p>
            
            <div className="flex items-center gap-3 sm:gap-4 mb-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
              {metrics.slice(0, 3).map((metric, index) => (
                <span key={index} className="flex items-center whitespace-nowrap">
                  {getMetricIcon(metric.icon)}
                  {metric.value}
                </span>
              ))}
            </div>

            {getMaintenanceStatsDisplay()}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {getPriceDisplay()}
              
              <div className="flex gap-2 flex-wrap">
                {property.listingType === 'rental' ? (
                  <Button 
                    size="sm"
                    onClick={() => handleAction('apply')}
                    className="flex-1 sm:flex-none text-xs"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Apply Now</span>
                    <span className="sm:hidden">Apply</span>
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => handleAction('contact')}
                    className="flex-1 sm:flex-none text-xs"
                  >
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Contact Agent</span>
                    <span className="sm:hidden">Contact</span>
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAction('view')}
                  className="px-2 sm:px-3 touch-manipulation"
                  aria-label="View property details"
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAction('favorite')}
                  className="px-2 sm:px-3 touch-manipulation"
                  aria-label="Add to favorites"
                >
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-200 relative">
        <PropertyImage
          src={property.images?.[0]}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 touch-manipulation" 
              onClick={() => handleAction('favorite')}
              aria-label="Add to favorites"
            >
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Badge variant={property.available ? "default" : "secondary"} className="text-xs">
              {property.available ? "Available" : "Rented"}
            </Badge>
          </div>
          {getListingTypeBadge()}
        </div>
      </div>
      
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{property.title}</h3>
          <div className="flex-shrink-0">
            {getPropertyTypeBadge()}
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 flex items-center">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </p>
        
        <div className="flex items-center gap-3 sm:gap-4 mb-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
          {metrics.slice(0, 3).map((metric, index) => (
            <span key={index} className="flex items-center whitespace-nowrap">
              {getMetricIcon(metric.icon)}
              {metric.value}
            </span>
          ))}
        </div>

        {getMaintenanceStatsDisplay()}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          {getPriceDisplay()}
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary mr-1" />
            <span className="hidden sm:inline">4.5 (12 reviews)</span>
            <span className="sm:hidden">4.5★</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {property.listingType === 'rental' ? (
            <Button 
              size="sm" 
              className="flex-1 text-xs sm:text-sm touch-manipulation"
              onClick={() => handleAction('apply')}
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Apply Now</span>
              <span className="sm:hidden">Apply</span>
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="flex-1 text-xs sm:text-sm touch-manipulation"
              onClick={() => handleAction('contact')}
            >
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Contact Agent</span>
              <span className="sm:hidden">Contact</span>
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleAction('view')}
            className="px-2 sm:px-3 touch-manipulation"
            aria-label="View property details"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PropertyCard;