import { useParams, Link } from 'react-router-dom';
import { useProperty } from '../useProperties';
import { mapIcon } from '../utils/mapIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Star, MapPin, Bed, Bath, Users, Maximize2, ArrowLeft,
  ChevronLeft, ChevronRight, Calendar,
} from 'lucide-react';
import { useState } from 'react';

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useProperty(Number(id));
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="aspect-[16/9] w-full rounded-xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/30">
        <h2 className="text-xl font-semibold mb-2">Property not found</h2>
        <Button asChild variant="outline">
          <Link to="/properties"><ArrowLeft className="h-4 w-4 mr-2" /> Back to listings</Link>
        </Button>
      </div>
    );
  }

  const allImages = [
    { id: 0, imageUrl: property.mainImageUrl },
    ...property.propertyImages,
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Top bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/properties"><ArrowLeft className="h-4 w-4 mr-2" /> Back to search</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Image gallery */}
        <div className="relative mb-8 rounded-xl overflow-hidden bg-muted aspect-[16/9] max-h-[520px]">
          <img
            src={allImages[activeImage]?.imageUrl}
            alt={property.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm p-2 shadow hover:bg-card transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveImage((prev) => (prev + 1) % allImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm p-2 shadow hover:bg-card transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeImage ? 'w-6 bg-primary-foreground' : 'w-2 bg-primary-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {allImages.map((img, i) => (
              <button
                key={img.id ?? i}
                onClick={() => setActiveImage(i)}
                className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeImage ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt=""
                  className="h-16 w-24 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Content + Booking sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{property.propertyType}</Badge>
                {property.propertyStatus && (
                  <Badge
                    className={`text-xs ${
                      property.propertyStatus === 'Accepted'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-warning/10 text-warning border-warning/20'
                    }`}
                    variant="outline"
                  >
                    {property.propertyStatus}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{property.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {property.areaName}, {property.governorateName}
                </span>
                {property.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" /> {property.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Bed, label: 'Bedrooms', value: property.bedrooms },
                { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
                { icon: Users, label: 'Max Guests', value: property.maxGuests },
                { icon: Maximize2, label: 'Area', value: `${property.area} m²` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="font-semibold text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">About this property</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            <Separator />

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => {
                    const Icon = mapIcon(amenity.icon);
                    return (
                      <div key={amenity.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                        <Icon className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-sm text-foreground">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Booking card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-0 ring-1 ring-border">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {property.pricePerNight.toLocaleString()} EGP
                  </span>
                  <span className="text-muted-foreground">/ night</span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">CHECK-IN</label>
                      <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <input type="date" className="text-sm bg-transparent outline-none w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">CHECK-OUT</label>
                      <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <input type="date" className="text-sm bg-transparent outline-none w-full" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">GUESTS</label>
                    <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <select className="text-sm bg-transparent outline-none w-full">
                        {Array.from({ length: property.maxGuests }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'guest' : 'guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 text-base font-semibold" size="lg">
                  Book Now
                </Button>

                <p className="text-center text-xs text-muted-foreground">You won't be charged yet</p>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-foreground font-medium text-right max-w-[60%]">{property.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
