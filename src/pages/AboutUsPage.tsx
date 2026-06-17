import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ShieldCheck,
  Search,
  MessageSquarePlus,
  ThumbsUp,
  CreditCard,
  UserCheck,
  Handshake,
  Building,
  BellRing,
  CheckCircle,
  FileText,
} from "lucide-react";
import UserNavbar from "@/components/UserNavbar";
import Footer from "@/components/Footer";

export default function AboutUsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"tenant" | "owner">("tenant");

  const TENANT_STEPS = [
    { icon: Search, titleKey: "about.tenantStep1" },
    { icon: MessageSquarePlus, titleKey: "about.tenantStep2" },
    { icon: ThumbsUp, titleKey: "about.tenantStep3" },
    { icon: CreditCard, titleKey: "about.tenantStep4" },
    { icon: UserCheck, titleKey: "about.tenantStep5" },
    { icon: Handshake, titleKey: "about.tenantStep6" },
  ];

  const OWNER_STEPS = [
    { icon: Building, titleKey: "about.ownerStep1" },
    { icon: BellRing, titleKey: "about.ownerStep2" },
    { icon: ThumbsUp, titleKey: "about.ownerStep3" },
    { icon: CheckCircle, titleKey: "about.ownerStep4" },
    { icon: Handshake, titleKey: "about.ownerStep5" },
  ];

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] text-slate-900 dark:text-white transition-colors duration-300">
      <Helmet>
        <title>{t("about.pageTitle", "About Us")} — Makanak</title>
        <meta name="description" content={t("about.heroSubtitle")} />
      </Helmet>

      <UserNavbar />

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden border-b border-black/5 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 dark:from-[#0A0F1C] dark:via-[#101827] dark:to-[#0A0F1C] opacity-90 transition-colors duration-300" />
        
        {/* Subtle moving glowing orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        
        <div className="relative mx-auto max-w-4xl text-center z-10 flex flex-col items-center">
          <motion.div 
            custom={0} initial="hidden" animate="visible" variants={headerVariants}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-6 py-2 text-sm font-medium backdrop-blur-md text-slate-800 dark:text-white transition-colors">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {t("about.pageTitle", "عن مكانك")}
            </span>
          </motion.div>
          <motion.h1 
            custom={1} initial="hidden" animate="visible" variants={headerVariants}
            className="text-4xl font-extrabold sm:text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight drop-shadow-sm dark:drop-shadow-xl text-slate-900 dark:text-white transition-colors"
          >
            {t("about.heroTitle", "About Us")}
          </motion.h1>
          <motion.p 
            custom={2} initial="hidden" animate="visible" variants={headerVariants}
            className="mx-auto max-w-2xl text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-white/70 font-light leading-relaxed transition-colors"
          >
            {t("about.heroSubtitle")}
          </motion.p>
        </div>
      </section>

      {/* Core Value / Trust Section */}
      <section className="px-4 py-24 bg-white dark:bg-[#050810] relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/5 dark:bg-primary/10 blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 dark:border-primary/30 shadow-[0_0_30px_rgba(30,58,138,0.2)] dark:shadow-[0_0_50px_rgba(30,58,138,0.4)] relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-primary animate-ping opacity-20" style={{ animationDuration: '2s' }} />
            <ShieldCheck className="h-12 w-12 text-primary drop-shadow-md dark:drop-shadow-[0_0_15px_rgba(30,58,138,0.8)] relative z-10" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl md:text-5xl mb-8 drop-shadow-sm dark:drop-shadow-lg transition-colors"
          >
            {t("about.coreValueTitle", "Absolute Security for Both Parties")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-slate-600 dark:text-white/60 leading-relaxed text-lg sm:text-xl font-light transition-colors"
          >
            {t("about.coreValueDesc", "We mandate ID verification to ensure a safe environment for both owners and tenants.")}
          </motion.p>
        </div>
      </section>

      {/* Lifecycles - Interactive Tabs */}
      <section className="px-4 py-24 bg-slate-50 dark:bg-[#0A0F1C] border-t border-black/5 dark:border-white/5 relative transition-colors duration-300">
        <div className="mx-auto max-w-6xl relative z-10">
          
          {/* Tabs Navigation */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#111827] rounded-full border border-black/5 dark:border-white/10 shadow-sm transition-colors">
              <button
                onClick={() => setActiveTab("tenant")}
                className={`px-8 py-3 rounded-full text-base font-bold transition-all duration-300 ${
                  activeTab === "tenant"
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t("about.tenantLifecycleTitle", "دورة حياة المستأجر")}
              </button>
              <button
                onClick={() => setActiveTab("owner")}
                className={`px-8 py-3 rounded-full text-base font-bold transition-all duration-300 ${
                  activeTab === "owner"
                    ? "bg-accent text-white shadow-md"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t("about.ownerLifecycleTitle", "دورة حياة المالك")}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "tenant" && (
              <motion.div
                key="tenant-timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Center Line */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-primary/80 via-primary/20 to-transparent" />

                {TENANT_STEPS.map(({ icon: Icon, titleKey }, idx) => {
                  const isLeft = idx % 2 === 0;
                  return (
                    <div key={idx} className={`relative flex items-center w-full mb-16 md:mb-24 flex-row ${isLeft ? "md:flex-row-reverse" : "md:flex-row"}`}>
                      <div className="hidden md:block md:w-5/12" />
                      
                      {/* Node */}
                      <div className="absolute left-8 md:static md:w-2/12 flex justify-center z-10 transform -translate-x-1/2 md:translate-x-0">
                        <motion.div 
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true, margin: "-100px" }}
                          className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-slate-50 dark:bg-[#0A0F1C] border-4 border-primary flex items-center justify-center shadow-sm dark:shadow-[0_0_20px_rgba(30,58,138,0.8)] transition-colors"
                        >
                          <span className="text-slate-900 dark:text-white font-bold text-lg md:text-xl transition-colors">{idx + 1}</span>
                        </motion.div>
                      </div>
                      
                      {/* Card */}
                      <motion.div 
                        className="w-full ml-16 md:ml-0 md:w-5/12"
                        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      >
                        <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-xl dark:shadow-2xl hover:shadow-2xl dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-2 hover:border-primary/50 transition-all duration-300 group">
                          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-primary group-hover:scale-110 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-300">
                            <Icon className="h-8 w-8" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight transition-colors">
                            {t(titleKey)}
                          </h3>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === "owner" && (
              <motion.div
                key="owner-timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Center Line */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-accent/80 via-accent/20 to-transparent" />

                {OWNER_STEPS.map(({ icon: Icon, titleKey }, idx) => {
                  const isLeft = idx % 2 === 0;
                  return (
                    <div key={idx} className={`relative flex items-center w-full mb-16 md:mb-24 flex-row ${isLeft ? "md:flex-row-reverse" : "md:flex-row"}`}>
                      <div className="hidden md:block md:w-5/12" />
                      
                      {/* Node */}
                      <div className="absolute left-8 md:static md:w-2/12 flex justify-center z-10 transform -translate-x-1/2 md:translate-x-0">
                        <motion.div 
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true, margin: "-100px" }}
                          className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-slate-50 dark:bg-[#0A0F1C] border-4 border-accent flex items-center justify-center shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-colors"
                        >
                          <span className="text-slate-900 dark:text-white font-bold text-lg md:text-xl transition-colors">{idx + 1}</span>
                        </motion.div>
                      </div>
                      
                      {/* Card */}
                      <motion.div 
                        className="w-full ml-16 md:ml-0 md:w-5/12"
                        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      >
                        <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-xl dark:shadow-2xl hover:shadow-2xl dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-2 hover:border-accent/50 transition-all duration-300 group">
                          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-accent group-hover:scale-110 group-hover:bg-accent/10 dark:group-hover:bg-accent/20 group-hover:border-accent/50 transition-all duration-300">
                            <Icon className="h-8 w-8" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight transition-colors">
                            {t(titleKey)}
                          </h3>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Terms Link Section */}
      <section className="px-4 py-24 text-center bg-white dark:bg-[#050810] relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <Link 
            to="/terms" 
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white font-bold text-lg hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:border-primary/50 shadow-md hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(30,58,138,0.5)] transition-all duration-300 group"
          >
            <FileText className="h-6 w-6 group-hover:scale-110 transition-transform" />
            {t("about.termsLink", "Read our Terms, Conditions, and Refund Policy")}
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
