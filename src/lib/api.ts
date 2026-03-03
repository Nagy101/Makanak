/**
 * Shared Axios Factory
 *
 * createApi(baseURL)
 *   – Creates a fully configured AxiosInstance with:
 *       1. Automatic Bearer-token injection on every request.
 *       2. Global response interceptor that:
 *          a. Rejects when the backend returns isSuccess === false
 *             (even on a 2xx HTTP status).
 *          b. Normalises every API error into a structured ApiError
 *             carrying the backend's message and errors array.
 *          c. Handles 401 Unauthorized — clears auth, shows the
 *             backend's message, and hard-redirects to /login.
 *
 * setupResponseInterceptor(instance)
 *   – Attaches the unified response interceptor to an existing
 *     instance (used by feature services that create their own
 *     axios.create() instead of going through createApi).
 *
 * @deprecated setup401Interceptor — renamed to setupResponseInterceptor.
 *             Re-exported for backwards compatibility.
 */

import axios, { type AxiosInstance } from "axios";
import { toast } from "sonner";
import { storage } from "./storage";
import { ApiError } from "./apiTypes";

// ── Centralised base URL from environment ─────────────────────
// Strips any trailing slash to prevent double-slash in URLs.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string).replace(
  /\/+$/,
  "",
);

// ── Guard: prevent redirect loops and duplicate toasts ────────
let _401Handled = false;

// ── Unified Response Interceptor ──────────────────────────────
export function setupResponseInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    // ── Fulfil handler: catch isSuccess === false on 2xx ──────
    (response) => {
      const body = response.data;

      if (
        body &&
        typeof body === "object" &&
        "isSuccess" in body &&
        body.isSuccess === false
      ) {
        return Promise.reject(
          new ApiError(
            body.statusCode ?? response.status,
            body.message || "Something went wrong.",
            body.errors ?? null,
          ),
        );
      }

      return response;
    },

    // ── Reject handler: HTTP 4xx / 5xx ───────────────────────
    (error) => {
      // Network failure — no response received
      if (!axios.isAxiosError(error) || !error.response) {
        return Promise.reject(
          new ApiError(
            0,
            "Network error. Please check your connection and try again.",
            null,
          ),
        );
      }

      const { status, data } = error.response;

      // ── 401 Unauthorized ────────────────────────────────────
      if (
        status === 401 &&
        !_401Handled &&
        !window.location.pathname.includes("/login")
      ) {
        _401Handled = true;

        // 1. Clear persisted token + user from localStorage
        storage.clear();

        // 2. Wipe Zustand auth store without importing it at module
        //    level (avoids circular-dep between api.ts ↔ auth.service.ts)
        import("@/features/auth/store/authStore")
          .then(({ useAuthStore }) => useAuthStore.getState().clearAuth())
          .catch(() => {
            /* no-op: store not yet loaded */
          });

        // 3. Show the API's message (fall back only if absent)
        const authMessage =
          data?.message || "Session expired. Please log in again.";
        toast.error(authMessage);

        // 4. Hard redirect — safe even outside React Router context
        window.location.href = "/login";

        // Reset guard after navigation (next page load)
        setTimeout(() => {
          _401Handled = false;
        }, 5_000);
      }

      // ── Normalise into ApiError ─────────────────────────────
      return Promise.reject(
        new ApiError(
          data?.statusCode ?? status,
          data?.message || "Something went wrong.",
          data?.errors ?? null,
        ),
      );
    },
  );
}

/**
 * @deprecated Use `setupResponseInterceptor` instead.
 * Kept for backwards compatibility during migration.
 */
export const setup401Interceptor = setupResponseInterceptor;

// ── Auth Request interceptor ──────────────────────────────────
function attachAuthHeader(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    const token = storage.getToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    return config;
  });
}

// ── Factory ───────────────────────────────────────────────────
export function createApi(baseURL: string = API_BASE): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  attachAuthHeader(instance);
  setupResponseInterceptor(instance);

  return instance;
}
