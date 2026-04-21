import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import {
  Building2,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  Users,
  User,
  Mail,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showErrorMessage, showSuccessMessage } from "@/lib/appMessage";
import { mapIcon } from "@/features/properties/utils/mapIcon";
import { useAdminPropertyDetails, useUpdatePropertyStatus } from "../useAdmin";

interface AdminReviewModalProps {
  propertyId: number | null;
  onClose: () => void;
}

const toUrl = (path: string | null | undefined) =>
  !path ? "/placeholder.svg" : path.startsWith("http") ? path : `/${path}`;

const AdminReviewModal = memo<AdminReviewModalProps>(({ propertyId, onClose }) => {
  const { t } = useTranslation();
  const localized = useLocalizedField();
  const { data: property, isLoading } = useAdminPropertyDetails(propertyId);
  const mutation = useUpdatePropertyStatus();

  const [activeImage, setActiveImage] = useState<string>("/placeholder.svg");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setActiveImage(toUrl(property?.mainImageUrl));
    setRejectReason("");
  }, [property?.mainImageUrl, propertyId]);

  const galleryImages = useMemo(() => {
    if (!property) return ["/placeholder.svg"];

    const urls = [
      toUrl(property.mainImageUrl),
      ...(property.propertyImages ?? []).map((image) => toUrl(image.imageUrl)),
    ];

    return urls.filter((url, index) => urls.indexOf(url) === index);
  }, [property]);

  const handleApprove = useCallback(() => {
    if (!propertyId) return;

    mutation.mutate(
      { propertyId, newStatus: "Accepted" },
      {
        onSuccess: () => {
          showSuccessMessage("admin.propertyApproved");
          onClose();
        },
      },
    );
  }, [mutation, onClose, propertyId]);

  const handleReject = useCallback(() => {
    if (!propertyId) return;

    if (!rejectReason.trim()) {
      showErrorMessage("admin.provideRejectionReason");
      return;
    }

    mutation.mutate(
      {
        propertyId,
        newStatus: "Rejected",
        rejectedReason: rejectReason.trim(),
      },
      {
        onSuccess: () => {
          showSuccessMessage("admin.propertyRejected");
          onClose();
        },
      },
    );
  }, [mutation, onClose, propertyId, rejectReason]);

  const details = property
    ? [
        {
          label: t("admin.priceNight"),
          value: `${property.pricePerNight} ${t("common.egp")}`,
          icon: DollarSign,
        },
        {
          label: t("properties.area"),
          value: `${property.area} ${t("properties.sqm")}`,
          icon: Ruler,
        },
        {
          label: t("properties.bedrooms"),
          value: String(property.bedrooms),
          icon: Bed,
        },
        {
          label: t("properties.bathrooms"),
          value: String(property.bathrooms),
          icon: Bath,
        },
        {
          label: t("properties.maxGuests"),
          value: String(property.maxGuests),
          icon: Users,
        },
      ]
    : [];

  return (
    <Dialog open={propertyId !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-background/95 backdrop-blur-md border-white/20 shadow-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5 text-primary" />
            {t("admin.propertyDetails")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-72 w-full rounded-xl" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          </div>
        ) : !property ? (
          <p className="px-6 pb-6 text-center text-muted-foreground">
            {t("admin.noPropertyData")}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-5">
              <section className="space-y-3 lg:col-span-3">
                <div className="overflow-hidden rounded-xl border bg-muted aspect-[16/10]">
                  <img
                    src={activeImage}
                    alt={property.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((image, index) => {
                    const isActive = image === activeImage;
                    return (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(image)}
                        aria-label={`${property.title} image ${index + 1}`}
                        className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border transition ${
                          isActive
                            ? "ring-2 ring-blue-500 border-blue-500"
                            : "opacity-70 hover:opacity-100 border-transparent"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${property.title} thumbnail ${index + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4 lg:col-span-2">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{property.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{property.propertyType}</Badge>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      {property.propertyStatus ?? "Pending"}
                    </Badge>
                  </div>
                </div>

                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t("admin.ownerProfile")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>{property.ownerName || t("admin.notProvided")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="break-all">{property.ownerEmail || t("admin.notProvided")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{property.ownerPhoneNumber || t("admin.notProvided")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t("admin.propertyDetails")}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    {details.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="rounded-lg border bg-muted/30 p-3">
                        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
                        <p className="flex items-center gap-1 font-semibold text-foreground">
                          <Icon className="h-4 w-4 text-primary" />
                          {value}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t("properties.amenities")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {property.amenities?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity, index) => {
                          const Icon = mapIcon(amenity.icon || "");
                          return (
                            <span
                              key={`${amenity.nameEn || amenity.name || "amenity"}-${index}`}
                              className="inline-flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1 text-xs font-medium"
                            >
                              {amenity.icon ? (
                                <Icon className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Home className="h-3.5 w-3.5 text-primary" />
                              )}
                              {localized(amenity.nameEn || amenity.name || "-", amenity.nameAr)}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("admin.notProvided")}</p>
                    )}
                  </CardContent>
                </Card>
              </section>
            </div>

            <Separator />

            <div className="space-y-3 p-6 pt-4">
              <Textarea
                placeholder={t("admin.reasonForRejection")}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[80px] resize-none"
              />

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="destructive"
                  className="sm:min-w-32"
                  onClick={handleReject}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {t("admin.reject")}
                </Button>

                <Button
                  className="sm:min-w-32 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleApprove}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {t("admin.approve")}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});

AdminReviewModal.displayName = "AdminReviewModal";
export default AdminReviewModal;
