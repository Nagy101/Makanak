import { useCallback, useMemo, useState, lazy, Suspense } from 'react';
import { useIncomingBookings } from '../useBookings';
import BookingStatusBadge from '../components/BookingStatusBadge';
import BookingDetailsModal from '../components/BookingDetailsModal';
import type { BookingStatusType, BookingListParams } from '../booking.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const CreateDisputeModal = lazy(() => import('@/features/disputes/components/CreateDisputeModal'));

const STATUS_OPTIONS: { label: string; value: BookingStatusType | 'All' }[] = [
  { label: 'All Statuses', value: 'All' },
  { label: 'Pending Approval', value: 'PendingOwnerApproval' },
  { label: 'Rejected', value: 'RejectedByOwner' },
  { label: 'Pending Payment', value: 'PendingPayment' },
  { label: 'Payment Failed', value: 'PaymentFailed' },
  { label: 'Confirmed', value: 'PaymentReceived' },
  { label: 'Checked In', value: 'CheckedIn' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Disputed', value: 'Disputed' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'DateCreatedDesc' },
  { label: 'Oldest First', value: 'DateCreatedAsc' },
  { label: 'Price High to Low', value: 'PriceDesc' },
  { label: 'Price Low to High', value: 'PriceAsc' },
];

const PAGE_SIZE = 10;

const toUrl = (path: string | null | undefined) =>
  !path ? '/placeholder.svg' : path.startsWith('http') ? path : `/${path}`;

export default function OwnerIncomingBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatusType | 'All'>('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('DateCreatedDesc');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [disputeBookingId, setDisputeBookingId] = useState<number | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch],
  );

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

  const { data, isLoading } = useIncomingBookings(params);

  const handleView = useCallback((id: number) => {
    setSelectedBookingId(id);
    setDetailsOpen(true);
  }, []);

  const handleDispute = useCallback((id: number) => {
    setDisputeBookingId(id);
    setDetailsOpen(false); // close details modal first
    setDisputeOpen(true);
  }, []);

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Incoming Bookings</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status dropdown */}
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v as BookingStatusType | 'All'); setPage(1); }}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort dropdown */}
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by property or tenant..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            <Search className="h-4 w-4 mr-1" /> Search
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No incoming bookings</p>
          <p className="text-sm mt-1">Bookings from tenants will appear here.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Owner Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={toUrl(booking.propertyMainImage)}
                        alt=""
                        className="h-10 w-14 rounded object-cover bg-muted shrink-0"
                        loading="lazy"
                        width={56}
                        height={40}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      <span className="font-medium text-foreground line-clamp-1 max-w-[140px]">{booking.propertyName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={toUrl(booking.tenantImage)}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover shrink-0"
                        loading="lazy"
                        width={28}
                        height={28}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      <span className="text-sm">{booking.tenantName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-center">
                    {booking.totalDays}
                  </TableCell>
                  <TableCell className="font-semibold text-primary whitespace-nowrap">
                    {booking.totalPrice.toLocaleString()} EGP
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {booking.amountToPayToOwner.toLocaleString()} EGP
                  </TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleView(booking.id)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <BookingDetailsModal
        bookingId={selectedBookingId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        role="owner"
        onDispute={handleDispute}
      />

      {disputeBookingId && (
        <Suspense fallback={null}>
          <CreateDisputeModal
            bookingId={disputeBookingId}
            open={disputeOpen}
            onOpenChange={setDisputeOpen}
            role="owner"
          />
        </Suspense>
      )}
    </div>
  );
}
