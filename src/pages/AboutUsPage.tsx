import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { ShieldCheck, CreditCard, Home, Headphones } from "lucide-react";
import UserNavbar from "@/components/UserNavbar";
import Footer from "@/components/Footer";

const FEATURES = [
  {
    icon: CreditCard,
    titleKey: "about.featurePaymentsTitle",
    descKey: "about.featurePaymentsDesc",
  },
  {
    icon: ShieldCheck,
    titleKey: "about.featureVerifiedTitle",
    descKey: "about.featureVerifiedDesc",
  },
  {
    icon: Headphones,
    titleKey: "about.featureDisputeTitle",
    descKey: "about.featureDisputeDesc",
  },
  {
    icon: Home,
    titleKey: "about.featureBookingTitle",
    descKey: "about.featureBookingDesc",
  },
] as const;

export default function AboutUsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t("about.pageTitle")} — Makanak</title>
        <meta name="description" content={t("about.heroSubtitle")} />
      </Helmet>

      <UserNavbar />

      {/* Hero Section */}
      <section className="relative bg-[#1E3A8A] text-white py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl mb-4">
            {t("about.heroTitle")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            {t("about.heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#1E3A8A]">
            {t("about.missionBadge")}
          </p>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-6">
            {t("about.missionTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            {t("about.missionDesc")}
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-50 dark:bg-card px-4 py-20 border-y border-slate-200/70 dark:border-border/40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#1E3A8A]">
              {t("about.whyBadge")}
            </p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              {t("about.whyTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="rounded-2xl border border-border/60 bg-background p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1E3A8A]/10">
                  <Icon className="h-7 w-7 text-[#1E3A8A]" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {t(titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
