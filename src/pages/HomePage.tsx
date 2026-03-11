/**
 * HomePage — public landing route (/).
 *
 * Sections:
 *   1. Hero — full-viewport banner with search bar
 *   2. Featured Properties — top 6 listings via TanStack Query
 *   3. Browse by Governorate — atomic Zustand selector
 *   4. Owner CTA banner
 *   5. Footer strip
 *
 * Performance:
 *   • HeroSection + GovernorateCard: React.memo (dumb/presentational)
 *   • All navigation handlers: useCallback
 *   • Featured query staleTime: 5 min (avoids refetch on nav-back)
 *   • Hero image: eager load for LCP
 *   • Governorate store: atomic selector (s => s.governorates)
 */

import { memo, useCallback, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Building2,
  ArrowRight,
  Star,
  Home,
  CalendarCheck,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserNavbar from "@/components/UserNavbar";
import PropertyCard from "@/features/properties/components/PropertyCard";
import * as propertyService from "@/features/properties/property.service";
import { useLookupStore } from "@/features/lookup";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import Footer from "@/components/Footer";

// ─────────────────────────────────────────────────────────────
// Hero Section — memoised, no internal navigation handler calls
// ─────────────────────────────────────────────────────────────
const HeroSection = memo(function HeroSection({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(() => {
    onSearch(query);
  }, [query, onSearch]);

  return (
    <section
      className="relative min-h-[75vh] flex items-center justify-center overflow-hidden"
      aria-label="Hero — property search"
    >
      {/* Hero background image */}
      <img
        src="/Main_image.jpg"
        alt="Properties in Egypt"
        width={1920}
        height={1080}
        // @ts-expect-error fetchpriority not yet in React types
        fetchpriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center scale-105 blur-[2px]"
      />

      {/* Overlay — subtle dark tint in light mode, deep navy in dark mode */}
      <div className="absolute inset-0 bg-black/45 dark:bg-[rgb(19,23,32)]/80" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center text-white">
        {/* Pill badge */}
        <div className="mb-5 flex justify-center animate-fade-in-down">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm text-white">
            <Star className="h-4 w-4 fill-white text-white" />
            {t("home.heroBadge")}
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-4xl font-bold leading-tight drop-shadow-xl sm:text-5xl md:text-6xl animate-fade-in-up whitespace-pre-line">
          {t("home.heroTitle")}
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 drop-shadow md:text-xl animate-fade-in-up">
          {t("home.heroSubtitle")}
        </p>

        {/* Search bar */}
        <div className="mx-auto max-w-2xl rounded-2xl bg-white dark:bg-[rgb(19,23,32)]/90 border border-black/10 dark:border-white/10 p-3 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-gray-50 dark:bg-secondary/50 px-4 py-3">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <input
                type="text"
                placeholder={t("home.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                aria-label="Property search"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="h-12 w-full shrink-0 rounded-xl px-8 text-base font-semibold sm:w-auto shadow-glow-sm hover:shadow-glow transition-premium"
            >
              <Search className="mr-2 h-4 w-4" />
              {t("common.search")}
            </Button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-white/90 drop-shadow-md">
          {[
            {
              icon: <ShieldCheck className="h-4 w-4" />,
              label: t("home.badgeVerified"),
            },
            {
              icon: <CreditCard className="h-4 w-4" />,
              label: t("home.badgeSecurePayments"),
            },
            {
              icon: <CalendarCheck className="h-4 w-4" />,
              label: t("home.badgeEasyBooking"),
            },
            {
              icon: <Headphones className="h-4 w-4" />,
              label: t("home.badgeSupport"),
            },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-4 py-2"
            >
              {icon}
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// ─────────────────────────────────────────────────────────────
// Maps governorate English name (lower-cased) → public image path
const GOVERNORATE_IMAGES: Record<string, string> = {
  cairo: "/cairo.jpg",
  giza: "/giza.jpg",
  alexandria: "/Alex.jpg",
  aswan: "/aswan.jpg",
  "red sea": "/redsea.jpg",
  "north sinai": "/north.jpg",
  "north coast": "/north.jpg",
};

function getGovernorateImage(name: string): string | null {
  return GOVERNORATE_IMAGES[name.toLowerCase().trim()] ?? null;
}

// GovernorateCard — memoised presentational card
// Only rendered for governorates that have a known image in /public.
// ─────────────────────────────────────────────────────────────
const GovernorateCard = memo(function GovernorateCard({
  name,
  id,
  imageSrc,
  onSelect,
}: {
  name: string;
  id: number;
  imageSrc: string;
  onSelect: (id: number) => void;
}) {
  const { t } = useTranslation();
  const handleClick = useCallback(() => onSelect(id), [id, onSelect]);

  return (
    <button
      onClick={handleClick}
      aria-label={`${t("home.browse")} — ${name}`}
      className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl shadow-card transition-premium hover:-translate-y-1 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[11rem]"
    >
      {/* Background image — no blur */}
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 p-6">
        <span className="text-base font-bold text-white drop-shadow">
          {name}
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-white/90 drop-shadow">
          {t("home.browse")}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
});

// ─────────────────────────────────────────────────────────────
// How It Works Section
// ─────────────────────────────────────────────────────────────
const STEPS_KEYS = [
  {
    icon: Search,
    number: 1,
    titleKey: "home.step1Title",
    descKey: "home.step1Desc",
  },
  {
    icon: CalendarCheck,
    number: 2,
    titleKey: "home.step2Title",
    descKey: "home.step2Desc",
  },
  {
    icon: CheckCircle,
    number: 3,
    titleKey: "home.step3Title",
    descKey: "home.step3Desc",
  },
] as const;

const HowItWorksSection = memo(function HowItWorksSection() {
  const { t } = useTranslation();
  return (
    <section
      className="px-4 py-20 bg-slate-50 dark:bg-background border-t border-slate-200/70 dark:border-border/40"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            {t("home.howItWorksBadge")}
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl font-extrabold text-foreground sm:text-4xl"
          >
            {t("home.howItWorksTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t("home.howItWorksSubtitle")}
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-6">
          {/* Connector line — desktop only */}
          <div
            aria-hidden="true"
            className="absolute left-[calc(16.667%+2rem)] right-[calc(16.667%+2rem)] top-[2.75rem] hidden h-px bg-primary/25 sm:block"
          />

          {STEPS_KEYS.map(({ icon: Icon, number, titleKey, descKey }) => (
            <div
              key={number}
              className="relative flex flex-col items-center text-center gap-5"
            >
              {/* Circle icon */}
              <div className="relative shrink-0">
                <div className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-primary shadow-lg">
                  <Icon
                    className="h-9 w-9 text-primary-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                {/* Step badge */}
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary text-[11px] font-bold text-primary-foreground shadow">
                  {number}
                </span>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {t(titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// ─────────────────────────────────────────────────────────────
// Property loading skeleton
// ─────────────────────────────────────────────────────────────
const PropertyCardSkeleton = memo(function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <Skeleton className="aspect-[16/11] w-full" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// HomePage — main export
// ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => !!s.token);
  const localized = useLocalizedField();

  // ── Navigation handlers (stable references via useCallback) ───
  const handleHeroSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("Search", query.trim());
      navigate(`/properties?${params.toString()}`);
    },
    [navigate],
  );

  const handleGovernorateSelect = useCallback(
    (id: number) => {
      navigate(`/properties?GovernorateId=${id}`);
    },
    [navigate],
  );

  const handleBrowseAll = useCallback(
    () => navigate("/properties"),
    [navigate],
  );
  const handleOwnerSignup = useCallback(
    () => navigate("/register"),
    [navigate],
  );

  // ── Atomic Zustand selector — prevents full-store re-renders ──
  const governorates = useLookupStore((s) => s.governorates);
  const displayedGovernorates = governorates
    .map((g) => ({
      gov: g,
      img: getGovernorateImage(g.nameEn ?? g.nameAr ?? ""),
    }))
    .filter((x): x is { gov: typeof x.gov; img: string } => x.img !== null);

  // ── Featured Properties ──────────────────────────────────────
  // Direct useQuery here (not via useProperties hook) so we can
  // set a higher staleTime (5 min) and prevent refetch on nav-back.
  const { data: featuredData, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["properties", "featured", { PageSize: 6, PageIndex: 1 }],
    queryFn: () => propertyService.getProperties({ PageSize: 6, PageIndex: 1 }),
    staleTime: 5 * 60 * 1000, // 5 min — stays fresh across navigations
    gcTime: 15 * 60 * 1000, // 15 min — keep in cache between visits
  });

  const featuredProperties = featuredData?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t("seo.homeTitle")}</title>
        <meta name="description" content={t("seo.homeDescription")} />
      </Helmet>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <UserNavbar />

      {/* ── Hero ───────────────────────────────────────────── */}
      <HeroSection onSearch={handleHeroSearch} />

      {/* ── Browse by Governorate — GRAY ───────────────── */}
      {displayedGovernorates.length > 0 && (
        <section
          className="bg-slate-50 dark:bg-card px-4 py-20 border-y border-slate-200/70 dark:border-border/50"
          aria-labelledby="governorates-heading"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                {t("home.exploreEgypt")}
              </p>
              <h2
                id="governorates-heading"
                className="text-2xl font-bold text-foreground sm:text-3xl"
              >
                {t("home.browseByGovernorate")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                {t("home.governorateSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {displayedGovernorates.map(({ gov, img }) => (
                <GovernorateCard
                  key={gov.id}
                  id={gov.id}
                  name={localized(gov.nameEn, gov.nameAr)}
                  imageSrc={img}
                  onSelect={handleGovernorateSelect}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Properties ─────────────────────────── */}
      <section className="px-4 py-20" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                {t("home.handPicked")}
              </p>
              <h2
                id="featured-heading"
                className="text-2xl font-bold text-foreground sm:text-3xl"
              >
                {t("home.featuredProperties")}
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={handleBrowseAll}
              className="shrink-0"
            >
              {t("common.viewAll")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <Home className="h-12 w-12 text-muted" />
              <p className="text-muted-foreground">{t("home.noProperties")}</p>
              <Button variant="outline" onClick={handleBrowseAll}>
                {t("home.browseAllListings")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <HowItWorksSection />

      {/* ── Owner CTA — WHITE ────────────────────────── */}
      {!isAuthenticated && (
        <section
          className="bg-white dark:bg-background px-4 py-16"
          aria-labelledby="owner-cta-heading"
        >
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-accent/80 p-10 text-center text-white shadow-2xl shadow-primary/20 md:p-14">
              {/* Decorative blur blobs */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl"
              />

              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h2
                  id="owner-cta-heading"
                  className="mb-4 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl whitespace-pre-line"
                >
                  {t("home.ownerCtaTitle")}
                </h2>

                <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
                  {t("home.ownerCtaSubtitle")}
                </p>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    onClick={handleOwnerSignup}
                    size="lg"
                    className="h-14 rounded-xl bg-white px-10 text-base font-bold text-primary transition-transform hover:scale-[1.02] hover:bg-white/90"
                  >
                    {t("home.getStartedAsOwner")}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-xl border-white/40 bg-white/10 text-base text-white backdrop-blur hover:bg-white/20"
                  >
                    <Link to="/login">{t("home.signInAsOwner")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
