import { memo, useCallback, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, PlusCircle, CalendarCheck, LogOut, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import NotificationBell from '@/features/notifications/components/NotificationBell';

const NAV_ITEMS = [
  { to: '/owner', icon: LayoutDashboard, label: 'My Properties', end: true },
  { to: '/owner/properties/new', icon: PlusCircle, label: 'Add Property', end: false },
  { to: '/owner/bookings', icon: CalendarCheck, label: 'Incoming Bookings', end: false },
  { to: '/properties', icon: Search, label: 'Browse Properties', end: true },
] as const;

const OwnerLayout = memo(() => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = useAuthStore((s) => s.user?.name ?? 'Owner');
  const logout = useLogout();

  const handleLogout = useCallback(() => {
    logout.mutate();
  }, [logout]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="rounded-lg bg-primary p-1.5 shrink-0">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Makanak</span>
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={closeSidebar}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-medium text-muted-foreground">Owner Panel</h2>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-secondary transition-colors"
              title="Go to profile"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-foreground sm:block">{userName}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
});

OwnerLayout.displayName = 'OwnerLayout';
export default OwnerLayout;
