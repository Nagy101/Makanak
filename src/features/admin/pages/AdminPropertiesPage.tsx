import { memo, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProperties } from "@/features/properties/useProperties";
import { useUpdatePropertyStatus, useAdminProperties } from "../useAdmin";
import {
  usePropertyTypes,
  usePropertyStatuses,
  useGovernorates,
  useSortingOptions,
} from "@/features/lookup";
import PropertyDetailsModal from "../components/PropertyDetailsModal";
import type {
  PropertySearchParams,
  PropertyListing,
} from "@/features/properties/property.types";
import type {
  AdminPropertySearchParams,
  AdminPropertyListing,
  PropertyStatus,
} from "../admin.types";
import { toast } from "sonner";

const PAGE_SIZE = 10;

// Mapping from SortingOption id to backend enum names
const SORT_ID_TO_ENUM: Record<number, string> = {
  1: "NameAsc",
  2: "NameDesc",
  3: "DateCreatedAsc",
  4: "DateCreatedDesc",
  5: "PriceAsc",
  6: "PriceDesc",
};

const statusColor: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  Accepted: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
  Banned: "bg-destructive/10 text-destructive border-destructive/20",
};

const AdminPropertiesPage = memo(() => {
  const { t } = useTranslation();
  const localized = useLocalizedField();
  const [params, setParams] = useState<AdminPropertySearchParams>({
    PageIndex: 1,
    PageSize: PAGE_SIZE,
  });
  const [searchInput, setSearchInput] = useState("");

  // Use admin-specific property endpoint
  const { data, isLoading } = useAdminProperties(params);
  const mutation = useUpdatePropertyStatus();

  // Get lookups
  const { propertyTypes } = usePropertyTypes();
  const { propertyStatuses } = usePropertyStatuses();
  const { governorates } = useGovernorates();
  const { sortingOptions } = useSortingOptions();

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null,
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
      Status: val === "all" ? undefined : (val as PropertyStatus),
      PageIndex: 1,
    }));
  }, []);

  const handleTypeFilter = useCallback((val: string) => {
    setParams((p) => ({
      ...p,
      Type: val === "all" ? undefined : val,
      PageIndex: 1,
    }));
  }, []);

  const handleGovernorateFilter = useCallback((val: string) => {
    setParams((p) => ({
      ...p,
      GovernorateId: val === "all" ? undefined : Number(val),
      PageIndex: 1,
    }));
  }, []);

  const handleSortChange = useCallback((val: string) => {
    if (val === "none") {
      setParams((p) => ({ ...p, Sort: undefined, PageIndex: 1 }));
    } else {
      const enumName = SORT_ID_TO_ENUM[Number(val)];
      setParams((p) => ({ ...p, Sort: enumName, PageIndex: 1 }));
    }
  }, []);

  const totalPages = useMemo(
    () => (data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1),
    [data],
  );

  const handleApprove = useCallback(
    (propertyId: number) => {
      mutation.mutate(
        { propertyId, newStatus: "Accepted" },
        { onSuccess: () => toast.success(t("admin.propertyApproved")) },
      );
    },
    [mutation],
  );

  const handleRejectSubmit = useCallback(() => {
    if (rejectTarget === null) return;
    mutation.mutate(
      {
        propertyId: rejectTarget,
        newStatus: "Rejected",
        rejectedReason: rejectReason,
      },
      {
        onSuccess: () => {
          toast.success(t("admin.propertyRejected"));
          setRejectTarget(null);
          setRejectReason("");
        },
      },
    );
  }, [rejectTarget, rejectReason, mutation]);

  const handlePageChange = useCallback((dir: 1 | -1) => {
    setParams((p) => ({ ...p, PageIndex: (p.PageIndex ?? 1) + dir }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("admin.propertyManagement")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.reviewManageListings")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("admin.searchPropertiesPlaceholder")}
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("admin.statusColumn")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.allStatus")}</SelectItem>
            {propertyStatuses.map((status) => (
              <SelectItem key={status.id} value={status.name}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleTypeFilter} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.allTypes")}</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type.id} value={type.name}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleGovernorateFilter} defaultValue="all">
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Governorate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.allGovernorates")}</SelectItem>
            {governorates.map((gov) => (
              <SelectItem key={gov.id} value={gov.id.toString()}>
                {localized(gov.nameEn, gov.nameAr)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleSortChange} defaultValue="none">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("admin.defaultSort")}</SelectItem>
            {sortingOptions.map((option) => (
              <SelectItem key={option.id} value={option.id.toString()}>
                {option.name}
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
            {t("admin.noPropertiesFound")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.titleColumn")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("admin.typeColumn")}
                </TableHead>
                <TableHead>{t("admin.priceNightColumn")}</TableHead>
                <TableHead>{t("admin.statusColumn")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("admin.locationColumn")}
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("admin.createdColumn")}
                </TableHead>
                <TableHead className="text-right">
                  {t("admin.actionsColumn")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((p: AdminPropertyListing) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {p.title}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                    {p.propertyType}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {p.pricePerNight} EGP
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        statusColor[p.propertyStatus ?? "Pending"] ?? ""
                      }
                    >
                      {p.propertyStatus ?? "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                    {p.governorateName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/15 hover:text-primary"
                        onClick={() => setSelectedPropertyId(p.id)}
                        title={t("admin.viewDetails")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-success hover:bg-success/15 hover:text-success"
                        onClick={() => handleApprove(p.id)}
                        disabled={mutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/15 hover:text-destructive"
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

      {/* Property Details Modal */}
      <PropertyDetailsModal
        propertyId={selectedPropertyId}
        onClose={() => setSelectedPropertyId(null)}
      />

      {/* Reject Dialog */}
      <Dialog
        open={rejectTarget !== null}
        onOpenChange={() => setRejectTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.rejectProperty")}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={t("admin.reasonForRejection")}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
              className="hover:bg-muted hover:text-foreground hover:border-border"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={mutation.isPending}
            >
              {t("admin.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

AdminPropertiesPage.displayName = "AdminPropertiesPage";
export default AdminPropertiesPage;
