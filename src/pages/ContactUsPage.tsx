import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import UserNavbar from "@/components/UserNavbar";
import Footer from "@/components/Footer";

interface ContactForm {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactUsPage() {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit = (data: ContactForm) => {
    const mailTo = "makanakservices@gmail.com";
    const subject = encodeURIComponent(data.subject);
    const body = encodeURIComponent(
      `Name: ${data.fullName}\nEmail: ${data.email}\n\n${data.message}`,
    );
    window.location.href = `mailto:${mailTo}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t("contact.pageTitle")} — Makanak</title>
        <meta name="description" content={t("contact.heroSubtitle")} />
      </Helmet>

      <UserNavbar />

      {/* Hero Section */}
      <section className="relative bg-[#1E3A8A] text-white py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl mb-4">
            {t("contact.heroTitle")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            {t("contact.heroSubtitle")}
          </p>
        </div>
      </section>



      {/* Premium Social & Contact Cards */}
      <section className="px-4 pt-20 pb-10 bg-slate-50 dark:bg-background transition-colors">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Facebook */}
          <a 
            href="https://www.facebook.com/share/1bLdoCZpwf/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-6 shadow-sm hover:shadow-[0_0_20px_rgba(24,119,242,0.2)] hover:border-[#1877F2]/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1877F2]/0 to-[#1877F2]/0 group-hover:from-[#1877F2]/5 group-hover:to-transparent transition-colors duration-500" />
            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-black/20 flex items-center justify-center group-hover:bg-[#1877F2]/10 transition-colors duration-300">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-700 dark:text-slate-300 group-hover:text-[#1877F2] transition-colors" fill="currentColor">
                  <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">Facebook</h3>
                <p className="text-sm text-muted-foreground font-medium">تابعنا على فيسبوك</p>
              </div>
            </div>
          </a>

          {/* Instagram */}
          <a 
            href="https://www.instagram.com/findmakanak?igsh=ZDgycjh3MTN2MXdv" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-6 shadow-sm hover:shadow-[0_0_20px_rgba(225,48,108,0.2)] hover:border-[#E1306C]/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#E1306C]/0 to-[#F56040]/0 group-hover:from-[#E1306C]/5 group-hover:to-[#F56040]/5 transition-colors duration-500" />
            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-black/20 flex items-center justify-center group-hover:bg-[#E1306C]/10 transition-colors duration-300">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-700 dark:text-slate-300 group-hover:text-[#E1306C] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">Instagram</h3>
                <p className="text-sm text-muted-foreground font-medium">صور عقاراتنا على إنستجرام</p>
              </div>
            </div>
          </a>

          {/* TikTok */}
          <a 
            href="https://www.tiktok.com/@findmakanak?_r=1&_t=ZS-97IDBruF0xZ" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-6 shadow-sm hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:border-black/50 dark:hover:border-white/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/0 dark:from-white/0 dark:to-white/0 group-hover:from-black/5 dark:group-hover:from-white/5 transition-colors duration-500" />
            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-black/20 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors duration-300">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">TikTok</h3>
                <p className="text-sm text-muted-foreground font-medium">فيديوهاتنا على تيك توك</p>
              </div>
            </div>
          </a>

          {/* WhatsApp */}
          <a 
            href="https://wa.me/201068057499" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-6 shadow-sm hover:shadow-[0_0_20px_rgba(37,211,102,0.2)] hover:border-[#25D366]/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/0 to-[#25D366]/0 group-hover:from-[#25D366]/5 group-hover:to-transparent transition-colors duration-500" />
            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-black/20 flex items-center justify-center group-hover:bg-[#25D366]/10 transition-colors duration-300">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-700 dark:text-slate-300 group-hover:text-[#25D366] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">WhatsApp</h3>
                <p className="text-sm text-muted-foreground font-medium">تواصل مباشرة عبر واتساب</p>
              </div>
            </div>
          </a>

        </div>
      </section>

      {/* Content */}
      <section className="px-4 pt-10 pb-20 bg-slate-50 dark:bg-background transition-colors">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: Contact Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t("contact.infoTitle")}
              </h2>
              <p className="text-muted-foreground">
                {t("contact.infoSubtitle")}
              </p>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A]/10">
                  <Mail className="h-6 w-6 text-[#1E3A8A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("contact.emailLabel")}
                  </h3>
                  <a
                    href="mailto:makanakservices@gmail.com"
                    className="text-sm text-muted-foreground hover:text-[#1E3A8A] transition-colors"
                  >
                    makanakservices@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A]/10">
                  <Phone className="h-6 w-6 text-[#1E3A8A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t("contact.phoneLabel")}
                  </h3>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    0106 805 7499
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {t("contact.formTitle")}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">{t("contact.fullName")}</Label>
                <Input
                  id="fullName"
                  placeholder={t("contact.fullNamePlaceholder")}
                  {...register("fullName", {
                    required: t("contact.fullNameRequired"),
                  })}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("contact.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("contact.emailPlaceholder")}
                  {...register("email", {
                    required: t("contact.emailRequired"),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t("contact.emailInvalid"),
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="subject">{t("contact.subject")}</Label>
                <Input
                  id="subject"
                  placeholder={t("contact.subjectPlaceholder")}
                  {...register("subject", {
                    required: t("contact.subjectRequired"),
                  })}
                />
                {errors.subject && (
                  <p className="text-xs text-destructive">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label htmlFor="message">{t("contact.message")}</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder={t("contact.messagePlaceholder")}
                  {...register("message", {
                    required: t("contact.messageRequired"),
                  })}
                />
                {errors.message && (
                  <p className="text-xs text-destructive">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#1E3A8A] text-white hover:bg-blue-700 transition-colors"
              >
                {t("contact.sendMessage")}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
