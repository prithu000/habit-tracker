"use client";

import React from "react";
import { format } from "date-fns";
import { Crown } from "lucide-react";
import {
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

interface PrintableA4ReportProps extends ReportDataProps {
  id?: string;
}

export const PrintableA4Report: React.FC<PrintableA4ReportProps> = (props) => {
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

  // Guarantee PieChart never renders an empty/invisible 0-degree angle when all values are 0
  const totalHabitVal = habitsList.reduce((acc, curr) => acc + curr.val, 0);
  const safeHabitsList = totalHabitVal > 0 ? habitsList : [
    { name: "No Activity Yet", val: 100, color: "#e4e4e7" }
  ];

  return (
    <div
      id={props.id || "printable-a4-paper"}
      className="relative bg-[#fcfbf9] text-zinc-900 shadow-2xl font-sans overflow-hidden mx-auto"
      style={{
        width: "794px",
        height: "1123px",
        padding: "44px 56px",
        backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0)",
        backgroundSize: "24px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* ── SUBTLE 4% WATERMARK ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] z-0 overflow-hidden">
        <div className="text-[110px] font-black tracking-tighter text-zinc-900 rotate-[-25deg] whitespace-nowrap">
          YOU VS YOU
        </div>
      </div>

      {/* ── 4 CORNER RIVETS / PINS (Pinned Paper Aesthetic) ── */}
      <div className="absolute top-6 left-6 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/50" />
      </div>
      <div className="absolute top-6 right-6 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/50" />
      </div>
      <div className="absolute bottom-6 left-6 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/50" />
      </div>
      <div className="absolute bottom-6 right-6 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/50" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="space-y-5">
          {/* ── HEADER ── */}
          <div className="text-center space-y-1 border-b border-zinc-300 pb-4">
            <div className="text-xs font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
              {reportTitle}
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
              {dateDisplay}
            </h1>
          </div>

          {/* ── TOP METRICS (2 Columns) ── */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-zinc-300 text-center min-h-[110px] items-center">
            <div className="border-r border-zinc-300 px-4 flex flex-col items-center justify-center">
              <div className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">
                Overall Score
              </div>
              <div className="text-5xl font-black text-emerald-700 mt-1 tracking-tight">
                {overallScore}%
              </div>
              <div className="text-xs font-bold text-zinc-700 mt-1.5">
                {statusSubtext}
              </div>
            </div>

            <div className="px-4 flex flex-col items-center justify-center">
              <div className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">
                Completed
              </div>
              <div className="text-5xl font-black text-zinc-900 mt-1 tracking-tight">
                {rightMetricVal}
              </div>
              <div className="text-xs font-bold text-zinc-700 mt-1.5">
                {rightMetricLabel}
              </div>
            </div>
          </div>

          {/* ── TIMEFRAME SPECIFIC SECTIONS ── */}

          {/* 1. DAILY REPORT SECTION (~15% Reduced Height, No Truncation, No Overlap) */}
          {props.timeframe === "daily" && (
            <div className="py-2 space-y-6">
              {/* Habit Breakdown (Fixed Wide Left Col, Never Truncate, Aligned Bars) */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-1.5">
                  Habit Breakdown
                </div>
                <div className="space-y-3 pt-1">
                  {habitsList.map((habit, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="w-56 shrink-0">
                        <span className="text-sm font-bold text-zinc-800 leading-snug break-words block text-left">
                          {habit.name}
                        </span>
                      </div>
                      <div className="flex-1 h-3 bg-zinc-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-none"
                          style={{ width: `${habit.val}%`, backgroundColor: habit.color }}
                        />
                      </div>
                      <div className="w-14 text-right shrink-0">
                        <span className="text-sm font-mono font-black text-zinc-900">
                          {habit.val}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Heatmap (GitHub Contribution Style with Today Highlight) */}
              <div className="space-y-2.5 pt-1">
                <div className="text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-1.5">
                  Last 14 Days Activity
                </div>
                <div className="p-5 rounded-2xl bg-zinc-100/70 border border-zinc-200/80 flex flex-col justify-center space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                    <span className="uppercase tracking-wider">Activity Frequency</span>
                    <span className="font-mono text-[11px] text-purple-600 font-bold bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                      100% Real Activity
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-3 pt-1">
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
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div
                            className={`w-full aspect-square max-h-10 max-w-10 rounded-lg flex items-center justify-center relative ${bg} ${
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

          {/* 2. WEEKLY REPORT SECTION (Fixed Dimensions, 7-col Heatmap, Safe Pie) */}
          {props.timeframe === "weekly" && (
            <div className="py-2 space-y-6">
              {/* Weekly Progress Chart (Explicit Width=660 Height=150 for 100% html2canvas Capture) */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-1.5">
                  Weekly Progress
                </div>
                <div className="w-full flex justify-center pt-2">
                  <LineChart width={660} height={150} data={weeklyChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={{ stroke: "#e4e4e7" }}
                      tickLine={false}
                      tick={{ fill: "#3f3f46", fontSize: 11, fontWeight: 700 }}
                      tickMargin={8}
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
                      dot={{ fill: "#7c3aed", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                      activeDot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </div>
              </div>

              {/* Weekly Heatmap (GitHub Style Contribution Grid: 7 Columns 1 Row) */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-1.5">
                  Weekly Heatmap (Last 7 Days)
                </div>
                <div className="grid grid-cols-7 gap-3 p-4 rounded-2xl bg-zinc-100/70 border border-zinc-200/80 shadow-sm">
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
                          className={`w-full aspect-square max-h-9 max-w-9 rounded-lg flex items-center justify-center relative ${bg} ${
                            isToday
                              ? "border-2 border-purple-600 ring-2 ring-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.35)]"
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

              {/* Habit Breakdown Pie Chart (Explicit Dimensions Width=320 Height=170) */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-1.5">
                  Habit Breakdown
                </div>
                <div className="grid grid-cols-2 items-center gap-6 py-1">
                  <div className="flex items-center justify-center">
                    <PieChart width={320} height={170}>
                      <Pie
                        data={safeHabitsList}
                        dataKey="val"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={38}
                        isAnimationActive={false}
                      >
                        {safeHabitsList.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>

                  <div className="space-y-3 pl-4 border-l border-zinc-200">
                    {habitsList.map((habit, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: habit.color }} />
                          <span className="text-sm font-bold text-zinc-800">{habit.name}</span>
                        </div>
                        <span className="text-sm font-mono font-black text-zinc-900">{habit.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. MONTHLY REPORT SECTION (~20% Reduced Height, Explicit Dimensions, Safe Pie) */}
          {props.timeframe === "monthly" && (
            <div className="py-2 space-y-6">
              {/* Monthly Heatmap (30 Days Contribution Grid) */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-1.5">
                  Monthly Heatmap (Last 30 Days)
                </div>
                <div className="grid grid-cols-10 gap-2 p-4 rounded-2xl bg-zinc-100/70 border border-zinc-200/80 shadow-sm">
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
                        className={`h-7 rounded-lg flex items-center justify-center text-xs font-mono transition-none relative ${bg} ${
                          isToday
                            ? "border-2 border-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.35)] font-black ring-2 ring-purple-500/20"
                            : ""
                        }`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Overview (Weekly Bar Comparison, Explicit Width=660 Height=140) */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-1.5">
                  Progress Overview (Weekly Comparison)
                </div>
                <div className="w-full flex justify-center pt-2">
                  <BarChart width={660} height={140} data={monthlyBarData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="week"
                      axisLine={{ stroke: "#e4e4e7" }}
                      tickLine={false}
                      tick={{ fill: "#3f3f46", fontSize: 11, fontWeight: 700 }}
                      tickMargin={8}
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
                      isAnimationActive={false}
                    />
                  </BarChart>
                </div>
              </div>

              {/* Habit Breakdown Pie Chart (Explicit Width=320 Height=160) */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-mono font-black tracking-[0.2em] uppercase text-zinc-600 border-b border-zinc-300 pb-1.5">
                  Habit Breakdown
                </div>
                <div className="grid grid-cols-2 items-center gap-6 py-1">
                  <div className="flex items-center justify-center">
                    <PieChart width={320} height={160}>
                      <Pie
                        data={safeHabitsList}
                        dataKey="val"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={36}
                        isAnimationActive={false}
                      >
                        {safeHabitsList.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>

                  <div className="space-y-3 pl-4 border-l border-zinc-200">
                    {habitsList.map((habit, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: habit.color }} />
                          <span className="text-sm font-bold text-zinc-800">{habit.name}</span>
                        </div>
                        <span className="text-sm font-mono font-black text-zinc-900">{habit.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER / METADATA / QUOTE BLOCK (Strict A4 Layout Flow) ── */}
        <div className="pt-4 mt-4 border-t border-zinc-300/90 space-y-4">
          {/* Metadata & Verification Row */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-600 pb-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-widest">Report ID</span>
              <span className="font-black text-zinc-800 tracking-wider">{(props as any).reportId || "YVY-A48E91C2"}</span>
            </div>
            <div className="text-center">
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
          <div className="text-center space-y-1.5">
            <div className="flex justify-center">
              <Crown className="w-4 h-4 text-zinc-700 fill-zinc-700/20" />
            </div>
            <blockquote className="text-sm font-serif italic text-zinc-800 max-w-lg mx-auto leading-relaxed px-4">
              &ldquo;{activeQuote}&rdquo;
            </blockquote>
          </div>

          {/* Bottom Branding */}
          <div className="text-center text-[10px] font-mono font-bold tracking-[0.25em] text-zinc-400 uppercase pt-1.5 border-t border-zinc-200">
            Generated by YOU VS YOU • Personal Operating System • www.youvsyou.site
          </div>
        </div>
      </div>
    </div>
  );
};

