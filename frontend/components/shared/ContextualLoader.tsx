"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Cpu, ShieldCheck, Activity, AlertTriangle, RotateCcw, LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils/cn";
import { useLogout } from "@/lib/utils/logout";

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
  const performLogout = useLogout();
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
      <div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl animate-in fade-in duration-300 p-6"
        style={{ background: "var(--bg)", color: "var(--fg)" }}
      >
        <div className="absolute w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none opacity-20" style={{ background: "var(--accent)" }} />
        <div
          className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md p-8 rounded-3xl border shadow-2xl"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--card-shadow-hover)",
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>Something took longer than expected.</h2>
            <p className="text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              We encountered a delay while loading data from the neural engine.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </button>
            <button
              onClick={async () => {
                await performLogout();
                window.location.href = "/login";
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
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
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin duration-1000"
          style={{
            borderTopColor: "var(--accent)",
            borderRightColor: "var(--accent-hover)",
          }}
        />
        <div className="absolute inset-1 rounded-full border animate-pulse" style={{ borderColor: "var(--border)" }} />

        {/* Center Badge */}
        <div
          className="w-13 h-13 rounded-2xl border flex items-center justify-center shadow-inner"
          style={{
            background: "var(--surface-raised)",
            borderColor: "var(--accent-border)",
          }}
        >
          {context === "dashboard" && <Activity className="w-6 h-6 animate-pulse" style={{ color: "var(--accent)" }} />}
          {context === "life-score" && <Cpu className="w-6 h-6 animate-pulse" style={{ color: "var(--accent)" }} />}
          {context === "focus" && <Sparkles className="w-6 h-6 animate-pulse" style={{ color: "var(--accent)" }} />}
          {context === "reports" && <ShieldCheck className="w-6 h-6 animate-pulse" style={{ color: "var(--accent)" }} />}
          {["analytics", "routines", "settings", "default"].includes(context) && (
            <span className="font-bold text-sm tracking-tight" style={{ color: "var(--fg)" }}>YvY</span>
          )}
        </div>
      </div>

      {/* Dynamic Text Messages */}
      <div className="space-y-1.5 max-w-sm">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono uppercase tracking-widest font-bold" style={{ color: "var(--accent)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: "var(--accent)" }} />
          <span>System Execution In Progress</span>
        </div>
        <p className="text-xs sm:text-sm font-semibold tracking-tight min-h-[36px] flex items-center justify-center px-4 transition-all duration-300" style={{ color: "var(--fg)" }}>
          {currentText}
        </p>
      </div>

      {/* Progress Bar Shimmer */}
      <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full w-1/3 rounded-full animate-[shimmer_1.5s_infinite_linear] translate-x-[-100%]"
          style={{ background: "var(--accent)" }}
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl animate-in fade-in duration-300"
        style={{ background: "var(--bg)", color: "var(--fg)" }}
      >
        <div className="absolute w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none opacity-20" style={{ background: "var(--accent-subtle)" }} />
        {content}
      </div>
    );
  }

  return content;
}
