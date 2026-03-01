import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  SearchX,
  MessageSquare,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMyProperties, useDeleteProperty } from "../useOwnerProperties";
import OwnerPropertyCard from "../components/OwnerPropertyCard";
import type { MyPropertiesParams } from "../owner.types";
import { usePropertyStatuses, useSortingOptions } from "@/features/lookup";
import { toLabel } from "@/lib/utils";

const PropertyReviewsSection = lazy(
  () => import("@/features/reviews/components/PropertyReviewsSection"),
);

export default function OwnerDashboardPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<MyPropertiesParams>({
    PageIndex: 1,
    PageSize: 6,
  });
  const [localSearch, setLocalSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [reviewPropertyId, setReviewPropertyId] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useMyProperties(params);
  const deleteMutation = useDeleteProperty();
  const { propertyStatuses } = usePropertyStatuses();
  const { sortingOptions } = useSortingOptions();

  const totalPages = useMemo(
    () => (data ? Math.ceil(data.totalCount / (params.PageSize || 6)) : 0),
    [data, params.PageSize],
  );
  const currentPage = params.PageIndex || 1;

  const handleSearch = useCallback(() => {
    setParams((p) => ({ ...p, Search: localSearch, PageIndex: 1 }));
  }, [localSearch]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setParams((p) => ({
      ...p,
      FilterStatus: tab === "All" ? undefined : tab,
      PageIndex: 1,
    }));
  }, []);

  const handleSort = useCallback((value: string) => {
    setParams((p) => ({ ...p, Sort: value, PageIndex: 1 }));
  }, []);

  const handleEdit = useCallback(
    (id: number) => {
      navigate(`/owner/properties/${id}/edit`);
    },
    [navigate],
  );

  const handleDelete = useCallback((id: number) => {
    setDeleteTarget(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTarget !== null) {
      deleteMutation.mutate(deleteTarget);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteMutation]);

  const handlePageChange = useCallback((page: number) => {
    setParams((p) => ({ ...p, PageIndex: page }));
  }, []);

  const handleViewReviews = useCallback((id: number) => {
    setReviewPropertyId(id);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                My Properties
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {data
                  ? `${data.totalCount} propert${data.totalCount === 1 ? "y" : "ies"} listed`
                  : "Manage your property listings"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/owner/properties/new")}
            className="font-semibold shadow-sm"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Property
          </Button>
        </div>
      </div>

      {/* Status tabs — sourced from lookup API */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...propertyStatuses.map((s) => s.name)] as string[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
              }`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {/* Search & Sort */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search properties…"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-10"
            />
          </div>
          <Select value={params.Sort || ""} onValueChange={handleSort}>
            <SelectTrigger className="w-full sm:w-[200px] h-10">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortingOptions.map((o) => (
                <SelectItem key={o.id} value={o.name}>
                  {toLabel(o.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="h-10 shrink-0">
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
          {isFetching && !isLoading && (
            <span className="self-center text-sm text-muted-foreground animate-pulse whitespace-nowrap">
              Updating…
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card overflow-hidden shadow-sm"
            >
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-9 w-full rounded-lg mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && data && data.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-3xl bg-muted/60 border border-dashed border-muted-foreground/20 p-10 mb-6 flex items-center justify-center">
            <SearchX className="h-14 w-14 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            No properties found
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            {activeTab === "All"
              ? "You haven't listed any properties yet. Add your first to get started."
              : `No properties with "${activeTab}" status.`}
          </p>
          {activeTab === "All" && (
            <Button
              className="mt-6 font-semibold"
              size="lg"
              onClick={() => navigate("/owner/properties/new")}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Your First Property
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((p) => (
              <OwnerPropertyCard
                key={p.id}
                property={p}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewReviews={handleViewReviews}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  const isVisible =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;
                  if (!isVisible) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span
                          key={page}
                          className="text-muted-foreground px-1 text-sm"
                        >
                          …
                        </span>
                      );
                    }
                    return null;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                        page === currentPage
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-primary hover:text-primary-foreground text-muted-foreground"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Property Reviews Dialog */}
      <Dialog
        open={!!reviewPropertyId}
        onOpenChange={(open) => !open && setReviewPropertyId(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Property Reviews
            </DialogTitle>
          </DialogHeader>
          {reviewPropertyId && (
            <Suspense
              fallback={
                <div className="py-10 text-center text-muted-foreground">
                  Loading reviews…
                </div>
              }
            >
              <PropertyReviewsSection propertyId={reviewPropertyId} />
            </Suspense>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
