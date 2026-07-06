"use client";

import React from "react";
import { ExecutiveSummary } from "@/types/api";
import {
  Award,
  TrendingUp,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  Dumbbell,
  BookOpen,
  Droplets,
  Moon,
  Brain,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ExecutiveSummaryCardProps {
  summary: ExecutiveSummary;
  theme?: "dark" | "light";
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  summary,
  theme = "dark",
}) => {
  const isDark = theme === "dark";

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "from-amber-500 via-yellow-400 to-amber-600 text-zinc-950 shadow-amber-500/30";
    if (grade.startsWith("B")) return "from-purple-500 via-indigo-500 to-purple-600 text-white shadow-purple-500/30";
    if (grade.startsWith("C")) return "from-blue-500 to-cyan-500 text-white shadow-blue-500/30";
    return "from-rose-500 to-red-600 text-white shadow-rose-500/30";
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-6 sm:p-8 transition-all duration-300 shadow-2xl",
        isDark
          ? "bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950 border-purple-500/30 text-white"
          : "bg-white border-zinc-200 text-zinc-900 shadow-xl"
      )}
    >
      {/* Background Glow */}
      {isDark && (
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/60">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Fortune 500 Executive Performance Audit
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <span>EXECUTIVE</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">
              SUMMARY
            </span>
          </h2>
          <p className={cn("text-sm max-w-xl", isDark ? "text-zinc-400" : "text-zinc-600")}>
            Comprehensive neurological and behavioral assessment across 9 core life dimensions.
          </p>
        </div>

        {/* Discipline Grade & Overall Score */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <div className="text-xs uppercase font-bold tracking-wider text-zinc-400">Overall Life Score</div>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
              {summary.overall_life_score || 85} <span className="text-sm font-semibold text-zinc-400">/ 100</span>
            </div>
          </div>

          <div
            className={cn(
              "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center font-black shadow-lg transform hover:scale-105 transition-transform",
              getGradeColor(summary.discipline_grade || "A")
            )}
            title="Discipline Grade"
          >
            <span className="text-xs uppercase tracking-tighter opacity-80 font-bold">Grade</span>
            <span className="text-3xl sm:text-4xl leading-none">{summary.discipline_grade || "A"}</span>
          </div>
        </div>
      </div>

      {/* 12 Executive KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 py-6">
        <div className={cn("p-4 rounded-2xl border", isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Streak Velocity</span>
          </div>
          <div className="text-xl font-bold">{summary.current_streak || 0} Days</div>
          <div className="text-[10px] text-zinc-500">Record: {summary.longest_streak || 0}d</div>
        </div>

        <div className={cn("p-4 rounded-2xl border", isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>XP Generated</span>
          </div>
          <div className="text-xl font-bold text-yellow-400">+{summary.xp_earned || 0}</div>
          <div className="text-[10px] text-emerald-400">+{summary.monthly_growth_percentage || 0}% MoM</div>
        </div>

        <div className={cn("p-4 rounded-2xl border", isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Execution Rate</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">{summary.completion_percentage || 0}%</div>
          <div className="text-[10px] text-zinc-500">{summary.habits_completed || 0} habits done</div>
        </div>

        <div className={cn("p-4 rounded-2xl border", isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Deep Focus</span>
          </div>
          <div className="text-xl font-bold">{summary.focus_hours || 0} hrs</div>
          <div className="text-[10px] text-purple-400">Pomodoro active</div>
        </div>

        <div className={cn("p-4 rounded-2xl border", isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
            <span>Workout / Study</span>
          </div>
          <div className="text-xl font-bold">{summary.workout_hours || 0}h / {summary.study_hours || 0}h</div>
          <div className="text-[10px] text-zinc-500">Physical & mental</div>
        </div>

        <div className={cn("p-4 rounded-2xl border", isDark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Productivity</span>
          </div>
          <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            {summary.productivity_rating || "Elite"}
          </div>
          <div className="text-[10px] text-zinc-500">Water: {summary.water_consistency || 90}%</div>
        </div>
      </div>

      {/* AI Assessment Box */}
      <div
        className={cn(
          "mt-2 p-5 rounded-2xl border flex items-start gap-4",
          isDark
            ? "bg-gradient-to-r from-purple-950/40 via-zinc-900/60 to-zinc-900/40 border-purple-500/20"
            : "bg-purple-50 border-purple-200"
        )}
      >
        <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 shrink-0 mt-0.5">
          <Brain className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI Executive Assessment & Diagnostic Synthesis
          </div>
          <p className={cn("text-sm sm:text-base leading-relaxed italic font-medium", isDark ? "text-zinc-200" : "text-zinc-800")}>
            &ldquo;{summary.ai_summary || "During this execution cycle, your behavioral discipline and consistency remained optimal across core metrics."}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
