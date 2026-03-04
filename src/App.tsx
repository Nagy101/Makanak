import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";
import { showApiErrorToast } from "@/lib/apiError";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "next-themes";
import { useAuthStore } from "@/features/auth/store/authStore";
import AuthGuard from "@/components/AuthGuard";
import OwnerGuard from "@/components/OwnerGuard";
import RequireAuth from "@/components/RequireAuth";
import { useAllLookups } from "@/features/lookup";
import { useBannedUserCheck, useProfile } from "@/features/auth/hooks/useAuth";
import NotFound from "./pages/NotFound";

// Lazy load auth pages for better code splitting
const HomePage = lazy(() => import("./pages/HomePage.tsx"));
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("./features/auth/pages/ForgotPasswordPage"),
);
const ProfilePage = lazy(() => import("./features/auth/pages/ProfilePage"));

// Lazy load property pages
const PropertiesPage = lazy(
  () => import("./features/properties/pages/PropertiesPage"),
);
const PropertyDetailsPage = lazy(
  () => import("./features/properties/pages/PropertyDetailsPage"),
);

// Lazy load admin pages
const AdminLayout = lazy(
  () => import("./features/admin/components/AdminLayout"),
);
const AdminLoginPage = lazy(
  () => import("./features/admin/pages/AdminLoginPage"),
);
const AdminDashboardPage = lazy(
  () => import("./features/admin/pages/AdminDashboardPage"),
);
const AdminUsersPage = lazy(
  () => import("./features/admin/pages/AdminUsersPage"),
);
const AdminPropertiesPage = lazy(
  () => import("./features/admin/pages/AdminPropertiesPage"),
);

// Lazy load owner pages
const OwnerLayout = lazy(
  () => import("./features/owner/components/OwnerLayout"),
);
const OwnerDashboardPage = lazy(
  () => import("./features/owner/pages/OwnerDashboardPage"),
);
const AddEditPropertyPage = lazy(
  () => import("./features/owner/pages/AddEditPropertyPage"),
);

// Lazy load booking pages
const TenantBookingsPage = lazy(
  () => import("./features/bookings/pages/TenantBookingsPage"),
);
const OwnerIncomingBookingsPage = lazy(
  () => import("./features/bookings/pages/OwnerIncomingBookingsPage"),
);

// Lazy load check-in / QR scanner page
const OwnerQRScannerPage = lazy(
  () => import("./features/checkin/pages/OwnerQRScannerPage"),
);

// Lazy load dispute pages
const MyDisputesPage = lazy(
  () => import("./features/disputes/pages/MyDisputesPage"),
);
const AdminDisputesDashboard = lazy(
  () => import("./features/disputes/pages/AdminDisputesDashboard"),
);
// Loading fallback component for lazy routes
const PageLoadingFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          {t("common.loadingPage")}
        </p>
      </div>
    </div>
  );
};

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      showApiErrorToast(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 min — data is fresh, no background refetch
      gcTime: 10 * 60 * 1000, // 10 min — keep unused cache in memory
      refetchOnWindowFocus: false, // don't refetch on every browser tab focus
      refetchOnReconnect: false, // don't refetch on network reconnect
      retry: 1, // only one retry on failure
    },
  },
});

// Guards /admin/login:
//  • Not logged in           → show admin login page
//  • Logged in as admin      → redirect to /admin
//  • Logged in as any other  → 404 (reveal nothing)
const AdminLoginGuard = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const { isLoading } = useProfile();

  if (!token) {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <AdminLoginPage />
      </Suspense>
    );
  }

  if (isLoading) return null;

  const role = (user?.role || user?.userType || "").toLowerCase();
  if (role === "admin" || role === "administrator") {
    return <Navigate to="/admin" replace />;
  }

  // Tenant / owner trying to peek at admin login → 404
  return <NotFound />;
};

// Root route: redirect based on auth + role.
const RootRoute = () => {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) =>
    (s.user?.role || s.user?.userType || "").toLowerCase(),
  );
  // Redirect logged-in owners / admins to their dashboards
  if (token && role === "owner") return <Navigate to="/owner" replace />;
  if (token && (role === "admin" || role === "administrator"))
    return <Navigate to="/admin" replace />;
  // Everyone else (unauthenticated visitors + tenants) sees the home page
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <HomePage />
    </Suspense>
  );
};

// Component inside Router to use navigation hooks
const RouterContent = () => {
  // Monitor banned user status (needs to be inside Router)
  useBannedUserCheck();
  // Hydrate user profile from token on every page load / refresh
  useProfile();

  return (
    <Routes>
      {/* ── Root: requires auth, else → /login ── */}
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <RegisterPage />
          </Suspense>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
      {/* ── Tenant protected routes ── */}
      <Route
        path="/profile"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          </Suspense>
        }
      />
      <Route
        path="/properties"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <PropertiesPage />
          </Suspense>
        }
      />
      <Route
        path="/properties/:id"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <PropertyDetailsPage />
          </Suspense>
        }
      />
      {/* ── Admin login (unauthenticated only) ── */}
      <Route path="/admin/login" element={<AdminLoginGuard />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <AuthGuard>
              <AdminLayout />
            </AuthGuard>
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AdminDashboardPage />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AdminUsersPage />
            </Suspense>
          }
        />
        <Route
          path="properties"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AdminPropertiesPage />
            </Suspense>
          }
        />
        <Route
          path="disputes"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AdminDisputesDashboard />
            </Suspense>
          }
        />
      </Route>
      {/* Owner routes */}
      <Route
        path="/owner"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <OwnerGuard>
              <OwnerLayout />
            </OwnerGuard>
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <OwnerDashboardPage />
            </Suspense>
          }
        />
        <Route
          path="properties/new"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AddEditPropertyPage />
            </Suspense>
          }
        />
        <Route
          path="properties/:id/edit"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AddEditPropertyPage />
            </Suspense>
          }
        />
        <Route
          path="bookings"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <OwnerIncomingBookingsPage />
            </Suspense>
          }
        />
        <Route
          path="qr-scanner"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <OwnerQRScannerPage />
            </Suspense>
          }
        />
      </Route>
      {/* Tenant protected routes */}
      <Route
        path="/my-bookings"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <RequireAuth>
              <TenantBookingsPage />
            </RequireAuth>
          </Suspense>
        }
      />
      <Route
        path="/my-disputes"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <RequireAuth>
              <MyDisputesPage />
            </RequireAuth>
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  // Load all lookups on app initialization
  useAllLookups();

  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <RouterContent />
    </BrowserRouter>
  );
};

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
