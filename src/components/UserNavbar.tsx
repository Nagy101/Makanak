import { memo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, LogOut, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout, useProfile } from '@/features/auth/hooks/useAuth';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
}

interface UserNavbarProps {
  className?: string;
}

const UserNavbar = memo(({ className = '' }: UserNavbarProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();
  const logout = useLogout();
  const token = useAuthStore((s) => s.token);

  // React Query deduplicates — no extra network call
  const { data: profileData } = useProfile();
  const storeUser = useAuthStore((s) => s.user);
  const user = profileData ?? storeUser;

  const userTypeStr = (user?.role || user?.userType || '').toLowerCase();
  const isAdmin = userTypeStr === 'admin' || userTypeStr === 'administrator';
  const isOwner = userTypeStr === 'owner';
  const isAuthenticated = !!token;

  const userName = user?.name ?? '';
  const userInitials = userName ? userName.charAt(0).toUpperCase() : 'U';
  const userRoleLabel = isAdmin ? 'Admin' : isOwner ? 'Owner' : 'Tenant';

  // Active state helper — exact match or path prefix
  const isActive = (href: string, exact = false) =>
    exact
      ? location.pathname === href
      : location.pathname === href || location.pathname.startsWith(href + '/');

  const linkClass = (href: string, exact = false) =>
    cn(
      'text-sm font-medium px-3 py-1.5 rounded-md transition-colors',
      isActive(href, exact)
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
    );

  // Role-based nav items
  const navItems: NavItem[] = !isAuthenticated
    ? [{ label: 'Browse Properties', href: '/properties', exact: true }]
    : isAdmin
    ? [
        { label: 'Dashboard', href: '/admin', exact: true },
        { label: 'Users', href: '/admin/users', exact: true },
        { label: 'Properties', href: '/admin/properties', exact: true },
      ]
    : isOwner
    ? [
        { label: 'Browse', href: '/properties', exact: true },
        { label: 'My Properties', href: '/owner', exact: true },
        { label: 'Incoming Bookings', href: '/owner/bookings', exact: true },
      ]
    : [
        { label: 'Browse Properties', href: '/properties', exact: true },
        { label: 'My Bookings', href: '/my-bookings', exact: true },
      ];

  const handleLogout = () => {
    logout.mutate();
    setSheetOpen(false);
  };

  return (
    <header className={cn('border-b bg-card sticky top-0 z-30', className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Makanak</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} className={linkClass(item.href, item.exact)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              <NotificationBell />

              {/* Profile button — shows avatar + name on desktop */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  'hidden md:flex items-center gap-2 px-2',
                  isActive('/profile', true) && 'bg-primary/10 text-primary',
                )}
              >
                <Link to="/profile">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shrink-0">
                    {userInitials}
                  </div>
                  <span className="hidden lg:inline text-sm font-medium truncate max-w-[100px]">
                    {userName || 'Profile'}
                  </span>
                </Link>
              </Button>

              {/* Logout (desktop) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="hidden md:flex items-center gap-1.5 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </Button>

              {/* Mobile hamburger */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle asChild>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {userInitials}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-sm font-semibold truncate">{userName || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{userRoleLabel}</p>
                        </div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="p-3 space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive(item.href, item.exact)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Separator className="my-2" />
                    <Link
                      to="/profile"
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive('/profile', true)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={logout.isPending}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
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
