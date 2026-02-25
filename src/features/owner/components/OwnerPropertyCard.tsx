import { memo } from 'react';
import { Star, MapPin, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OwnerPropertyListing } from '../owner.types';

const STATUS_VARIANT: Record<string, string> = {
  Accepted: 'bg-success text-success-foreground',
  Pending: 'bg-warning text-warning-foreground',
  Rejected: 'bg-destructive text-destructive-foreground',
  Banned: 'bg-destructive text-destructive-foreground',
};

interface Props {
  property: OwnerPropertyListing;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewReviews: (id: number) => void;
}

const OwnerPropertyCard = memo(({ property, onEdit, onDelete, onViewReviews }: Props) => (
  <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
      <img
        src={property.mainImageUrl}
        alt={property.title}
        loading="lazy"
        width={400}
        height={300}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />
      <Badge className={`absolute top-3 left-3 text-xs font-medium ${STATUS_VARIANT[property.propertyStatus] || 'bg-secondary text-secondary-foreground'}`}>
        {property.propertyStatus}
      </Badge>
      {property.propertyType && (
        <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs">
          {property.propertyType}
        </Badge>
      )}
    </div>

    <div className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground line-clamp-1 text-base">{property.title}</h3>
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

      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-primary">{property.pricePerNight.toLocaleString()} EGP</span>
        <span className="text-sm text-muted-foreground">/ night</span>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(property.id)}>
          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-[#1E3A8A] border-[#1E3A8A]/30 hover:bg-[#1E3A8A]/10"
          onClick={() => onViewReviews(property.id)}
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Reviews
        </Button>
        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => onDelete(property.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  </article>
));

OwnerPropertyCard.displayName = 'OwnerPropertyCard';
export default OwnerPropertyCard;
