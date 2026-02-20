import { memo, useCallback, useMemo, useState } from 'react';
import { useMyBookings, useCancelBooking } from '../useBookings';
import BookingStatusBadge from '../components/BookingStatusBadge';
import BookingDetailsModal from '../components/BookingDetailsModal';
import { BookingStatus, type BookingStatusType, type BookingListParams } from '../booking.types';
import UserNavbar from '@/components/UserNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_TABS: { label: string; value: BookingStatusType | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'PendingOwnerApproval' },
  { label: 'Payment', value: 'PendingPayment' },
  { label: 'Confirmed', value: 'PaymentReceived' },
  { label: 'Checked In', value: 'CheckedIn' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

const PAGE_SIZE = 8;

const BookingCard = memo(
  ({
    booking,
    onView,
    onCancel,
    isCancelling,
  }: {
    booking: { id: number; propertyName: string; propertyMainImage: string; checkInDate: string; checkOutDate: string; totalPrice: number; status: string };
    onView: (id: number) => void;
    onCancel: (id: number) => void;
    isCancelling: boolean;
  }) => {
    const canCancel = ['PendingOwnerApproval', 'PendingPayment'].includes(booking.status);
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 h-36 sm:h-auto bg-muted shrink-0">
            <img
              src={booking.propertyMainImage || '/placeholder.svg'}
              alt={booking.propertyName}
              className="h-full w-full object-cover"
              loading="lazy"
              width={192}
              height={144}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground line-clamp-1">{booking.propertyName}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {format(new Date(booking.checkInDate), 'MMM dd')} –{' '}
                  {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {booking.totalPrice.toLocaleString()} EGP
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(booking.id)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> Details
                </Button>
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => onCancel(booking.id)}
                    disabled={isCancelling}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  },
);
BookingCard.displayName = 'BookingCard';

export default function TenantBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatusType | 'All'>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('DateCreatedDesc');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const params = useMemo<BookingListParams>(
    () => ({
      Status: statusFilter === 'All' ? undefined : (statusFilter as BookingStatusType),
      Search: search || undefined,
      PageIndex: page,
      PageSize: PAGE_SIZE,
      Sort: sort as any,
    }),
    [statusFilter, search, page, sort],
  );

  const { data, isLoading } = useMyBookings(params);
  const cancelMutation = useCancelBooking();

  const handleView = useCallback((id: number) => {
    setSelectedBookingId(id);
    setDetailsOpen(true);
  }, []);

  const handleCancel = useCallback(
    (id: number) => {
      cancelMutation.mutate(id);
    },
    [cancelMutation],
  );

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div className="min-h-screen bg-secondary/30">
      <UserNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Bookings</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.value}
                variant={statusFilter === tab.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 w-56"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DateCreatedDesc">Newest First</SelectItem>
                <SelectItem value="DateCreatedAsc">Oldest First</SelectItem>
                <SelectItem value="PriceDesc">Price High→Low</SelectItem>
                <SelectItem value="PriceAsc">Price Low→High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No bookings found</p>
            <p className="text-sm mt-1">Your bookings will appear here once you make a reservation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.data.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onView={handleView}
                onCancel={handleCancel}
                isCancelling={cancelMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <BookingDetailsModal
        bookingId={selectedBookingId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        role="tenant"
      />
    </div>
  );
}
