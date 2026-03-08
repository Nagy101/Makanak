import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPage = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.backToHome")}
        </Link>

        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("legal.privacyTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("legal.lastUpdated")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="shrink-0 gap-2"
          >
            <Globe className="h-4 w-4" />
            {i18n.language === "ar" ? "English" : "العربية"}
          </Button>
        </header>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              {t("legal.privacy.title")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t("legal.privacy.intro")}
            </p>
            <ul className="space-y-3 list-disc ps-5">
              <li className="text-muted-foreground leading-relaxed">
                {t("legal.privacy.p1")}
              </li>
              <li className="text-muted-foreground leading-relaxed">
                {t("legal.privacy.p2")}
              </li>
              <li className="text-muted-foreground leading-relaxed">
                {t("legal.privacy.p3")}
              </li>
              <li className="text-muted-foreground leading-relaxed">
                {t("legal.privacy.p4")}
              </li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPage;
