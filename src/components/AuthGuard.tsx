import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useProfile } from '@/features/auth/hooks/useAuth';

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);

  const { isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access admin pages.');
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    // Wait until profile finishes loading before checking role
    if (profileLoading) return;

    const role = (user?.role || user?.userType || '').toString().toLowerCase();
    const hasAdminRole = role === 'admin' || role === 'administrator';

    if (!hasAdminRole) {
      toast.error('You do not have permission to access admin pages.');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location, profileLoading]);

  if (!isAuthenticated) return null;
  if (profileLoading) return null;

  const role = (user?.role || user?.userType || '').toString().toLowerCase();
  const hasAdminRole = role === 'admin' || role === 'administrator';
  if (!hasAdminRole) return null;

  return <>{children}</>;
}
