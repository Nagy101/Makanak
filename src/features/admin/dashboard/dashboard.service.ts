// ═══════════════════════════════════════════════════════════════
//  Admin Dashboard — Service Layer
//  4 decoupled fetch functions — one per endpoint.
//  Each is independent so TanStack Query can run them in parallel.
// ═══════════════════════════════════════════════════════════════
import axios from "axios";
import { storage } from "@/lib/storage";
import { setup401Interceptor } from "@/lib/api";
import type {
  DashboardApiResponse,
  UserStats,
  PropertyStats,
  BookingsStats,
  FinancialStats,
} from "./dashboard.types";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});
setup401Interceptor(api);

// ── 1. Users Stats ─────────────────────────────────────────────
export const getUserStats = (): Promise<UserStats> =>
  api
    .get<DashboardApiResponse<UserStats>>("/AdminDashboard/users-stats")
    .then((r) => r.data.data);

// ── 2. Properties Stats ────────────────────────────────────────
export const getPropertyStats = (): Promise<PropertyStats> =>
  api
    .get<
      DashboardApiResponse<PropertyStats>
    >("/AdminDashboard/properties-stats")
    .then((r) => r.data.data);

// ── 3. Bookings Stats ──────────────────────────────────────────
export const getBookingsStats = (): Promise<BookingsStats> =>
  api
    .get<DashboardApiResponse<BookingsStats>>("/AdminDashboard/bookings-stats")
    .then((r) => r.data.data);

// ── 4. Financial Stats ─────────────────────────────────────────
export const getFinancialStats = (): Promise<FinancialStats> =>
  api
    .get<
      DashboardApiResponse<FinancialStats>
    >("/AdminDashboard/financial-stats")
    .then((r) => r.data.data);
