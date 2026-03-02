import { memo, useCallback, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  PlusCircle,
  CalendarCheck,
  QrCode,
  LogOut,
  Menu,
  X,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLogout, useProfile } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import NotificationBell from "@/features/notifications/components/NotificationBell";

const NAV_ITEMS = [
  { to: "/owner", icon: LayoutDashboard, label: "My Properties", end: true },
  {
    to: "/owner/properties/new",
    icon: PlusCircle,
    label: "Add Property",
    end: false,
  },
  {
    to: "/owner/bookings",
    icon: CalendarCheck,
    label: "Incoming Bookings",
    end: false,
  },
  { to: "/owner/qr-scanner", icon: QrCode, label: "QR Check-in", end: false },
  { to: "/profile", icon: UserCircle, label: "My Account", end: true },
] as const;

const OwnerLayout = memo(() => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = useAuthStore((s) => s.user?.name ?? "Owner");
  const userAvatar = useAuthStore((s) => s.user?.profilePictureUrl ?? null);
  const userInitial = userName.charAt(0).toUpperCase();
  // Ensures profile (with avatar) is loaded and stored
  useProfile();
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
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/60 bg-card shadow-panel transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <Link to="/" className="flex items-center min-w-0">
            <img
              src="/Makanak_logo.png"
              alt="Makanak Logo"
              className="h-9 object-contain"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/8"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {t("common.logout")}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/60 bg-card/90 backdrop-blur-md shadow-panel px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("owner.ownerDashboard")}
          </h2>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-all duration-150"
              title="Go to profile"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-8 w-8 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shrink-0">
                  {userInitial}
                </div>
              )}
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {userName}
              </span>
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

OwnerLayout.displayName = "OwnerLayout";
export default OwnerLayout;
