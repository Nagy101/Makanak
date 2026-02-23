import { memo, useState, useCallback, useMemo } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useAdminUsers } from '../useAdmin';
import type { AdminUserSearchParams, UserStatus, UserType, AdminUser } from '../admin.types';
import UserVerificationModal from '../components/UserVerificationModal';
import { useUserStatuses, useUserTypes } from '@/features/lookup';
const PAGE_SIZE = 10;

const statusBadgeClass: Record<UserStatus, string> = {
  New: 'bg-primary/10 text-primary border-primary/20',
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Active: 'bg-success/10 text-success border-success/20',
  Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  Banned: 'bg-destructive/10 text-destructive border-destructive/20',
};

const AdminUsersPage = memo(() => {
  const [params, setParams] = useState<AdminUserSearchParams>({
    PageIndex: 1,
    PageSize: PAGE_SIZE,
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers(params);
  const { userStatuses } = useUserStatuses();
  const { userTypes } = useUserTypes();

  const handleSearch = useCallback(() => {
    setParams((p) => ({ ...p, Search: searchInput || undefined, PageIndex: 1 }));
  }, [searchInput]);

  const handleStatusFilter = useCallback((val: string) => {
    setParams((p) => ({
      ...p,
      Status: val === 'all' ? undefined : (val as UserStatus),
      PageIndex: 1,
    }));
  }, []);

  const handleTypeFilter = useCallback((val: string) => {
    setParams((p) => ({
      ...p,
      Type: val === 'all' ? undefined : (val as UserType),
      PageIndex: 1,
    }));
  }, []);

  const handlePageChange = useCallback((dir: 1 | -1) => {
    setParams((p) => ({ ...p, PageIndex: (p.PageIndex ?? 1) + dir }));
  }, []);

  const totalPages = useMemo(
    () => (data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1),
    [data]
  );

  const handleViewDetails = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  const closeModal = useCallback(() => setSelectedUserId(null), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage and verify platform users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {userStatuses.map((s) => (
              <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleTypeFilter} defaultValue="all">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {userTypes.map((t) => (
              <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} size="sm">
          Search
        </Button>
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
            No users found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((user: AdminUser) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{user.userType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass[user.userStatus]}>
                      {user.userStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                    {new Date(user.joinAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(user.userId)}
                    >
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
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

      {/* Verification Modal */}
      {selectedUserId && (
        <UserVerificationModal userId={selectedUserId} onClose={closeModal} />
      )}
    </div>
  );
});

AdminUsersPage.displayName = 'AdminUsersPage';
export default AdminUsersPage;
