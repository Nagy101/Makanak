// ═══════════════════════════════════════════════════════════════
//  Reviews Feature — Public API
//  Import from '@/features/reviews' instead of deep paths.
// ═══════════════════════════════════════════════════════════════

// Types
export type {
  Review,
  CreateReviewRequest,
  GetPropertyReviewsParams,
  ReviewApiResponse,
  ReviewPaginatedData,
} from './review.types';

// Service (rarely needed directly — prefer hooks)
export * as reviewService from './review.service';

// Hooks
export { usePropertyReviews, useCreateReview, useDeleteReview } from './useReviews';

// UI Components — these are NOT re-exported as lazy here because they
// are imported lazily where needed (App.tsx / page level) using:
//   const LeaveReviewModal = lazy(
//     () => import(/* webpackChunkName: "reviews-module" */
//       '@/features/reviews/components/LeaveReviewModal')
//   );
//
// Direct imports are fine for components used inside the reviews
// section itself (already inside PropertyDetailsPage bundle).
