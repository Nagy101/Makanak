import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import authHero from "@/assets/auth-hero.jpg";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = memo(({ children, title, subtitle }: AuthLayoutProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen">
      {/* Left: Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={authHero}
          alt="Luxury real estate"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-primary-foreground">
          <Link
            to="/"
            className="absolute top-8 left-8 flex items-center gap-2"
          >
            <img
              src="/Makanak_logo.png"
              alt="Makanak Logo"
              className="h-10 object-contain brightness-0 invert"
            />
          </Link>
          <h2 className="text-4xl font-bold leading-tight mb-3 whitespace-pre-line">
            {t("auth.heroTitle")}
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            {t("auth.heroSubtitle")}
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-start lg:justify-center bg-background">
        {/* Mobile hero banner — hidden on desktop */}
        <div className="lg:hidden relative w-full h-52 overflow-hidden shrink-0">
          <img
            src={authHero}
            alt="Luxury real estate"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/60" />
          {/* Logo overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <Link to="/" className="inline-block">
              <img
                src="/Makanak_logo.png"
                alt="Makanak Logo"
                className="h-16 w-auto object-contain brightness-0 invert drop-shadow-lg"
              />
            </Link>
            <p className="text-white/90 text-sm font-medium drop-shadow">
              {t("auth.mobileBadge")}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-8 lg:py-12 w-full flex-1">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

AuthLayout.displayName = "AuthLayout";
export default AuthLayout;
