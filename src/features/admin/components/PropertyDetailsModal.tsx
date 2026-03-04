import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import {
  X,
  MapPin,
  DollarSign,
  Users,
  Building2,
  Bed,
  Bath,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperty } from "@/features/properties/useProperties";
import { useUpdatePropertyStatus } from "../useAdmin";
import type { PropertyStatus } from "../admin.types";
import { toast } from "sonner";

interface PropertyDetailsModalProps {
  propertyId: number | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  Accepted: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
  Banned: "bg-destructive/10 text-destructive",
};

const PropertyDetailsModal = memo<PropertyDetailsModalProps>(
  ({ propertyId, onClose }) => {
    const { t } = useTranslation();
    const localized = useLocalizedField();
    const { data: property, isLoading } = useProperty(propertyId);
    const mutation = useUpdatePropertyStatus();
    const [newStatus, setNewStatus] = useState<PropertyStatus | "">("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [showReasonInput, setShowReasonInput] = useState(false);

    const handleStatusChange = useCallback((status: PropertyStatus) => {
      setNewStatus(status);
      if (status === "Rejected") {
        setShowReasonInput(true);
      } else {
        setShowReasonInput(false);
      }
    }, []);

    const handleApplyStatus = useCallback(() => {
      if (!propertyId || !newStatus) {
        toast.error(t("admin.selectStatusError"));
        return;
      }

      if (newStatus === "Rejected" && !rejectionReason.trim()) {
        toast.error(t("admin.provideRejectionReason"));
        return;
      }

      mutation.mutate(
        {
          propertyId,
          newStatus,
          rejectedReason:
            newStatus === "Rejected" ? rejectionReason : undefined,
        },
        {
          onSuccess: () => {
            toast.success(t("admin.statusUpdatedTo", { status: newStatus }));
            setNewStatus("");
            setRejectionReason("");
            setShowReasonInput(false);
            onClose();
          },
        },
      );
    }, [propertyId, newStatus, rejectionReason, mutation, onClose]);

    return (
      <Dialog open={propertyId !== null} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {t("admin.propertyDetails")}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : !property ? (
            <p className="py-8 text-center text-muted-foreground">
              {t("admin.noPropertyData")}
            </p>
          ) : (
            <div className="space-y-6 py-2">
              {/* Main Image */}
              {property.mainImageUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={property.mainImageUrl}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Title & Status */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {property.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={
                      statusColors[property.propertyStatus ?? "Pending"]
                    }
                  >
                    {property.propertyStatus ?? "Pending"}
                  </Badge>
                  <Badge variant="outline">{property.propertyType}</Badge>
                </div>
              </div>

              <Separator />

              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t("admin.priceNight")}
                  </p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-semibold">
                      {property.pricePerNight}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t("properties.bedrooms")}
                  </p>
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{property.bedrooms}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t("properties.bathrooms")}
                  </p>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{property.bathrooms}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t("properties.maxGuests")}
                  </p>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{property.maxGuests}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {t("properties.description")}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {t("properties.location")}
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{property.address}</p>
                  <p className="text-xs">
                    {property.areaName}, {property.governorateName}
                  </p>
                  <p className="text-xs">
                    {t("properties.area")}: {property.area}{" "}
                    {t("properties.sqm")}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {t("properties.amenities")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <Badge key={amenity.id} variant="secondary">
                        {localized(
                          amenity.nameEn || amenity.name,
                          amenity.nameAr,
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Status Management */}
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  {t("admin.updateStatus")}
                </p>

                <Select
                  value={newStatus}
                  onValueChange={(val) =>
                    handleStatusChange(val as PropertyStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.selectNewStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Banned">Banned</SelectItem>
                  </SelectContent>
                </Select>

                {showReasonInput && (
                  <Textarea
                    placeholder={t("admin.reasonForRejection")}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="resize-none h-20"
                  />
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={mutation.isPending}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleApplyStatus}
                    disabled={mutation.isPending || !newStatus}
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {t("admin.applyStatus")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

PropertyDetailsModal.displayName = "PropertyDetailsModal";
export default PropertyDetailsModal;
