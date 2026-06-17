import { memo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLogout, useProfile } from "@/features/auth/hooks/useAuth";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
}

interface UserNavbarProps {
  className?: string;
}

const UserNavbar = memo(({ className = "" }: UserNavbarProps) => {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHomePage) {
      timer = setTimeout(() => {
        setShowTour(true);
        if (window.innerWidth < 768) {
          setSheetOpen(true);
        }
      }, 7000); // Sequence Step 2: Spotlight appears after Welcome Toast (6.5s)
    } else {
      setShowTour(false);
    }
    return () => clearTimeout(timer);
  }, [isHomePage]);

  const dismissTour = () => {
    setShowTour(false);
  };
  const logout = useLogout();
  const token = useAuthStore((s) => s.token);

  // React Query deduplicates — no extra network call
  const { data: profileData } = useProfile();
  const storeUser = useAuthStore((s) => s.user);
  // Read avatar directly from store so it survives page navigation
  // (storeUser is always synced by setUser() in useProfile)
  const storedAvatar = useAuthStore((s) => s.user?.profilePictureUrl ?? null);
  const user = profileData ?? storeUser;

  const userTypeStr = (user?.role || user?.userType || "").toLowerCase();
  const isAdmin = userTypeStr === "admin" || userTypeStr === "administrator";
  const isOwner = userTypeStr === "owner";
  const isAuthenticated = !!token;

  const userName = user?.name ?? "";
  const userInitials = userName ? userName.charAt(0).toUpperCase() : "U";
  const userAvatar = storedAvatar || profileData?.profilePictureUrl || null;
  const userRoleLabel = isAdmin
    ? t("nav.admin")
    : isOwner
      ? t("nav.owner")
      : t("nav.tenant");

  // Active state helper — exact match or path prefix
  const isActive = (href: string, exact = false) =>
    exact
      ? location.pathname === href
      : location.pathname === href || location.pathname.startsWith(href + "/");

  const linkClass = (href: string, exact = false) =>
    cn(
      "text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-150",
      isActive(href, exact)
        ? "bg-primary text-primary-foreground font-semibold"
        : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
    );

  // Role-based nav items
  const baseNavItems: NavItem[] = [
    { label: t("nav.browseProperties"), href: "/properties", exact: true },
    { label: t("nav.aboutUs", "About Us"), href: "/about", exact: true },
    { label: t("nav.contactUs", "Contact Us"), href: "/contact", exact: true },
  ];

  const navItems: NavItem[] = !isAuthenticated
    ? baseNavItems
    : isAdmin
      ? [{ label: t("nav.adminDashboard"), href: "/admin", exact: false }, ...baseNavItems]
      : isOwner
        ? [{ label: t("nav.ownerDashboard"), href: "/owner", exact: false }, ...baseNavItems]
        : [
            ...baseNavItems,
            { label: t("nav.myBookings"), href: "/my-bookings", exact: true },
            { label: t("nav.myDisputes"), href: "/my-disputes", exact: true },
          ];

  const handleLogout = () => {
    logout.mutate();
    setSheetOpen(false);
  };

  return (
    <>
      {/* Tour Overlay */}
      {showTour && (
        <div 
          className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-sm cursor-pointer animate-in fade-in duration-500"
          onClick={dismissTour}
        />
      )}

      {/* Mini Top-Bar */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-1.5 px-4 z-40 relative border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center text-xs sm:text-sm">
          <div className="flex-1 flex justify-center md:justify-start overflow-hidden">
            <span className="font-medium tracking-wide animate-pulse inline-block truncate">
              تابعنا على منصات التواصل لمعرفة أخر الاخبار 
            </span>
          </div>
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <a href="https://www.facebook.com/share/1bLdoCZpwf/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1877F2] hover:scale-110 transition-all" aria-label="Facebook">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/findmakanak?igsh=ZDgycjh3MTN2MXdv" target="_blank" rel="noopener noreferrer" className="hover:text-[#E1306C] hover:scale-110 transition-all" aria-label="Instagram">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@findmakanak?_r=1&_t=ZS-97IDBruF0xZ" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 hover:scale-110 transition-all" aria-label="TikTok">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-panel",
          showTour ? "relative z-[45]" : "",
          className,
        )}
      >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0 group">
          <img
            src="/Makanak_logo.png"
            alt="Makanak"
            className="h-20 object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {navItems.map((item) => {
            const isAboutUs = item.href === "/about";
            const isSpotlighted = showTour && isAboutUs;

            return (
              <div key={item.href} className={cn("relative", isSpotlighted && "z-[50]")}>
                <Link
                  to={item.href}
                  onClick={() => {
                    if (isSpotlighted) dismissTour();
                  }}
                  className={cn(
                    linkClass(item.href, item.exact),
                    isSpotlighted && "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(30,58,138,0.8)] ring-4 ring-primary/30"
                  )}
                >
                  {item.label}
                </Link>

                {isSpotlighted && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-64 max-w-[85vw] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="relative bg-gradient-to-r from-primary to-accent text-white p-4 rounded-2xl shadow-2xl animate-bounce" style={{ animationDuration: '2s' }}>
                      {/* Triangle pointer */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary transform rotate-45" />
                      
                      {/* X Button */}
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dismissTour();
                        }}
                        className="absolute top-1 right-1 p-2 rounded-full hover:bg-white/30 transition-colors"
                        aria-label="Close spotlight"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>

                      <p className="text-sm font-bold text-center leading-relaxed drop-shadow-sm mt-1 px-2">
                        {t("nav.aboutUsTour")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <NotificationBell />

              {/* Profile button — shows avatar + name on desktop */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "hidden md:flex items-center gap-2 px-2 hover:bg-primary hover:text-primary-foreground",
                  isActive("/profile", true) &&
                    "bg-primary text-primary-foreground",
                )}
              >
                <Link to="/profile">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="h-7 w-7 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shrink-0">
                      {userInitials}
                    </div>
                  )}
                  <span className="hidden lg:inline text-sm font-medium truncate max-w-[100px]">
                    {userName || t("common.profile")}
                  </span>
                </Link>
              </Button>

              {/* Logout (desktop) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="hidden md:flex items-center gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">{t("common.logout")}</span>
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-1.5">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t("common.signIn")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">{t("common.signUp")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger - Moved OUTSIDE isAuthenticated so all users see it! */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden ml-1">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("nav.openMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle asChild>
                  {isAuthenticated ? (
                    <div className="flex items-center gap-3">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {userInitials}
                        </div>
                      )}
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {userName || t("common.profile")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {userRoleLabel}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-left">
                      <p className="text-sm font-semibold">{t("nav.menu", "القائمة")}</p>
                    </div>
                  )}
                </SheetTitle>
              </SheetHeader>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => {
                  const isAboutUs = item.href === "/about";
                  const isSpotlighted = showTour && isAboutUs;

                  return (
                    <div key={item.href} className="relative">
                      <Link
                        to={item.href}
                        onClick={() => {
                          if (isSpotlighted) dismissTour();
                          setSheetOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive(item.href, item.exact)
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                          isSpotlighted && "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(30,58,138,0.8)] ring-4 ring-primary/30 relative z-[60]"
                        )}
                      >
                        {item.label}
                      </Link>

                      {isSpotlighted && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[250px] z-[70] animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="relative bg-gradient-to-r from-primary to-accent text-white p-4 rounded-2xl shadow-2xl animate-bounce" style={{ animationDuration: '2s' }}>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary transform rotate-45" />
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                dismissTour();
                              }}
                              className="absolute top-1 right-1 p-2 rounded-full hover:bg-white/30 transition-colors"
                              aria-label="Close spotlight"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <p className="text-sm font-bold text-center leading-relaxed drop-shadow-sm mt-1 px-2">
                              {t("nav.aboutUsTour")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                <Separator className="my-2" />
                
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive("/profile", true)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                      )}
                    >
                      <User className="h-4 w-4" />
                      {t("common.profile")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={logout.isPending}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("common.logout")}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button asChild onClick={() => setSheetOpen(false)}>
                      <Link to="/login">{t("common.signIn")}</Link>
                    </Button>
                    <Button asChild onClick={() => setSheetOpen(false)}>
                      <Link to="/register">{t("common.signUp")}</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      </header>
    </>
  );
});

UserNavbar.displayName = "UserNavbar";
export default UserNavbar;
