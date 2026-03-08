import { memo, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminUsers, useAddStrike, useRemoveStrike } from "../useAdmin";
import type {
  AdminUserSearchParams,
  UserStatus,
  UserType,
  AdminUser,
} from "../admin.types";
import UserVerificationModal from "../components/UserVerificationModal";
import { useUserStatuses, useUserTypes } from "@/features/lookup";
import { toast } from "sonner";
const PAGE_SIZE = 10;

const statusBadgeClass: Record<UserStatus, string> = {
  New: "bg-primary/10 text-primary border-primary/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Active: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
  Banned: "bg-destructive/10 text-destructive border-destructive/20",
};

// ── Memoized Strike Badge (primitive props only) ──
const StrikeBadge = memo(function StrikeBadge({ count }: { count: number }) {
  const colorClass =
    count === 0
      ? "bg-success/10 text-success border-success/20"
      : count >= 3
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : "bg-warning/10 text-warning border-warning/20";

  return (
    <Badge variant="outline" className={`text-xs font-semibold ${colorClass}`}>
      {count}/3
    </Badge>
  );
});
StrikeBadge.displayName = "StrikeBadge";

// ── Memoized Strike Action Buttons ──
interface StrikeActionsProps {
  userId: string;
  strikeCount: number;
  onAddStrike: (userId: string) => void;
  onRemoveStrike: (userId: string) => void;
  isPending: boolean;
  addLabel: string;
  removeLabel: string;
  confirmTitle: string;
  confirmDesc: string;
  confirmAction: string;
  cancelLabel: string;
}

const StrikeActions = memo(function StrikeActions({
  userId,
  strikeCount,
  onAddStrike,
  onRemoveStrike,
  isPending,
  addLabel,
  removeLabel,
  confirmTitle,
  confirmDesc,
  confirmAction,
  cancelLabel,
}: StrikeActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <AlertDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-warning hover:text-destructive"
                disabled={isPending || strikeCount >= 3}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>{addLabel}</TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onAddStrike(userId)}
            >
              {confirmAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            disabled={isPending || strikeCount === 0}
            onClick={() => onRemoveStrike(userId)}
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{removeLabel}</TooltipContent>
      </Tooltip>
    </div>
  );
});
StrikeActions.displayName = "StrikeActions";

const AdminUsersPage = memo(() => {
  const { t } = useTranslation();
  const [params, setParams] = useState<AdminUserSearchParams>({
    PageIndex: 1,
    PageSize: PAGE_SIZE,
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers(params);
  const { userStatuses } = useUserStatuses();
  const { userTypes } = useUserTypes();
  const addStrikeMutation = useAddStrike();
  const removeStrikeMutation = useRemoveStrike();
  const isStrikePending =
    addStrikeMutation.isPending || removeStrikeMutation.isPending;

  const handleAddStrike = useCallback(
    (userId: string) => {
      addStrikeMutation.mutate(userId, {
        onSuccess: () => toast.success(t("admin.strikeAdded")),
      });
    },
    [addStrikeMutation, t],
  );

  const handleRemoveStrike = useCallback(
    (userId: string) => {
      removeStrikeMutation.mutate(userId, {
        onSuccess: () => toast.success(t("admin.strikeRemoved")),
      });
    },
    [removeStrikeMutation, t],
  );

  const handleSearch = useCallback(() => {
    setParams((p) => ({
      ...p,
      Search: searchInput || undefined,
      PageIndex: 1,
    }));
  }, [searchInput]);

  const handleStatusFilter = useCallback((val: string) => {
    setParams((p) => ({
      ...p,
      Status: val === "all" ? undefined : (val as UserStatus),
      PageIndex: 1,
    }));
  }, []);

  const handleTypeFilter = useCallback((val: string) => {
    setParams((p) => ({
      ...p,
      Type: val === "all" ? undefined : (val as UserType),
      PageIndex: 1,
    }));
  }, []);

  const handlePageChange = useCallback((dir: 1 | -1) => {
    setParams((p) => ({ ...p, PageIndex: (p.PageIndex ?? 1) + dir }));
  }, []);

  const totalPages = useMemo(
    () => (data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1),
    [data],
  );

  const handleViewDetails = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  const closeModal = useCallback(() => setSelectedUserId(null), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("admin.userManagement")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.manageVerifyUsers")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("admin.searchByNameOrEmail")}
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.allStatus")}</SelectItem>
            {userStatuses.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleTypeFilter} defaultValue="all">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("admin.typeColumn")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.allTypes")}</SelectItem>
            {userTypes.map((ut) => (
              <SelectItem key={ut.id} value={ut.name}>
                {ut.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} size="sm">
          {t("common.search")}
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
            {t("admin.noUsersFound")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.nameColumn")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("admin.emailColumn")}
                </TableHead>
                <TableHead>{t("admin.typeColumn")}</TableHead>
                <TableHead>{t("admin.statusColumn")}</TableHead>
                <TableHead>{t("admin.strikesColumn")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("admin.joinedColumn")}
                </TableHead>
                <TableHead className="text-right">
                  {t("admin.actionsColumn")}
                </TableHead>
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
                    <Badge variant="outline" className="text-xs">
                      {user.userType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusBadgeClass[user.userStatus]}
                    >
                      {user.userStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StrikeBadge count={user.strikeCount ?? 0} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                    {new Date(user.joinAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <StrikeActions
                        userId={user.userId}
                        strikeCount={user.strikeCount ?? 0}
                        onAddStrike={handleAddStrike}
                        onRemoveStrike={handleRemoveStrike}
                        isPending={isStrikePending}
                        addLabel={t("admin.addStrike")}
                        removeLabel={t("admin.removeStrike")}
                        confirmTitle={t("admin.confirmStrikeTitle")}
                        confirmDesc={t("admin.confirmStrikeDesc")}
                        confirmAction={t("admin.confirmStrikeAction")}
                        cancelLabel={t("common.cancel")}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(user.userId)}
                      >
                        <Eye className="mr-1 h-4 w-4" /> {t("common.view")}
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
            Page {params.PageIndex ?? 1} of {totalPages} ({data.totalCount}{" "}
            total)
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

AdminUsersPage.displayName = "AdminUsersPage";
export default AdminUsersPage;
