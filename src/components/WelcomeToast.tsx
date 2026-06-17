import { useState, useEffect } from "react";
import { X, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WelcomeToast() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we've shown it this session
    const hasSeenToast = sessionStorage.getItem("hasSeenWelcomeToast");
    
    if (!hasSeenToast) {
      // Small delay before showing
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      // Auto dismiss after 4 seconds (1s delay + 4s = 5s total)
      const dismissTimer = setTimeout(() => {
        dismissToast();
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
  }, []);

  const dismissToast = () => {
    setIsVisible(false);
    sessionStorage.setItem("hasSeenWelcomeToast", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 left-4 md:left-6 z-[100] w-[calc(100%-2rem)] md:w-[400px] max-w-[90vw]"
        >
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-border shadow-2xl rounded-2xl p-4 flex items-start gap-4">
            {/* Glossy highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
            
            <div className="flex-shrink-0 h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <PhoneCall className="h-5 w-5 animate-pulse" />
            </div>
            
            <div className="flex-1 pt-1">
              <p className="text-sm font-bold text-foreground leading-relaxed">
                لو حسيت بأي حاجة صعبة ماتاخدش وقت وتتواصل معانا، إحنا متوفرين في كل وقت للمساعدة! 📞
              </p>
            </div>
            
            <button
              onClick={dismissToast}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-full transition-colors"
              aria-label="Close message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
