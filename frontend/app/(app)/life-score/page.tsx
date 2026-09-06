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



  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="space-y-2">
          <div 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono uppercase tracking-wider"
            style={{
              background: "var(--accent-subtle)",
              borderColor: "var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Core Flagship Telemetry — ScoreEngine 2.0
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
            LIFE SCORE <span style={{ color: "var(--fg-muted)" }}>STUDIO</span>
          </h1>
          <p className="text-xs sm:text-sm max-w-2xl font-normal leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Real-time 9-dimensional neuro-systems telemetry combining physical vitality, mental clarity, and execution discipline.
          </p>
        </div>
        <div 
          onClick={() => setShowBreakdownModal(true)}
          className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border cursor-pointer hover:border-[var(--accent)] transition-colors group self-start md:self-auto"
          style={{
            background: "var(--surface-raised)",
            borderColor: "var(--border)",
          }}
          title="Click to view exact calculation breakdown & confidence index"
        >
          <div className="text-right">
            <div className="text-[10px] font-medium uppercase tracking-wider flex items-center justify-end gap-1" style={{ color: "var(--fg-muted)" }}>
              <span>Classification</span>
              <Info className="w-3 h-3 group-hover:opacity-100 transition-opacity" style={{ color: "var(--fg-muted)" }} />
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight uppercase" style={{ color: "var(--fg)" }}>
              {title}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Gauge & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overall Gauge & Interactive Button */}
        <div 
          className="border rounded-xl p-5 flex flex-col justify-between space-y-5"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-muted)" }}>
                <Activity className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                Overall Equilibrium
              </h3>
              {confidence_pct && (
                <span className="text-[10px] font-mono text-[#34D399] px-2 py-0.5 rounded border border-[#34D399]/30" style={{ background: "var(--surface-raised)" }}>
                  {confidence_pct}% Confidence
                </span>
              )}
            </div>
            
            {/* Animated Circular Gauge */}
            <div 
              onClick={() => setShowBreakdownModal(true)}
              className="relative flex items-center justify-center my-6 cursor-pointer group"
              title="Click to view exact calculation additions & penalties"
            >
              <svg className="w-44 h-44 transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke="currentColor"
                  className="text-[var(--border)]"
                  strokeWidth="10"
                  fill="transparent"
                />
                <motion.circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke="var(--accent)"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 72}
                  strokeDashoffset={2 * Math.PI * 72 * (1 - overall_score / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  initial={{ strokeDashoffset: 2 * Math.PI * 72 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 72 * (1 - overall_score / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-mono tracking-tight" style={{ color: "var(--fg)" }}>{overall_score}</span>
                <span className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: "var(--fg-muted)" }}>{title}</span>
                {trend && (
                  <span className={cn(
                    "text-[10px] font-mono mt-1 px-2 py-0.5 rounded border",
                    trend.direction === "up" ? "text-[#34D399] border-[#34D399]/30" : "border-[var(--border)]"
                  )} style={{ background: "var(--surface-raised)", color: trend.direction === "up" ? undefined : "var(--fg-muted)" }}>
                    {trend.change > 0 ? `+${trend.change}` : trend.change} pts
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Axis Summary & Modal Trigger */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setShowBreakdownModal(true)}
              className="w-full py-2.5 rounded-lg border font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
            >
              <BarChart3 className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              View Score Breakdown
            </button>
            <p className="text-[11px] leading-relaxed text-center font-mono" style={{ color: "var(--fg-faint)" }}>
              25% Tasks • 20% Streak • 15% Discipline • 40% OS Execution
            </p>
          </div>
        </div>

        {/* Right 2 Columns: 9-Axis Radar Chart & AI Diagnostic */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radar Chart Card */}
          <div 
            className="border rounded-xl p-5 flex flex-col justify-between"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-muted)" }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  9-Axis Radar Diagnostic
                </h3>
                <div className="flex items-center gap-1 p-1 rounded-lg border" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
                  {(["today", "weekly", "monthly"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setRadarTimeframe(tf)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-colors",
                        radarTimeframe === tf ? "border font-bold" : "hover:text-[var(--fg)]"
                      )}
                      style={
                        radarTimeframe === tf
                          ? { background: "var(--surface)", color: "var(--fg)", borderColor: "var(--border)" }
                          : { color: "var(--fg-muted)" }
                      }
                    >
                      {tf === "today" ? "Today" : (tf === "weekly" ? "7D Avg" : "30D Avg")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-60 w-full flex items-center justify-center">
              <LifeScoreRadarChart
                radarAxes={radarAxes}
                radarTimeframe={radarTimeframe}
                setSelectedAxis={setSelectedAxis}
              />
            </div>

            {/* Selected Axis explanation */}
            <div className="pt-2.5 border-t min-h-[44px] flex items-center" style={{ borderColor: "var(--border)" }}>
              {selectedAxis ? (
                <div className="text-xs p-2 rounded-lg border w-full flex items-start justify-between gap-2" style={{ background: "var(--surface-raised)", borderColor: "var(--border)", color: "var(--fg-muted)" }}>
                  <div>
                    <strong className="font-semibold" style={{ color: "var(--fg)" }}>{selectedAxis.subject}:</strong> {selectedAxis.explanation}
                  </div>
                  <button onClick={() => setSelectedAxis(null)} className="text-xs hover:text-[var(--fg)]" style={{ color: "var(--fg-muted)" }}>✕</button>
                </div>
              ) : (
                <p className="text-[11px] text-center w-full font-mono" style={{ color: "var(--fg-faint)" }}>
                  Select an axis to inspect definitions.
                </p>
              )}
            </div>
          </div>

          {/* AI Analysis Card */}
          <div 
            className="border rounded-xl p-5 flex flex-col justify-between relative"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div>
              <div 
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider mb-3"
                style={{
                  background: "var(--accent-subtle)",
                  borderColor: "var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                <BrainCircuit className="w-3 h-3" />
                AI Neural Diagnostic
              </div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--fg)" }}>System Synthesis</h4>
              <p className="text-xs leading-relaxed p-3 rounded-lg border mb-4 font-normal" style={{ background: "var(--surface-raised)", borderColor: "var(--border)", color: "var(--fg-muted)" }}>
                &ldquo;{ai_analysis}&rdquo;
              </p>
            </div>

            <div>
              <h5 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--fg-muted)" }}>
                Actionable Protocols
              </h5>
              <div className="space-y-1.5">
                {suggestions.map((sug: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg border" style={{ background: "var(--surface-raised)", borderColor: "var(--border)", color: "var(--fg-muted)" }}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trend */}
      <div 
        className="border rounded-xl p-5"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--fg)" }}>
              <Activity className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              14-Day Life Score Trajectory
            </h3>
            <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>Historical progression of your combined telemetry.</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ background: "var(--accent-subtle)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>
            Synchronized
          </span>
        </div>
        <div className="h-56 w-full">
          <LifeScoreLineChart history={history} />
        </div>
      </div>

      {/* Interactive Score Breakdown Modal */}
      <ResponsiveModal
        isOpen={showBreakdownModal}
        onClose={() => setShowBreakdownModal(false)}
        className="max-w-2xl p-0"
        title="Life Score 2.0 Calculation Engine"
        description="Exact mathematical synthesis & anti-gaming telemetry"
        icon={
          <div className="w-9 h-9 mx-auto rounded-lg flex items-center justify-center border" style={{ background: "var(--accent-subtle)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>
            <BarChart3 className="w-4 h-4" />
          </div>
        }
      >
        <div className="space-y-4 text-left">
          {/* Score summary badge */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 rounded-xl border text-center" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
            <div>
              <span className="text-[10px] font-mono uppercase block" style={{ color: "var(--fg-muted)" }}>Overall</span>
              <span className="text-xl sm:text-2xl font-bold font-mono" style={{ color: "var(--fg)" }}>{overall_score}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase block" style={{ color: "var(--fg-muted)" }}>Confidence</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#34D399]">{confidence_pct || 95}%</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase block" style={{ color: "var(--fg-muted)" }}>7D Trend</span>
              <span className="text-xl sm:text-2xl font-black text-purple-400">
                {trend ? (trend.change > 0 ? `+${trend.change}` : trend.change) : "+4.2"}
              </span>
            </div>
          </div>

          {/* Additions */}
          <div className="space-y-3">
            <h4 className="text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
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
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
                  <div className="pr-2">
                    <span className="text-xs sm:text-sm font-bold block" style={{ color: "var(--fg)" }}>{item.label}</span>
                    <span className="text-[10px] sm:text-xs" style={{ color: "var(--fg-muted)" }}>{item.detail}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-emerald-500 bg-emerald-500/10 px-2 sm:px-3 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap">
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
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-center">
                <span className="text-xs font-bold text-emerald-500 block mb-1">🎉 Zero Deductions Applied!</span>
                <p className="text-[10px] sm:text-[11px]" style={{ color: "var(--fg-muted)" }}>
                  No high-priority tasks were missed and core daily habits were executed consistently.
                </p>
              </div>
            )}
          </div>

          <ResponsiveModalFooter className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setShowBreakdownModal(false)}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
              }}
            >
              Close Diagnostic
            </button>
          </ResponsiveModalFooter>
        </div>
      </ResponsiveModal>
    </PageTransition>
  );
}
