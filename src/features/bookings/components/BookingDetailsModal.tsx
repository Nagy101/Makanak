import { memo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useBookingDetails, useCancelBooking, useUpdateBookingStatus } from '../useBookings';
import BookingStatusBadge from './BookingStatusBadge';
import { format } from 'date-fns';
import type { BookingStatusType } from '../booking.types';

interface BookingDetailsModalProps {
  bookingId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: 'tenant' | 'owner';
}

const BookingDetailsModal = memo(({ bookingId, open, onOpenChange, role }: BookingDetailsModalProps) => {
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

  const canCancel =
    booking &&
    ['PendingOwnerApproval', 'PendingPayment'].includes(booking.status);

  const canOwnerAct =
    role === 'owner' && booking?.status === 'PendingOwnerApproval';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : booking ? (
          <div className="space-y-4 py-2">
            {/* Property image */}
            <div className="rounded-lg overflow-hidden bg-muted aspect-video">
              <img
                src={booking.propertyMainImage || '/placeholder.svg'}
                alt={booking.propertyName}
                className="h-full w-full object-cover"
                loading="lazy"
                width={480}
                height={270}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{booking.propertyName}</h3>
              <BookingStatusBadge status={booking.status} />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Check-in" value={format(new Date(booking.checkInDate), 'MMM dd, yyyy')} />
              <InfoRow label="Check-out" value={format(new Date(booking.checkOutDate), 'MMM dd, yyyy')} />
              <InfoRow label="Total Days" value={String(booking.totalDays)} />
              <InfoRow label="Total Price" value={`${booking.totalPrice.toLocaleString()} EGP`} />
              <InfoRow label="Commission" value={`${booking.commissionPaid.toLocaleString()} EGP`} />
              <InfoRow label="Owner Payout" value={`${booking.amountToPayToOwner.toLocaleString()} EGP`} />
              <InfoRow label="Tenant" value={booking.tenantName} />
            </div>

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
              {canCancel && (
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

const InfoRow = memo(({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-muted-foreground">{label}</p>
    <p className="font-medium text-foreground">{value}</p>
  </div>
));
InfoRow.displayName = 'InfoRow';

BookingDetailsModal.displayName = 'BookingDetailsModal';
export default BookingDetailsModal;
