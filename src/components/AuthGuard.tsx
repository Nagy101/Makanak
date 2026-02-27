import { ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useProfile } from "@/features/auth/hooks/useAuth";
import NotFound from "@/pages/NotFound";

interface Props {
  children: ReactNode;
}

/**
 * Silently shows 404 for any non-admin visitor.
 * No toast, no redirect message — security by obscurity.
 */
export default function AuthGuard({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const { isLoading: profileLoading } = useProfile();

  // Not logged in at all → 404 (reveal nothing)
  if (!isAuthenticated) return <NotFound />;

  // Still fetching profile — render nothing while we wait
  if (profileLoading) return null;

  const role = (user?.role || user?.userType || "").toString().toLowerCase();
  const isAdmin = role === "admin" || role === "administrator";

  // Wrong role (tenant / owner) → 404 (reveal nothing)
  if (!isAdmin) return <NotFound />;

  return <>{children}</>;
}
