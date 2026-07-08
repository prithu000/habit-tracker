"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  Target,
  TrendingUp,
  Lightbulb,
  Compass,
  ArrowRight,
  Flame,
} from "lucide-react";
import { DashboardData } from "@/types/api";
import { cn } from "@/lib/utils/cn";

interface AICoachWidgetProps {
  dashboard: DashboardData;
}

export function AICoachWidget({ dashboard }: AICoachWidgetProps) {
  const { xp, streak, day_progress } = dashboard.widgets;
  const { user } = dashboard;

  // Calculate Progress Prediction
  const xpNeeded = xp.xp_to_next_level;
  const avgDailyXp = Math.max(50, xp.xp_earned_today || 80);
  const daysToNextLevel = Math.max(1, Math.ceil(xpNeeded / avgDailyXp));

  // Rotating daily quotes — deterministic based on day of year
  const dailyQuotes = [
    "Small victories repeated consistently become extraordinary lives.",
    "The goal isn't perfection. The goal is becoming better than yesterday.",
    "Every completed habit is proof of who you are becoming.",
    "Discipline is the bridge between who you are and who you want to be.",
    "You don't compete against anyone. You compete against yesterday's version of you.",
    "Momentum is built one decision at a time. Start now.",
    "Identity is built through daily evidence. Show up.",
  ];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyQuote = dailyQuotes[dayOfYear % dailyQuotes.length];

  // Determine dynamic motivational message and focus based on real completion data
  let motivation = dailyQuote;
  let focusSuggestion = "Complete your high-priority morning routines before noon to lock in execution momentum.";
  let tip = "Small victories repeated consistently become extraordinary lives.";

  if (day_progress.completion_rate === 100 && day_progress.tasks_scheduled > 0) {
    motivation = "Total execution achieved. You have proven your identity today.";
    focusSuggestion = "Review your upcoming weekly goals and prepare your environment for tomorrow.";
    tip = "Recovery is part of elite discipline. Protect your sleep and reset for tomorrow.";
  } else if (streak.current >= 7) {
    motivation = `${streak.current}-day streak. Your habits are becoming permanent identity traits. Protect this.`;
    focusSuggestion = "Maintain strict consistency on your anchor habits. Intensity is optional. Consistency is not.";
    tip = "When motivation fades, your systems carry you forward. Trust the process.";
  } else if (day_progress.tasks_completed === 0) {
    motivation = "Every remarkable transformation begins with a single completed task. Today is Day One.";
    focusSuggestion = "Pick the smallest task on your list and complete it immediately. Momentum begins now.";
    tip = "The first action breaks inertia. Everything compounds from here.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[24px] bg-gradient-to-br from-[#0f0a1c] via-[#0a0a0c] to-[#0a0a0c] border border-forge-500/30 hover:border-forge-500/60 shadow-[0_15px_50px_rgba(139,92,246,0.15)] relative overflow-hidden group transition-all"
    >
      {/* Futuristic Glowing Orb / Mesh Illustration in Background */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br from-forge-500/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute right-10 top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none animate-pulse duration-3000" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-forge-500 to-purple-600 p-[1px] shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0a0c] rounded-[15px] flex items-center justify-center text-forge-300 group-hover:bg-transparent group-hover:text-white transition-all">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#0a0a0c]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-base tracking-wide text-white">
                NEURAL COACH
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-forge-500/20 to-cyan-500/20 text-forge-300 border border-forge-500/30 uppercase tracking-widest font-bold">
                LIVE
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Personalized insights for <span className="text-foreground font-medium">{user.display_name}</span>
            </p>
          </div>
        </div>

        {/* Prediction Badge */}
        <div className="flex items-center gap-2 bg-white/[0.03] border border-purple-500/30 px-3 py-1.5 rounded-xl shadow-inner self-start sm:self-auto">
          <TrendingUp className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="text-left">
            <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">
              Progress Prediction
            </p>
            <p className="text-xs font-bold text-purple-300">
              Level {xp.current_level + 1} in ~{daysToNextLevel} {daysToNextLevel === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5 relative z-10">
        {/* Daily Insight / Motivation */}
        <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forge-400">
            <Sparkles className="w-4 h-4" />
            Daily Synthesis
          </div>
          <p className="text-xs text-forge-100 leading-relaxed font-medium">
            &quot;{motivation}&quot;
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Execution Engine Active</span>
          </div>
        </div>

        {/* Today's Focus Recommendation */}
        <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Target className="w-4 h-4" />
            Primary Focus Vector
          </div>
          <p className="text-xs text-cyan-100 leading-relaxed font-medium">
            {focusSuggestion}
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>Target: {day_progress.tasks_scheduled} habits</span>
            <span className="text-cyan-400 font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Improvement Tip */}
        <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Lightbulb className="w-4 h-4" />
            Optimization Tip
          </div>
          <p className="text-xs text-amber-100 leading-relaxed font-medium">
            {tip}
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>Protocol: Consistency First</span>
            <span className="text-amber-400 font-bold">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Footer / Interactive Prompt */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Compass className="w-4 h-4 text-forge-400" />
          <span>AI Coach continuously adapts to your completion telemetry in real-time.</span>
        </div>
        <button
          onClick={() => {
            const el = document.getElementById("routines-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-forge-500/20 hover:bg-forge-500/30 text-forge-200 border border-forge-500/40 font-semibold transition-all group/btn shadow-[0_0_15px_rgba(139,92,246,0.2)]"
        >
          <span>Execute Today&apos;s Routines</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
