import { memo, useCallback, lazy, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useTenantBookingDetails,
  useOwnerBookingDetails,
  useCancelBooking,
  useUpdateBookingStatus,
} from '../useBookings';
import BookingStatusBadge from './BookingStatusBadge';
import { format } from 'date-fns';
import { Phone, MapPin, Info, CreditCard, User, ShieldCheck, Banknote, CheckCircle2, AlertCircle } from 'lucide-react';
import type { BookingStatusType, TenantBookingDetails, OwnerBookingDetails } from '../booking.types';

const TenantQRCodeDisplay = lazy(() => import('@/features/checkin/components/TenantQRCodeDisplay'));

/** Normalise relative backend paths to absolute URLs */
const toUrl = (path: string | null | undefined) =>
  !path ? '/placeholder.svg' : path.startsWith('http') ? path : `/${path}`;

// ── Error Boundary ──────────────────────────────────────────────────────────
class ModalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="py-10 text-center space-y-2">
          <p className="text-destructive font-medium">Something went wrong loading this booking.</p>
          <p className="text-sm text-muted-foreground">Please close and try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Shared helpers ──────────────────────────────────────────────────────────

const InfoRow = memo(({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div>
    <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
    <p className="font-medium text-foreground flex items-center gap-1">{icon}{value}</p>
  </div>
));
InfoRow.displayName = 'InfoRow';

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

const TenantBookingContent = memo(
  ({ booking, bookingId, onCancel, onPay, onClose, isCancelling }: TenantContentProps) => {
    const canCancel = ['PendingOwnerApproval', 'PendingPayment'].includes(booking.status);
    const canPay = booking.status === 'PendingPayment';
    const showQr =
      !!booking.checkInQrCode &&
      ['PaymentReceived', 'CheckedIn'].includes(booking.status);

    return (
      <div className="space-y-5 py-2">
        {/* Property image */}
        <div className="rounded-lg overflow-hidden bg-muted aspect-video">
          <img
            src={toUrl(booking.propertyMainImage)}
            alt={booking.propertyName}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </div>

        {/* Title + status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{booking.propertyName}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Booking #{booking.id}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <Separator />

        {/* Stay dates */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Stay</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <InfoRow label="Check-in" value={format(new Date(booking.checkInDate), 'MMM dd, yyyy')} />
            <InfoRow label="Check-out" value={format(new Date(booking.checkOutDate), 'MMM dd, yyyy')} />
            <InfoRow
              label="Total Nights"
              value={`${booking.totalDays} night${booking.totalDays !== 1 ? 's' : ''}`}
            />
          </div>
        </div>

        <Separator />

        {/* Pricing — full transparent breakdown for tenant */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Cost Breakdown</p>
          <div className="rounded-lg border bg-secondary/30 p-3 space-y-3 text-sm">
            {/* Detailed breakdown only when backend supplies both fields */}
            {booking.commissionPaid != null && booking.amountToPayToOwner != null ? (
              <>
                {/* Online payment row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Platform Fee</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {canPay ? 'Pay now online via card' : 'Paid online \u2714'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${canPay ? 'text-foreground' : 'text-green-600 dark:text-green-400'}`}>
                      {booking.commissionPaid.toLocaleString()} EGP
                    </p>
                    {!canPay && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center justify-end gap-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Cash-to-owner row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Owner Payment</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pay in cash directly to owner at arrival</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600 dark:text-amber-400">
                      {booking.amountToPayToOwner.toLocaleString()} EGP
                    </p>
                    <span className="text-xs text-amber-600 dark:text-amber-400">Cash at arrival</span>
                  </div>
                </div>

                <Separator className="my-0.5" />
              </>
            ) : null}

            <div className="flex justify-between font-bold text-foreground text-base">
              <span>Total Cost</span>
              <span>{booking.totalPrice.toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Cash reminder banner — show after payment confirmed, only when amount is known */}
          {['PaymentReceived', 'CheckedIn', 'Completed'].includes(booking.status) &&
            booking.amountToPayToOwner != null && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-800 dark:text-amber-300">
                  Remember to bring{' '}
                  <span className="font-semibold">{booking.amountToPayToOwner.toLocaleString()} EGP cash</span>{' '}
                  to pay the owner upon arrival.
                </p>
              </div>
            )}
        </div>

        {/* Special requests */}
        {booking.specialRequests && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Special Requests</p>
              <p className="text-sm text-foreground bg-secondary/30 rounded-lg p-3">{booking.specialRequests}</p>
            </div>
          </>
        )}

        {/* Check-in info — fields may be null until payment is completed */}
        {(booking.checkInInstructions || booking.ownerPhoneNumber || booking.exactLocationUrl) && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Check-in Info</p>
              {booking.checkInInstructions && (
                <div className="flex gap-2 text-sm bg-secondary/30 rounded-lg p-3">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-foreground">{booking.checkInInstructions}</p>
                </div>
              )}
              {booking.ownerPhoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{booking.ownerPhoneNumber}</span>
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
                  View Exact Location
                </a>
              )}
            </div>
          </>
        )}

        {/* QR Code — only for tenant after payment */}
        {showQr && (
          <>
            <Separator />
            <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
              <TenantQRCodeDisplay
                qrCodeValue={booking.checkInQrCode!}
                bookingId={booking.id}
                propertyName={booking.propertyName}
              />
            </Suspense>
            {booking.isQrScanned && (
              <Badge variant="secondary" className="text-xs mx-auto block w-fit">
                QR already scanned
              </Badge>
            )}
          </>
        )}

        <Separator />

        {/* Tenant actions */}
        <div className="flex gap-2 justify-end">
          {canPay && onPay && (
            <Button onClick={() => { onPay(bookingId); onClose(); }} className="gap-1">
              <CreditCard className="h-4 w-4" />
              {booking.commissionPaid != null
                ? `Pay Platform Fee — ${booking.commissionPaid.toLocaleString()} EGP`
                : 'Pay Now'}
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" onClick={onCancel} disabled={isCancelling}>
              Cancel Booking
            </Button>
          )}
        </div>
      </div>
    );
  },
);
TenantBookingContent.displayName = 'TenantBookingContent';

// ── Owner Content ───────────────────────────────────────────────────────────

interface OwnerContentProps {
  booking: OwnerBookingDetails;
  bookingId: number;
  onStatusUpdate: (status: BookingStatusType) => void;
  isUpdating: boolean;
}

const OwnerBookingContent = memo(({ booking, onStatusUpdate, isUpdating }: OwnerContentProps) => {
  const canOwnerAct = booking.status === 'PendingOwnerApproval';

  return (
    <div className="space-y-5 py-2">
      {/* Title + status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{booking.propertyName}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Booking #{booking.id}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <Separator />

      {/* Tenant identity */}
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1">
          <User className="h-3.5 w-3.5" /> Tenant
        </p>
        <div className="flex items-center gap-3">
          <img
            src={toUrl(booking.tenantImage)}
            alt={booking.tenantName}
            className="h-12 w-12 rounded-full object-cover border shrink-0"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
          <div>
            <p className="font-medium text-foreground">{booking.tenantName}</p>
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
              <ShieldCheck className="h-3.5 w-3.5" /> Identity Document
            </p>
            <img
              src={toUrl(booking.tenantIdentityImage)}
              alt="Tenant identity"
              className="rounded-lg border h-32 w-auto object-contain bg-secondary/30"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Stay dates */}
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Stay</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <InfoRow label="Check-in" value={format(new Date(booking.checkInDate), 'MMM dd, yyyy')} />
          <InfoRow label="Check-out" value={format(new Date(booking.checkOutDate), 'MMM dd, yyyy')} />
          <InfoRow
            label="Total Nights"
            value={`${booking.totalDays} night${booking.totalDays !== 1 ? 's' : ''}`}
          />
        </div>
      </div>

      {/* QR scan status */}
      {booking.isQrScanned && (
        <Badge variant="secondary" className="text-xs w-fit">Check-in QR Scanned</Badge>
      )}

      <Separator />

      {/* Financial — owner only sees what the tenant will bring in cash */}
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
          <Banknote className="h-3.5 w-3.5" /> Expected Payment
        </p>
        <div className="rounded-lg border bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Cash from tenant at check-in</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tenant pays this directly to you upon arrival</p>
          </div>
          <p className="text-2xl font-bold text-primary">{booking.amountToPayToOwner.toLocaleString()} <span className="text-sm font-semibold">EGP</span></p>
        </div>
      </div>

      {/* Special requests */}
      {booking.specialRequests && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Special Requests</p>
            <p className="text-sm text-foreground bg-secondary/30 rounded-lg p-3">{booking.specialRequests}</p>
          </div>
        </>
      )}

      <Separator />

      {/* Owner actions */}
      {canOwnerAct && (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => onStatusUpdate('RejectedByOwner')}
            disabled={isUpdating}
          >
            Reject
          </Button>
          <Button onClick={() => onStatusUpdate('PendingPayment')} disabled={isUpdating}>
            Approve
          </Button>
        </div>
      )}
    </div>
  );
});
OwnerBookingContent.displayName = 'OwnerBookingContent';

// ── Modal shell ─────────────────────────────────────────────────────────────

interface BookingDetailsModalProps {
  bookingId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: 'tenant' | 'owner';
  onPayNow?: (bookingId: number) => void;
}

const BookingDetailsModal = memo(
  ({ bookingId, open, onOpenChange, role, onPayNow }: BookingDetailsModalProps) => {
    const activeId = open ? bookingId : null;

    // Both hooks are always called (React hook rules).
    // Only the one matching `role` is enabled — the other receives null.
    const { data: tenantBooking, isLoading: tenantLoading } = useTenantBookingDetails(
      role === 'tenant' ? activeId : null,
    );
    const { data: ownerBooking, isLoading: ownerLoading } = useOwnerBookingDetails(
      role === 'owner' ? activeId : null,
    );

    const cancelMutation = useCancelBooking();
    const updateStatusMutation = useUpdateBookingStatus();

    const handleCancel = useCallback(() => {
      if (!bookingId) return;
      cancelMutation.mutate(bookingId, { onSuccess: () => onOpenChange(false) });
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
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          <ModalErrorBoundary>
            {isLoading ? (
              <LoadingSkeleton />
            ) : role === 'tenant' && tenantBooking ? (
              <TenantBookingContent
                booking={tenantBooking}
                bookingId={bookingId!}
                onCancel={handleCancel}
                onPay={onPayNow}
                onClose={() => onOpenChange(false)}
                isCancelling={cancelMutation.isPending}
              />
            ) : role === 'owner' && ownerBooking ? (
              <OwnerBookingContent
                booking={ownerBooking}
                bookingId={bookingId!}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={updateStatusMutation.isPending}
              />
            ) : (
              <p className="py-8 text-center text-muted-foreground">Booking not found.</p>
            )}
          </ModalErrorBoundary>
        </DialogContent>
      </Dialog>
    );
  },
);

BookingDetailsModal.displayName = 'BookingDetailsModal';
export default BookingDetailsModal;
