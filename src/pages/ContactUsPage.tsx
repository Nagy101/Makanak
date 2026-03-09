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

      {/* Content */}
      <section className="px-4 py-20">
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
