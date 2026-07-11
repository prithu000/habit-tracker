"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor, ChevronRight } from "lucide-react";

export function DesktopExperienceBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on client to prevent hydration mismatch
    const isDismissed = localStorage.getItem("hide_desktop_banner");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem("hide_desktop_banner", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 24 }}
          exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="lg:hidden w-full overflow-hidden"
        >
          <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1a1a24]/90 to-[#0a0a0c]/90 backdrop-blur-xl border border-forge-500/20 shadow-[0_8px_32px_rgba(139,92,246,0.15)] overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-forge-500/10 blur-[40px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-forge-500/20 flex items-center justify-center border border-forge-500/30 shrink-0">
                    <Monitor className="w-4 h-4 text-forge-400" />
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
                    Better Experience on Desktop
                  </h3>
                </div>
                <button
                  onClick={dismiss}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed pl-10">
                YOU VS YOU is fully functional on mobile, but for the best productivity experience—including detailed analytics, reports, planning, and advanced features—we recommend using the desktop version.
              </p>
              
              <div className="pl-10 pt-2 flex items-center gap-3">
                <button
                  onClick={dismiss}
                  className="flex-1 py-2.5 rounded-xl bg-forge-500 hover:bg-forge-400 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  <span>Continue on Mobile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
