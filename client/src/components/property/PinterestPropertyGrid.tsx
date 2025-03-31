import React from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { Building, Heart, Share2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@shared/schema';

interface PinterestPropertyGridProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

export default function PinterestPropertyGrid({ properties, onPropertyClick }: PinterestPropertyGridProps) {
  // Responsive breakpoints for the masonry grid
  const breakpointColumnsObj = {
    default: 4,
    1400: 3,
    1000: 2,
    600: 1
  };

  // Format currency to BWP
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'BWP',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {properties.map((property) => (
        <motion.div
          key={property.id}
          className="mb-4 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5 }}
          onClick={() => onPropertyClick(property)}
        >
          {/* Property Image */}
          <div className="relative w-full">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.address}
                className="w-full object-cover"
                style={{ minHeight: '200px' }}
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-gray-200 flex items-center justify-center text-gray-400">
                <Building size={48} />
              </div>
            )}
            
            {/* Overlay actions that appear on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="rounded-full">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" className="rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Status badge */}
            {property.available && (
              <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                Available
              </Badge>
            )}
            
            {/* Price badge */}
            <Badge className="absolute bottom-2 left-2 bg-white text-black font-semibold px-3 py-1 text-sm">
              {formatCurrency(property.rentAmount)} / month
            </Badge>
          </div>
          
          {/* Property details */}
          <div className="p-4 bg-white">
            <h3 className="font-medium text-lg mb-1 truncate">{property.address}</h3>
            <p className="text-gray-500 text-sm mb-2 truncate">{property.city}, {property.state}</p>
            
            <div className="flex justify-between text-sm mt-2">
              <div className="flex gap-2">
                <span className="text-gray-700">{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                <span>•</span>
                <span className="text-gray-700">{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                {property.squareFeet && (
                  <>
                    <span>•</span>
                    <span className="text-gray-700">{property.squareFeet} sqft</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t flex justify-between items-center">
              <span className="text-sm text-gray-500">{property.propertyType}</span>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                View <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </Masonry>
  );
}