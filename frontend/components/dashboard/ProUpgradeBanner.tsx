import React from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSubscription } from "@/lib/hooks/useSubscription";

export function ProUpgradeBanner() {
  const { isPaidActive: isSubscriber, subscription } = useSubscription();
  
  if (isSubscriber) return null;

  return (
    <div className="relative mt-8 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1d1633] via-[#151324] to-[#0a0a0c] border border-forge-500/30 p-8 md:p-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] group">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-forge-500/10 rounded-full blur-[80px] group-hover:bg-forge-500/20 transition-all duration-700 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        
        {/* Left Side: Copy */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forge-500/20 border border-forge-500/30 text-forge-300 text-xs font-bold uppercase tracking-widest shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Experience</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            YOU VS YOU <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 to-purple-400">PRO</span>
          </h2>
          
          <p className="text-sm md:text-base text-zinc-400 max-w-lg leading-relaxed mx-auto md:mx-0">
            Turn your discipline into measurable progress. Unlock the full potential of your personal operating system.
          </p>
        </div>

        {/* Middle: Features List */}
        <div className="flex-1 w-full md:w-auto">
          <div className="bg-[#0a0a0c]/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-3">
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Unlock:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
              {[
                "Unlimited Habit Widgets",
                "Weekly & Monthly Reports",
                "PDF Export",
                "Arena Progression",
                "Cross-device Sync",
                "Future Premium Features"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: CTA */}
        <div className="shrink-0 w-full md:w-auto flex flex-col items-center md:items-end space-y-3">
          <Link
            href="/pricing"
            className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-forge-500 to-purple-600 hover:from-forge-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wide transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>Upgrade to PRO</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Secure checkout via Razorpay</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
