// ═══════════════════════════════════════════════════════════════
//  Reviews Module — Axios Service Layer
// ═══════════════════════════════════════════════════════════════
import axios from "axios";
import { storage } from "@/lib/storage";
import { setup401Interceptor, API_BASE } from "@/lib/api";
import type {
  ReviewApiResponse,
  ReviewPaginatedData,
  Review,
  CreateReviewRequest,
  GetPropertyReviewsParams,
} from "./review.types";

// ── Axios instance ────────────────────────────────────────────
const api = axios.create({
  baseURL: `${API_BASE}/Review`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});
setup401Interceptor(api);

// ── Create Review (Tenant — Completed bookings only) ─────────
// POST /api/Review
export const createReview = (data: CreateReviewRequest) =>
  api.post<ReviewApiResponse<Review>>("", data).then((r) => r.data);

// ── Get Property Reviews (Paginated) ─────────────────────────
// GET /api/Review/{propertyId}?pageIndex=1&pageSize=5
export const getPropertyReviews = (
  propertyId: number,
  params: GetPropertyReviewsParams,
) =>
  api
    .get<ReviewApiResponse<ReviewPaginatedData<Review>>>(`/${propertyId}`, {
      params,
    })
    .then((r) => r.data);

// ── Delete Review (Tenant author OR Admin) ────────────────────
// DELETE /api/Review/{reviewId}
export const deleteReview = (reviewId: number) =>
  api.delete<ReviewApiResponse<string>>(`/${reviewId}`).then((r) => r.data);
