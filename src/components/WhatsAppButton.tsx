import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Sequence Step 3: WhatsApp Tooltip
    // ALWAYS SHOW - Removed localStorage check
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 13000);
    return () => clearTimeout(timer);
  }, []);

  const dismissTooltip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {/* Tooltip */}
      {showTooltip && (
        <div className="relative flex items-center gap-3 bg-white dark:bg-card px-4 py-3 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm font-bold text-foreground whitespace-nowrap">
            تواصل معنا الان
          </p>
          <button
            onClick={dismissTooltip}
            className="p-1.5 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            aria-label="Dismiss tooltip"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Triangle pointer centered */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-card border-b border-r border-black/5 dark:border-white/10 transform rotate-45"></div>
        </div>
      )}

      <div className="relative flex items-center justify-center">
        {/* Ping effect behind the button */}
        <div className="absolute inset-0 w-full h-full bg-[#25D366] rounded-full animate-ping opacity-75"></div>
        
        {/* Main button */}
        <a
          href="https://wa.me/201068057499"
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-transform transition-shadow duration-300 animate-bounce hover:animate-none"
          aria-label="Chat with us on WhatsApp"
          style={{ animationDuration: '2s' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default WhatsAppButton;
