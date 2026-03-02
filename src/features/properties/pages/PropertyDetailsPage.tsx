import { useParams, Link } from "react-router-dom";
import { decodeId } from "@/lib/idEncoder";
import { useProperty } from "../useProperties";
import { mapIcon } from "../utils/mapIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  MapPin,
  Bed,
  Bath,
  Users,
  Maximize2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import UserNavbar from "@/components/UserNavbar";
import PropertyReviewsSection from "@/features/reviews/components/PropertyReviewsSection";

const CreateBookingWidget = lazy(
  () => import("@/features/bookings/components/CreateBookingWidget"),
);

export default function PropertyDetailsPage() {
  const { t } = useTranslation();
  const localized = useLocalizedField();
  const { id: encodedId } = useParams<{ id: string }>();
  const propertyId = encodedId ? decodeId(encodedId) : null;
  const { data: property, isLoading } = useProperty(propertyId ?? 0);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Skeleton className="h-5 w-36 mb-6 rounded-full" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl mb-4" />
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-24 rounded-xl shrink-0" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-[480px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="rounded-3xl bg-muted/60 p-10 mb-6">
            <Home className="h-14 w-14 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {t("properties.propertyNotFound")}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {t("properties.propertyNotFoundDesc")}
          </p>
          <Button asChild variant="outline">
            <Link to="/properties">
              <ArrowLeft className="h-4 w-4 mr-2" />{" "}
              {t("properties.backToListings")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const allImages = [
    { id: 0, imageUrl: property.mainImageUrl },
    ...property.propertyImages,
  ];

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb back link */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-5 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link to="/properties">
            <ArrowLeft className="h-4 w-4 mr-1.5" />{" "}
            {t("properties.backToSearch")}
          </Link>
        </Button>

        {/* ── TOP: Image + Booking side by side ── */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Left col (2/3): gallery */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3] shadow-sm">
              <img
                src={allImages[activeImage]?.imageUrl}
                alt={property.title}
                className="h-full w-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />

              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              {/* Image counter badge */}
              {allImages.length > 1 && (
                <span className="absolute bottom-4 right-4 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1">
                  {activeImage + 1} / {allImages.length}
                </span>
              )}

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImage(
                        (prev) =>
                          (prev - 1 + allImages.length) % allImages.length,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-md p-2.5 shadow-md hover:bg-black/70 transition-all hover:scale-105 border border-white/10"
                    aria-label={t("properties.previousImage")}
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImage((prev) => (prev + 1) % allImages.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-md p-2.5 shadow-md hover:bg-black/70 transition-all hover:scale-105 border border-white/10"
                    aria-label={t("properties.nextImage")}
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`rounded-full transition-all duration-200 ${
                          i === activeImage
                            ? "w-5 h-2 bg-white"
                            : "w-2 h-2 bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {allImages.map((img, i) => (
                  <button
                    key={img.id ?? i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 rounded-xl overflow-hidden transition-all duration-200 ${
                      i === activeImage
                        ? "ring-2 ring-primary ring-offset-2 opacity-100 scale-[1.03]"
                        : "opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="h-16 w-24 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* end left col */}

          {/* Right col (1/3): booking widget — sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Suspense
                fallback={<Skeleton className="h-[480px] w-full rounded-2xl" />}
              >
                <CreateBookingWidget
                  propertyId={property.id}
                  pricePerNight={property.pricePerNight}
                  maxGuests={property.maxGuests}
                />
              </Suspense>
              <div className="rounded-2xl border bg-card px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  {t("properties.address")}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {property.address}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* end top grid */}

        {/* ── BOTTOM: Property details full width ── */}
        <div className="space-y-8">
          {/* Property header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="rounded-full px-3 text-xs font-medium"
              >
                {property.propertyType}
              </Badge>
              {property.propertyStatus && (
                <Badge
                  variant="outline"
                  className={`rounded-full px-3 text-xs font-medium ${
                    property.propertyStatus === "Accepted"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {property.propertyStatus}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {property.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {property.areaName}, {property.governorateName}
              </span>
              {property.averageRating > 0 && (
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {property.averageRating.toFixed(1)}
                  <span className="text-muted-foreground font-normal">
                    {t("properties.rating")}
                  </span>
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: Bed,
                label: t("properties.bedrooms"),
                value: property.bedrooms,
              },
              {
                icon: Bath,
                label: t("properties.bathrooms"),
                value: property.bathrooms,
              },
              {
                icon: Users,
                label: t("properties.maxGuests"),
                value: property.maxGuests,
              },
              {
                icon: Maximize2,
                label: t("properties.area"),
                value: `${property.area} ${t("properties.sqm")}`,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-4 text-center shadow-sm"
              >
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-3">
              {t("properties.aboutThisProperty")}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">
                {t("properties.amenities")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => {
                  const Icon = mapIcon(amenity.icon);
                  const label =
                    localized(amenity.nameEn, amenity.nameAr) ||
                    amenity.name ||
                    "Unknown";
                  return (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm hover:border-primary/30 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <PropertyReviewsSection propertyId={property.id} />
          </div>
        </div>
        {/* end bottom section */}
      </div>
    </div>
  );
}
