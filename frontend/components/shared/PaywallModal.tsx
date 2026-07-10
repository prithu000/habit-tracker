"use client";

import React from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePaywallStore } from "@/lib/stores/paywallStore";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, CheckCircle2, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export function PaywallModal() {
  const { user } = useAuthStore();
  const { isOpen, closePaywall } = usePaywallStore();
  const router = useRouter();
  const pathname = usePathname();

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
  const isFreeMode = user.subscription_status === "expired" || user.is_premium_active === false;

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0a0a0c]/85 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      {/* Background ambient glow */}
      <div className="absolute w-[500px] h-[500px] bg-forge-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none translate-x-32" />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-[#121216] border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center text-center">
        
        {/* Top Lock Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-forge-500/20 to-purple-600/20 border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Subscription Gating</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
          Your Premium Trial Has Ended
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-8 leading-relaxed">
          You can still continue tracking your daily routines for free.
        </p>

        {/* Benefits Box */}
        <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-8 text-left space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-forge-400 mb-2">
            Upgrade to unlock:
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm text-white/90 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AI Coach</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Executive PDF</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Arena</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Heatmaps</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Planner</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Focus Mode</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleUpgrade}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-forge-500 to-purple-600 hover:from-forge-600 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_45px_rgba(139,92,246,0.6)] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Upgrade Now</span>
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
        <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Secure Razorpay checkout · Cancel anytime from Account Settings</span>
        </div>
      </div>
    </div>
  );
}
