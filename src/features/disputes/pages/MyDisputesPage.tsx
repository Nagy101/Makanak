import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDisputesList, useDisputeDetails, useCancelDispute } from '../useDisputes';
import type { DisputeListParams, DisputeStatusType, DisputeSortType } from '../dispute.types';
import DisputeStatusBadge from '../components/DisputeStatusBadge';
import DisputeDetailsView from '../components/DisputeDetailsView';
import CreateDisputeModal from '../components/CreateDisputeModal';
import UserNavbar from '@/components/UserNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Eye, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS: { label: string; value: DisputeStatusType | 'All' }[] = [
  { label: 'All Statuses', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Cancelled', value: 'Cancelled' },
];

const SORT_OPTIONS: { label: string; value: DisputeSortType }[] = [
  { label: 'Newest First', value: 'DateDesc' },
  { label: 'Oldest First', value: 'DateAsc' },
  { label: 'Status', value: 'StatusAsc' },
];

const PAGE_SIZE = 8;

const DisputeRow = memo(
  ({
    dispute,
    onView,
    onCancel,
    isCancelling,
  }: {
    dispute: { id: number; propertyName: string; reason: string; status: string; createdAt: string };
    onView: (id: number) => void;
    onCancel: (id: number) => void;
    isCancelling: boolean;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{dispute.propertyName}</h3>
            <DisputeStatusBadge status={dispute.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {dispute.reason} · {format(new Date(dispute.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onView(dispute.id)}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Details
          </Button>
          {dispute.status === 'Pending' && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => onCancel(dispute.id)}
              disabled={isCancelling}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  ),
);
DisputeRow.displayName = 'DisputeRow';

export default function MyDisputesPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<DisputeStatusType | 'All'>('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DisputeSortType>('DateDesc');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createBookingId] = useState(0);

  const params = useMemo<DisputeListParams>(
    () => ({
      Status: statusFilter === 'All' ? undefined : statusFilter,
      Search: search || undefined,
      PageIndex: page,
      PageSize: PAGE_SIZE,
      Sort: sort,
    }),
    [statusFilter, search, page, sort],
  );

  const { data, isLoading } = useDisputesList(params);
  const cancelMutation = useCancelDispute();
  const { data: selectedDispute } = useDisputeDetails(detailsOpen ? selectedId : null);

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleView = useCallback((id: number) => {
    setSelectedId(id);
    setDetailsOpen(true);
  }, []);

  const handleCancel = useCallback(
    (id: number) => cancelMutation.mutate(id),
    [cancelMutation],
  );

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div className="min-h-screen bg-secondary/30">
      <UserNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t("disputes.title")}</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v as DisputeStatusType | 'All'); setPage(1); }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => { setSort(v as DisputeSortType); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("disputes.searchDisputes")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 w-full"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">{t("disputes.noDisputes")}</p>
            <p className="text-sm mt-1">{t("disputes.noDisputesHint")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.data.map((d) => (
              <DisputeRow
                key={d.id}
                dispute={d}
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
            <span className="text-sm text-muted-foreground">{t("bookings.pageOf", { page, total: totalPages })}</span>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("disputes.disputeDetails")}</DialogTitle>
          </DialogHeader>
          {selectedDispute ? (
            <DisputeDetailsView dispute={selectedDispute} />
          ) : (
            <div className="space-y-3 py-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create modal */}
      <CreateDisputeModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        bookingId={createBookingId}
      />
    </div>
  );
}
