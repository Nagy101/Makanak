import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { toast } from 'sonner';

interface UserNavbarProps {
  className?: string;
}

const UserNavbar = memo(({ className = '' }: UserNavbarProps) => {
  const navigate = useNavigate();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isAuthenticated = !!user;

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
                onClick={() => navigate('/profile')}
                className="text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                Profile
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isAdmin) navigate('/admin');
                    else toast.error('You do not have permission to access admin panel.');
                  }}
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
