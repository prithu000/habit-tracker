"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Cpu, ShieldCheck, Activity, AlertTriangle, RotateCcw, LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils/cn";

export type LoaderContext =
  | "dashboard"
  | "life-score"
  | "focus"
  | "reports"
  | "analytics"
  | "routines"
  | "settings"
  | "about"
  | "help"
  | "calendar"
  | "leagues"
  | "profile"
  | "default";

interface ContextualLoaderProps {
  context?: LoaderContext;
  customMessage?: string;
  className?: string;
  fullScreen?: boolean;
}

const MESSAGES: Record<LoaderContext, string[]> = {
  dashboard: [
    "Loading your Dashboard...",
    "Synchronizing biological telemetry & XP...",
    "Aggregating daily momentum diagnostics...",
    "Loading active routines & habit streaks...",
  ],
  "life-score": [
    "Calculating your Life Score...",
    "Evaluating 8 foundational Life Pillars...",
    "Synthesizing discipline & habit correlations...",
    "Computing compound biological progression...",
  ],
  analytics: [
    "Loading your Analytics...",
    "Querying multi-period habit heatmaps...",
    "Calculating consistency correlations & velocity...",
    "Rendering discipline score trajectories...",
  ],
  reports: [
    "Preparing your Executive Report...",
    "Compiling Executive Printable Report...",
    "Aggregating daily & weekly metrics...",
    "Optimizing layout for high-resolution A4 PDF...",
  ],
  routines: [
    "Loading your Planner...",
    "Loading habit structures & daily checklists...",
    "Verifying completion validation rules...",
    "Synchronizing streak multipliers...",
  ],
  focus: [
    "Preparing your Focus Session...",
    "Configuring Deep Focus Chamber...",
    "Optimizing binaural soundscapes & ambient modes...",
    "Synchronizing flow state protocol...",
  ],
  settings: [
    "Loading your Preferences...",
    "Loading Studio configuration & identity telemetry...",
    "Verifying Razorpay subscription status...",
  ],
  about: [
    "Loading YOU VS YOU...",
    "Synchronizing system documentation & vision...",
    "Preparing executive briefing...",
  ],
  help: [
    "Loading Support Center...",
    "Connecting to knowledge base & diagnostics...",
    "Preparing assistance guides...",
  ],
  calendar: [
    "Loading your Schedule...",
    "Synchronizing day logs & heatmap events...",
    "Preparing timeline view...",
  ],
  leagues: [
    "Loading Discipline League...",
    "Fetching division rankings & competitor telemetry...",
    "Calculating seasonal trajectories...",
  ],
  profile: [
    "Loading User Profile...",
    "Synchronizing identity badge collection...",
    "Calculating all-time achievement milestones...",
  ],
  default: [
    "Synchronizing YOU VS YOU intelligence engine...",
    "Loading personal operating system...",
    "Preparing your environment for execution...",
  ],
};

export function ContextualLoader({
  context = "default",
  customMessage,
  className,
  fullScreen = false,
}: ContextualLoaderProps) {
  const router = useRouter();
  const [msgIndex, setMsgIndex] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const messages = MESSAGES[context] || MESSAGES.default;

  useEffect(() => {
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [context, messages.length]);

  useEffect(() => {
    setIsTimedOut(false);
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [context]);

  const currentText = customMessage || messages[msgIndex];

  if (isTimedOut && fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0c]/95 backdrop-blur-xl animate-in fade-in duration-300 p-6">
        <div className="absolute w-[450px] h-[450px] bg-forge-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md glass-card p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-black tracking-tight text-white">Something took longer than expected.</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We encountered a delay while loading data from the DeepMind neural engine.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-forge-500 hover:bg-forge-400 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </button>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                window.location.href = "/login";
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Refresh Session</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className={cn("flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-6", className)}>
      {/* Animated Ring Logo & Icon */}
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Outer glowing spinning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-forge-500 border-r-purple-600 animate-spin duration-1000 shadow-[0_0_25px_rgba(139,92,246,0.4)]" />
        <div className="absolute inset-1 rounded-full border border-white/10 animate-pulse" />

        {/* Center Badge */}
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-forge-500/20 to-purple-600/20 border border-forge-500/40 flex items-center justify-center shadow-inner">
          {context === "dashboard" && <Activity className="w-6 h-6 text-forge-400 animate-pulse" />}
          {context === "life-score" && <Cpu className="w-6 h-6 text-purple-400 animate-pulse" />}
          {context === "focus" && <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />}
          {context === "reports" && <ShieldCheck className="w-6 h-6 text-cyan-400 animate-pulse" />}
          {["analytics", "routines", "settings", "default"].includes(context) && (
            <span className="font-black text-sm tracking-tighter text-white">YvY</span>
          )}
        </div>
      </div>

      {/* Dynamic Text Messages */}
      <div className="space-y-1.5 max-w-sm">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-forge-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-forge-400 animate-ping" />
          <span>System Execution In Progress</span>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-white tracking-tight min-h-[36px] flex items-center justify-center px-4 transition-all duration-300">
          {currentText}
        </p>
      </div>

      {/* Progress Bar Shimmer */}
      <div className="w-48 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-forge-500 via-purple-500 to-cyan-400 w-1/3 rounded-full animate-[shimmer_1.5s_infinite_linear] translate-x-[-100%]" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0c]/90 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="absolute w-[450px] h-[450px] bg-forge-500/10 rounded-full blur-[130px] pointer-events-none" />
        {content}
      </div>
    );
  }

  return content;
}
