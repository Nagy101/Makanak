import { memo, useCallback, lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookingDetails, useCancelBooking, useUpdateBookingStatus } from '../useBookings';
import BookingStatusBadge from './BookingStatusBadge';
import { format } from 'date-fns';
import { Users, Phone, MapPin, QrCode, Info, CreditCard } from 'lucide-react';
import type { BookingStatusType } from '../booking.types';

const TenantQRCodeDisplay = lazy(() => import('@/features/checkin/components/TenantQRCodeDisplay'));

/** Ensure a relative path like `uploads/...` becomes `/uploads/...` */
const toUrl = (path: string | null | undefined) =>
  !path ? '/placeholder.svg' : path.startsWith('http') ? path : `/${path}`;

interface BookingDetailsModalProps {
  bookingId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: 'tenant' | 'owner';
  onPayNow?: (bookingId: number) => void;
}

const BookingDetailsModal = memo(({ bookingId, open, onOpenChange, role, onPayNow }: BookingDetailsModalProps) => {
  const { data: booking, isLoading } = useBookingDetails(open ? bookingId : null);
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

  const canCancel = booking && ['PendingOwnerApproval', 'PendingPayment'].includes(booking.status);
  const canOwnerAct = role === 'owner' && booking?.status === 'PendingOwnerApproval';
  const canPay = role === 'tenant' && booking?.status === 'PendingPayment';
  const showQr = role === 'tenant' && booking?.checkInQrCode && ['PaymentReceived', 'CheckedIn'].includes(booking?.status ?? '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : booking ? (
          <div className="space-y-5 py-2">
            {/* Main property image */}
            <div className="rounded-lg overflow-hidden bg-muted aspect-video">
              <img
                src={toUrl(booking.propertyMainImage)}
                alt={booking.propertyName}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
            </div>

            {/* Gallery */}
            {booking.galleryImages?.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {booking.galleryImages.map((img, i) => (
                  <img
                    key={i}
                    src={toUrl(img)}
                    alt={`Gallery ${i + 1}`}
                    className="h-16 w-24 object-cover rounded-md shrink-0 border"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                ))}
              </div>
            )}

            {/* Title + status */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{booking.propertyName}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Booking #{booking.id}</p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>

            <Separator />

            {/* Dates & guests */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Stay</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <InfoRow label="Check-in" value={format(new Date(booking.checkInDate), 'MMM dd, yyyy')} />
                <InfoRow label="Check-out" value={format(new Date(booking.checkOutDate), 'MMM dd, yyyy')} />
                <InfoRow label="Total Nights" value={`${booking.totalDays} night${booking.totalDays !== 1 ? 's' : ''}`} />
                <InfoRow label="Guests" value={`${booking.numberOfGuests} guest${booking.numberOfGuests !== 1 ? 's' : ''}`} icon={<Users className="h-3.5 w-3.5" />} />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Pricing</p>
              <div className="rounded-lg border bg-secondary/30 p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {booking.pricePerNight?.toLocaleString()} EGP &times; {booking.totalDays} nights
                  </span>
                  <span className="font-medium">{booking.totalPrice.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Service fee</span>
                  <span>{booking.commissionPaid.toLocaleString()} EGP</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{booking.totalPrice.toLocaleString()} EGP</span>
                </div>
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

            {/* Check-in info */}
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

            {/* QR Code — generated client-side for tenant */}
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
                  <Badge variant="secondary" className="text-xs mx-auto">QR already scanned</Badge>
                )}
              </>
            )}

            {/* Fallback: show raw QR image from backend for owner or other statuses */}
            {!showQr && booking.checkInQrCode && (
              <>
                <Separator />
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                    <QrCode className="h-3.5 w-3.5" /> Check-in QR Code
                  </p>
                  <img
                    src={booking.checkInQrCode}
                    alt="Check-in QR Code"
                    className="h-40 w-40 rounded-lg border"
                  />
                  {booking.isQrScanned && (
                    <Badge variant="secondary" className="text-xs">QR already scanned</Badge>
                  )}
                </div>
              </>
            )}

            {/* Tenant info (owner view) */}
            {role === 'owner' && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <img
                    src={toUrl(booking.tenantImage)}
                    alt={booking.tenantName}
                    className="h-10 w-10 rounded-full object-cover border"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{booking.tenantName}</p>
                    <p className="text-xs text-muted-foreground">Tenant</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              {canOwnerAct && (
                <>
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleStatusUpdate('RejectedByOwner')}
                    disabled={updateStatusMutation.isPending}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('PendingPayment')}
                    disabled={updateStatusMutation.isPending}
                  >
                    Approve
                  </Button>
                </>
              )}
              {canPay && onPayNow && (
                <Button
                  onClick={() => { onPayNow(bookingId!); onOpenChange(false); }}
                  className="gap-1"
                >
                  <CreditCard className="h-4 w-4" /> Pay Now
                </Button>
              )}
              {canCancel && role === 'tenant' && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">Booking not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
});

const InfoRow = memo(({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div>
    <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
    <p className="font-medium text-foreground flex items-center gap-1">{icon}{value}</p>
  </div>
));
InfoRow.displayName = 'InfoRow';

BookingDetailsModal.displayName = 'BookingDetailsModal';
export default BookingDetailsModal;
