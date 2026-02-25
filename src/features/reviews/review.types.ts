// ═══════════════════════════════════════════════════════════════
//  Reviews Module — Strict TypeScript Types
//  Matches the API contract exactly (no truncations).
// ═══════════════════════════════════════════════════════════════

// ── Generic API Response Wrapper ──────────────────────────────
export interface ReviewApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// ── Paginated Envelope ────────────────────────────────────────
export interface ReviewPaginatedData<T> {
  pageIndex: number;
  pageSize: number;
  /** Total number of items across all pages */
  count: number;
  data: T[];
}

// ── Single Review Item ─────────────────────────────────────────
export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string;
  reviewerPhotoUrl: string;
}

// ── Create Review ─────────────────────────────────────────────
// POST /api/Review
// Business rule: only allowed when booking.status === 'Completed'

export interface CreateReviewRequest {
  bookingId: number;
  rating: number; // 1–5
  comment: string;
}

// Response: ReviewApiResponse<Review>

// ── Get Property Reviews (Paginated) ─────────────────────────
// GET /api/Review/{propertyId}?pageIndex=1&pageSize=5

export interface GetPropertyReviewsParams {
  pageIndex: number;
  pageSize: number;
}

// Response: ReviewApiResponse<ReviewPaginatedData<Review>>

// ── Delete Review ─────────────────────────────────────────────
// DELETE /api/Review/{reviewId}
// Allowed for: review author (Tenant) OR Admin

// Response: ReviewApiResponse<string>
