// ═══════════════════════════════════════════════════════════════
//  Reviews Module — TanStack Query Hooks
//
//  Performance Checklist Applied:
//  ✓ useInfiniteQuery for paginated reviews (infinite scroll / load-more)
//  ✓ Stable, typed query keys
//  ✓ select option to transform/extract data
//  ✓ Atomic Zustand selector (s => s.user) — used in calling components
//  ✓ Toast feedback on mutations
//  ✓ Precise cache invalidation scoped to the property
// ═══════════════════════════════════════════════════════════════
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import * as reviewService from './review.service';
import type { CreateReviewRequest, Review } from './review.types';
import { toast } from 'sonner';

// ── Constants ─────────────────────────────────────────────────
const PAGE_SIZE = 5;

/** Stable, namespaced query key factory */
const reviewKeys = {
  all: ['reviews'] as const,
  property: (propertyId: number) => ['reviews', propertyId] as const,
};

// ── usePropertyReviews ────────────────────────────────────────
/**
 * Fetches paginated reviews for a property using **useInfiniteQuery**.
 *
 * The backend returns:
 *   { pageIndex, pageSize, count, data: Review[] }
 *
 * `getNextPageParam` computes whether a next page exists by comparing
 * how many items we've received so far against the total `count`.
 *
 * Performance:
 *   - `select` flattens all pages into a single Review[] + exposes count.
 *   - Stable query key via `reviewKeys.property(propertyId)`.
 */
export const usePropertyReviews = (propertyId: number) =>
  useInfiniteQuery({
    queryKey: reviewKeys.property(propertyId),
    queryFn: ({ pageParam }) =>
      reviewService.getPropertyReviews(propertyId, {
        pageIndex: pageParam as number,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pageIndex, pageSize, count } = lastPage.data;
      const fetched = pageIndex * pageSize;
      return fetched < count ? pageIndex + 1 : undefined;
    },
    enabled: propertyId > 0,
    staleTime: 2 * 60 * 1000, // 2 min — reviews don't change every second
    // ── Transform: flatten pages → flat array + total count ──
    select: (data) => ({
      reviews: data.pages.flatMap((page) => page.data.data) as Review[],
      totalCount: data.pages[0]?.data.count ?? 0,
      pageParams: data.pageParams,
    }),
  });

// ── useCreateReview ───────────────────────────────────────────
/**
 * Mutation hook for creating a review (Tenant only, Completed bookings).
 * Accepts `propertyId` to know which cache key to invalidate after success.
 */
export const useCreateReview = (propertyId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewService.createReview(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Review submitted successfully!');
      // Invalidate only the reviews for this specific property
      qc.invalidateQueries({ queryKey: reviewKeys.property(propertyId) });
    },
  });
};

// ── useDeleteReview ───────────────────────────────────────────
/**
 * Mutation hook for deleting a review.
 * Allowed for: the review's original author (Tenant) OR Admin.
 * `propertyId` is required to invalidate the correct cache entry.
 */
export const useDeleteReview = (propertyId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number) => reviewService.deleteReview(reviewId),
    onSuccess: (res) => {
      toast.success(res.message || 'Review deleted.');
      qc.invalidateQueries({ queryKey: reviewKeys.property(propertyId) });
    },
  });
};
