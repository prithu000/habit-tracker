"use client";

import React from "react";
import { SmartReportsData } from "@/types/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Shield,
  Sparkles,
  Zap,
  Flame,
  Target,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart2,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";

interface MultiPagePDFReportProps {
  data: SmartReportsData;
}

const COLORS = ["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#06b6d4"];

export const MultiPagePDFReport: React.FC<MultiPagePDFReportProps> = ({ data }) => {
  const user = useAuthStore((state) => state.user);
  const userName = user?.display_name || user?.email?.split("@")[0] || "Executive Operator";
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { executive_summary, charts } = data;
  const isInit = data.is_initializing || executive_summary.is_initializing;

  return (
    <div
      id="pdf-export-container"
      className="fixed left-[-9999px] top-0 pointer-events-none select-none z-[-50] flex flex-col gap-10 font-sans"
      style={{ width: "794px" }}
    >
      {/* =========================================================================
          PAGE 1: EXECUTIVE OVERVIEW & CORE METRICS (A4 Portrait: 794px x 1123px)
          ========================================================================= */}
      <div
        id="pdf-page-1"
        className="w-[794px] h-[1123px] bg-[#0a0a0c] text-white p-10 flex flex-col justify-between border border-zinc-800 shrink-0 box-border"
        style={{ width: "794px", height: "1123px" }}
      >
        {/* Header */}
        <div className="space-y-4 border-b border-zinc-800 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-600 text-white font-black text-xl tracking-tighter">
                YvY
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">YOU VS YOU</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
                  Personal Performance Intelligence Report
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              Confidential / Executive Report
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 text-xs">
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-500 block font-semibold uppercase">Executive Operator</span>
              <span className="font-bold text-white text-sm truncate block mt-0.5">{userName}</span>
            </div>
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-500 block font-semibold uppercase">Report Period</span>
              <span className="font-bold text-white text-sm block mt-0.5 capitalize">
                {data.timeframe} ({data.start_date} to {data.end_date})
              </span>
            </div>
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-500 block font-semibold uppercase">Generated Date</span>
              <span className="font-bold text-purple-400 text-sm block mt-0.5">{generatedDate}</span>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="py-2">
          <h2 className="text-xl font-black uppercase tracking-wider text-zinc-300">
            1. Core Performance & System Equilibrium
          </h2>
          <p className="text-xs text-zinc-500">
            Multi-axis operational audit across 9 life dimensions and execution reliability.
          </p>
        </div>

        {/* 6 Core Cards Grid */}
        <div className="grid grid-cols-2 gap-5 flex-1 py-2">
          {/* Card 1: Life Score 2.0 */}
          <div className="bg-gradient-to-br from-purple-950/40 to-zinc-900/90 p-5 rounded-2xl border border-purple-500/30 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Life Score 2.0
              </span>
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div className="my-2">
              <div className="text-5xl font-black tracking-tight text-white">
                {isInit ? "Init" : executive_summary.overall_life_score}
                <span className="text-lg font-normal text-zinc-500"> /100</span>
              </div>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {isInit ? "Initializing" : executive_summary.productivity_rating}
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${isInit ? 0 : executive_summary.overall_life_score}%` }}
              />
            </div>
          </div>

          {/* Card 2: Discipline Score 2.0 */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-zinc-900/90 p-5 rounded-2xl border border-indigo-500/30 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Discipline Score 2.0
              </span>
              <Flame className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="my-2">
              <div className="text-5xl font-black tracking-tight text-white">
                {executive_summary.discipline_grade}
              </div>
              <span className="text-xs text-zinc-400 block mt-1">
                Planned vs. Completed Execution Index
              </span>
            </div>
            <div className="text-xs font-semibold text-indigo-300">
              {isInit ? "No historical logs recorded yet." : "Consistent execution reliability verified."}
            </div>
          </div>

          {/* Card 3: Total XP Generated */}
          <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-500">
                Total XP Generated
              </span>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-4xl font-black text-white my-2">
              +{executive_summary.xp_earned.toLocaleString()} <span className="text-sm font-normal text-zinc-500">XP</span>
            </div>
            <span className="text-xs text-zinc-400">
              Earned across task completions and streak milestones.
            </span>
          </div>

          {/* Card 4: Current Level */}
          <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Current Level
              </span>
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-4xl font-black text-white my-2">
              LVL {user?.current_level || 1}
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
              Mastery Tier Active
            </span>
          </div>

          {/* Card 5: Streak Momentum */}
          <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Streak Momentum
              </span>
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-4 my-2">
              <div>
                <span className="text-3xl font-black text-white">{executive_summary.current_streak}d</span>
                <span className="text-xs text-zinc-500 block">Current Streak</span>
              </div>
              <div>
                <span className="text-3xl font-black text-zinc-400">{executive_summary.longest_streak}d</span>
                <span className="text-xs text-zinc-500 block">Longest Record</span>
              </div>
            </div>
            <span className="text-xs text-zinc-400">Unbroken daily routine execution.</span>
          </div>

          {/* Card 6: Consistency Score */}
          <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Consistency Score
              </span>
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-4xl font-black text-white my-2">
              {executive_summary.completion_percentage}%
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-cyan-400 h-full rounded-full"
                style={{ width: `${executive_summary.completion_percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Executive Synthesis Banner */}
        <div className="bg-zinc-900/80 p-5 rounded-2xl border border-purple-500/30 my-2">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            Executive Telemetry Synthesis
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-medium">
            {executive_summary.ai_summary}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-zinc-500 text-xs border-t border-zinc-800 pt-4">
          <span>Page 1 of 3 • Executive Overview & Core Metrics</span>
          <span>Generated by FORGE Telemetry Engine • YOU VS YOU</span>
        </div>
      </div>

      {/* =========================================================================
          PAGE 2: VISUAL TELEMETRY & CHARTS (A4 Portrait: 794px x 1123px)
          ========================================================================= */}
      <div
        id="pdf-page-2"
        className="w-[794px] h-[1123px] bg-[#0a0a0c] text-white p-10 flex flex-col justify-between border border-zinc-800 shrink-0 box-border"
        style={{ width: "794px", height: "1123px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 font-black text-sm">YvY</div>
            <h2 className="text-lg font-black tracking-tight uppercase">
              Page 2: Visual Telemetry & Multi-Axis Distribution
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-semibold">{userName} • {data.timeframe}</span>
        </div>

        {/* 6 Charts Grid */}
        <div className="grid grid-cols-2 gap-5 flex-1 py-4">
          {/* Chart 1: Life Score Trend */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 block">
              1. Life Score Trend (30 Days)
            </span>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.life_score_timeline.days_30 || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Consistency Trajectory */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2 block">
              2. Consistency Trajectory & Momentum
            </span>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.consistency_trajectory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
                  <Line
                    type="monotone"
                    dataKey="discipline_trend"
                    stroke="#f97316"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="consistency"
                    stroke="#a855f7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Execution Velocity */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">
              3. Execution Velocity (Planned vs Completed)
            </span>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.execution_velocity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.2}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: 9-Axis Radar Chart */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 block">
              4. 9-Axis Life Dimension Radar
            </span>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={charts.radar_balance || []}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={9} />
                  <PolarRadiusAxis stroke="#52525b" fontSize={8} domain={[0, 100]} />
                  <Radar
                    name="Dimensions"
                    dataKey="val"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.4}
                    isAnimationActive={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Activity Heatmap Summary */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2 block">
              5. Weekly Calendar Execution Heatmap
            </span>
            <div className="flex flex-wrap gap-1.5 py-2 max-h-36 overflow-y-auto items-center justify-center">
              {(charts.weekly_calendar_heatmap || []).map((d, i) => {
                const bg =
                  d.rate >= 90
                    ? "bg-emerald-500"
                    : d.rate >= 70
                    ? "bg-emerald-600/80"
                    : d.rate >= 40
                    ? "bg-emerald-700/60"
                    : d.rate > 0
                    ? "bg-emerald-900/40"
                    : "bg-zinc-800";
                return (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-md ${bg} flex items-center justify-center text-[9px] font-bold text-white border border-zinc-700/50`}
                    title={`${d.day}: ${d.rate}%`}
                  >
                    {d.day.slice(0, 2)}
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] text-zinc-500 text-center block">
              Color intensity correlates directly with daily task completion rates.
            </span>
          </div>

          {/* Chart 6: Habit Distribution */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-2 block">
              6. Habit Category Distribution
            </span>
            <div className="h-36 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.habit_distribution || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    label={({ name }) => name}
                    labelLine={false}
                    isAnimationActive={false}
                  >
                    {(charts.habit_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-zinc-500 text-xs border-t border-zinc-800 pt-4">
          <span>Page 2 of 3 • Visual Telemetry & Multi-Axis Distribution</span>
          <span>Generated by FORGE Telemetry Engine • YOU VS YOU</span>
        </div>
      </div>

      {/* =========================================================================
          PAGE 3: AI COACH DIAGNOSTIC & ACTION PLAN (A4 Portrait: 794px x 1123px)
          ========================================================================= */}
      <div
        id="pdf-page-3"
        className="w-[794px] h-[1123px] bg-[#0a0a0c] text-white p-10 flex flex-col justify-between border border-zinc-800 shrink-0 box-border"
        style={{ width: "794px", height: "1123px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 font-black text-sm">YvY</div>
            <h2 className="text-lg font-black tracking-tight uppercase">
              Page 3: Neural Coach Diagnostic & Action Plan
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-semibold">{userName} • {data.timeframe}</span>
        </div>

        {/* Content Section */}
        <div className="space-y-6 flex-1 py-4">
          {/* Executive Summary */}
          <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Executive Diagnostic Assessment
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              {executive_summary.ai_summary}
            </p>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Verified Strengths
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                {(charts.ai_coach_report?.strengths || ["No specific strengths recorded yet."]).map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-500/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Critical Vulnerabilities
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                {(charts.ai_coach_report?.weaknesses || ["No vulnerabilities detected."]).map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Actionable Strategic Recommendations
            </h3>
            <ul className="space-y-3 text-xs text-zinc-300">
              {(charts.ai_coach_report?.suggestions || ["Complete more daily habits to generate recommendations."]).map((sg, i) => (
                <li key={i} className="flex items-start gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{sg}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Month Target Banner */}
          <div className="bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border border-purple-500/40 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-300 block">
              Strategic Target For Next Cycle
            </span>
            <p className="text-lg font-black text-white tracking-tight">
              {charts.ai_coach_report?.next_month_target || "Ascend to Life Score 90+ (Excellent Tier)."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-zinc-500 text-xs border-t border-zinc-800 pt-4">
          <span>Page 3 of 3 • Neural Coach Diagnostic & Action Plan</span>
          <span>Generated by FORGE Telemetry Engine • YOU VS YOU</span>
        </div>
      </div>
    </div>
  );
};
