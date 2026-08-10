"use client";

import React from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePaywallStore } from "@/lib/stores/paywallStore";
import { useRouter, usePathname } from "next/navigation";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Sparkles, CheckCircle2, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/ResponsiveModal";

export function PaywallModal() {
  const { user } = useAuthStore();
  const { isOpen, closePaywall } = usePaywallStore();
  const router = useRouter();
  const pathname = usePathname();

  const { isFreeMode } = useSubscription();

  if (!user) return null;
  if (
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/pricing") ||
    pathname?.startsWith("/onboarding")
  ) {
    return null;
  }

  const lockedRoutes = ["/reports", "/analytics", "/leagues", "/calendar", "/focus"];
  const isLockedRoute = lockedRoutes.some((route) => pathname?.startsWith(route));

  const shouldShow = isOpen || (isFreeMode && isLockedRoute);
  if (!shouldShow) return null;

  const handleUpgrade = () => {
    closePaywall();
    router.push("/pricing?plan=12_month");
  };

  const handleContinueFree = () => {
    closePaywall();
    if (isLockedRoute) {
      router.push("/dashboard");
    }
  };

  const getContextualMessaging = () => {
    const path = pathname || "";
    if (path.startsWith("/analytics")) {
      return {
        title: "Unlock Analytics",
        description: "See whether your consistency is actually improving.",
        features: ["Progress analytics", "Weekly trends", "Monthly insights", "Detailed performance data"],
        cta: "Unlock Analytics"
      };
    }
    if (path.startsWith("/reports")) {
      return {
        title: "Unlock Executive Reports",
        description: "Get detailed, actionable PDFs of your performance.",
        features: ["Daily breakdowns", "Weekly executive summaries", "AI coaching insights", "Printable PDFs"],
        cta: "Unlock Reports"
      };
    }
    if (path.startsWith("/focus")) {
      return {
        title: "Unlock Focus Mode",
        description: "Deep work sessions without distraction.",
        features: ["Pomodoro timer", "Ambient soundscapes", "Session analytics", "Distraction blocking"],
        cta: "Unlock Focus Mode"
      };
    }
    if (path.startsWith("/calendar") || path.startsWith("/leagues")) {
      return {
        title: "Unlock Your Full Potential",
        description: "Access advanced tools to engineer your best self.",
        features: ["Calendar heatmap", "Arena competition", "Advanced routines", "Lifetime data retention"],
        cta: "Unlock YOU VS YOU"
      };
    }
    return {
      title: "Premium Features Locked",
      description: "Upgrade to a premium subscription to access this feature and supercharge your productivity.",
      features: ["AI Coach", "Reports", "Executive PDF", "Analytics", "Arena", "Heatmaps", "Planner", "Focus Mode"],
      cta: "Upgrade Now"
    };
  };

  const context = getContextualMessaging();

  return (
    <ResponsiveModal
      isOpen={shouldShow}
      onClose={handleContinueFree}
      hideCloseButton={true}
      className="bg-[#121216] max-w-xl p-0"
    >
      <div className="relative overflow-hidden flex flex-col items-center text-center p-6 sm:p-8 md:p-10">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-forge-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-[80%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Top Lock Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-forge-500/20 to-purple-600/20 border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] relative z-10">
          <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3 relative z-10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Subscription Gating</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3 relative z-10">
          {context.title}
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-8 leading-relaxed relative z-10">
          {context.description}
        </p>

        {/* Benefits Box */}
        <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-8 text-left space-y-3 relative z-10">
          <div className="text-xs font-bold uppercase tracking-wider text-forge-400 mb-2">
            Upgrade to unlock:
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm text-white/90 font-medium">
            {context.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row-reverse items-center gap-3 relative z-10">
          <button
            onClick={handleUpgrade}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-forge-500 to-purple-600 hover:from-forge-600 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_45px_rgba(139,92,246,0.6)] transition-all flex items-center justify-center gap-2 group"
          >
            <span>{context.cta}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleContinueFree}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-muted-foreground hover:text-white font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
          >
            <span>Continue Free</span>
          </button>
        </div>

        {/* Security / Guarantee Footer */}
        <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground relative z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Secure Razorpay checkout · Cancel anytime</span>
        </div>
      </div>
    </ResponsiveModal>
  );
}
