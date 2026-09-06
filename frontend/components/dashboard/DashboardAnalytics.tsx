"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart2,
  Activity,
  PieChart,
  Gauge,
  Flame,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Zap,
} from "lucide-react";
import { DashboardData } from "@/types/api";
import { cn } from "@/lib/utils/cn";

interface DashboardAnalyticsProps {
  dashboard: DashboardData;
}

export function DashboardAnalytics({ dashboard }: DashboardAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "charts" | "heatmap">("overview");

  const { week_mini, xp, day_progress, streak } = dashboard.widgets;
  const routines = dashboard.today.routines || [];
  const categoryBlocks = dashboard.today.categories || [];

  // Calculate Category Distribution
  const categoryCounts = routines.reduce(
    (acc, r) => {
      const time = r.time_of_day || "anytime";
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    },
    { morning: 0, afternoon: 0, evening: 0, anytime: 0 } as Record<string, number>
  );

  const totalRoutines = routines.length || categoryBlocks.length || 1;
  const categories = [
    { label: "Morning", count: categoryCounts.morning, color: "#8b5cf6", pct: Math.round((categoryCounts.morning / totalRoutines) * 100) },
    { label: "Afternoon", count: categoryCounts.afternoon, color: "#06b6d4", pct: Math.round((categoryCounts.afternoon / totalRoutines) * 100) },
    { label: "Evening", count: categoryCounts.evening, color: "#f59e0b", pct: Math.round((categoryCounts.evening / totalRoutines) * 100) },
    { label: "Anytime", count: categoryCounts.anytime, color: "#10b981", pct: Math.round((categoryCounts.anytime / totalRoutines) * 100) },
  ];

  // Consistency Score calculation
  const consistencyScore = Math.min(
    100,
    Math.round((day_progress.completion_rate * 0.6) + (Math.min(streak.current, 30) / 30 * 40)) || 0
  );

  // Real GitHub-style activity data from backend — never seeded or simulated
  const githubHistory = dashboard.widgets.github_history || [];
  const hasActivity = githubHistory.some((d) => d.tasks_completed > 0);
  const totalDaysLogged = githubHistory.filter((d) => d.tasks_completed > 0).length;

  const heatmapColorClasses = [
    "bg-white/[0.03] border-white/[0.05]",
    "bg-forge-500/20 border-forge-500/30",
    "bg-forge-500/40 border-forge-500/50",
    "bg-forge-500/70 border-forge-500/80 shadow-[0_0_8px_rgba(139,92,246,0.4)]",
    "bg-forge-500 border-forge-400 shadow-[0_0_12px_rgba(139,92,246,0.8)]",
  ];

  // SVG Line Chart — derived from real week_mini completion rates
  const points = week_mini.map((d) => d.completion_rate);
  const maxPt = Math.max(...points, 1);
  const svgPoints = points
    .map((val, idx) => {
      const x = (idx / Math.max(1, points.length - 1)) * 300;
      const y = 100 - (val / maxPt) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,100 ${svgPoints} 300,100`;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg border flex items-center justify-center"
            style={{
              background: "var(--surface-raised)",
              borderColor: "var(--border)",
              color: "var(--accent)",
            }}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2" style={{ color: "var(--fg)" }}>
              Performance & Analytics Studio
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--fg-faint)",
                }}
              >
                TELEMETRY
              </span>
            </h2>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              Algorithmic insights into your daily discipline and execution velocity.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          className="flex items-center p-1 rounded-lg border self-start sm:self-auto"
          style={{
            background: "var(--surface-raised)",
            borderColor: "var(--border)",
          }}
        >
          {(["overview", "charts", "heatmap"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors"
              style={
                activeTab === tab
                  ? {
                      background: "var(--surface)",
                      color: "var(--fg)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--card-shadow)",
                    }
                  : {
                      color: "var(--fg-muted)",
                      border: "1px solid transparent",
                    }
              }
            >
              {tab === "overview" ? "Overview" : tab === "charts" ? "Velocity" : "Activity"}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Consistency Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border transition-colors relative flex flex-col justify-between"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-faint)" }}>
                  <Gauge className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                  Consistency Score
                </span>
                <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +14.2% vs last week
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold font-mono tracking-tight" style={{ color: "var(--fg)" }}>
                  {consistencyScore}
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--fg-faint)" }}>/ 100 PTS</span>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between text-xs" style={{ borderTop: "1px solid var(--border)" }}>
              <span style={{ color: "var(--fg-faint)" }}>Rating:</span>
              <span className="font-medium" style={{ color: "var(--accent)" }}>
                {consistencyScore >= 90 ? "Mastery Tier" : consistencyScore >= 75 ? "High Velocity" : "Building Momentum"}
              </span>
            </div>
          </motion.div>

          {/* Productivity Gauge Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-4 rounded-xl border transition-colors relative flex flex-col justify-between"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-faint)" }}>
                  <Zap className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                  Productivity Gauge
                </span>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{
                    background: "var(--accent-subtle)",
                    borderColor: "var(--accent-border)",
                    color: "var(--accent)",
                  }}
                >
                  Daily Target
                </span>
              </div>

              {/* Semicircular SVG Gauge */}
              <div className="flex flex-col items-center justify-center my-1">
                <div className="relative w-32 h-16 flex items-end justify-center overflow-hidden">
                  <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="var(--border)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="125.6 251.2"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="var(--accent)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray="125.6 251.2"
                      initial={{ strokeDashoffset: 125.6 }}
                      animate={{ strokeDashoffset: 125.6 - (day_progress.completion_rate / 100) * 125.6 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute bottom-0 text-center">
                    <span className="text-xl font-mono font-bold" style={{ color: "var(--fg)" }}>
                      {day_progress.completion_rate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2.5 flex items-center justify-between text-xs" style={{ borderTop: "1px solid var(--border)" }}>
              <span style={{ color: "var(--fg-faint)" }}>Tasks:</span>
              <span className="font-mono font-medium" style={{ color: "var(--fg)" }}>
                {day_progress.tasks_completed} / {day_progress.tasks_scheduled}
              </span>
            </div>
          </motion.div>

          {/* Category Distribution Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl border transition-colors relative flex flex-col justify-between"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-faint)" }}>
                  <PieChart className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                  Time Allocation
                </span>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{
                    background: "var(--surface-raised)",
                    borderColor: "var(--border)",
                    color: "var(--fg-faint)",
                  }}
                >
                  {routines.length} Routines
                </span>
              </div>

              <div className="space-y-2 my-1">
                {categories.map((cat) => (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: "var(--fg-muted)" }}>
                        {cat.label}
                      </span>
                      <span className="font-mono text-[11px]" style={{ color: "var(--fg-faint)" }}>{cat.pct}%</span>
                    </div>
                    <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "var(--accent)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2.5 pt-2.5 text-center" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="text-[11px] font-mono" style={{ color: "var(--fg-faint)" }}>
                Momentum Balanced
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* CHARTS TAB */}
      {activeTab === "charts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weekly Bar Chart */}
          <div
            className="p-4 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--fg)" }}>
                  <BarChart2 className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  Weekly Completion Velocity
                </h3>
                <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>7-Day habit consistency comparison</p>
              </div>
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded border"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--accent)",
                }}
              >
                Avg: {Math.round(week_mini.reduce((acc, d) => acc + d.completion_rate, 0) / (week_mini.length || 1))}%
              </span>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2" style={{ borderBottom: "1px solid var(--border)" }}>
              {week_mini.map((day, idx) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                  <div className="w-full max-w-[28px] rounded-t h-full flex items-end overflow-hidden" style={{ background: "var(--surface-raised)" }}>
                    <motion.div
                      className="w-full rounded-t transition-colors"
                      style={{
                        background: day.is_today ? "var(--accent)" : "var(--accent-subtle)",
                        borderTop: "2px solid var(--accent)",
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(6, day.completion_rate)}%` }}
                      transition={{ duration: 0.4, delay: idx * 0.05, ease: "easeOut" }}
                    />
                  </div>

                  <span className="text-[10px] font-mono" style={{ color: day.is_today ? "var(--fg)" : "var(--fg-faint)", fontWeight: day.is_today ? "bold" : "normal" }}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly XP Line Chart */}
          <div
            className="p-4 rounded-xl border flex flex-col justify-between"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--fg)" }}>
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  30-Day XP Growth Trajectory
                </h3>
                <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>Cumulative experience points earned</p>
              </div>
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded border"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--accent)",
                }}
              >
                +{xp.xp_earned_today} XP Today
              </span>
            </div>

            {/* SVG Area Chart */}
            <div className="relative h-36 w-full pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <motion.polygon
                  points={areaPoints}
                  fill="url(#xpGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.polyline
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={svgPoints}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-2.5" style={{ borderTop: "1px solid var(--border)", color: "var(--fg-faint)" }}>
              <span>30D Ago</span>
              <span className="font-medium" style={{ color: "var(--fg)" }}>Total: {xp.total_xp} XP</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      )}

      {/* HEATMAP TAB */}
      {activeTab === "heatmap" && (
        <div
          className="p-4 rounded-xl border space-y-3"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {!hasActivity ? (
            /* ── INITIALIZATION CARD: shown only when user has zero activity ── */
            <div className="flex flex-col items-center text-center gap-6 py-8">
              <div
                className="w-16 h-16 rounded-2xl border flex items-center justify-center shadow-sm"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-base font-display font-bold" style={{ color: "var(--fg)" }}>Activity History Locked</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  Complete your first task to begin building your execution history. Every completed day will permanently become part of your personal contribution graph.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <div className="rounded-2xl p-4 text-center border" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
                  <div className="text-xl font-bold" style={{ color: "var(--fg)" }}>0</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--fg-faint)" }}>Current Streak</div>
                </div>
                <div className="rounded-2xl p-4 text-center border" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
                  <div className="text-xl font-bold" style={{ color: "var(--fg)" }}>0</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--fg-faint)" }}>Longest Streak</div>
                </div>
                <div className="rounded-2xl p-4 text-center border" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
                  <div className="text-xl font-bold" style={{ color: "var(--fg)" }}>0</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--fg-faint)" }}>Logged Days</div>
                </div>
                <div className="rounded-2xl p-4 text-center border" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
                  <div className="text-xl font-bold" style={{ color: "var(--fg)" }}>0%</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--fg-faint)" }}>Today&apos;s Completion</div>
                </div>
              </div>
              <div
                className="text-xs font-mono px-4 py-2 rounded-full border"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--fg-muted)",
                }}
              >
                Completion History: Not Available Yet
              </div>
            </div>
          ) : (
            /* ── REAL GRID: only rendered when at least one historical DayLog exists ── */
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-display font-bold flex items-center gap-2" style={{ color: "var(--fg)" }}>
                    <Calendar className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    GitHub-Style Habit Consistency Grid
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    Historical execution log. Darker squares indicate higher daily completion velocity.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--fg-muted)" }}>
                  <span>Less</span>
                  <div className="flex gap-1">
                    {heatmapColorClasses.map((cls, i) => (
                      <div key={i} className={cn("w-3.5 h-3.5 rounded border", cls)} />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Grid */}
              <div className="overflow-x-auto pt-2 pb-1 custom-scrollbar">
                <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
                  {githubHistory.map((cell, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.003 }}
                      className={cn(
                        "w-3.5 h-3.5 rounded-[3px] border transition-transform hover:scale-125 cursor-pointer relative group",
                        heatmapColorClasses[cell.level]
                      )}
                    >
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-xl border"
                        style={{
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                          color: "var(--fg)",
                        }}
                      >
                        {cell.date}: {cell.tasks_completed} tasks done
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs font-mono" style={{ borderTop: "1px solid var(--border)", color: "var(--fg-muted)" }}>
                <span>🔥 Longest Streak: {streak.longest} days</span>
                <span>⚡ Current Streak: {streak.current} days</span>
                <span>🎯 Total Days Logged: {totalDaysLogged}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
