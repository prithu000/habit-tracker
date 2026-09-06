"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Crown, Copy, Check, Sparkles, Activity, ShieldCheck } from "lucide-react";
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
  Tooltip,
} from "recharts";
import { useReportData, ReportDataProps } from "./useReportData";
import { useCustomizationStore } from "@/lib/stores/customizationStore";
import { toast } from "react-hot-toast";

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
    dynamicHabits,
    recent14Days,
    weeklyChartData,
    monthlyBarData,
    last30Days,
    activeQuote,
  } = useReportData(props);

  const { theme } = useCustomizationStore();
  const isDarkOrGreen = theme === "dark" || theme === "green";

  // Chart styling colors based on active theme
  const gridColor = isDarkOrGreen ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
  const tickColor = isDarkOrGreen ? "#8A8D92" : "#6B6760";
  const tooltipBg = isDarkOrGreen ? "#181A1C" : "#FFFFFF";
  const tooltipBorder = isDarkOrGreen ? "#282C30" : "#E4E1DA";
  const tooltipTextColor = isDarkOrGreen ? "#F0EFEC" : "#1A1916";

  // Interactivity states
  const [isCopied, setIsCopied] = useState(false);
  const [habitFilter, setHabitFilter] = useState<"all" | "active" | "focus">("all");
  const [inspectedDay, setInspectedDay] = useState<{
    dateStr: string;
    label: string;
    level: number;
    completion?: number;
  } | null>(null);

  // Filter habits interactively
  const filteredHabits = useMemo(() => {
    if (habitFilter === "active") {
      return habitsList.filter((h) => h.val > 0);
    }
    if (habitFilter === "focus") {
      return habitsList.filter((h) => h.val < 100);
    }
    return habitsList;
  }, [habitsList, habitFilter]);

  // Safe data for PieChart
  const hasDynamicPositive = dynamicHabits && dynamicHabits.some((h: any) => h.val > 0);
  const safePieData = hasDynamicPositive
    ? dynamicHabits.filter((h: any) => h.val > 0)
    : habitsList.some((h: any) => h.val > 0)
    ? habitsList.filter((h: any) => h.val > 0)
    : [{ name: "No Activity Yet", val: 100, color: isDarkOrGreen ? "#333" : "#e4e4e7" }];

  const handleCopySummary = async () => {
    const summaryText = `YOU VS YOU ${reportTitle}\n${dateDisplay}\nOverall Consistency: ${overallScore}%\nCompleted: ${rightMetricVal} ${rightMetricLabel}\nVerified by youvsyou.site`;
    try {
      await navigator.clipboard.writeText(summaryText);
      setIsCopied(true);
      toast.success("Executive summary copied!");
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      toast.error("Failed to copy summary.");
    }
  };

  return (
    <div
      id={props.id || "preview-paper-report"}
      className="relative w-full max-w-[680px] mx-auto rounded-[24px] sm:rounded-[28px] shadow-2xl transition-all duration-300 p-4 sm:p-6 md:p-8 overflow-hidden font-sans border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--fg)",
        backgroundImage: "radial-gradient(var(--border) 1.1px, transparent 0)",
        backgroundSize: "18px 18px",
      }}
    >
      {/* ── 5% SUBTLE WATERMARK ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.035] z-0 overflow-hidden">
        <div
          className="text-[60px] sm:text-[90px] font-black tracking-tighter rotate-[-22deg] whitespace-nowrap"
          style={{ color: "var(--fg)" }}
        >
          YOU VS YOU
        </div>
      </div>

      {/* ── 4 CORNER RIVETS / PINS ── */}
      <div
        className="absolute top-3 left-3 sm:top-4 sm:left-4 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border flex items-center justify-center z-10 shadow-xs"
        style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
      >
        <div className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full" style={{ background: "var(--fg-faint)" }} />
      </div>
      <div
        className="absolute top-3 right-3 sm:top-4 sm:right-4 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border flex items-center justify-center z-10 shadow-xs"
        style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
      >
        <div className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full" style={{ background: "var(--fg-faint)" }} />
      </div>
      <div
        className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border flex items-center justify-center z-10 shadow-xs"
        style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
      >
        <div className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full" style={{ background: "var(--fg-faint)" }} />
      </div>
      <div
        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border flex items-center justify-center z-10 shadow-xs"
        style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
      >
        <div className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full" style={{ background: "var(--fg-faint)" }} />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="space-y-4 sm:space-y-6">
          {/* ── HEADER & INTERACTIVE COPY ── */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="text-left">
              <div
                className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase"
                style={{ color: "var(--fg-faint)" }}
              >
                {reportTitle}
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight mt-0.5" style={{ color: "var(--fg)" }}>
                {dateDisplay}
              </h1>
            </div>

            {/* Quick Action Button: 1-Click Summary Copy */}
            <button
              onClick={handleCopySummary}
              title="Copy executive summary"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-medium transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: isCopied ? "var(--accent)" : "var(--fg-muted)",
              }}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Summary</span>
                </>
              )}
            </button>
          </div>

          {/* ── TOP METRICS (2 Columns, Compact & Balanced) ── */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 py-3 sm:py-4 border-b text-center items-center" style={{ borderColor: "var(--border)" }}>
            {/* Overall Score */}
            <div
              className="border-r px-2 sm:px-4 py-1 flex flex-col items-center justify-center transition-transform hover:scale-[1.02]"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase" style={{ color: "var(--fg-faint)" }}>
                Overall Score
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black mt-1 tracking-tight text-emerald-500">
                {overallScore}%
              </div>
              <div
                className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold mt-1.5 px-2 py-0.5 rounded-md"
                style={{ background: "var(--surface-raised)", color: "var(--fg-muted)" }}
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>{statusSubtext}</span>
              </div>
            </div>

            {/* Completed */}
            <div className="px-2 sm:px-4 py-1 flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
              <div className="text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase" style={{ color: "var(--fg-faint)" }}>
                Completed
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black mt-1 tracking-tight" style={{ color: "var(--fg)" }}>
                {rightMetricVal}
              </div>
              <div
                className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold mt-1.5 px-2 py-0.5 rounded-md"
                style={{ background: "var(--surface-raised)", color: "var(--fg-muted)" }}
              >
                <Activity className="w-3 h-3 text-purple-500" />
                <span>{rightMetricLabel}</span>
              </div>
            </div>
          </div>

          {/* ── TIMEFRAME SPECIFIC SECTIONS ── */}

          {/* 1. DAILY REPORT SECTION */}
          {props.timeframe === "daily" && (
            <div className="py-2 space-y-5 sm:space-y-6">
              {/* Interactive Habit Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
                  <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase" style={{ color: "var(--fg-muted)" }}>
                    Habit Breakdown ({filteredHabits.length})
                  </div>
                  {/* Interactive Habit Filter Buttons */}
                  <div className="flex items-center gap-1">
                    {(["all", "active", "focus"] as const).map((filterKey) => (
                      <button
                        key={filterKey}
                        onClick={() => setHabitFilter(filterKey)}
                        className={`text-[9px] sm:text-[10px] uppercase font-mono px-2 py-0.5 rounded-md transition-colors ${
                          habitFilter === filterKey ? "font-bold shadow-xs" : "opacity-60 hover:opacity-100"
                        }`}
                        style={
                          habitFilter === filterKey
                            ? { background: "var(--accent)", color: "var(--accent-fg)" }
                            : { background: "var(--surface-raised)", color: "var(--fg-muted)" }
                        }
                      >
                        {filterKey === "all" ? "All" : filterKey === "active" ? "Active" : "Needs Focus"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {filteredHabits.length === 0 ? (
                    <div className="text-center py-4 text-xs font-mono" style={{ color: "var(--fg-faint)" }}>
                      No habits match this filter.
                    </div>
                  ) : (
                    filteredHabits.map((habit, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center justify-between gap-2.5 sm:gap-4 p-1.5 rounded-xl transition-all hover:bg-[var(--surface-raised)]"
                      >
                        <div className="w-28 sm:w-44 shrink-0">
                          <span className="text-xs sm:text-sm font-semibold leading-snug truncate block text-left" style={{ color: "var(--fg)" }}>
                            {habit.name}
                          </span>
                        </div>
                        <div
                          className="flex-1 h-2.5 rounded-full overflow-hidden mx-1 sm:mx-2 border"
                          style={{ background: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                            style={{ width: `${habit.val}%`, backgroundColor: habit.color }}
                          />
                        </div>
                        <div className="w-10 sm:w-12 text-right shrink-0">
                          <span className="text-xs font-mono font-bold" style={{ color: "var(--fg)" }}>
                            {habit.val}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Interactive Heatmap with Click/Hover Inspection */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
                  <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase" style={{ color: "var(--fg-muted)" }}>
                    14-Day Activity Heatmap
                  </div>
                  <span
                    className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      background: "var(--surface-raised)",
                      borderColor: "var(--border)",
                      color: "var(--fg-muted)",
                    }}
                  >
                    Tap day to inspect
                  </span>
                </div>

                <div
                  className="p-3 sm:p-4 rounded-2xl border flex flex-col justify-center space-y-3"
                  style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
                >
                  {/* Selected/Hovered Day Inspection Info Banner */}
                  {inspectedDay && (
                    <div
                      className="flex items-center justify-between text-[11px] font-mono px-3 py-1.5 rounded-xl border animate-in fade-in"
                      style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}
                    >
                      <span className="font-bold">{inspectedDay.dateStr}</span>
                      <span className="text-emerald-500 font-extrabold">{inspectedDay.label}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
                    {recent14Days.map((cell: any, idx: number) => {
                      const isToday = idx === recent14Days.length - 1;
                      const lvl = cell.level || 0;

                      // Theme adaptive heatmap colors
                      let bgStyle: React.CSSProperties = {};
                      if (lvl === 0) {
                        bgStyle = {
                          background: "var(--surface)",
                          border: "1px solid var(--border-subtle)",
                        };
                      } else if (lvl === 1) {
                        bgStyle = { backgroundColor: "#34d399", color: "#064e3b" };
                      } else if (lvl === 2) {
                        bgStyle = { backgroundColor: "#10b981", color: "#ffffff" };
                      } else if (lvl === 3) {
                        bgStyle = { backgroundColor: "#059669", color: "#ffffff" };
                      } else {
                        bgStyle = { backgroundColor: "#047857", color: "#ffffff" };
                      }

                      let dayStr = "";
                      let fullDateStr = "";
                      try {
                        dayStr = cell.date ? format(new Date(cell.date), "dd") : `${idx + 1}`;
                        fullDateStr = cell.date ? format(new Date(cell.date), "MMM d, yyyy") : `Day ${idx + 1}`;
                      } catch {
                        dayStr = `${idx + 1}`;
                        fullDateStr = `Day ${idx + 1}`;
                      }

                      const cellPct = cell.rate || (lvl === 0 ? 0 : lvl * 25);
                      const isInspected = inspectedDay?.dateStr === fullDateStr;

                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setInspectedDay({
                              dateStr: fullDateStr,
                              label: lvl === 0 ? "No Activity" : `${cellPct}% Completed`,
                              level: lvl,
                            })
                          }
                          className="flex flex-col items-center gap-1 cursor-pointer group"
                        >
                          <div
                            style={bgStyle}
                            className={`w-full aspect-square max-h-9 max-w-9 rounded-lg flex items-center justify-center relative transition-all duration-200 group-hover:scale-110 ${
                              isToday
                                ? "border-2 border-purple-500 ring-2 ring-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.35)]"
                                : ""
                            } ${isInspected ? "ring-2 ring-emerald-500 scale-105" : ""}`}
                          >
                            {isToday && (
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 absolute top-1 right-1" />
                            )}
                          </div>
                          <span
                            className={`text-[9px] sm:text-[10px] font-mono ${
                              isToday ? "font-black text-purple-500" : "font-medium"
                            }`}
                            style={!isToday ? { color: "var(--fg-faint)" } : undefined}
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
            <div className="py-2 space-y-5 sm:space-y-6">
              {/* Weekly Progress Chart */}
              <div className="space-y-2">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase border-b pb-2" style={{ color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                  Weekly Consistency Curve
                </div>
                <div className="h-36 sm:h-40 w-full pt-2 -ml-2 sm:ml-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyChartData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="weeklyThemeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="day"
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                        tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                        tickMargin={6}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 50, 100]}
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                        tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                        tickMargin={6}
                        width={28}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          color: tooltipTextColor,
                          borderRadius: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 2, stroke: isDarkOrGreen ? "#181A1C" : "#ffffff" }}
                        activeDot={{ r: 6, fill: "#8b5cf6" }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Heatmap (Last 7 Days) */}
              <div className="space-y-2">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase border-b pb-2" style={{ color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                  Weekly Heatmap (Last 7 Days)
                </div>
                <div
                  className="grid grid-cols-7 gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl border"
                  style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
                >
                  {recent14Days.slice(-7).map((cell: any, idx: number) => {
                    const isToday = idx === 6;
                    const lvl = cell.level || 0;
                    let bgStyle: React.CSSProperties = {};
                    if (lvl === 0) {
                      bgStyle = { background: "var(--surface)", border: "1px solid var(--border-subtle)" };
                    } else if (lvl === 1) {
                      bgStyle = { backgroundColor: "#34d399", color: "#064e3b" };
                    } else if (lvl === 2) {
                      bgStyle = { backgroundColor: "#10b981", color: "#ffffff" };
                    } else if (lvl === 3) {
                      bgStyle = { backgroundColor: "#059669", color: "#ffffff" };
                    } else {
                      bgStyle = { backgroundColor: "#047857", color: "#ffffff" };
                    }

                    let dayStr = "";
                    try {
                      dayStr = cell.date ? format(new Date(cell.date), "EEE") : `D${idx + 1}`;
                    } catch {
                      dayStr = `D${idx + 1}`;
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 group">
                        <div
                          style={bgStyle}
                          className={`w-full aspect-square max-h-9 max-w-9 rounded-lg flex items-center justify-center relative transition-transform group-hover:scale-110 ${
                            isToday ? "border-2 border-purple-500 ring-2 ring-purple-500/30" : ""
                          }`}
                        >
                          {isToday && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 absolute top-1 right-1" />
                          )}
                        </div>
                        <span
                          className={`text-[9px] sm:text-[10px] font-mono ${
                            isToday ? "font-black text-purple-500" : "font-medium"
                          }`}
                          style={!isToday ? { color: "var(--fg-faint)" } : undefined}
                        >
                          {dayStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Habit Breakdown Pie Chart & Legend */}
              <div className="space-y-3 pt-1">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase border-b pb-2" style={{ color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                  Habit Breakdown Distribution
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-1">
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: tooltipBg,
                            borderColor: tooltipBorder,
                            color: tooltipTextColor,
                            borderRadius: "12px",
                            fontSize: "11px",
                          }}
                        />
                        <Pie
                          data={safePieData}
                          dataKey="val"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={68}
                          innerRadius={36}
                          isAnimationActive={true}
                        >
                          {safePieData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 sm:pl-3 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0" style={{ borderColor: "var(--border)" }}>
                    {habitsList.map((habit, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-3 h-3 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: habit.color }} />
                          <span className="font-semibold truncate" style={{ color: "var(--fg)" }}>{habit.name}</span>
                        </div>
                        <span className="font-mono font-bold shrink-0" style={{ color: "var(--fg)" }}>{habit.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. MONTHLY REPORT SECTION */}
          {props.timeframe === "monthly" && (
            <div className="py-2 space-y-5 sm:space-y-6">
              {/* Monthly Heatmap */}
              <div className="space-y-2">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase border-b pb-2" style={{ color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                  Monthly Heatmap Grid (30 Days)
                </div>
                <div
                  className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-3 sm:p-4 rounded-2xl border"
                  style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
                >
                  {last30Days.map((cell: any, idx: number) => {
                    const isToday = idx === last30Days.length - 1;
                    const lvl = cell.level || 0;
                    let bgStyle: React.CSSProperties = {};
                    if (lvl === 0) {
                      bgStyle = { background: "var(--surface)", border: "1px solid var(--border-subtle)", color: "var(--fg-faint)" };
                    } else if (lvl === 1) {
                      bgStyle = { backgroundColor: "#34d399", color: "#064e3b", fontWeight: 700 };
                    } else if (lvl === 2) {
                      bgStyle = { backgroundColor: "#10b981", color: "#ffffff", fontWeight: 700 };
                    } else if (lvl === 3) {
                      bgStyle = { backgroundColor: "#059669", color: "#ffffff", fontWeight: 700 };
                    } else {
                      bgStyle = { backgroundColor: "#047857", color: "#ffffff", fontWeight: 700 };
                    }

                    let dayNum = "";
                    try {
                      dayNum = cell.date ? format(new Date(cell.date), "d") : `${idx + 1}`;
                    } catch {
                      dayNum = `${idx + 1}`;
                    }

                    return (
                      <div
                        key={idx}
                        style={bgStyle}
                        className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-110 relative ${
                          isToday ? "border-2 border-purple-500 ring-2 ring-purple-500/30 font-black" : ""
                        }`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Overview (Weekly Bars) */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase border-b pb-2" style={{ color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                  Weekly Performance Blocks
                </div>
                <div className="h-36 sm:h-40 w-full pt-2 -ml-2 sm:ml-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyBarData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="week"
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                        tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                        tickMargin={6}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 50, 100]}
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                        tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                        tickMargin={6}
                        width={28}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          borderColor: tooltipBorder,
                          color: tooltipTextColor,
                          borderRadius: "12px",
                          fontSize: "11px",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#8b5cf6"
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={true}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Habit Breakdown Pie Chart & Legend */}
              <div className="space-y-3 pt-1">
                <div className="text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase border-b pb-2" style={{ color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                  Habit Breakdown Distribution
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-1">
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: tooltipBg,
                            borderColor: tooltipBorder,
                            color: tooltipTextColor,
                            borderRadius: "12px",
                            fontSize: "11px",
                          }}
                        />
                        <Pie
                          data={safePieData}
                          dataKey="val"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={68}
                          innerRadius={36}
                          isAnimationActive={true}
                        >
                          {safePieData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 sm:pl-3 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0" style={{ borderColor: "var(--border)" }}>
                    {habitsList.map((habit, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-3 h-3 rounded-md shrink-0 shadow-xs" style={{ backgroundColor: habit.color }} />
                          <span className="font-semibold truncate" style={{ color: "var(--fg)" }}>{habit.name}</span>
                        </div>
                        <span className="font-mono font-bold shrink-0" style={{ color: "var(--fg)" }}>{habit.val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER / METADATA / QUOTE BLOCK ── */}
        <div className="pt-4 mt-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
          {/* Metadata & Verification Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest block" style={{ color: "var(--fg-faint)" }}>Report ID</span>
              <span className="font-bold tracking-wider" style={{ color: "var(--fg)" }}>{(props as any).reportId || "YVY-A48E91C2"}</span>
            </div>
            <div className="text-left sm:text-center">
              <span className="text-[9px] uppercase font-bold tracking-widest block" style={{ color: "var(--fg-faint)" }}>Generated On</span>
              <span className="font-medium" style={{ color: "var(--fg-muted)" }}>{(props as any).generatedTimestamp || format(new Date(), "MMMM d, yyyy • h:mm a")}</span>
            </div>
            <div
              className="flex items-center gap-2 p-1.5 rounded-xl border shadow-xs"
              style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-500 font-mono text-[9px] font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-mono font-bold tracking-wider" style={{ color: "var(--fg)" }}>VERIFIED A4</div>
                <div className="text-[8px]" style={{ color: "var(--fg-faint)" }}>youvsyou.site</div>
              </div>
            </div>
          </div>

          {/* Centered Quote */}
          <div className="text-center space-y-1 pt-1">
            <div className="flex justify-center">
              <Crown className="w-3.5 h-3.5 opacity-60" style={{ color: "var(--fg-muted)" }} />
            </div>
            <blockquote className="text-xs font-serif italic max-w-md mx-auto leading-relaxed px-2" style={{ color: "var(--fg-muted)" }}>
              &ldquo;{activeQuote}&rdquo;
            </blockquote>
          </div>

          {/* Bottom Branding */}
          <div
            className="text-center text-[9px] font-mono font-medium tracking-[0.18em] uppercase pt-2 border-t"
            style={{ borderColor: "var(--border-subtle)", color: "var(--fg-faint)" }}
          >
            YOU VS YOU • Personal Operating System • www.youvsyou.site
          </div>
        </div>
      </div>
    </div>
  );
};
