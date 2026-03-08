import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsPage = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  const sections = [
    { title: "s1Title", points: ["s1p1", "s1p2", "s1p3"] },
    { title: "s2Title", points: ["s2p1", "s2p2", "s2p3", "s2p4"] },
    { title: "s3Title", points: ["s3p1", "s3p2", "s3p3"] },
    {
      title: "s4Title",
      intro: "s4intro",
      points: ["s4row1", "s4row2", "s4row3"],
    },
    {
      title: "s5Title",
      intro: "s5intro",
      points: ["s5p1", "s5p2", "s5p3", "s5p4"],
    },
    {
      title: "s6Title",
      intro: "s6intro",
      points: ["s6p1", "s6p2", "s6p3"],
    },
    {
      title: "s7Title",
      intro: "s7intro",
      points: ["s7p1", "s7p2", "s7p3"],
    },
    {
      title: "s8Title",
      intro: "s8intro",
      points: ["s8p1", "s8p2", "s8p3"],
    },
    {
      title: "s9Title",
      intro: "s9intro",
      points: ["s9p1", "s9p2", "s9p3", "s9p4"],
    },
    {
      title: "s10Title",
      intro: "s10intro",
      points: ["s10p1", "s10p2"],
      subPoints: ["s10p2a", "s10p2b", "s10p2c"],
    },
    {
      title: "s11Title",
      intro: "s11intro",
      points: ["s11p1", "s11p2", "s11p3"],
    },
    {
      title: "s12Title",
      intro: "s12intro",
      strikeGroups: [
        {
          heading: "s12strike1Title",
          items: ["s12strike1a", "s12strike1b"],
        },
        {
          heading: "s12strike2Title",
          items: ["s12strike2a", "s12strike2b"],
        },
        {
          heading: "s12strike3Title",
          items: ["s12strike3a", "s12strike3b"],
        },
      ],
    },
    {
      title: "s13Title",
      intro: "s13intro",
      points: ["s13p1", "s13p2", "s13p3"],
    },
  ];

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
              {t("legal.termsTitle")}
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
          {sections.map((section) => (
            <section key={section.title} className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t(`legal.terms.${section.title}`)}
              </h2>

              {section.intro && (
                <p className="text-muted-foreground mb-4">
                  {t(`legal.terms.${section.intro}`)}
                </p>
              )}

              {section.points && (
                <ul className="space-y-3 list-disc ps-5">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {t(`legal.terms.${point}`)}
                    </li>
                  ))}
                </ul>
              )}

              {section.subPoints && (
                <ul className="mt-2 space-y-2 list-[circle] ps-10">
                  {section.subPoints.map((sp) => (
                    <li
                      key={sp}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {t(`legal.terms.${sp}`)}
                    </li>
                  ))}
                </ul>
              )}

              {section.strikeGroups &&
                section.strikeGroups.map((group) => (
                  <div key={group.heading} className="mb-4">
                    <h3 className="text-base font-medium text-foreground mt-4 mb-2">
                      {t(`legal.terms.${group.heading}`)}
                    </h3>
                    <ul className="space-y-2 list-disc ps-5">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="text-muted-foreground leading-relaxed"
                        >
                          {t(`legal.terms.${item}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
};

export default TermsPage;
