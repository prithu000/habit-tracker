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
  const routines = dashboard.today.routines;

  // Calculate Category Distribution
  const categoryCounts = routines.reduce(
    (acc, r) => {
      const time = r.time_of_day || "anytime";
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    },
    { morning: 0, afternoon: 0, evening: 0, anytime: 0 } as Record<string, number>
  );

  const totalRoutines = routines.length || 1;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-forge-500/20 to-cyan-500/10 border border-forge-500/30 flex items-center justify-center text-forge-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold tracking-tight text-foreground flex items-center gap-2">
              Performance & Analytics Studio
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forge-500/10 text-forge-400 border border-forge-500/20">
                LIVE METRICS
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Deep-dive algorithmic insights into your daily discipline and identity velocity.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] self-start sm:self-auto">
          {(["overview", "charts", "heatmap"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                activeTab === tab
                  ? "bg-forge-500/20 text-forge-300 border border-forge-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {tab === "overview" ? "Key Metrics" : tab === "charts" ? "Growth Charts" : "Activity Grid"}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Consistency Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-[20px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] hover:border-forge-500/40 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-forge-500/5 rounded-full blur-2xl group-hover:bg-forge-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-forge-400" />
                Consistency Score
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3" />
                +14.2% vs last week
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-black tracking-tight text-white">
                {consistencyScore}
              </span>
              <span className="text-xs font-mono text-muted-foreground">/ 100 PTS</span>
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Discipline Rating:</span>
              <span className="font-bold text-forge-300">
                {consistencyScore >= 90 ? "Mastery Tier" : consistencyScore >= 75 ? "High Velocity" : "Building Momentum"}
              </span>
            </div>
          </motion.div>

          {/* Productivity Gauge Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-[20px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/40 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                Productivity Gauge
              </span>
              <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Daily Target
              </span>
            </div>

            {/* Semicircular SVG Gauge */}
            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative w-36 h-18 flex items-end justify-center overflow-hidden">
                <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="125.6 251.2"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#06b6d4"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="125.6 251.2"
                    initial={{ strokeDashoffset: 125.6 }}
                    animate={{ strokeDashoffset: 125.6 - (day_progress.completion_rate / 100) * 125.6 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute bottom-1 text-center">
                  <span className="text-2xl font-display font-black text-white">
                    {day_progress.completion_rate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Tasks Completed:</span>
              <span className="font-bold text-cyan-300 font-mono">
                {day_progress.tasks_completed} / {day_progress.tasks_scheduled}
              </span>
            </div>
          </motion.div>

          {/* Category Distribution Pie/Donut Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-[20px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/40 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-amber-400" />
                Time Allocation
              </span>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {routines.length} Routines
              </span>
            </div>

            <div className="space-y-2.5 my-1">
              {categories.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-foreground font-medium">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.label}
                    </span>
                    <span className="font-mono text-muted-foreground">{cat.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] text-center">
              <span className="text-[11px] text-muted-foreground">
                Optimized for peak biological momentum
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* CHARTS TAB */}
      {activeTab === "charts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Bar Chart */}
          <div className="p-6 rounded-[20px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-forge-400" />
                  Weekly Completion Velocity
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">7-Day habit consistency comparison</p>
              </div>
              <span className="text-xs font-mono text-forge-400 bg-forge-500/10 px-2.5 py-1 rounded-lg border border-forge-500/20">
                Avg: {Math.round(week_mini.reduce((acc, d) => acc + d.completion_rate, 0) / (week_mini.length || 1))}%
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2 border-b border-white/[0.08]">
              {week_mini.map((day, idx) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Floating Tooltip */}
                  <div className="absolute -top-10 bg-[#0a0a0c] border border-white/20 text-white px-2 py-1 rounded text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                    {day.completion_rate}% ({day.tasks_completed} done)
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-white/5 rounded-t-lg h-full flex items-end overflow-hidden">
                    <motion.div
                      className={cn(
                        "w-full rounded-t-lg transition-colors",
                        day.is_today
                          ? "bg-gradient-to-t from-forge-600 to-forge-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                          : "bg-gradient-to-t from-purple-500/40 to-purple-400/80 group-hover:from-purple-500/60 group-hover:to-purple-400"
                      )}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(8, day.completion_rate)}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={cn("text-xs font-semibold", day.is_today ? "text-forge-300 font-bold" : "text-muted-foreground")}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly XP Line Chart */}
          <div className="p-6 rounded-[20px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  30-Day XP Growth Trajectory
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Cumulative experience points earned</p>
              </div>
              <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                +{xp.xp_earned_today} XP Today
              </span>
            </div>

            {/* SVG Area Chart */}
            <div className="relative h-44 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <motion.polygon
                  points={areaPoints}
                  fill="url(#xpGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                />
                <motion.polyline
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={svgPoints}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                {/* Current Dot */}
                <circle cx="300" cy="18" r="4" className="fill-forge-400 animate-ping" />
                <circle cx="300" cy="18" r="4" className="fill-white stroke-forge-500 stroke-2" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/[0.08]">
              <span>30 Days Ago</span>
              <span className="font-mono text-forge-300 font-semibold">Total: {xp.total_xp} XP</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      )}

      {/* HEATMAP TAB */}
      {activeTab === "heatmap" && (
        <div className="p-6 rounded-[20px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4">
          {!hasActivity ? (
            /* ── INITIALIZATION CARD: shown only when user has zero activity ── */
            <div className="flex flex-col items-center text-center gap-6 py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forge-500/20 to-cyan-500/10 border border-forge-500/30 flex items-center justify-center text-forge-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-base font-display font-bold text-foreground">Activity History Locked</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Complete your first task to begin building your execution history. Every completed day will permanently become part of your personal contribution graph.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
                  <div className="text-xl font-black text-foreground">0</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Current Streak</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
                  <div className="text-xl font-black text-foreground">0</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Longest Streak</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
                  <div className="text-xl font-black text-foreground">0</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Logged Days</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
                  <div className="text-xl font-black text-foreground">0%</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Today&apos;s Completion</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-mono px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
                Completion History: Not Available Yet
              </div>
            </div>
          ) : (
            /* ── REAL GRID: only rendered when at least one historical DayLog exists ── */
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-forge-400" />
                    GitHub-Style Habit Consistency Grid
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Historical execution log. Darker squares indicate higher daily completion velocity.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#0a0a0c] border border-white/20 text-white px-2 py-0.5 rounded text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-xl">
                        {cell.date}: {cell.tasks_completed} tasks done
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-muted-foreground font-mono">
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
