import React from 'react';
import { motion } from 'framer-motion';
import { Building, Heart, Share2, Bed, Bath, MapPin, ArrowUpRight, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';

interface PropertyGridProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

// We've renamed the component to reflect the new design
export default function PinterestPropertyGrid({ properties, onPropertyClick }: PropertyGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <motion.div
          key={property.id}
          className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => onPropertyClick(property)}
        >
          {/* Property Image */}
          <div className="relative w-full overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.address}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="w-full aspect-[16/10] bg-gray-100 flex items-center justify-center text-gray-400">
                <Building size={48} />
              </div>
            )}
            
            {/* Status badge */}
            {property.available && (
              <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600 text-white">
                Available
              </Badge>
            )}
            
            {/* Type badge */}
            <Badge className="absolute top-3 right-3 bg-primary/90 hover:bg-primary text-white">
              {property.propertyType}
            </Badge>
            
            {/* Quick action buttons */}
            <div className="absolute bottom-3 right-3 flex space-x-2">
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white">
                <Bookmark className="h-4 w-4 text-gray-700" />
              </Button>
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white">
                <Share2 className="h-4 w-4 text-gray-700" />
              </Button>
            </div>
          </div>
          
          {/* Property details */}
          <div className="p-5 flex-grow flex flex-col">
            {/* Price */}
            <div className="mb-3">
              <p className="text-xl font-semibold text-primary">
                {formatCurrency(property.rentAmount)}
                <span className="text-sm text-gray-500 font-normal"> / month</span>
              </p>
            </div>
            
            {/* Title and location */}
            <h3 className="font-medium text-lg mb-1 line-clamp-1">{property.address}</h3>
            <p className="text-gray-500 text-sm mb-3 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1 inline-flex shrink-0" />
              <span className="line-clamp-1">{property.city}, {property.state}</span>
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mt-1 mb-3">
              <div className="flex items-center text-gray-700">
                <Bed className="h-4 w-4 mr-2 text-gray-500" />
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Bath className="h-4 w-4 mr-2 text-gray-500" />
                <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
              </div>
              {property.squareFeet && (
                <div className="flex items-center text-gray-700 col-span-2">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{property.squareFeet} sq ft</span>
                </div>
              )}
            </div>
            
            {/* View button (at the bottom with margin-top:auto to push to bottom) */}
            <div className="mt-auto pt-3 border-t">
              <Button 
                variant="outline" 
                className="w-full mt-2 font-medium border-primary/20 text-primary hover:text-primary hover:bg-primary/5"
              >
                View Property
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}