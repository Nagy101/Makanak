import { useNavigate } from "react-router-dom";
import { Star, MapPin, BedDouble } from "lucide-react";
import { encodeId } from "@/lib/idEncoder";
import type { PropertyListing } from "../property.types";

interface Props {
  property: PropertyListing;
}

export default function PropertyCard({ property }: Props) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/properties/${encodeId(property.id)}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-card transition-premium hover:shadow-card-hover hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[16/11] overflow-hidden bg-muted">
        <img
          src={property.mainImageUrl}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {property.propertyType && (
          <span className="absolute top-3 left-3 rounded-full bg-primary/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            {property.propertyType}
          </span>
        )}
        {property.averageRating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1">
            <Star className="h-3 w-3 fill-white text-white" />
            <span className="text-xs font-semibold text-white">
              {property.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <h3 className="font-semibold text-foreground line-clamp-1 text-[15px] leading-snug group-hover:text-primary transition-colors duration-200">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="text-sm truncate">{property.governorateName}</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-primary">
              {property.pricePerNight.toLocaleString()} EGP
            </span>
            <span className="text-xs text-muted-foreground">/ night</span>
          </div>
          <span className="text-xs text-muted-foreground rounded-full bg-secondary px-2 py-0.5">
            View &rarr;
          </span>
        </div>
      </div>
    </article>
  );
}
