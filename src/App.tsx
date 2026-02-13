import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAllLookups } from "@/features/lookup";
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

const AppContent = () => {
  // Load all lookups on app initialization
  useAllLookups();

  return (
    <BrowserRouter>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
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
