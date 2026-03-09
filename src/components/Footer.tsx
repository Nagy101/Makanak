import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Mail, Phone } from "lucide-react";

const Footer = memo(function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/60 bg-[rgb(11,14,21)] text-slate-400">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Column 1: Company Info & Contact */}
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="flex items-center w-fit rounded-xl px-3 py-1.5 transition-opacity hover:opacity-90"
          >
            <img
              src="/Makanak_logo.png"
              alt="Makanak"
              width={40}
              height={10}
              loading="lazy"
              className="h-20 w-auto object-contain"
            />
          </Link>
          <p className="text-sm leading-relaxed">{t("footer.brand")}</p>
          {/* Email */}
          <a
            href="mailto:makanakservices@gmail.com"
            className="flex items-center gap-2 text-sm transition-colors hover:text-white w-fit"
          >
            <Mail className="h-4 w-4 shrink-0 text-blue-400" />
            <span>makanakservices@gmail.com</span>
          </a>
          {/* Phone */}
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 shrink-0 text-blue-400" />
            <span dir="ltr">0106 805 7499</span>
          </div>

          {/* Social links */}
          <div className="flex gap-3 mt-1">
            <a
              href="https://www.facebook.com/share/1LAUyCrgqJ/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-primary hover:text-white"
              aria-label="Facebook"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/findmakanak?igsh=cmd5OHF5MmNtYmI5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-primary hover:text-white"
              aria-label="Instagram"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Categories (Quick Links) */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            {t("footer.categories")}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                to="/properties"
                className="transition-colors hover:text-white"
              >
                {t("footer.shopAll")}
              </Link>
            </li>
            <li>
              <Link
                to="/properties?sort=popular"
                className="transition-colors hover:text-white"
              >
                {t("footer.bestSeller")}
              </Link>
            </li>
            <li>
              <Link
                to="/properties?sort=price_asc"
                className="transition-colors hover:text-white"
              >
                {t("footer.bestOffers")}
              </Link>
            </li>
            <li>
              <Link
                to="/properties?sort=newest"
                className="transition-colors hover:text-white"
              >
                {t("footer.newArrivals")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Our Policy */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            {t("footer.ourPolicy")}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                to="/privacy"
                className="transition-colors hover:text-white"
              >
                {t("footer.privacyPolicy")}
              </Link>
            </li>
            <li>
              <Link to="/return" className="transition-colors hover:text-white">
                {t("footer.returnPolicy")}
              </Link>
            </li>
            <li>
              <Link
                to="/shipping"
                className="transition-colors hover:text-white"
              >
                {t("footer.shippingPolicy")}
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition-colors hover:text-white">
                {t("footer.termsOfService")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Help Center */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            {t("footer.helpCenter")}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/about" className="transition-colors hover:text-white">
                {t("footer.aboutUs")}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="transition-colors hover:text-white"
              >
                {t("footer.contactUs")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs sm:flex-row">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p className="text-slate-600">{t("footer.builtWith")}</p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
