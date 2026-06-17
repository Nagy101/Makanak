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

          {/* Address for Paymob Compliance */}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <span className="leading-relaxed">{t("footer.address")}</span>
          </div>

          {/* Social links */}
          <div className="mt-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              تابعنا
            </h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/share/1bLdoCZpwf/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all duration-300 hover:scale-110 hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:shadow-[0_0_15px_rgba(24,119,242,0.5)]"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/findmakanak?igsh=ZDgycjh3MTN2MXdv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all duration-300 hover:scale-110 hover:bg-[#E1306C]/10 hover:text-[#E1306C] hover:shadow-[0_0_15px_rgba(225,48,108,0.5)]"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@findmakanak?_r=1&_t=ZS-97IDBruF0xZ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all duration-300 hover:scale-110 hover:bg-white/10 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
              </a>
              <a
                href="https://wa.me/201068057499"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all duration-300 hover:scale-110 hover:bg-[#25D366]/10 hover:text-[#25D366] hover:shadow-[0_0_15px_rgba(37,211,102,0.5)]"
                aria-label="WhatsApp"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
            </div>
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
