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
        {/* Subtle background ambient glow matching theme */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full blur-[80px] pointer-events-none opacity-30" 
          style={{ background: "var(--accent-subtle)" }}
        />
        
        {/* Top Lock Badge */}
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-sm"
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.28)",
          }}
        >
          <Lock className="w-7 h-7 text-amber-500" />
        </div>

        {/* Pricing Badge */}
        <div 
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 relative z-10 shadow-sm"
          style={{
            background: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Premium Plan · ₹49 / Month</span>
        </div>

        {/* Title */}
        <h2 
          className="text-xl sm:text-2xl font-black tracking-tight mb-2 relative z-10"
          style={{ color: "var(--fg)" }}
        >
          {context.title}
        </h2>

        {/* Description */}
        <p 
          className="text-xs sm:text-sm max-w-sm mb-5 leading-relaxed relative z-10"
          style={{ color: "var(--fg-muted)" }}
        >
          Premium loge <strong className="font-bold" style={{ color: "var(--accent)" }}>₹49 per month</strong> tabhi saare features access karoge. Free plan me basic routine tracking available hai.
        </p>

        {/* Benefits Box */}
        <div 
          className="w-full rounded-xl p-3.5 mb-6 text-left space-y-2.5 relative z-10"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <div 
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--accent)" }}
          >
            Premium Features Included:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {context.features.map((feat, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2"
                style={{ color: "var(--fg)" }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--accent)" }} />
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
            className="w-full py-3.5 px-5 rounded-xl text-white font-bold text-sm shadow-[0_4px_14px_rgba(44,95,42,0.3)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #16a34a, #15803d)",
            }}
          >
            <span>Get Plan (₹49/mo)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={handleContinueFree}
            id="paywall-continue-free-btn"
            className="w-full py-3 px-5 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--fg-muted)",
            }}
          >
            <span>Continue Free</span>
          </button>
        </div>

        {/* Security / Guarantee Footer */}
        <div 
          className="mt-4 flex items-center gap-1.5 text-[11px] relative z-10"
          style={{ color: "var(--fg-faint)" }}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--accent)" }} />
          <span>Secure checkout · Cancel anytime</span>
        </div>
      </div>
    </ResponsiveModal>
  );
}
