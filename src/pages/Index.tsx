import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Search,
  LayoutDashboard,
  CalendarCheck,
  PlusCircle,
  Users,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UserNavbar from "@/components/UserNavbar";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useProfile } from "@/features/auth/hooks/useAuth";

const Index = () => {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const { data: profileData } = useProfile();
  const storeUser = useAuthStore((s) => s.user);
  const user = profileData ?? storeUser;

  const isAuthenticated = !!token;
  const userTypeStr = (user?.role || user?.userType || "").toLowerCase();
  const isAdmin = userTypeStr === "admin" || userTypeStr === "administrator";
  const isOwner = userTypeStr === "owner";
  const firstName = user?.name ? user.name.split(" ")[0] : "";

  // --- Guest landing ---
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="text-center space-y-8 max-w-xl">
          <div className="flex justify-center animate-fade-in">
            <img
              src="/Makanak_logoo.png"
              alt="Makanak Logo"
              width={480}
              height={480}
              className="w-[22rem] sm:w-[28rem] h-auto object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground animate-fade-in-up">
            {t("index.welcomeTo")}{" "}
            <span className="text-gradient">{t("index.makanak")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto animate-fade-in-up">
            {t("index.discoverSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 font-semibold shadow-glow-sm hover:shadow-glow transition-premium"
            >
              <Link to="/properties">
                <Search className="mr-2 h-5 w-5" /> {t("nav.browseProperties")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-8 font-semibold"
            >
              <Link to="/login">
                {t("common.signIn")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated — role-specific quick actions ---
  const quickActions = isAdmin
    ? [
        {
          label: t("index.adminDashboard"),
          href: "/admin",
          icon: LayoutDashboard,
          primary: true,
        },
        {
          label: t("index.manageUsers"),
          href: "/admin/users",
          icon: Users,
          primary: false,
        },
        {
          label: t("index.manageProperties"),
          href: "/admin/properties",
          icon: Building2,
          primary: false,
        },
      ]
    : isOwner
      ? [
          {
            label: t("index.myProperties"),
            href: "/owner",
            icon: LayoutDashboard,
            primary: true,
          },
          {
            label: t("index.addProperty"),
            href: "/owner/properties/new",
            icon: PlusCircle,
            primary: false,
          },
          {
            label: t("index.incomingBookings"),
            href: "/owner/bookings",
            icon: CalendarCheck,
            primary: false,
          },
        ]
      : [
          {
            label: t("nav.browseProperties"),
            href: "/properties",
            icon: Search,
            primary: true,
          },
          {
            label: t("nav.myBookings"),
            href: "/my-bookings",
            icon: CalendarCheck,
            primary: false,
          },
        ];

  const subtitle = isAdmin
    ? t("index.adminSubtitle")
    : isOwner
      ? t("index.ownerSubtitle")
      : t("index.tenantSubtitle");

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="text-center space-y-6 max-w-lg">
          <div className="flex justify-center">
            <img
              src="/Makanak_logoo.png"
              alt="Makanak Logo"
              width={280}
              height={280}
              className="w-44 sm:w-56 h-auto object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            {firstName
              ? t("index.hello", { name: firstName })
              : t("index.welcomeBack")}
          </h1>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                asChild
                size="lg"
                variant={action.primary ? "default" : "outline"}
                className="h-12 px-6 font-semibold"
              >
                <Link to={action.href}>
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
