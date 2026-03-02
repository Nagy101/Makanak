// ═══════════════════════════════════════════════════════════════
//  PropertyReviewsSection — Main reviews container for a property.
//
//  Responsibilities:
//    • Fetches reviews via usePropertyReviews (useInfiniteQuery).
//    • Renders ReviewItem list, iterating over infinite query pages.
//    • Exposes a "Load More" button; hidden when hasNextPage is false.
//    • Shows a clean empty state when there are no reviews.
//    • Shows skeleton placeholders during the initial load.
//
//  Performance:
//    ✓ React.memo on this component.
//    ✓ Stable key={review.id} (unique DB id — never index).
//    ✓ useCallback for the delete handler.
//    ✓ useMemo for the average rating derived value.
//    ✓ Atomic Zustand selector used inside child components.
// ═══════════════════════════════════════════════════════════════
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Loader2 } from "lucide-react";
import { usePropertyReviews, useDeleteReview } from "../useReviews";
import ReviewItem from "./ReviewItem";
import StarRating from "./StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// ── Props ─────────────────────────────────────────────────────
interface PropertyReviewsSectionProps {
  propertyId: number;
}

// ── Sub-component: Loading Skeletons ──────────────────────────
const ReviewSkeletons = memo(function ReviewSkeletons() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex gap-4 py-5 border-b border-border/50">
          <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
});

// ── Sub-component: Empty State ────────────────────────────────
const EmptyReviews = memo(function EmptyReviews() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      <div className="h-14 w-14 rounded-full bg-primary/8 flex items-center justify-center">
        <MessageSquare className="h-7 w-7 text-primary/50" />
      </div>
      <p className="font-semibold text-foreground">
        {t("reviews.noReviewsYet")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("reviews.beFirstToReview")}
      </p>
    </div>
  );
});

// ── Main Component ────────────────────────────────────────────
const PropertyReviewsSection = memo(function PropertyReviewsSection({
  propertyId,
}: PropertyReviewsSectionProps) {
  const { t } = useTranslation();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    usePropertyReviews(propertyId);

  const { mutate: deleteReview, isPending: isDeleting } =
    useDeleteReview(propertyId);

  // ── Stable delete callback ─────────────────────────────────
  const handleDelete = useCallback(
    (reviewId: number) => deleteReview(reviewId),
    [deleteReview],
  );

  // ── Stable load-more callback ──────────────────────────────
  const handleLoadMore = useCallback(() => fetchNextPage(), [fetchNextPage]);

  // ── Derived: average rating across all loaded reviews ──────
  const averageRating = useMemo(() => {
    const reviews = data?.reviews ?? [];
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [data?.reviews]);

  const totalCount = data?.totalCount ?? 0;
  const reviews = data?.reviews ?? [];

  // ── Render ─────────────────────────────────────────────────
  return (
    <section aria-labelledby="reviews-heading" className="mt-8">
      {/* ── Section Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 id="reviews-heading" className="text-xl font-bold text-foreground">
          {t("reviews.guestReviews")}
        </h2>

        {!isLoading && totalCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(averageRating)} size={18} />
            <span className="text-sm font-semibold text-primary">
              {averageRating}
            </span>
            <span className="text-sm text-muted-foreground">
              ({t("reviews.reviewCount", { count: totalCount })})
            </span>
          </div>
        )}
      </div>

      {/* ── Divider ────────────────────────────────────────── */}
      <div className="h-px bg-border/60 mb-4" />

      {/* ── Content ────────────────────────────────────────── */}
      {isLoading ? (
        <ReviewSkeletons />
      ) : reviews.length === 0 ? (
        <EmptyReviews />
      ) : (
        <>
          {/* ── Review List ──────────────────────────────── */}
          <ul className="divide-y divide-transparent" role="list">
            {reviews.map((review) => (
              // Stable key: unique DB id — NEVER array index
              <li key={review.id}>
                <ReviewItem
                  review={review}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              </li>
            ))}
          </ul>

          {/* ── Load More Button ──────────────────────────── */}
          {hasNextPage && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground
                           min-w-[140px] transition-colors"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("reviews.loadingReviews")}
                  </>
                ) : (
                  t("reviews.loadMoreReviews")
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
});

export default PropertyReviewsSection;
