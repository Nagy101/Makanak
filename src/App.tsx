import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import AuthGuard from "@/components/AuthGuard";
import OwnerGuard from "@/components/OwnerGuard";
import { useAllLookups } from "@/features/lookup";
import { useBannedUserCheck, useProfile } from "@/features/auth/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load auth pages for better code splitting
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./features/auth/pages/ForgotPasswordPage"));
const ProfilePage = lazy(() => import("./features/auth/pages/ProfilePage"));

// Lazy load property pages
const PropertiesPage = lazy(() => import("./features/properties/pages/PropertiesPage"));
const PropertyDetailsPage = lazy(() => import("./features/properties/pages/PropertyDetailsPage"));

// Lazy load admin pages
const AdminLayout = lazy(() => import("./features/admin/components/AdminLayout"));
const AdminDashboardPage = lazy(() => import("./features/admin/pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./features/admin/pages/AdminUsersPage"));
const AdminPropertiesPage = lazy(() => import("./features/admin/pages/AdminPropertiesPage"));

// Lazy load owner pages
const OwnerLayout = lazy(() => import("./features/owner/components/OwnerLayout"));
const OwnerDashboardPage = lazy(() => import("./features/owner/pages/OwnerDashboardPage"));
const AddEditPropertyPage = lazy(() => import("./features/owner/pages/AddEditPropertyPage"));

// Lazy load booking pages
const TenantBookingsPage = lazy(() => import("./features/bookings/pages/TenantBookingsPage"));
const OwnerIncomingBookingsPage = lazy(() => import("./features/bookings/pages/OwnerIncomingBookingsPage"));

// Lazy load check-in / QR scanner page
const OwnerQRScannerPage = lazy(() => import("./features/checkin/pages/OwnerQRScannerPage"));
// Loading fallback component for lazy routes
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

// Component inside Router to use navigation hooks
const RouterContent = () => {
  // Monitor banned user status (needs to be inside Router)
  useBannedUserCheck();
  // Hydrate user profile from token on every page load / refresh
  useProfile();

  return (
    <Routes>
        <Route path="/" element={<Index />} />
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
        <Route
          path="/profile"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <ProfilePage />
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
        {/* Tenant bookings */}
        <Route
          path="/my-bookings"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <TenantBookingsPage />
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
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
