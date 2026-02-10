import { useState } from 'react';
import { useProperties } from '../useProperties';
import type { PropertySearchParams } from '../property.types';
import PropertySearchFilter from '../components/PropertySearchFilter';
import PropertyCard from '../components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Building2, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';

export default function PropertiesPage() {
  const [params, setParams] = useState<PropertySearchParams>({
    PageIndex: 1,
    PageSize: 12,
  });

  const { data, isLoading, isFetching } = useProperties(params);

  const totalPages = data ? Math.ceil(data.totalCount / (params.PageSize || 12)) : 0;
  const currentPage = params.PageIndex || 1;

  return (
    <div className="min-h-screen bg-secondary/30">
      <PropertySearchFilter params={params} onParamsChange={setParams} />

      <main className="container mx-auto px-4 py-8">
        {/* Results header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Properties</h1>
            {data && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.totalCount} {data.totalCount === 1 ? 'property' : 'properties'} found
              </p>
            )}
          </div>
          {isFetching && !isLoading && (
            <div className="text-sm text-muted-foreground animate-pulse">Updating…</div>
          )}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-3">
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
            <div className="rounded-2xl bg-muted p-6 mb-6">
              <SearchX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No properties found</h2>
            <p className="text-muted-foreground max-w-md">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setParams({ PageIndex: 1, PageSize: 12 })}
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Property grid */}
        {!isLoading && data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  onClick={() => setParams({ ...params, PageIndex: currentPage - 1 })}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'ghost'}
                        size="sm"
                        className="w-9 h-9"
                        onClick={() => setParams({ ...params, PageIndex: page })}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setParams({ ...params, PageIndex: currentPage + 1 })}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
