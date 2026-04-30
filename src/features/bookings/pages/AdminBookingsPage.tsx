import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminBookings } from "../useBookings";
import BookingStatusBadge from "../components/BookingStatusBadge";
import BookingDetailsModal from "../components/BookingDetailsModal";
import type {
  BookingListParams,
  BookingStatusType,
  BookingSortType,
} from "../booking.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS: { labelKey: string; value: BookingStatusType | "All" }[] =
  [
    { labelKey: "bookings.allStatuses", value: "All" },
    { labelKey: "bookings.pendingApproval", value: "PendingOwnerApproval" },
    { labelKey: "bookings.rejected", value: "RejectedByOwner" },
    { labelKey: "bookings.pendingPayment", value: "PendingPayment" },
    { labelKey: "bookings.paymentFailed", value: "PaymentFailed" },
    { labelKey: "bookings.confirmed", value: "PaymentReceived" },
    { labelKey: "bookings.refundRequested", value: "RefundRequested" },
    { labelKey: "bookings.refunded", value: "Refunded" },
    { labelKey: "bookings.checkedIn", value: "CheckedIn" },
    { labelKey: "bookings.completed", value: "Completed" },
    { labelKey: "bookings.cancelled", value: "Cancelled" },
    { labelKey: "bookings.disputed", value: "Disputed" },
  ];

const SORT_OPTIONS = [
  { labelKey: "bookings.newestFirst", value: "DateCreatedDesc" },
  { labelKey: "bookings.oldestFirst", value: "DateCreatedAsc" },
  { labelKey: "bookings.priceHighToLow", value: "PriceDesc" },
  { labelKey: "bookings.priceLowToHigh", value: "PriceAsc" },
];

const PAGE_SIZE = 10;

const toUrl = (path: string | null | undefined) =>
  !path ? "/placeholder.svg" : path.startsWith("http") ? path : `/${path}`;

export default function AdminBookingsPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<BookingStatusType | "All">(
    "All",
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [sort, setSort] = useState("DateCreatedDesc");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPageIndex(1);
  }, [searchInput]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  const params = useMemo<BookingListParams>(
    () => ({
      Status:
        statusFilter === "All"
          ? undefined
          : (statusFilter as BookingStatusType),
      Search: search || undefined,
      PageIndex: Math.max(1, pageIndex),
      PageSize: PAGE_SIZE,
      Sort: sort as BookingSortType,
    }),
    [statusFilter, search, pageIndex, sort],
  );

  const { data, isLoading } = useAdminBookings(params);

  const handleOpen = useCallback((id: number) => {
    setSelectedBookingId(id);
    setDetailsOpen(true);
  }, []);

  const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.sidebarBookings")}
          </h1>
          <p className="text-sm text-muted-foreground">
            All bookings visible to administrators.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as BookingStatusType | "All");
            setPageIndex(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder={t("bookings.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t(o.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) => {
            setSort(v);
            setPageIndex(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t(o.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("bookings.searchByPropertyOrTenant")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 w-full"
            />
          </div>
          <Button
            onClick={handleSearch}
            variant="secondary"
            className="hover:bg-primary hover:text-primary-foreground"
          >
            <Search className="h-4 w-4 mr-1" /> {t("common.search")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No bookings found</p>
          <p className="text-sm mt-1">Try adjusting the filters.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("bookings.property")}</TableHead>
                <TableHead>{t("bookings.tenant")}</TableHead>
                <TableHead>{t("properties.checkIn")}</TableHead>
                <TableHead>{t("properties.checkOut")}</TableHead>
                <TableHead>{t("bookings.status")}</TableHead>
                <TableHead>{t("bookings.total")}</TableHead>
                <TableHead className="text-right">{t("bookings.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleOpen(booking.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={toUrl(booking.propertyMainImage)}
                        alt={booking.propertyName}
                        className="h-10 w-14 rounded object-cover bg-muted shrink-0"
                        loading="lazy"
                        width={56}
                        height={40}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <span className="font-medium text-foreground line-clamp-1 max-w-[180px]">
                        {booking.propertyName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={toUrl(booking.tenantImage)}
                        alt={booking.tenantName}
                        className="h-7 w-7 rounded-full object-cover shrink-0"
                        loading="lazy"
                        width={28}
                        height={28}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <span className="text-sm">{booking.tenantName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {format(new Date(booking.checkInDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {format(new Date(booking.checkOutDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="font-semibold text-primary whitespace-nowrap">
                    {booking.totalPrice.toLocaleString()} {t("common.egp")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpen(booking.id)}>
                      <Eye className="h-4 w-4 mr-1" /> {t("common.view")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            disabled={pageIndex <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("bookings.pageOf", { page: pageIndex, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
            disabled={pageIndex >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <BookingDetailsModal
        bookingId={selectedBookingId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        role="admin"
      />
    </div>
  );
}