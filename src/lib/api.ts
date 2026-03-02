/**
 * Shared Axios Factory
 *
 * createApi(baseURL)
 *   – Creates a fully configured AxiosInstance with:
 *       1. Automatic Bearer-token injection on every request.
 *       2. Global 401 response interceptor that clears auth state,
 *          shows a toast, and hard-redirects to /login.
 *
 * setup401Interceptor(instance)
 *   – Attaches only the 401 response interceptor to an existing
 *     instance (used by feature services that create their own
 *     axios.create() instead of going through createApi).
 */

import axios, { type AxiosInstance } from "axios";
import { toast } from "sonner";
import { storage } from "./storage";

// ── Centralised base URL from environment ─────────────────────
// Strips any trailing slash to prevent double-slash in URLs.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string).replace(
  /\/+$/,
  "",
);

// ── Guard: prevent redirect loops and duplicate toasts ────────
let _401Handled = false;

// ── 401 Response interceptor ──────────────────────────────────
export function setup401Interceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response?.status === 401 &&
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

        // 3. Inform the user
        toast.error(
          "Your session has expired or you are unauthorized. Please log in again.",
        );

        // 4. Hard redirect — safe even outside React Router context
        window.location.href = "/login";

        // Reset guard after navigation (next page load)
        setTimeout(() => {
          _401Handled = false;
        }, 5_000);
      }

      return Promise.reject(error);
    },
  );
}

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
  setup401Interceptor(instance);

  return instance;
}
