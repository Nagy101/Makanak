import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useProfile } from '@/features/auth/hooks/useAuth';

interface Props {
  children: ReactNode;
}

/**
 * Guards owner-only routes.
 * Checks userType === "Owner" from the auth store (populated via profile endpoint after login).
 * Completely independent from AuthGuard (which is admin-only).
 */
export default function OwnerGuard({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const isAuthenticated = !!token;
  const isOwner = user?.userType?.toLowerCase() === 'owner';

  // Fetch profile on refresh so userType is available even after a hard reload
  const { isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access this page.');
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }
    // Wait for profile to finish loading before checking role
    if (profileLoading) return;

    if (user && !isOwner) {
      toast.error('Access denied. Only property owners can access this page.');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isOwner, user, navigate, location, profileLoading]);

  if (!isAuthenticated) return null;
  if (profileLoading) return null;
  if (!isOwner) return null;

  return <>{children}</>;
}
