import { memo, useCallback, useMemo, useState } from 'react';
import { useDisputesList, useDisputeDetails } from '../useDisputes';
import type { DisputeListParams, DisputeStatusType, DisputeSortType } from '../dispute.types';
import DisputeStatusBadge from '../components/DisputeStatusBadge';
import DisputeDetailsView from '../components/DisputeDetailsView';
import ResolveDisputeModal from '../components/ResolveDisputeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Eye, Gavel, ChevronLeft, ChevronRight } from 'lucide-react';
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

const PAGE_SIZE = 10;

const AdminDisputesDashboard = memo(() => {
  const [statusFilter, setStatusFilter] = useState<DisputeStatusType | 'All'>('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DisputeSortType>('DateDesc');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveId, setResolveId] = useState<number | null>(null);

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
  const { data: selectedDispute } = useDisputeDetails(detailsOpen ? selectedId : null);

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleView = useCallback((id: number) => {
    setSelectedId(id);
    setDetailsOpen(true);
  }, []);

  const handleResolve = useCallback((id: number) => {
    setResolveId(id);
    setResolveOpen(true);
  }, []);

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Disputes</h1>
        <p className="text-sm text-muted-foreground">Manage all platform disputes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
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
              placeholder="Search disputes..."
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

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No disputes found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Complainant</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Filed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">#{d.id}</TableCell>
                  <TableCell className="max-w-[160px] truncate">{d.propertyName}</TableCell>
                  <TableCell>{d.complainantName}</TableCell>
                  <TableCell>{d.reason}</TableCell>
                  <TableCell><DisputeStatusBadge status={d.status} /></TableCell>
                  <TableCell>{format(new Date(d.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => handleView(d.id)} title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {d.status === 'Pending' && (
                        <Button variant="ghost" size="icon" onClick={() => handleResolve(d.id)} title="Resolve">
                          <Gavel className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          {selectedDispute ? (
            <>
              <DisputeDetailsView dispute={selectedDispute} />
              {selectedDispute.status === 'Pending' && (
                <DialogFooter>
                  <Button onClick={() => { setDetailsOpen(false); handleResolve(selectedDispute.id); }}>
                    <Gavel className="h-4 w-4 mr-1" /> Resolve
                  </Button>
                </DialogFooter>
              )}
            </>
          ) : (
            <div className="space-y-3 py-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <ResolveDisputeModal
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        disputeId={resolveId}
      />
    </div>
  );
});

AdminDisputesDashboard.displayName = 'AdminDisputesDashboard';
export default AdminDisputesDashboard;
