import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReturnPolicyPage() {
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
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {isAr ? t("legal.switchToEnglish") : t("legal.switchToArabic")}
          </Button>
        </div>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("legal.returnTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.lastUpdated")}
          </p>
        </header>

        {/* Content — Section 4 from Terms: Cancellation & Refund Policy */}
        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p>{t("legal.section4Intro")}</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-start font-semibold">
                    {isAr ? "توقيت طلب الإلغاء" : "Cancellation Timing"}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {isAr ? "قيمة المبلغ المسترد" : "Refund Amount"}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-3">{t("legal.section4Row1Title")}</td>
                  <td className="px-4 py-3">{t("legal.section4Row1Value")}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3">{t("legal.section4Row2Title")}</td>
                  <td className="px-4 py-3">{t("legal.section4Row2Value")}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">{t("legal.section4Row3Title")}</td>
                  <td className="px-4 py-3">{t("legal.section4Row3Value")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  );
}
