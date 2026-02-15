import { memo, useState, useCallback, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useProperties } from '@/features/properties/useProperties';
import { useUpdatePropertyStatus } from '../useAdmin';
import type { PropertySearchParams, PropertyListing } from '@/features/properties/property.types';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const statusColor: Record<string, string> = {
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Accepted: 'bg-success/10 text-success border-success/20',
  Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const AdminPropertiesPage = memo(() => {
  const [params, setParams] = useState<PropertySearchParams>({
    PageIndex: 1,
    PageSize: PAGE_SIZE,
  });
  const [searchInput, setSearchInput] = useState('');

  // Reuse existing property hook
  const { data, isLoading } = useProperties(params);
  const mutation = useUpdatePropertyStatus();

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleSearch = useCallback(() => {
    setParams((p) => ({ ...p, Search: searchInput || undefined, PageIndex: 1 }));
  }, [searchInput]);

  const handleStatusFilter = useCallback((val: string) => {
    setParams((p) => ({ ...p, Type: val === 'all' ? undefined : val, PageIndex: 1 }));
  }, []);

  const totalPages = useMemo(
    () => (data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1),
    [data]
  );

  const handleApprove = useCallback(
    (propertyId: number) => {
      mutation.mutate(
        { propertyId, newStatus: 'Accepted' },
        { onSuccess: () => toast.success('Property approved') }
      );
    },
    [mutation]
  );

  const handleRejectSubmit = useCallback(() => {
    if (rejectTarget === null) return;
    mutation.mutate(
      { propertyId: rejectTarget, newStatus: 'Rejected', rejectedReason: rejectReason },
      {
        onSuccess: () => {
          toast.success('Property rejected');
          setRejectTarget(null);
          setRejectReason('');
        },
      }
    );
  }, [rejectTarget, rejectReason, mutation]);

  const handlePageChange = useCallback((dir: 1 | -1) => {
    setParams((p) => ({ ...p, PageIndex: (p.PageIndex ?? 1) + dir }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Property Management</h1>
        <p className="text-sm text-muted-foreground">Review and manage property listings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="Chalet">Chalet</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} size="sm">Search</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            No properties found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((p: PropertyListing) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{p.title}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                    {p.propertyType}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${p.pricePerNight}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColor[p.propertyStatus ?? 'Pending'] ?? ''}
                    >
                      {p.propertyStatus ?? 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                    {p.governorateName}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-success hover:text-success"
                        onClick={() => handleApprove(p.id)}
                        disabled={mutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setRejectTarget(p.id)}
                        disabled={mutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {params.PageIndex ?? 1} of {totalPages} ({data.totalCount} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={(params.PageIndex ?? 1) <= 1}
              onClick={() => handlePageChange(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(params.PageIndex ?? 1) >= totalPages}
              onClick={() => handlePageChange(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectTarget !== null} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={mutation.isPending}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

AdminPropertiesPage.displayName = 'AdminPropertiesPage';
export default AdminPropertiesPage;
