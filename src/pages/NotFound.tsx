import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-muted p-6">
            <img
              src="/Makanak_logo.png"
              alt="Makanak Logo"
              className="h-14 object-contain opacity-40 grayscale"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold text-foreground tracking-tight">
            {t("notFound.title")}
          </h1>
          <p className="text-xl font-semibold text-foreground">
            {t("notFound.heading")}
          </p>
          <p className="text-muted-foreground">
            {t("notFound.description")}
          </p>
        </div>
        <Button asChild size="lg" className="h-12 px-8 font-semibold">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> {t("common.backToHome")}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
