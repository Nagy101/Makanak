import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇺🇸" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇪🇬" },
] as const;

const LanguageSwitcher = memo(function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("nav.language")}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-primary hover:text-primary-foreground"
            >
              <Globe className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("nav.language")}</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">
            {t("language.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {LANGUAGES.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-start transition-all duration-150",
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-secondary/50",
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    {lang.nativeLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">{lang.label}</p>
                </div>
                {isActive && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <svg
                      className="h-3 w-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default LanguageSwitcher;
