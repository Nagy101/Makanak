import axios from "axios";
import { storage } from "@/lib/storage";
import { setup401Interceptor } from "@/lib/api";
import type {
  ApiResponse,
  Governorate,
  Amenity,
  PropertyType,
  PropertyStatus,
  UserStatus,
  UserType,
  DisputeReason,
  BookingStatus,
  SortingOption,
} from "./lookup.types";

const api = axios.create({
  baseURL: "/api/Lookup",
  headers: { "Content-Type": "application/json" },
});

// ── Governorates ──
export const getGovernorates = () =>
  api.get<ApiResponse<Governorate[]>>("/governorates").then((r) => r.data.data);

// ── Amenities ──
export const getAmenities = () =>
  api.get<ApiResponse<Amenity[]>>("/amenities").then((r) => r.data.data);

// ── Property Types (Enum) ──
export const getPropertyTypes = () =>
  api
    .get<ApiResponse<PropertyType[]>>("/property-types")
    .then((r) => r.data.data);

// ── Property Statuses (Enum) ──
export const getPropertyStatuses = () =>
  api
    .get<ApiResponse<PropertyStatus[]>>("/property-statuses")
    .then((r) => r.data.data);

// ── User Statuses (Enum) ──
export const getUserStatuses = () =>
  api.get<ApiResponse<UserStatus[]>>("/user-statuses").then((r) => r.data.data);

// ── User Types (Enum) ──
export const getUserTypes = () =>
  api.get<ApiResponse<UserType[]>>("/user-types").then((r) => r.data.data);

// ── Booking Statuses (Enum) ──
export const getBookingStatuses = () =>
  api
    .get<ApiResponse<BookingStatus[]>>("/booking-statuses")
    .then((r) => r.data.data);

// NOTE: /dispute-reasons and /dispute-statuses endpoints do NOT exist on the backend.
// Use role-scoped dispute reason endpoints below.
// Use DisputeStatus/DisputeStatusType constants from dispute.types.ts for statuses.

// ── Sorting Options ──
export const getSortingOptions = () =>
  api
    .get<ApiResponse<SortingOption[]>>("/sorting-options")
    .then((r) => r.data.data);

// ────────────────────────────────────────────────────────────────────────────
// Role-based Dispute Reasons  (same /api/Lookup controller, auth-required)
// ────────────────────────────────────────────────────────────────────────────

// Attach auth token to the shared api instance (idempotent interceptor)
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
setup401Interceptor(api);

/** Reasons available to property owners when filing a dispute */
export const getOwnerDisputeReasons = () =>
  api
    .get<ApiResponse<DisputeReason[]>>("/owner-dispute-reasons")
    .then((r) => r.data.data);

/** Reasons available to tenants when filing a dispute */
export const getTenantDisputeReasons = () =>
  api
    .get<ApiResponse<DisputeReason[]>>("/tenant-dispute-reasons")
    .then((r) => r.data.data);

/** All dispute reasons — for admin filter dropdowns */
export const getAllDisputeReasons = () =>
  api
    .get<ApiResponse<DisputeReason[]>>("/all-dispute-reasons")
    .then((r) => r.data.data);
