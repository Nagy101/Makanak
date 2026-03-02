import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMyBookings, useCancelBooking } from "../useBookings";
import BookingStatusBadge from "../components/BookingStatusBadge";
import BookingDetailsModal from "../components/BookingDetailsModal";
import {
  type BookingStatusType,
  type BookingListParams,
} from "../booking.types";
import UserNavbar from "@/components/UserNavbar";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useProfile } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  AlertTriangle,
  Star,
} from "lucide-react";
import { format } from "date-fns";

const PaymentModal = lazy(
  () => import("@/features/payment/components/PaymentModal"),
);
const CreateDisputeModal = lazy(
  () => import("@/features/disputes/components/CreateDisputeModal"),
);
const LeaveReviewModal = lazy(
  () =>
    import(
      /* webpackChunkName: "reviews-module" */ "@/features/reviews/components/LeaveReviewModal"
    ),
);

const STATUS_OPTIONS: { labelKey: string; value: BookingStatusType | "All" }[] =
  [
    { labelKey: "bookings.allStatuses", value: "All" },
    { labelKey: "bookings.pendingApproval", value: "PendingOwnerApproval" },
    { labelKey: "bookings.rejected", value: "RejectedByOwner" },
    { labelKey: "bookings.pendingPayment", value: "PendingPayment" },
    { labelKey: "bookings.paymentFailed", value: "PaymentFailed" },
    { labelKey: "bookings.confirmed", value: "PaymentReceived" },
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

const PAGE_SIZE = 8;

/** Normalize relative backend image paths to absolute frontend URLs */
const toUrl = (path: string | null | undefined) =>
  !path ? "/placeholder.svg" : path.startsWith("http") ? path : `/${path}`;

const BookingCard = memo(
  ({
    booking,
    onView,
    onCancel,
    onPay,
    onDispute,
    onReview,
    isCancelling,
  }: {
    booking: {
      id: number;
      propertyId: number;
      propertyName: string;
      propertyMainImage: string;
      checkInDate: string;
      checkOutDate: string;
      totalDays: number;
      totalPrice: number;
      status: string;
    };
    onView: (id: number) => void;
    onCancel: (id: number) => void;
    onPay: (id: number) => void;
    onDispute: (id: number) => void;
    onReview: (bookingId: number, propertyId: number) => void;
    isCancelling: boolean;
  }) => {
    const { t } = useTranslation();
    const canCancel = ["PendingOwnerApproval", "PendingPayment"].includes(
      booking.status,
    );
    const canPay = booking.status === "PendingPayment";
    const canDispute = ["PaymentReceived", "CheckedIn", "Completed"].includes(
      booking.status,
    );
    const canReview = booking.status === "Completed";
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 h-36 sm:h-auto bg-muted shrink-0">
            <img
              src={toUrl(booking.propertyMainImage)}
              alt={booking.propertyName}
              className="h-full w-full object-cover"
              loading="lazy"
              width={192}
              height={144}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {booking.propertyName}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {format(new Date(booking.checkInDate), "MMM dd")} -{" "}
                  {format(new Date(booking.checkOutDate), "MMM dd, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {booking.totalDays}{" "}
                  {booking.totalDays !== 1
                    ? t("common.nights")
                    : t("common.night")}
                </p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {booking.totalPrice.toLocaleString()} {t("common.egp")}
              </span>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(booking.id)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> {t("common.details")}
                </Button>
                {canPay && (
                  <Button
                    size="sm"
                    onClick={() => onPay(booking.id)}
                    className="gap-1"
                  >
                    <CreditCard className="h-3.5 w-3.5" />{" "}
                    {t("bookings.payNow")}
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => onCancel(booking.id)}
                    disabled={isCancelling}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />{" "}
                    {t("common.cancel")}
                  </Button>
                )}
                {canDispute && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-warning border-warning/30 hover:bg-warning hover:text-white hover:border-warning"
                    onClick={() => onDispute(booking.id)}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />{" "}
                    {t("bookings.dispute")}
                  </Button>
                )}
                {canReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    onClick={() => onReview(booking.id, booking.propertyId)}
                  >
                    <Star className="h-3.5 w-3.5 mr-1" /> {t("bookings.review")}
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
BookingCard.displayName = "BookingCard";

export default function TenantBookingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const storeUser = useAuthStore((s) => s.user);
  const user = profileData ?? storeUser;
  const userTypeStr = (user?.role || user?.userType || "").toLowerCase();

  // Owners and admins don't have personal bookings — redirect them to the right place
  useEffect(() => {
    if (userTypeStr === "owner") navigate("/owner/bookings", { replace: true });
    else if (userTypeStr === "admin" || userTypeStr === "administrator")
      navigate("/admin", { replace: true });
  }, [userTypeStr, navigate]);

  const [statusFilter, setStatusFilter] = useState<BookingStatusType | "All">(
    "All",
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("DateCreatedDesc");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [payBookingId, setPayBookingId] = useState<number | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [disputeBookingId, setDisputeBookingId] = useState<number | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    bookingId: number;
    propertyId: number;
  } | null>(null);
  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
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

  const handlePay = useCallback((id: number) => {
    setPayBookingId(id);
    setPayOpen(true);
  }, []);

  const handleDispute = useCallback((id: number) => {
    setDisputeBookingId(id);
    setDisputeOpen(true);
  }, []);

  const handleReview = useCallback((bookingId: number, propertyId: number) => {
    setReviewTarget({ bookingId, propertyId });
  }, []);

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div className="min-h-screen bg-secondary/30">
      <UserNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {t("bookings.title")}
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Status dropdown */}
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as BookingStatusType | "All");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-52">
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

          {/* Sort dropdown */}
          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
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

          {/* Search */}
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("bookings.searchByProperty")}
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

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">{t("bookings.noBookings")}</p>
            <p className="text-sm mt-1">{t("bookings.noBookingsHint")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.data.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onView={handleView}
                onCancel={handleCancel}
                onPay={handlePay}
                onDispute={handleDispute}
                onReview={handleReview}
                isCancelling={cancelMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {t("bookings.pageOf", { page, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
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
        onPayNow={handlePay}
      />

      <PaymentModal
        bookingId={payBookingId}
        open={payOpen}
        onOpenChange={setPayOpen}
      />

      {disputeBookingId && (
        <CreateDisputeModal
          bookingId={disputeBookingId}
          open={disputeOpen}
          onOpenChange={setDisputeOpen}
        />
      )}

      {reviewTarget && (
        <Suspense fallback={null}>
          <LeaveReviewModal
            bookingId={reviewTarget.bookingId}
            propertyId={reviewTarget.propertyId}
            open={!!reviewTarget}
            onClose={() => setReviewTarget(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
