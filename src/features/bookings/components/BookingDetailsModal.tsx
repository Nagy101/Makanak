import {
  memo,
  useCallback,
  lazy,
  Suspense,
  Component,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { encodeId } from "@/lib/idEncoder";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useConfirmRefund, useRejectRefund } from "@/features/admin/useAdmin";
import {
  useTenantBookingDetails,
  useOwnerBookingDetails,
  useAdminBookingDetails,
  useCancelBooking,
  useUpdateBookingStatus,
} from "../useBookings";
import BookingStatusBadge from "./BookingStatusBadge";
import { format } from "date-fns";
import {
  Phone,
  MapPin,
  Info,
  CreditCard,
  User,
  ShieldCheck,
  Banknote,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type {
  BookingStatusType,
  TenantBookingDetails,
  OwnerBookingDetails,
  AdminBookingDetails,
} from "../booking.types";

const TenantQRCodeDisplay = lazy(
  () => import("@/features/checkin/components/TenantQRCodeDisplay"),
);

const CANCEL_HIDDEN_STATUSES = new Set([
  "Cancelled",
  "RefundRequested",
  "Refunded",
  "Completed",
  "CheckedIn",
]);

/** Normalise relative backend paths to absolute URLs */
const toUrl = (path: string | null | undefined) =>
  !path ? "/placeholder.svg" : path.startsWith("http") ? path : `/${path}`;

// ── Error Boundary ──────────────────────────────────────────────────────────
class ModalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="py-10 text-center space-y-2">
          <p className="text-destructive font-medium">
            {i18n.t("bookings.somethingWentWrong")}
          </p>
          <p className="text-sm text-muted-foreground">
            {i18n.t("bookings.pleaseCloseAndTry")}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Shared helpers ──────────────────────────────────────────────────────────

const InfoRow = memo(
  ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: React.ReactNode;
  }) => (
    <div>
      <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
      <p className="font-medium text-foreground flex items-center gap-1">
        {icon}
        {value}
      </p>
    </div>
  ),
);
InfoRow.displayName = "InfoRow";

const LoadingSkeleton = () => (
  <div className="space-y-4 py-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

const PropertyImageGallery = memo(
  ({
    propertyName,
    propertyMainImage,
    propertyImages,
  }: {
    propertyName: string;
    propertyMainImage?: string | null;
    propertyImages?: { id: number; imageUrl: string }[];
  }) => {
    const [activeImage, setActiveImage] = useState(toUrl(propertyMainImage));

    useEffect(() => {
      setActiveImage(toUrl(propertyMainImage));
    }, [propertyMainImage]);

    const galleryImages = useMemo(() => {
      const images = [
        toUrl(propertyMainImage),
        ...(propertyImages ?? []).map((image) => toUrl(image.imageUrl)),
      ];

      return images.filter((image, index) => images.indexOf(image) === index);
    }, [propertyMainImage, propertyImages]);

    const hasGallery = galleryImages.length > 1;

    return (
      <div className="space-y-3">
        <div className="rounded-lg overflow-hidden bg-muted aspect-video">
          <img
            src={activeImage}
            alt={propertyName}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>

        {hasGallery && (
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
            {galleryImages.map((image, index) => {
              const isActive = image === activeImage;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  aria-label={`${propertyName} image ${index + 1}`}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-md transition ${
                    isActive
                      ? "ring-2 ring-blue-500"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${propertyName} thumbnail ${index + 1}`}
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
        )}
      </div>
    );
  },
);
PropertyImageGallery.displayName = "PropertyImageGallery";

// ── Tenant Content ──────────────────────────────────────────────────────────

interface TenantContentProps {
  booking: TenantBookingDetails;
  bookingId: number;
  onCancel: () => void;
  onPay?: (id: number) => void;
  onClose: () => void;
  isCancelling: boolean;
}

const TenantBookingContent = memo(
  ({
    booking,
    bookingId,
    onCancel,
    onPay,
    onClose,
    isCancelling,
  }: TenantContentProps) => {
    const { t } = useTranslation();

    const canCancel = !CANCEL_HIDDEN_STATUSES.has(booking.status);
    const canPay = booking.status === "PendingPayment";
    const showQr =
      !!booking.checkInQrCode &&
      ["PaymentReceived", "CheckedIn"].includes(booking.status);

    const platformFee =
      booking.platformFee ?? booking.commissionPaid ?? 0;
    const basePrice =
      booking.basePrice ??
      booking.amountToPayToOwner ??
      Math.max(booking.totalPrice - platformFee, 0);
    const pricePerNight =
      booking.pricePerNight ??
      (booking.totalDays > 0 ? basePrice / booking.totalDays : basePrice);

    return (
      <div className="space-y-5 py-2">
        {/* Property gallery */}
        <PropertyImageGallery
          propertyName={booking.propertyName}
          propertyMainImage={booking.propertyMainImage}
          propertyImages={booking.propertyImages}
        />

        {/* Title + status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {booking.propertyName}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("bookings.ref")} {encodeId(booking.id)}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <Separator />

        {/* Stay dates */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            {t("bookings.stay")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <InfoRow
              label={t("bookings.checkIn")}
              value={format(new Date(booking.checkInDate), "MMM dd, yyyy")}
            />
            <InfoRow
              label={t("bookings.checkOut")}
              value={format(new Date(booking.checkOutDate), "MMM dd, yyyy")}
            />
            <InfoRow
              label={t("bookings.totalNights")}
              value={`${booking.totalDays} ${booking.totalDays !== 1 ? t("common.nights") : t("common.night")}`}
            />
          </div>
        </div>

        <Separator />

        {/* Pricing — transparent invoice-style breakdown for tenant */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            {t("bookings.costBreakdown")}
          </p>
          <div className="rounded-lg border bg-secondary/30 p-3 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  Accommodation ({pricePerNight.toLocaleString()} EGP x {booking.totalDays} {booking.totalDays === 1 ? t("common.night") : t("common.nights")})
                </p>
              </div>
              <p className="font-semibold text-foreground">
                {basePrice.toLocaleString()} EGP
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  Service Fee (Platform Fee)
                </p>
              </div>
              <p className="font-semibold text-foreground">
                {platformFee.toLocaleString()} EGP
              </p>
            </div>

            <Separator className="my-0.5" />

            <div className="flex justify-between font-bold text-foreground text-base">
              <span>{t("bookings.totalCost")}</span>
              <span>{booking.totalPrice.toLocaleString()} EGP</span>
            </div>
          </div>
        </div>

        {/* Special requests */}
        {booking.specialRequests && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                {t("bookings.specialRequests")}
              </p>
              <p className="text-sm text-foreground bg-secondary/30 rounded-lg p-3">
                {booking.specialRequests}
              </p>
            </div>
          </>
        )}

        {/* Check-in info — fields may be null until payment is completed */}
        {(booking.checkInInstructions ||
          booking.ownerPhoneNumber ||
          booking.exactLocationUrl) && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {t("bookings.checkinInfo")}
              </p>
              {booking.checkInInstructions && (
                <div className="flex gap-2 text-sm bg-secondary/30 rounded-lg p-3">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-foreground">
                    {booking.checkInInstructions}
                  </p>
                </div>
              )}
              {booking.ownerPhoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {booking.ownerPhoneNumber}
                  </span>
                </div>
              )}
              {booking.exactLocationUrl && (
                <a
                  href={booking.exactLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <MapPin className="h-4 w-4" />
                  {t("bookings.viewExactLocation")}
                </a>
              )}
            </div>
          </>
        )}

        {/* QR Code — only for tenant after payment */}
        {showQr && (
          <>
            <Separator />
            <Suspense
              fallback={<Skeleton className="h-64 w-full rounded-lg" />}
            >
              <TenantQRCodeDisplay
                qrCodeValue={booking.checkInQrCode!}
                bookingId={booking.id}
                propertyName={booking.propertyName}
              />
            </Suspense>
            {booking.isQrScanned && (
              <Badge
                variant="secondary"
                className="text-xs mx-auto block w-fit"
              >
                {t("bookings.qrAlreadyScanned")}
              </Badge>
            )}
          </>
        )}

        <Separator />

        {/* Tenant actions */}
        <div className="flex gap-2 justify-end">
          {canPay && onPay && (
            <Button
              onClick={() => {
                onPay(bookingId);
                onClose();
              }}
              className="gap-1"
            >
              <CreditCard className="h-4 w-4" />
              {booking.platformFee != null || booking.commissionPaid != null
                ? t("bookings.payPlatformFee", {
                    amount: (
                      booking.platformFee ?? booking.commissionPaid
                    )!.toLocaleString(),
                  })
                : t("bookings.payNow")}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {t("bookings.cancelBooking")}
            </Button>
          )}
        </div>
      </div>
    );
  },
);
TenantBookingContent.displayName = "TenantBookingContent";

// ── Owner Content ───────────────────────────────────────────────────────────

interface OwnerContentProps {
  booking: OwnerBookingDetails;
  bookingId: number;
  onStatusUpdate: (status: BookingStatusType) => void;
  isUpdating: boolean;
  /** Called when the owner clicks "Open Dispute". Receives the booking id. */
  onDispute?: (id: number) => void;
}

const OwnerBookingContent = memo(
  ({
    booking,
    bookingId,
    onStatusUpdate,
    isUpdating,
    onDispute,
  }: OwnerContentProps) => {
    const { t } = useTranslation();
    const canOwnerAct = booking.status === "PendingOwnerApproval";
    const canDispute = ["PaymentReceived", "CheckedIn", "Completed"].includes(
      booking.status,
    );

    return (
      <div className="space-y-5 py-2">
        <PropertyImageGallery
          propertyName={booking.propertyName}
          propertyMainImage={booking.propertyMainImage}
          propertyImages={booking.propertyImages}
        />

        {/* Title + status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {booking.propertyName}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("bookings.ref")} {encodeId(booking.id)}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <Separator />

        {/* Tenant identity */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> {t("bookings.tenant")}
          </p>
          <div className="flex items-center gap-3">
            <img
              src={toUrl(booking.tenantImage)}
              alt={booking.tenantName}
              className="h-12 w-12 rounded-full object-cover border shrink-0"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div>
              <p className="font-medium text-foreground">
                {booking.tenantName}
              </p>
              {booking.tenantPhoneNumber && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <Phone className="h-3.5 w-3.5" />
                  {booking.tenantPhoneNumber}
                </div>
              )}
            </div>
          </div>
          {/* Identity document */}
          {booking.tenantIdentityImage && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />{" "}
                {t("bookings.identityDocument")}
              </p>
              <img
                src={toUrl(booking.tenantIdentityImage)}
                alt="Tenant identity"
                className="rounded-lg border h-32 w-auto object-contain bg-secondary/30"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Stay dates */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            {t("bookings.stay")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <InfoRow
              label={t("bookings.checkIn")}
              value={format(new Date(booking.checkInDate), "MMM dd, yyyy")}
            />
            <InfoRow
              label={t("bookings.checkOut")}
              value={format(new Date(booking.checkOutDate), "MMM dd, yyyy")}
            />
            <InfoRow
              label={t("bookings.totalNights")}
              value={`${booking.totalDays} ${booking.totalDays !== 1 ? t("common.nights") : t("common.night")}`}
            />
          </div>
        </div>

        {/* QR scan status */}
        {booking.isQrScanned && (
          <Badge variant="secondary" className="text-xs w-fit">
            {t("bookings.checkinQrScanned")}
          </Badge>
        )}

        <Separator />

        {/* Financial — owner only sees what the tenant will bring in cash */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5" /> {t("bookings.expectedPayment")}
          </p>
          <div className="rounded-lg border bg-primary/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("bookings.cashFromTenant")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("bookings.tenantPaysDirectly")}
              </p>
            </div>
            <p className="text-2xl font-bold text-primary">
              {booking.amountToPayToOwner.toLocaleString()}{" "}
              <span className="text-sm font-semibold">EGP</span>
            </p>
          </div>
        </div>

        {/* Special requests */}
        {booking.specialRequests && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                {t("bookings.specialRequests")}
              </p>
              <p className="text-sm text-foreground bg-secondary/30 rounded-lg p-3">
                {booking.specialRequests}
              </p>
            </div>
          </>
        )}

        <Separator />

        {/* Owner actions */}
        {(canOwnerAct || canDispute) && (
          <div className="flex gap-2 justify-end flex-wrap">
            {canOwnerAct && (
              <>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => onStatusUpdate("RejectedByOwner")}
                  disabled={isUpdating}
                >
                  {t("bookings.rejectBooking")}
                </Button>
                <Button
                  onClick={() => onStatusUpdate("PendingPayment")}
                  disabled={isUpdating}
                >
                  {t("bookings.approveBooking")}
                </Button>
              </>
            )}
            {canDispute && onDispute && (
              <Button
                variant="outline"
                className="text-warning border-warning/30 hover:bg-warning hover:text-white hover:border-warning"
                onClick={() => onDispute(bookingId)}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                {t("bookings.openDispute")}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  },
);
OwnerBookingContent.displayName = "OwnerBookingContent";

interface AdminContentProps {
  booking: AdminBookingDetails;
}

const AdminBookingContent = memo(({ booking }: AdminContentProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 py-2">
      <PropertyImageGallery
        propertyName={booking.propertyTitle}
        propertyMainImage={booking.propertyMainImage}
        propertyImages={booking.propertyImages}
      />

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {booking.propertyTitle}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("bookings.ref")} {encodeId(booking.id)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <Separator />

      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          {t("bookings.stay")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <InfoRow
            label={t("bookings.checkIn")}
            value={format(new Date(booking.checkInDate), "MMM dd, yyyy")}
          />
          <InfoRow
            label={t("bookings.checkOut")}
            value={format(new Date(booking.checkOutDate), "MMM dd, yyyy")}
          />
          <InfoRow
            label="Created At"
            value={format(new Date(booking.createdAt), "MMM dd, yyyy")}
          />
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Financials
        </p>
        <div className="rounded-lg border bg-secondary/30 p-4 space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow
              label={t("bookings.totalCost")}
              value={`${booking.totalPrice.toLocaleString()} EGP`}
            />
            <InfoRow
              label={t("bookings.platformFee")}
              value={`${booking.commissionPaid.toLocaleString()} EGP`}
            />
            <InfoRow
              label="Transaction ID"
              value={booking.transactionId || "-"}
            />
            <InfoRow
              label="Refunded"
              value={booking.isRefunded ? "Yes" : "No"}
            />
            <InfoRow
              label="Refunded Amount"
              value={`${booking.refundedAmount.toLocaleString()} EGP`}
            />
            <InfoRow
              label="Cancellation Reason"
              value={booking.cancellationReason || "-"}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Parties
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-secondary/30 p-4 space-y-1.5">
            <p className="text-xs uppercase text-muted-foreground">Tenant</p>
            <p className="font-semibold text-foreground">{booking.tenantName}</p>
            <p className="text-sm text-muted-foreground">
              {booking.tenantPhoneNumber || "-"}
            </p>
          </div>
          <div className="rounded-lg border bg-secondary/30 p-4 space-y-1.5">
            <p className="text-xs uppercase text-muted-foreground">Owner</p>
            <p className="font-semibold text-foreground">{booking.ownerName}</p>
            <p className="text-sm text-muted-foreground">
              {booking.ownerPhoneNumber || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
AdminBookingContent.displayName = "AdminBookingContent";

// ── Modal shell ─────────────────────────────────────────────────────────────

interface BookingDetailsModalProps {
  bookingId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "tenant" | "owner" | "admin";
  onPayNow?: (bookingId: number) => void;
  /** Owner only — triggered when "Open Dispute" is clicked inside the modal */
  onDispute?: (bookingId: number) => void;
}

const BookingDetailsModal = memo(
  ({
    bookingId,
    open,
    onOpenChange,
    role,
    onPayNow,
    onDispute,
  }: BookingDetailsModalProps) => {
    const { t } = useTranslation();
    const activeId = open ? bookingId : null;
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
    const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);
    const [refundRejectOpen, setRefundRejectOpen] = useState(false);
    const [refundRejectReason, setRefundRejectReason] = useState("");
    const user = useAuthStore((s) => s.user);
    const userRole = (user?.role || user?.userType || "").toLowerCase();
    const isAdmin = userRole === "admin" || userRole === "administrator";

    // Both hooks are always called (React hook rules).
    // Only the one matching `role` is enabled — the other receives null.
    const { data: tenantBooking, isLoading: tenantLoading } =
      useTenantBookingDetails(role === "tenant" ? activeId : null);
    const { data: ownerBooking, isLoading: ownerLoading } =
      useOwnerBookingDetails(role === "owner" ? activeId : null);
    const { data: adminBooking, isLoading: adminLoading } =
      useAdminBookingDetails(role === "admin" ? activeId : null);

    const cancelMutation = useCancelBooking();
    const updateStatusMutation = useUpdateBookingStatus();
    const confirmRefundMutation = useConfirmRefund();
    const rejectRefundMutation = useRejectRefund();

    const handleCancelConfirm = useCallback(() => {
      if (!bookingId) return;
      cancelMutation.mutate(bookingId, {
        onSuccess: () => setCancelConfirmOpen(false),
      });
    }, [bookingId, cancelMutation]);

    const handleStatusUpdate = useCallback(
      (status: BookingStatusType) => {
        if (!bookingId) return;
        updateStatusMutation.mutate(
          { id: bookingId, data: { bookingId, status } },
          { onSuccess: () => onOpenChange(false) },
        );
      },
      [bookingId, updateStatusMutation, onOpenChange],
    );

    const isLoading = tenantLoading || ownerLoading || adminLoading;
    const activeStatus =
      role === "admin"
        ? adminBooking?.status
        : role === "owner"
        ? ownerBooking?.status
        : role === "tenant"
          ? tenantBooking?.status
          : ownerBooking?.status ?? tenantBooking?.status;
    const canManageRefund = isAdmin && activeStatus === "RefundRequested";
    const isRejectDisabled =
      !refundRejectReason.trim() || rejectRefundMutation.isPending;

    const handleConfirmRefund = useCallback(() => {
      if (!bookingId) return;
      confirmRefundMutation.mutate(bookingId, {
        onSuccess: () => setRefundConfirmOpen(false),
      });
    }, [bookingId, confirmRefundMutation]);

    const handleRejectRefund = useCallback(() => {
      if (!bookingId || !refundRejectReason.trim()) return;
      rejectRefundMutation.mutate(
        { bookingId, reason: refundRejectReason.trim() },
        {
          onSuccess: () => {
            setRefundRejectOpen(false);
            setRefundRejectReason("");
          },
        },
      );
    }, [bookingId, refundRejectReason, rejectRefundMutation]);

    return (
      <>
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            onOpenChange(nextOpen);
            if (!nextOpen) setCancelConfirmOpen(false);
          }}
        >
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("bookings.bookingDetails")}</DialogTitle>
            </DialogHeader>

            <ModalErrorBoundary>
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  {role === "tenant" && tenantBooking ? (
                    <TenantBookingContent
                      booking={tenantBooking}
                      bookingId={bookingId!}
                      onCancel={() => setCancelConfirmOpen(true)}
                      onPay={onPayNow}
                      onClose={() => onOpenChange(false)}
                      isCancelling={cancelMutation.isPending}
                    />
                  ) : role === "owner" && ownerBooking ? (
                    <OwnerBookingContent
                      booking={ownerBooking}
                      bookingId={bookingId!}
                      onStatusUpdate={handleStatusUpdate}
                      isUpdating={updateStatusMutation.isPending}
                      onDispute={onDispute}
                    />
                  ) : role === "admin" && adminBooking ? (
                    <AdminBookingContent booking={adminBooking} />
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      {t("bookings.bookingNotFound")}
                    </p>
                  )}

                  {canManageRefund && (
                    <div className="mt-4 rounded-lg border bg-secondary/30 p-4">
                      <p className="text-sm font-semibold text-foreground mb-3">
                        Refund Requested
                      </p>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setRefundRejectOpen(true)}
                        >
                          Reject Refund
                        </Button>
                        <Button
                          onClick={() => setRefundConfirmOpen(true)}
                        >
                          Confirm Refund
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </ModalErrorBoundary>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={cancelConfirmOpen}
          onOpenChange={setCancelConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? The platform's
                cancellation and refund policy will be applied.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  handleCancelConfirm();
                }}
                disabled={cancelMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {cancelMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirm Cancel
                  </span>
                ) : (
                  "Confirm Cancel"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={refundConfirmOpen}
          onOpenChange={setRefundConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
              <AlertDialogDescription>
                Have you successfully processed the manual refund via the
                payment gateway dashboard? This action will finalize the refund
                in our system and notify the tenant.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  handleConfirmRefund();
                }}
                disabled={confirmRefundMutation.isPending}
              >
                {confirmRefundMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirm Refund
                  </span>
                ) : (
                  "Confirm Refund"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog
          open={refundRejectOpen}
          onOpenChange={(nextOpen) => {
            setRefundRejectOpen(nextOpen);
            if (!nextOpen && !rejectRefundMutation.isPending) {
              setRefundRejectReason("");
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Refund</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Rejection Reason
                </label>
                <Textarea
                  value={refundRejectReason}
                  onChange={(e) => setRefundRejectReason(e.target.value)}
                  placeholder="Provide a reason for rejecting this refund"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRefundRejectOpen(false)}
                  disabled={rejectRefundMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectRefund}
                  disabled={isRejectDisabled}
                >
                  {rejectRefundMutation.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Reject Refund
                    </span>
                  ) : (
                    "Reject Refund"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

BookingDetailsModal.displayName = "BookingDetailsModal";
export default BookingDetailsModal;
