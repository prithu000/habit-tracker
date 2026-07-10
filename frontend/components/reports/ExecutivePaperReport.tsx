"use client";

import React from "react";
import { format } from "date-fns";
import { Crown } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useReportData, ReportDataProps } from "./useReportData";

interface ExecutivePaperReportProps extends ReportDataProps {
  id?: string;
}

export const ExecutivePaperReport: React.FC<ExecutivePaperReportProps> = (props) => {
  const {
    reportTitle,
    dateDisplay,
    overallScore,
    statusSubtext,
    rightMetricVal,
    rightMetricLabel,
    habitsList,
    recent14Days,
    weeklyChartData,
    monthlyBarData,
    last30Days,
    activeQuote,
  } = useReportData(props);

  return (
    <div
      id={props.id || "preview-paper-report"}
      className="relative w-full max-w-[900px] mx-auto bg-[#fcfbf9] text-zinc-900 rounded-[24px] sm:rounded-[32px] shadow-2xl border border-zinc-300/80 p-4 sm:p-10 md:p-14 overflow-hidden font-sans"
      style={{
        backgroundImage:
          "radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* ── SUBTLE 5% WATERMARK ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] z-0 overflow-hidden">
        <div className="text-[70px] sm:text-[100px] md:text-[120px] font-black tracking-tighter text-zinc-900 rotate-[-25deg] whitespace-nowrap">
          YOU VS YOU
        </div>
      </div>

      {/* ── 4 CORNER RIVETS / PINS ── */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center z-10">
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-500/50" />
      </div>
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center z-10">
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-500/50" />
      </div>
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center z-10">
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-500/50" />
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center z-10">
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-500/50" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="space-y-6 sm:space-y-8">
          {/* ── HEADER ── */}
          <div className="text-center space-y-1 sm:space-y-1.5 border-b border-zinc-300 pb-5 sm:pb-7">
            <div className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
              {reportTitle}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
              {dateDisplay}
            </h1>
          </div>

          {/* ── TOP METRICS (2 Columns) ── */}
          <div className="grid grid-cols-2 gap-4 py-5 sm:py-7 border-b border-zinc-300 text-center min-h-[130px] sm:min-h-[150px] items-center">
            <div className="border-r border-zinc-300 px-3 sm:px-4 flex flex-col items-center justify-center">
              <div className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">
                Overall Score
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-black text-emerald-700 mt-1.5 sm:mt-2 tracking-tight">
                {overallScore}%
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-700 mt-2 sm:mt-3">
                {statusSubtext}
              </div>
            </div>

            <div className="px-3 sm:px-4 flex flex-col items-center justify-center">
              <div className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">
                Completed
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 mt-1.5 sm:mt-2 tracking-tight">
                {rightMetricVal}
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-700 mt-2 sm:mt-3">
                {rightMetricLabel}
              </div>
            </div>
          </div>

          {/* ── TIMEFRAME SPECIFIC SECTIONS ── */}

          {/* 1. DAILY REPORT SECTION */}
          {props.timeframe === "daily" && (
            <div className="py-4 space-y-8 sm:space-y-10">
              {/* Habit Breakdown (Fixed Columns, Equal Radius, Aligned) */}
              <div className="space-y-4">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-2">
                  Habit Breakdown
                </div>
                <div className="space-y-4 pt-1">
                  {habitsList.map((habit, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="w-36 sm:w-56 shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-zinc-800 leading-snug break-words block text-left">
                          {habit.name}
                        </span>
                      </div>
                      <div className="flex-1 h-3 bg-zinc-200/80 rounded-full overflow-hidden mx-1 sm:mx-4">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${habit.val}%`, backgroundColor: habit.color }}
                        />
                      </div>
                      <div className="w-12 sm:w-14 text-right shrink-0">
                        <span className="text-xs sm:text-sm font-mono font-black text-zinc-900">
                          {habit.val}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Heatmap (GitHub Contribution Style with Today Highlight) */}
              <div className="space-y-3 pt-2">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-2">
                  Today&apos;s Heatmap
                </div>
                <div className="p-4 sm:p-6 rounded-2xl bg-zinc-100/70 border border-zinc-200/80 flex flex-col justify-center space-y-4 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-zinc-700">
                    <span className="uppercase tracking-wider">Activity Frequency</span>
                    <span className="font-mono text-[10px] sm:text-[11px] text-purple-600 font-bold bg-purple-50 px-2 sm:px-2.5 py-1 rounded-md border border-purple-200">
                      100% Real Activity
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-1">
                    {recent14Days.map((cell: any, idx: number) => {
                      const isToday = idx === recent14Days.length - 1;
                      const lvl = cell.level || 0;
                      const bg =
                        lvl === 0
                          ? "bg-zinc-200"
                          : lvl === 1
                          ? "bg-emerald-300"
                          : lvl === 2
                          ? "bg-emerald-400"
                          : lvl === 3
                          ? "bg-emerald-600"
                          : "bg-emerald-700";

                      let dayStr = "";
                      try {
                        dayStr = cell.date ? format(new Date(cell.date), "dd") : `${idx + 1}`;
                      } catch {
                        dayStr = `${idx + 1}`;
                      }
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                          <div
                            className={`w-full aspect-square max-h-11 max-w-11 rounded-lg flex items-center justify-center relative ${bg} ${
                              isToday
                                ? "border-2 border-purple-600 ring-2 ring-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.35)]"
                                : ""
                            }`}
                          >
                            {isToday && (
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-950 absolute top-1 right-1" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-mono ${
                              isToday ? "font-black text-purple-700" : "font-semibold text-zinc-500"
                            }`}
                          >
                            {dayStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. WEEKLY REPORT SECTION */}
          {props.timeframe === "weekly" && (
            <div className="py-4 space-y-8 sm:space-y-10">
              {/* Weekly Progress Chart (Gradient Area Curve with Markers & Shadow) */}
              <div className="space-y-3">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-2">
                  Weekly Progress
                </div>
                <div className="h-44 sm:h-52 w-full pt-3 -ml-2 sm:ml-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyChartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="weeklyScreenGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="day"
                        axisLine={{ stroke: "#e4e4e7" }}
                        tickLine={false}
                        tick={{ fill: "#3f3f46", fontSize: 11, fontWeight: 700 }}
                        tickMargin={10}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        axisLine={{ stroke: "#e4e4e7" }}
                        tickLine={false}
                        tick={{ fill: "#3f3f46", fontSize: 11, fontWeight: 700 }}
                        tickMargin={8}
                        width={32}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#7c3aed"
                        strokeWidth={3}
                        dot={{ fill: "#7c3aed", r: 4.5, strokeWidth: 2, stroke: "#ffffff" }}
                        activeDot={{ r: 6, fill: "#7c3aed" }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Heatmap (GitHub Style Contribution Grid: 7 Columns 1 Row) */}
              <div className="space-y-3">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-2">
                  Weekly Heatmap (Last 7 Days)
                </div>
                <div className="grid grid-cols-7 gap-2 sm:gap-3 p-4 sm:p-5 rounded-2xl bg-zinc-100/70 border border-zinc-200/80 shadow-sm">
                  {recent14Days.slice(-7).map((cell: any, idx: number) => {
                    const isToday = idx === 6;
                    const lvl = cell.level || 0;
                    const bg =
                      lvl === 0
                        ? "bg-zinc-200"
                        : lvl === 1
                        ? "bg-emerald-300"
                        : lvl === 2
                        ? "bg-emerald-400"
                        : lvl === 3
                        ? "bg-emerald-600"
                        : "bg-emerald-700";

                    let dayStr = "";
                    try {
                      dayStr = cell.date ? format(new Date(cell.date), "EEE") : `D${idx + 1}`;
                    } catch {
                      dayStr = `D${idx + 1}`;
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-full aspect-square max-h-11 max-w-11 rounded-lg flex items-center justify-center relative ${bg} ${
                            isToday
                              ? "border-2 border-purple-600 ring-2 ring-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.35)]"
                              : ""
                          }`}
                        >
                          {isToday && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-950 absolute top-1 right-1" />
                          )}
                        </div>
                        <span className={`text-[10px] font-mono ${isToday ? "font-black text-purple-700" : "font-semibold text-zinc-500"}`}>
                          {dayStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Habit Breakdown Pie Chart (Enlarged, Centered, Equal Legend Spacing) */}
              <div className="space-y-4 pt-2">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-2">
                  Habit Breakdown
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-8 py-2">
                  <div className="h-52 sm:h-56 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                      <PieChart>
                        <Pie
                          data={habitsList.reduce((acc, h) => acc + h.val, 0) > 0 ? habitsList : [{ name: "No Activity Yet", val: 100, color: "#e4e4e7" }]}
                          dataKey="val"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          isAnimationActive={true}
                        >
                          {(habitsList.reduce((acc, h) => acc + h.val, 0) > 0 ? habitsList : [{ name: "No Activity Yet", val: 100, color: "#e4e4e7" }]).map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3.5 sm:pl-4 border-t sm:border-t-0 sm:border-l border-zinc-200 pt-4 sm:pt-0">
                    {habitsList.map((habit, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: habit.color }} />
                          <span className="text-xs sm:text-sm font-bold text-zinc-800">{habit.name}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-mono font-black text-zinc-900">{habit.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. MONTHLY REPORT SECTION */}
          {props.timeframe === "monthly" && (
            <div className="py-4 space-y-8 sm:space-y-10">
              {/* Monthly Heatmap (GitHub Contribution Grid with Current Day Highlight) */}
              <div className="space-y-3">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-2">
                  Monthly Heatmap
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 sm:gap-2 p-4 sm:p-5 rounded-2xl bg-zinc-100/70 border border-zinc-200/80 shadow-sm">
                  {last30Days.map((cell: any, idx: number) => {
                    const isToday = idx === last30Days.length - 1;
                    const lvl = cell.level || 0;
                    const bg =
                      lvl === 0
                        ? "bg-zinc-200 text-zinc-500 font-medium"
                        : lvl === 1
                        ? "bg-emerald-300 text-emerald-950 font-bold"
                        : lvl === 2
                        ? "bg-emerald-400 text-emerald-950 font-black"
                        : lvl === 3
                        ? "bg-emerald-600 text-white font-black"
                        : "bg-emerald-700 text-white font-black";

                    let dayNum = "";
                    try {
                      dayNum = cell.date ? format(new Date(cell.date), "d") : `${idx + 1}`;
                    } catch {
                      dayNum = `${idx + 1}`;
                    }

                    return (
                      <div
                        key={idx}
                        className={`h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-none relative ${bg} ${
                          isToday
                            ? "border-2 border-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.35)] font-black ring-2 ring-purple-500/20"
                            : ""
                        }`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Overview (Stunning Weekly Bar Comparison) */}
              <div className="space-y-3 pt-1">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-2">
                  Progress Overview
                </div>
                <div className="h-44 sm:h-52 w-full pt-3 -ml-2 sm:ml-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyBarData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="week"
                        axisLine={{ stroke: "#e4e4e7" }}
                        tickLine={false}
                        tick={{ fill: "#3f3f46", fontSize: 11, fontWeight: 700 }}
                        tickMargin={10}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        axisLine={{ stroke: "#e4e4e7" }}
                        tickLine={false}
                        tick={{ fill: "#3f3f46", fontSize: 11, fontWeight: 700 }}
                        tickMargin={8}
                        width={32}
                      />
                      <Bar
                        dataKey="value"
                        fill="#7c3aed"
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={true}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Habit Breakdown Pie Chart (Centered, Clean Alignment) */}
              <div className="space-y-4 pt-1">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-2">
                  Habit Breakdown
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-8 py-1">
                  <div className="h-52 sm:h-56 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                      <PieChart>
                        <Pie
                          data={habitsList.reduce((acc, h) => acc + h.val, 0) > 0 ? habitsList : [{ name: "No Activity Yet", val: 100, color: "#e4e4e7" }]}
                          dataKey="val"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          isAnimationActive={true}
                        >
                          {(habitsList.reduce((acc, h) => acc + h.val, 0) > 0 ? habitsList : [{ name: "No Activity Yet", val: 100, color: "#e4e4e7" }]).map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3.5 sm:pl-4 border-t sm:border-t-0 sm:border-l border-zinc-200 pt-4 sm:pt-0">
                    {habitsList.map((habit, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: habit.color }} />
                          <span className="text-xs sm:text-sm font-bold text-zinc-800">{habit.name}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-mono font-black text-zinc-900">{habit.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER / METADATA / QUOTE BLOCK ── */}
        <div className="pt-6 mt-6 border-t border-zinc-300/90 space-y-5">
          {/* Metadata & Verification Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-zinc-600 pb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-widest">Report ID</span>
              <span className="font-black text-zinc-800 tracking-wider">{(props as any).reportId || "YVY-A48E91C2"}</span>
            </div>
            <div className="text-left sm:text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-widest">Generated On</span>
              <span className="font-bold text-zinc-800">{(props as any).generatedTimestamp || format(new Date(), "MMMM d, yyyy • h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-100/80 p-2 rounded-xl border border-zinc-300 shadow-xs">
              <div className="w-8 h-8 rounded bg-zinc-900 text-white flex flex-col items-center justify-center font-mono text-[6px] font-black leading-tight tracking-tighter">
                <div>YVY</div>
                <div>QR</div>
              </div>
              <div className="text-left">
                <div className="text-[9px] font-mono font-bold text-zinc-900 tracking-wider">VERIFIED A4</div>
                <div className="text-[8px] font-sans text-zinc-500">youvsyou.site</div>
              </div>
            </div>
          </div>

          {/* Centered Quote */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Crown className="w-5 h-5 text-zinc-700 fill-zinc-700/20" />
            </div>
            <blockquote className="text-xs sm:text-sm font-serif italic text-zinc-800 max-w-lg mx-auto leading-relaxed px-4">
              &ldquo;{activeQuote}&rdquo;
            </blockquote>
          </div>

          {/* Bottom Branding */}
          <div className="text-center text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] sm:tracking-[0.25em] text-zinc-400 uppercase pt-2 border-t border-zinc-200">
            Generated by YOU VS YOU • Personal Operating System • www.youvsyou.site
          </div>
        </div>
      </div>
    </div>
  );
};
