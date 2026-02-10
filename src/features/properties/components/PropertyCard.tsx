import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PropertyListing } from '../property.types';

interface Props {
  property: PropertyListing;
}

export default function PropertyCard({ property }: Props) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/properties/${property.id}`)}
      className="group cursor-pointer overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={property.mainImageUrl}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {property.propertyType && (
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-medium">
            {property.propertyType}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1 text-base group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          {property.averageRating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-sm font-medium text-foreground">{property.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-sm">{property.governorateName}</span>
        </div>

        <div className="flex items-baseline gap-1 pt-1">
          <span className="text-lg font-bold text-primary">
            {property.pricePerNight.toLocaleString()} EGP
          </span>
          <span className="text-sm text-muted-foreground">/ night</span>
        </div>
      </div>
    </article>
  );
}
