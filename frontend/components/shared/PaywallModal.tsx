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
    router.push("/pricing");
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
        title: "Unlock Deep Analytics",
        description: "Consistency aur progress track karne ke liye premium subscription zaroori hai. Unlock full insights and weekly trends.",
        features: ["Progress analytics", "Weekly trends", "Monthly insights", "Detailed performance data"],
      };
    }
    if (path.startsWith("/reports")) {
      return {
        title: "Unlock Executive Reports",
        description: "Actionable executive PDF reports aur AI coaching summaries download karne ke liye upgrade karein.",
        features: ["Daily breakdowns", "Weekly executive summaries", "AI coaching insights", "Printable PDFs"],
      };
    }
    if (path.startsWith("/focus")) {
      return {
        title: "Unlock Focus Mode",
        description: "Distraction-free deep work sessions, ambient soundscapes, aur Pomodoro analytics unlock karein.",
        features: ["Pomodoro timer", "Ambient soundscapes", "Session analytics", "Distraction blocking"],
      };
    }
    if (path.startsWith("/calendar") || path.startsWith("/leagues")) {
      return {
        title: "Unlock Arena & Calendar Heatmap",
        description: "Community competition aur advanced consistency heatmap ke sath khud ko har roz behtar banayein.",
        features: ["Calendar heatmap", "Arena competition", "Advanced routines", "Lifetime data retention"],
      };
    }
    return {
      title: "Unlock All Features",
      description: "Free accounts can track daily routines. Premium loge (₹49/month) tabhi saare features access karoge.",
      features: ["AI Coach", "Reports & PDF", "Deep Analytics", "Arena Leagues", "Heatmaps", "Focus Mode"],
    };
  };

  const context = getContextualMessaging();

  return (
    <ResponsiveModal
      isOpen={shouldShow}
      onClose={handleContinueFree}
      hideCloseButton={false}
      className="max-w-md p-0 overflow-hidden"
    >
      <div className="relative overflow-hidden flex flex-col items-center text-center p-6 sm:p-7">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
        
        {/* Top Lock Badge */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-emerald-500/15 to-purple-600/20 border border-amber-500/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(245,158,11,0.2)] relative z-10">
          <Lock className="w-7 h-7 text-amber-400" />
        </div>

        {/* Pricing Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3 relative z-10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Premium Plan · ₹49 / Month</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 relative z-10">
          {context.title}
        </h2>

        <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mb-5 leading-relaxed relative z-10">
          Premium loge <strong className="text-emerald-400 font-bold">₹49 per month</strong> tabhi saare features access karoge. Free plan me basic routine tracking available hai.
        </p>

        {/* Benefits Box */}
        <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 mb-6 text-left space-y-2.5 relative z-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Premium Features Included:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-200 font-medium">
            {context.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5 relative z-10">
          <button
            onClick={handleUpgrade}
            id="paywall-get-plan-btn"
            className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Get Plan (₹49/mo)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={handleContinueFree}
            id="paywall-continue-free-btn"
            className="w-full py-3 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-zinc-400 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Free</span>
          </button>
        </div>

        {/* Security / Guarantee Footer */}
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-zinc-500 relative z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Secure checkout · Cancel anytime</span>
        </div>
      </div>
    </ResponsiveModal>
  );
}
