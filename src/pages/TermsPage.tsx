import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
            {t("legal.termsTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.lastUpdated")}
          </p>
        </header>

        {/* Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Section 1 */}
          <Section title={t("legal.section1Title")}>
            <ul>
              <li>{t("legal.section1P1")}</li>
              <li>{t("legal.section1P2")}</li>
              <li>{t("legal.section1P3")}</li>
            </ul>
          </Section>

          {/* Section 2 */}
          <Section title={t("legal.section2Title")}>
            <ul>
              <li>{t("legal.section2P1")}</li>
              <li>{t("legal.section2P2")}</li>
              <li>{t("legal.section2P3")}</li>
              <li>{t("legal.section2P4")}</li>
            </ul>
          </Section>

          {/* Section 3 */}
          <Section title={t("legal.section3Title")}>
            <ul>
              <li>{t("legal.section3P1")}</li>
              <li>{t("legal.section3P2")}</li>
              <li>{t("legal.section3P3")}</li>
            </ul>
          </Section>

          {/* Section 4 — Cancellation Table */}
          <Section title={t("legal.section4Title")}>
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
                    <td className="px-4 py-3">
                      {t("legal.section4Row1Title")}
                    </td>
                    <td className="px-4 py-3">
                      {t("legal.section4Row1Value")}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3">
                      {t("legal.section4Row2Title")}
                    </td>
                    <td className="px-4 py-3">
                      {t("legal.section4Row2Value")}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      {t("legal.section4Row3Title")}
                    </td>
                    <td className="px-4 py-3">
                      {t("legal.section4Row3Value")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section 5 */}
          <Section title={t("legal.section5Title")}>
            <p>{t("legal.section5Intro")}</p>
            <ul>
              <li>{t("legal.section5P1")}</li>
              <li>{t("legal.section5P2")}</li>
              <li>{t("legal.section5P3")}</li>
              <li>{t("legal.section5P4")}</li>
            </ul>
          </Section>

          {/* Section 6 */}
          <Section title={t("legal.section6Title")}>
            <p>{t("legal.section6Intro")}</p>
            <ul>
              <li>{t("legal.section6P1")}</li>
              <li>{t("legal.section6P2")}</li>
              <li>{t("legal.section6P3")}</li>
            </ul>
          </Section>

          {/* Section 7 */}
          <Section title={t("legal.section7Title")}>
            <p>{t("legal.section7Intro")}</p>
            <ul>
              <li>{t("legal.section7P1")}</li>
              <li>{t("legal.section7P2")}</li>
              <li>{t("legal.section7P3")}</li>
            </ul>
          </Section>

          {/* Section 8 */}
          <Section title={t("legal.section8Title")}>
            <p>{t("legal.section8Intro")}</p>
            <ul>
              <li>{t("legal.section8P1")}</li>
              <li>{t("legal.section8P2")}</li>
              <li>{t("legal.section8P3")}</li>
            </ul>
          </Section>

          {/* Section 9 */}
          <Section title={t("legal.section9Title")}>
            <p>{t("legal.section9Intro")}</p>
            <ul>
              <li>{t("legal.section9P1")}</li>
              <li>{t("legal.section9P2")}</li>
              <li>{t("legal.section9P3")}</li>
              <li>{t("legal.section9P4")}</li>
            </ul>
          </Section>

          {/* Section 10 */}
          <Section title={t("legal.section10Title")}>
            <p>{t("legal.section10Intro")}</p>
            <ul>
              <li>{t("legal.section10P1")}</li>
              <li>
                {t("legal.section10P2")}
                <ul className="mt-2">
                  <li>{t("legal.section10P2a")}</li>
                  <li>{t("legal.section10P2b")}</li>
                  <li>{t("legal.section10P2c")}</li>
                </ul>
              </li>
            </ul>
          </Section>

          {/* Section 11 */}
          <Section title={t("legal.section11Title")}>
            <p>{t("legal.section11Intro")}</p>
            <ul>
              <li>{t("legal.section11P1")}</li>
              <li>{t("legal.section11P2")}</li>
              <li>{t("legal.section11P3")}</li>
            </ul>
          </Section>

          {/* Section 12 — Strike System */}
          <Section title={t("legal.section12Title")}>
            <p>{t("legal.section12Intro")}</p>

            <h3 className="text-lg font-semibold mt-4">
              {t("legal.section12Strike1Title")}
            </h3>
            <ul>
              <li>{t("legal.section12Strike1P1")}</li>
              <li>{t("legal.section12Strike1P2")}</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">
              {t("legal.section12Strike2Title")}
            </h3>
            <ul>
              <li>{t("legal.section12Strike2P1")}</li>
              <li>{t("legal.section12Strike2P2")}</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">
              {t("legal.section12Strike3Title")}
            </h3>
            <ul>
              <li>{t("legal.section12Strike3P1")}</li>
              <li>{t("legal.section12Strike3P2")}</li>
            </ul>
          </Section>

          {/* Section 13 */}
          <Section title={t("legal.section13Title")}>
            <p>{t("legal.section13Intro")}</p>
            <ul>
              <li>{t("legal.section13P1")}</li>
              <li>{t("legal.section13P2")}</li>
              <li>{t("legal.section13P3")}</li>
            </ul>
          </Section>
        </article>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
