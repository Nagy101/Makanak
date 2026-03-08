import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const toggleLang = () => i18n.changeLanguage(isAr ? "en" : "ar");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("legal.backToHome")}
          </Link>
          <Button variant="outline" size="sm" onClick={toggleLang} className="gap-2">
            <Globe className="h-4 w-4" />
            {isAr ? t("legal.switchToEnglish") : t("legal.switchToArabic")}
          </Button>
        </div>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("legal.privacyTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("legal.lastUpdated")}</p>
        </header>

        {/* Content — Section 14 from Terms is the Privacy Policy */}
        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p>{t("legal.section14Intro")}</p>
          <ul className="space-y-3">
            <li>{t("legal.section14P1")}</li>
            <li>{t("legal.section14P2")}</li>
            <li>{t("legal.section14P3")}</li>
            <li>{t("legal.section14P4")}</li>
          </ul>
        </article>
      </div>
    </div>
  );
}
