import { memo, useCallback, useMemo, useState } from 'react';
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

const STATUS_TABS: { label: string; value: BookingStatusType | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'PendingOwnerApproval' },
  { label: 'Payment', value: 'PendingPayment' },
  { label: 'Confirmed', value: 'PaymentReceived' },
  { label: 'Checked In', value: 'CheckedIn' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

const PAGE_SIZE = 10;

export default function OwnerIncomingBookingsPage() {
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

  const { data, isLoading } = useIncomingBookings(params);

  const handleView = useCallback((id: number) => {
    setSelectedBookingId(id);
    setDetailsOpen(true);
  }, []);

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Incoming Bookings</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 w-52"
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
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Total</TableHead>
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
                        src={booking.propertyMainImage || '/placeholder.svg'}
                        alt=""
                        className="h-10 w-14 rounded object-cover bg-muted"
                        loading="lazy"
                        width={56}
                        height={40}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <span className="font-medium text-foreground line-clamp-1">{booking.propertyName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {booking.tenantImage ? (
                        <img
                          src={booking.tenantImage}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover"
                          loading="lazy"
                          width={28}
                          height={28}
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {booking.tenantName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm">{booking.tenantName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {booking.totalPrice.toLocaleString()} EGP
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
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
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
      />
    </div>
  );
}
