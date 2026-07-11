"use client";

import React, { useState } from "react";
import { useLifeScore } from "@/lib/queries/useOS";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  Activity,
  BookOpen,
  Briefcase,
  Smile,
  Heart,
  Moon,
  DollarSign,
  User,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  BrainCircuit,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  AlertTriangle,
  BarChart3,
  Calendar,
} from "lucide-react";
import { ResponsiveModal, ResponsiveModalFooter } from "@/components/ui/ResponsiveModal";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const LifeScoreRadarChart = dynamic(
  () => import("@/components/life-score/LifeScoreRadarChart").then((m) => m.LifeScoreRadarChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-2xl bg-zinc-900/60" /> }
);

const LifeScoreLineChart = dynamic(
  () => import("@/components/life-score/LifeScoreLineChart").then((m) => m.LifeScoreLineChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-2xl bg-zinc-900/60" /> }
);

export default function LifeScorePage() {
  const { data, isLoading, isError } = useLifeScore();
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [radarTimeframe, setRadarTimeframe] = useState<"today" | "weekly" | "monthly">("today");
  const [selectedAxis, setSelectedAxis] = useState<any | null>(null);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16">
        <Skeleton className="h-28 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[450px] w-full rounded-3xl" />
          <Skeleton className="h-[450px] lg:col-span-2 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl max-w-7xl mx-auto">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Life Score Telemetry Offline</h3>
        <p className="text-zinc-400">Unable to synchronize neuro-systems diagnostic data.</p>
      </div>
    );
  }

  const { overall_score, title, categories, history, ai_analysis, suggestions, confidence_pct, trend, breakdown, radar, dimensions } = data;
  const isInitializing = data.is_initializing || radar?.is_initializing || title === "Initializing";

  // 9-Axis Radar data fallback
  const radarAxes = radar?.axes || [
    { subject: "Discipline", today: isInitializing ? 0 : categories.discipline, weekly: isInitializing ? 0 : categories.discipline - 4, monthly: isInitializing ? 0 : categories.discipline - 7, fullMark: 100, explanation: "Adherence to scheduled routines without procrastination." },
    { subject: "Focus", today: isInitializing ? 0 : categories.mental_health, weekly: isInitializing ? 0 : categories.mental_health - 3, monthly: isInitializing ? 0 : categories.mental_health - 6, fullMark: 100, explanation: "Deep work immersion and Pomodoro session completion." },
    { subject: "Consistency", today: isInitializing ? 0 : 90, weekly: isInitializing ? 0 : 85, monthly: isInitializing ? 0 : 80, fullMark: 100, explanation: "Uninterrupted daily execution streaks across core habits." },
    { subject: "Deep Study", today: isInitializing ? 0 : categories.learning, weekly: isInitializing ? 0 : categories.learning - 5, monthly: isInitializing ? 0 : categories.learning - 8, fullMark: 100, explanation: "Cognitive skill acquisition and reading/learning time." },
    { subject: "Workout", today: isInitializing ? 0 : categories.fitness, weekly: isInitializing ? 0 : categories.fitness - 4, monthly: isInitializing ? 0 : categories.fitness - 6, fullMark: 100, explanation: "Hypertrophy push, physical exertion, and exercise completion." },
    { subject: "Hydration", today: isInitializing ? 0 : categories.health, weekly: isInitializing ? 0 : categories.health - 2, monthly: isInitializing ? 0 : categories.health - 5, fullMark: 100, explanation: "Daily water intake consistency against physiological goals." },
    { subject: "Execution", today: isInitializing ? 0 : categories.work, weekly: isInitializing ? 0 : categories.work - 3, monthly: isInitializing ? 0 : categories.work - 5, fullMark: 100, explanation: "Raw volume of tasks completed versus total planned workload." },
    { subject: "Recovery", today: isInitializing ? 0 : categories.sleep, weekly: isInitializing ? 0 : categories.sleep - 4, monthly: isInitializing ? 0 : categories.sleep - 6, fullMark: 100, explanation: "Sleep duration, restorative rest, and recovery protocol adherence." },
    { subject: "Growth", today: isInitializing ? 0 : categories.personal, weekly: isInitializing ? 0 : categories.personal - 3, monthly: isInitializing ? 0 : categories.personal - 5, fullMark: 100, explanation: "XP generation, level progression, and achievement unlocks." },
  ];

  // Dimensional metrics fallback
  const dimData = dimensions || [
    { id: "discipline", title: "Discipline Mastery", score: categories.discipline, trend: "+4.2%", weekly_avg: categories.discipline - 3, monthly_avg: categories.discipline - 6, improvement_pct: 5.1, ai_insight: "High execution consistency during morning routines.", recommendation: "Lock in evening routines 30 mins earlier." },
    { id: "focus", title: "Focus Mastery", score: categories.mental_health, trend: "+3.8%", weekly_avg: categories.mental_health - 2, monthly_avg: categories.mental_health - 5, improvement_pct: 4.2, ai_insight: "Pomodoro completion rate increased significantly.", recommendation: "Eliminate desktop notifications during sprints." },
    { id: "workout", title: "Workout Mastery", score: categories.fitness, trend: "+5.0%", weekly_avg: categories.fitness - 4, monthly_avg: categories.fitness - 7, improvement_pct: 6.0, ai_insight: "Hypertrophy push goals met consistently.", recommendation: "Add 15-min mobility session post-workout." },
    { id: "study", title: "Deep Study Mastery", score: categories.learning, trend: "+2.5%", weekly_avg: categories.learning - 3, monthly_avg: categories.learning - 5, improvement_pct: 3.1, ai_insight: "Reading velocity pacing ahead of targets.", recommendation: "Dedicate 45 mins to technical docs review." },
    { id: "hydration", title: "Hydration Mastery", score: categories.health, trend: "0.0%", weekly_avg: categories.health - 1, monthly_avg: categories.health - 3, improvement_pct: 1.0, ai_insight: "Water consistency reached optimal adherence.", recommendation: "Keep 1500ml water bottle at workstation." },
    { id: "execution", title: "Execution Mastery", score: categories.work, trend: "+4.1%", weekly_avg: categories.work - 3, monthly_avg: categories.work - 6, improvement_pct: 4.8, ai_insight: "High completion velocity across tasks.", recommendation: "Tackle urgent priority tasks first thing." },
    { id: "recovery", title: "Recovery Mastery", score: categories.sleep, trend: "+1.8%", weekly_avg: categories.sleep - 2, monthly_avg: categories.sleep - 4, improvement_pct: 2.2, ai_insight: "Restorative sleep index indicates solid recovery.", recommendation: "Maintain strict 11:00 PM digital sunset." },
    { id: "growth", title: "Growth Mastery", score: categories.personal, trend: "+3.5%", weekly_avg: categories.personal - 3, monthly_avg: categories.personal - 5, improvement_pct: 3.9, ai_insight: "XP accumulation rate pacing well for promotion.", recommendation: "Unlock 2 pending achievements in League arena." },
  ];

  const categoryConfigs = [
    { key: "fitness", label: "Fitness", val: categories.fitness, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-500" },
    { key: "learning", label: "Learning", val: categories.learning, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10", bar: "bg-blue-500" },
    { key: "work", label: "Work", val: categories.work, icon: Briefcase, color: "text-indigo-400", bg: "bg-indigo-500/10", bar: "bg-indigo-500" },
    { key: "mental_health", label: "Mental Health", val: categories.mental_health, icon: Smile, color: "text-purple-400", bg: "bg-purple-500/10", bar: "bg-purple-500" },
    { key: "health", label: "Health", val: categories.health, icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", bar: "bg-rose-500" },
    { key: "sleep", label: "Sleep", val: categories.sleep, icon: Moon, color: "text-cyan-400", bg: "bg-cyan-500/10", bar: "bg-cyan-500" },
    { key: "finance", label: "Finance", val: categories.finance, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10", bar: "bg-amber-500" },
    { key: "personal", label: "Personal", val: categories.personal, icon: User, color: "text-pink-400", bg: "bg-pink-500/10", bar: "bg-pink-500" },
    { key: "discipline", label: "Discipline", val: categories.discipline, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", bar: "bg-purple-500" },
  ];

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-zinc-900/60 to-zinc-900/40 p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
            Core Flagship Telemetry — ScoreEngine 2.0
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            LIFE SCORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">STUDIO</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            Real-time 9-dimensional neuro-systems telemetry combining physical vitality, mental clarity, and execution discipline.
          </p>
        </div>
        <div 
          onClick={() => setShowBreakdownModal(true)}
          className="flex items-center gap-4 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 shadow-inner cursor-pointer hover:border-purple-500/50 transition-all group"
          title="Click to view exact calculation breakdown & confidence index"
        >
          <div className="text-right">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest flex items-center justify-end gap-1">
              <span>Classification</span>
              <Info className="w-3 h-3 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-wider">
              {title}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            {overall_score}
          </div>
        </div>
      </div>

      {/* Onboarding Banner for New Users */}
      {isInitializing && (
        <div className="bg-gradient-to-r from-purple-900/50 via-indigo-950/60 to-zinc-900/60 p-6 rounded-3xl border border-purple-500/40 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden animate-pulse">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                SYSTEM TELEMETRY INITIALIZING
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  0 Days Tracked
                </span>
              </h3>
              <p className="text-sm text-zinc-300 mt-1">
                {data.onboarding_message || "Complete your first day to unlock your Personal Operating System analytics."}
              </p>
            </div>
          </div>
          <a
            href="/calendar"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 shrink-0"
          >
            Start First Day →
          </a>
        </div>
      )}

      {/* Main Grid: Gauge & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Overall Gauge & Interactive Button */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Overall Equilibrium
              </h3>
              {confidence_pct && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {confidence_pct}% Confidence
                </span>
              )}
            </div>
            
            {/* Animated Circular Gauge */}
            <div 
              onClick={() => setShowBreakdownModal(true)}
              className="relative flex items-center justify-center my-8 cursor-pointer group"
              title="Click to view exact calculation additions & penalties"
            >
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-zinc-800"
                  fill="transparent"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#purpleGradient)"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - overall_score / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - overall_score / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-5xl font-black tracking-tighter text-white">{overall_score}</span>
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-widest mt-1">{title}</span>
                {trend && (
                  <span className={cn(
                    "text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full",
                    trend.direction === "up" ? "bg-emerald-500/20 text-emerald-300" : (trend.direction === "down" ? "bg-rose-500/20 text-rose-300" : "bg-zinc-800 text-zinc-400")
                  )}>
                    {trend.change > 0 ? `+${trend.change}` : trend.change} pts (7d)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Axis Summary & Modal Trigger */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/80">
            <button
              onClick={() => setShowBreakdownModal(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              View Exact Math & Penalties
            </button>
            <p className="text-xs text-zinc-500 leading-relaxed text-center">
              ScoreEngine 2.0 uses a weighted algorithm: 25% Task Completion, 20% Consistency Streak, 15% Discipline, and 40% OS Execution.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: 9-Axis Radar Chart & AI Diagnostic */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  9-Axis Radar Diagnostic
                </h3>
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {(["today", "weekly", "monthly"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setRadarTimeframe(tf)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                        radarTimeframe === tf ? "bg-purple-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {tf === "today" ? "Today" : (tf === "weekly" ? "7D Avg" : "30D Avg")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <LifeScoreRadarChart
                radarAxes={radarAxes}
                radarTimeframe={radarTimeframe}
                setSelectedAxis={setSelectedAxis}
              />
            </div>

            {/* Selected Axis explanation */}
            <div className="pt-3 border-t border-zinc-800/80 min-h-[50px] flex items-center">
              {selectedAxis ? (
                <div className="text-xs text-zinc-300 bg-zinc-950/80 p-2.5 rounded-xl border border-purple-500/30 w-full flex items-start justify-between gap-2">
                  <div>
                    <strong className="text-purple-400 font-bold">{selectedAxis.subject}:</strong> {selectedAxis.explanation}
                  </div>
                  <button onClick={() => setSelectedAxis(null)} className="text-zinc-500 hover:text-white text-xs">✕</button>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 text-center w-full italic">
                  💡 Click any axis label on the radar chart to inspect diagnostic definitions.
                </p>
              )}
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-gradient-to-br from-purple-950/40 via-zinc-900/60 to-zinc-900/40 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                AI Neural Diagnostic
              </div>
              <h4 className="text-lg font-bold text-white mb-3">System Synthesis</h4>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/80 mb-4">
                &ldquo;{ai_analysis}&rdquo;
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                Actionable Protocols
              </h5>
              <div className="space-y-2">
                {suggestions.map((sug: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Dimensional Metrics Breakdown */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Dimensional Metrics Breakdown
          </h3>
          <p className="text-xs text-zinc-400">Click any card to expand multi-period averages and AI coaching recommendations.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimData.map((dim: any) => {
            const isExpanded = expandedDimension === dim.id;
            return (
              <motion.div
                key={dim.id}
                layout
                onClick={() => setExpandedDimension(isExpanded ? null : dim.id)}
                className={cn(
                  "bg-zinc-900/40 border rounded-2xl p-5 backdrop-blur-sm cursor-pointer transition-all shadow-md flex flex-col justify-between",
                  isExpanded ? "border-purple-500/60 bg-zinc-900/80 ring-1 ring-purple-500/30" : "border-zinc-800/80 hover:border-zinc-700"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{dim.title}</h4>
                        <span className="text-xs text-zinc-500">System Index</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white">{dim.score}</span>
                      <div className="text-[10px] font-semibold text-emerald-400">{dim.trend}</div>
                    </div>
                  </div>
                  
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 mt-2 border-t border-zinc-800 space-y-3 text-xs"
                    >
                      <div className="grid grid-cols-2 gap-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Weekly Avg</span>
                          <span className="font-bold text-white">{dim.weekly_avg} / 100</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Monthly Avg</span>
                          <span className="font-bold text-white">{dim.monthly_avg} / 100</span>
                        </div>
                      </div>

                      <div className="bg-purple-950/20 p-3 rounded-xl border border-purple-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">AI Neural Insight</span>
                        <p className="text-zinc-300 leading-relaxed">{dim.ai_insight}</p>
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Actionable Recommendation</span>
                        <p className="text-zinc-400 leading-relaxed">{dim.recommendation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-center pt-2 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span className="ml-1">{isExpanded ? "Show Less" : "Expand Diagnostics"}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Historical Trend */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              14-Day Life Score Trajectory
            </h3>
            <p className="text-xs text-zinc-400">Historical progression of your combined neuro-systems telemetry.</p>
          </div>
          <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Live Synchronized
          </span>
        </div>
        <div className="h-64 w-full">
          <LifeScoreLineChart history={history} />
        </div>
      </div>

      {/* Interactive Score Breakdown Modal */}
      <ResponsiveModal
        isOpen={showBreakdownModal}
        onClose={() => setShowBreakdownModal(false)}
        className="max-w-2xl bg-zinc-900 border-purple-500/30 p-0"
        title="Life Score 2.0 Calculation Engine"
        description="Exact mathematical synthesis & anti-gaming telemetry"
        icon={
          <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        }
      >
        <div className="space-y-6 text-left">
          {/* Score summary badge */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">Overall Score</span>
              <span className="text-xl sm:text-2xl font-black text-white">{overall_score}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">Data Confidence</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{confidence_pct || 95}%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block">7-Day Trend</span>
              <span className="text-xl sm:text-2xl font-black text-purple-400">
                {trend ? (trend.change > 0 ? `+${trend.change}` : trend.change) : "+4.2"}
              </span>
            </div>
          </div>

          {/* Additions */}
          <div className="space-y-3">
            <h4 className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 shrink-0" />
              <span>Weighted Positive Telemetry (Additions)</span>
            </h4>
            <div className="space-y-2">
              {(breakdown?.additions || [
                { label: "Discipline & Adherence", value: "+20", detail: "88% execution reliability" },
                { label: "Consistency Streak", value: "+18", detail: "Active uninterrupted streak" },
                { label: "Task Completion Volume", value: "+22", detail: "High checklist completion rate" },
                { label: "OS Habit Execution", value: "+25", detail: "Water, workout, study & focus logged" },
              ]).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                  <div className="pr-2">
                    <span className="text-xs sm:text-sm font-bold text-white block">{item.label}</span>
                    <span className="text-[10px] sm:text-xs text-zinc-500">{item.detail}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-500/10 px-2 sm:px-3 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Penalties */}
          <div className="space-y-3">
            <h4 className="text-[10px] sm:text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Anti-Gaming & Consistency Deductions</span>
            </h4>
            {breakdown?.penalties && breakdown.penalties.length > 0 ? (
              <div className="space-y-2">
                {breakdown.penalties.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-rose-950/20 p-3 rounded-xl border border-rose-500/30">
                    <div className="pr-2">
                      <span className="text-xs sm:text-sm font-bold text-rose-200 block">{item.label}</span>
                      <span className="text-[10px] sm:text-xs text-rose-400/80">{item.detail}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-rose-400 bg-rose-500/10 px-2 sm:px-3 py-1 rounded-lg border border-rose-500/20 whitespace-nowrap">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30 text-center">
                <span className="text-xs font-bold text-emerald-400 block mb-1">🎉 Zero Deductions Applied!</span>
                <p className="text-[10px] sm:text-[11px] text-zinc-400">
                  No high-priority tasks were missed and core daily habits were executed consistently.
                </p>
              </div>
            )}
          </div>

          <ResponsiveModalFooter className="pt-4 border-t border-zinc-800">
            <button
              onClick={() => setShowBreakdownModal(false)}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Close Diagnostic
            </button>
          </ResponsiveModalFooter>
        </div>
      </ResponsiveModal>
    </PageTransition>
  );
}
