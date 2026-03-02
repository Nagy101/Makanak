import { memo, useCallback, lazy, Suspense, Component } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { encodeId } from "@/lib/idEncoder";
import {
  useTenantBookingDetails,
  useOwnerBookingDetails,
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
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import type {
  BookingStatusType,
  TenantBookingDetails,
  OwnerBookingDetails,
} from "../booking.types";

const TenantQRCodeDisplay = lazy(
  () => import("@/features/checkin/components/TenantQRCodeDisplay"),
);

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

// ── Tenant Content ──────────────────────────────────────────────────────────

interface TenantContentProps {
  booking: TenantBookingDetails;
  bookingId: number;
  onCancel: () => void;
  onPay?: (id: number) => void;
  onClose: () => void;
  isCancelling: boolean;
}

/** Platform fee percentage charged online (10 %) */
const PLATFORM_FEE_RATE = 0.1;

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
    const canCancel = ["PendingOwnerApproval", "PendingPayment"].includes(
      booking.status,
    );
    const canPay = booking.status === "PendingPayment";
    const showQr =
      !!booking.checkInQrCode &&
      ["PaymentReceived", "CheckedIn"].includes(booking.status);

    /**
     * When the API omits commissionPaid / amountToPayToOwner (post-payment
     * statuses), derive them from totalPrice using the fixed 10 % platform fee.
     */
    const isPostPayment = [
      "PaymentReceived",
      "CheckedIn",
      "Completed",
    ].includes(booking.status);
    const derivedCommission =
      booking.commissionPaid != null
        ? booking.commissionPaid
        : isPostPayment
          ? Math.round(booking.totalPrice * PLATFORM_FEE_RATE)
          : null;
    const derivedOwnerAmount =
      booking.amountToPayToOwner != null
        ? booking.amountToPayToOwner
        : derivedCommission != null
          ? booking.totalPrice - derivedCommission
          : null;

    return (
      <div className="space-y-5 py-2">
        {/* Property image */}
        <div className="rounded-lg overflow-hidden bg-muted aspect-video">
          <img
            src={toUrl(booking.propertyMainImage)}
            alt={booking.propertyName}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>

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

        {/* Pricing — full transparent breakdown for tenant */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            {t("bookings.costBreakdown")}
          </p>

          {/* Post-payment breakdown */}
          {isPostPayment ? (
            <div className="rounded-lg border bg-secondary/30 p-3 space-y-3 text-sm">
              {/* Platform fee row — paid online */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    {t("bookings.platformFee")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("bookings.paidOnline")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {derivedCommission != null
                      ? `${derivedCommission.toLocaleString()} EGP`
                      : "—"}
                  </p>
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center justify-end gap-0.5">
                    <CheckCircle2 className="h-3 w-3" />{" "}
                    {t("bookings.paidLabel")}
                  </span>
                </div>
              </div>

              {/* Cash-to-owner row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <Banknote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    {t("bookings.ownerPayment")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("bookings.payInCash")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-600 dark:text-amber-400">
                    {derivedOwnerAmount != null
                      ? `${derivedOwnerAmount.toLocaleString()} EGP`
                      : "—"}
                  </p>
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    {t("bookings.cashAtArrival")}
                  </span>
                </div>
              </div>

              <Separator className="my-0.5" />

              <div className="flex justify-between font-bold text-foreground text-base">
                <span>{t("bookings.totalCost")}</span>
                <span>{booking.totalPrice.toLocaleString()} EGP</span>
              </div>
            </div>
          ) : (
            /* Pre-payment: show breakdown if available, otherwise just total */
            <div className="rounded-lg border bg-secondary/30 p-3 space-y-3 text-sm">
              {booking.commissionPaid != null &&
                booking.amountToPayToOwner != null && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {t("bookings.platformFee")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t("bookings.payNowOnline")}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {booking.commissionPaid.toLocaleString()} EGP
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {t("bookings.ownerPayment")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t("bookings.cashToOwner")}
                        </p>
                      </div>
                      <p className="font-semibold text-amber-600 dark:text-amber-400">
                        {booking.amountToPayToOwner.toLocaleString()} EGP
                      </p>
                    </div>
                    <Separator className="my-0.5" />
                  </>
                )}
              <div className="flex justify-between font-bold text-foreground text-base">
                <span>{t("bookings.totalCost")}</span>
                <span>{booking.totalPrice.toLocaleString()} EGP</span>
              </div>
            </div>
          )}

          {/* Cash reminder banner — shown after payment with derived owner amount */}
          {isPostPayment && derivedOwnerAmount != null && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300">
                {t("bookings.rememberCash", {
                  amount: derivedOwnerAmount.toLocaleString(),
                })}
              </p>
            </div>
          )}
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
              {booking.commissionPaid != null
                ? t("bookings.payPlatformFee", {
                    amount: booking.commissionPaid.toLocaleString(),
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

// ── Modal shell ─────────────────────────────────────────────────────────────

interface BookingDetailsModalProps {
  bookingId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "tenant" | "owner";
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

    // Both hooks are always called (React hook rules).
    // Only the one matching `role` is enabled — the other receives null.
    const { data: tenantBooking, isLoading: tenantLoading } =
      useTenantBookingDetails(role === "tenant" ? activeId : null);
    const { data: ownerBooking, isLoading: ownerLoading } =
      useOwnerBookingDetails(role === "owner" ? activeId : null);

    const cancelMutation = useCancelBooking();
    const updateStatusMutation = useUpdateBookingStatus();

    const handleCancel = useCallback(() => {
      if (!bookingId) return;
      cancelMutation.mutate(bookingId, {
        onSuccess: () => onOpenChange(false),
      });
    }, [bookingId, cancelMutation, onOpenChange]);

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

    const isLoading = tenantLoading || ownerLoading;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("bookings.bookingDetails")}</DialogTitle>
          </DialogHeader>

          <ModalErrorBoundary>
            {isLoading ? (
              <LoadingSkeleton />
            ) : role === "tenant" && tenantBooking ? (
              <TenantBookingContent
                booking={tenantBooking}
                bookingId={bookingId!}
                onCancel={handleCancel}
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
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                {t("bookings.bookingNotFound")}
              </p>
            )}
          </ModalErrorBoundary>
        </DialogContent>
      </Dialog>
    );
  },
);

BookingDetailsModal.displayName = "BookingDetailsModal";
export default BookingDetailsModal;
