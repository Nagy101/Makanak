import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, CalendarCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout, useProfile } from '@/features/auth/hooks/useAuth';
import NotificationBell from '@/features/notifications/components/NotificationBell';

interface UserNavbarProps {
  className?: string;
}

const UserNavbar = memo(({ className = '' }: UserNavbarProps) => {
  const navigate = useNavigate();
  const logout = useLogout();
  const token = useAuthStore((s) => s.token);

  // Call useProfile here so the navbar always has fresh user data.
  // React Query deduplicates the request — no extra network call.
  const { data: profileData } = useProfile();

  // profileData (from query) is the authoritative source; Zustand user is the fallback
  const storeUser = useAuthStore((s) => s.user);
  const user = profileData ?? storeUser;

  const userTypeStr = (user?.role || user?.userType || '').toLowerCase();
  const isAdmin = userTypeStr === 'admin';
  const isOwner = userTypeStr === 'owner';
  const isAuthenticated = !!token;

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <header className={`border-b bg-card sticky top-0 z-30 ${className}`}>
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Makanak</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <NotificationBell />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-bookings')}
                className="text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                <CalendarCheck className="h-4 w-4 mr-1" />
                My Bookings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                Profile
              </Button>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/owner')}
                  className="text-muted-foreground hover:text-foreground hidden sm:flex"
                >
                  My Properties
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="text-muted-foreground hover:text-foreground hidden sm:flex"
                >
                  Admin Panel
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
});

UserNavbar.displayName = 'UserNavbar';
export default UserNavbar;
