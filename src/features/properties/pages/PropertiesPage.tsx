import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProperties } from "../useProperties";
import type { PropertySearchParams } from "../property.types";
import PropertySearchFilter from "../components/PropertySearchFilter";
import PropertyCard from "../components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import UserNavbar from "@/components/UserNavbar";

// ── Helper: build initial params from URL query string ────────
function buildInitialParams(searchParams: URLSearchParams): PropertySearchParams {
  const base: PropertySearchParams = { PageIndex: 1, PageSize: 6 };
  const search      = searchParams.get("Search");
  const govId       = searchParams.get("GovernorateId");
  const pageIndex   = searchParams.get("PageIndex");
  if (search)    base.Search        = search;
  if (govId)     base.GovernorateId = Number(govId);
  if (pageIndex) base.PageIndex     = Number(pageIndex);
  return base;
}

export default function PropertiesPage() {
  const [searchParams] = useSearchParams();

  const [params, setParams] = useState<PropertySearchParams>(() =>
    buildInitialParams(searchParams),
  );

  // Sync params when URL search string changes (e.g. nav from HomePage)
  useEffect(() => {
    setParams(buildInitialParams(searchParams));
    // We only want to re-init when the URL query string changes from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const { data, isLoading, isFetching } = useProperties(params);

  const currentPage = params.PageIndex ?? 1;
  const totalPages  = data
    ? Math.ceil(data.totalCount / (params.PageSize || 6))
    : 0;

  // ── Pagination helper ──────────────────────────────────────
  function getPageNumbers(): number[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <UserNavbar />
      <PropertySearchFilter params={params} onParamsChange={setParams} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Properties</h1>
            {data && (
              <p className="mt-1 text-sm text-muted-foreground">
                {data.totalCount}{" "}
                {data.totalCount === 1 ? "property" : "properties"} found
              </p>
            )}
          </div>
          {isFetching && !isLoading && (
            <div className="text-sm text-muted-foreground animate-pulse">
              Updating…
            </div>
          )}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border bg-card">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && data && data.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 rounded-2xl bg-muted p-6">
              <SearchX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              No properties found
            </h2>
            <p className="max-w-md text-muted-foreground">
              Try adjusting your search or filters to find what you are looking
              for.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setParams({ PageIndex: 1, PageSize: 6 })}
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Property grid */}
        {!isLoading && data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.data.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setParams({ ...params, PageIndex: currentPage - 1 })
                  }
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setParams({ ...params, PageIndex: page })}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setParams({ ...params, PageIndex: currentPage + 1 })
                  }
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
