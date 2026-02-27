/**
 * RequireAuth — lightweight guard for tenant-level protected routes.
 *
 * Behaviour:
 *  • If the user is NOT authenticated → redirect to /login, preserving
 *    the attempted path in Router state so the login page can redirect
 *    back after a successful login.
 *  • If authenticated → render children as-is.
 *
 * Use this wrapper for tenant routes (/my-bookings, /profile, /my-disputes).
 * Admin / owner routes have their own specialised guards (AuthGuard / OwnerGuard).
 */
import { type ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/authStore";

interface Props {
  children: ReactNode;
}

export default function RequireAuth({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  // Atomic selector — only re-renders when token changes
  const isAuthenticated = useAuthStore((s) => !!s.token);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to access this page.");
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
