"use client";

import React from "react";
import { format, parseISO } from "date-fns";
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

interface ExecutivePaperReportProps {
  data?: any;
  dashboard?: any;
  lifeScore?: any;
  disciplineScore?: any;
  weeklyAnalytics?: any;
  monthlyAnalytics?: any;
  timeframe: "daily" | "weekly" | "monthly";
  id?: string;
}

const QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "Small daily improvements over time lead to stunning results.",
  "You don't rise to the level of your goals. You fall to the level of your systems.",
  "Success is neither magical nor mysterious. Success is the natural consequence of consistently applying basic fundamentals.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
];

export const ExecutivePaperReport: React.FC<ExecutivePaperReportProps> = ({
  data,
  dashboard,
  lifeScore,
  disciplineScore,
  weeklyAnalytics,
  monthlyAnalytics,
  timeframe,
  id = "printable-a4-paper",
}) => {
  // Safely parse dates
  const endDateStr = data?.end_date || new Date().toISOString();
  const startDateStr = data?.start_date || new Date().toISOString();
  let endDateObj = new Date();
  let startDateObj = new Date();
  try {
    endDateObj = parseISO(endDateStr);
    startDateObj = parseISO(startDateStr);
  } catch {
    endDateObj = new Date();
    startDateObj = new Date();
  }

  // Format header titles and dates
  const reportTitle =
    timeframe === "daily"
      ? "DAILY REPORT"
      : timeframe === "weekly"
      ? "WEEKLY REPORT"
      : "MONTHLY REPORT";

  const dateDisplay =
    timeframe === "daily"
      ? format(endDateObj, "MMMM d, yyyy")
      : timeframe === "weekly"
      ? `${format(startDateObj, "MMM d")} – ${format(endDateObj, "MMM d, yyyy")}`
      : format(endDateObj, "MMMM yyyy");

  // Top Metrics Calculation (Exact API binding: Life Score, Dashboard, Analytics)
  const overallScore =
    timeframe === "daily"
      ? Math.round(lifeScore?.overall_score ?? dashboard?.today?.stats?.completion_rate ?? data?.summary?.life_score ?? 0)
      : timeframe === "weekly"
      ? Math.round(weeklyAnalytics?.summary?.avg_completion_rate ?? data?.smart_statistics?.week_score ?? lifeScore?.overall_score ?? 0)
      : Math.round(monthlyAnalytics?.summary?.avg_completion_rate ?? data?.smart_statistics?.month_score ?? lifeScore?.overall_score ?? 0);

  const statusSubtext =
    overallScore >= 85
      ? "Amazing Work!"
      : overallScore >= 70
      ? "Keep Going!"
      : "Keep Consistent!";

  // Completed metrics
  const completedTasks = dashboard?.today?.stats?.completed_tasks ?? data?.summary?.total_tasks_completed ?? 0;
  const executionVelocity = Array.isArray(data?.charts?.execution_velocity) ? data.charts.execution_velocity : [];
  const latestLog = executionVelocity.length > 0 ? executionVelocity[executionVelocity.length - 1] : null;
  const totalTasks = dashboard?.today?.stats?.total_tasks ?? latestLog?.scheduled_tasks ?? Math.max(1, completedTasks);

  // Active days & heatmaps calculation
  const heatmap365 = Array.isArray(data?.charts?.heatmap_365) ? data.charts.heatmap_365 : [];
  const weeklyHeatmap = Array.isArray(data?.charts?.weekly_calendar_heatmap) ? data.charts.weekly_calendar_heatmap : [];
  const githubHistory = Array.isArray(dashboard?.widgets?.github_history) ? dashboard.widgets.github_history : heatmap365;
  const recent14Days = Array.isArray(githubHistory) ? githubHistory.slice(-14) : [];
  
  const activeDaysWeek = weeklyAnalytics?.summary?.active_days ?? weeklyHeatmap.filter((d: any) => (d.rate || d.completion_rate || 0) > 0).length ?? 0;
  
  let monthlyDaysSource: any[] = [];
  if (monthlyAnalytics?.calendar_grid?.weeks && Array.isArray(monthlyAnalytics.calendar_grid.weeks)) {
    monthlyDaysSource = monthlyAnalytics.calendar_grid.weeks.flat().filter(Boolean);
  } else if (Array.isArray(monthlyAnalytics?.calendar_grid)) {
    monthlyDaysSource = monthlyAnalytics.calendar_grid;
  } else if (Array.isArray(heatmap365) && heatmap365.length > 0) {
    monthlyDaysSource = heatmap365;
  } else if (Array.isArray(githubHistory)) {
    monthlyDaysSource = githubHistory;
  }
  const last30Days = Array.isArray(monthlyDaysSource) ? monthlyDaysSource.slice(-30) : [];
  const activeDaysMonth = monthlyAnalytics?.summary?.active_days ?? last30Days.filter((d: any) => (d.level || 0) > 0 || (d.rate || d.completion_rate || 0) > 0 || (d.tasks || d.tasks_completed || 0) > 0).length ?? 0;

  const rightMetricVal =
    timeframe === "daily"
      ? `${completedTasks}/${totalTasks}`
      : timeframe === "weekly"
      ? `${activeDaysWeek}/7`
      : `${activeDaysMonth}/${last30Days.length || 30}`;

  const rightMetricLabel =
    timeframe === "daily" ? "Tasks" : "Days";

  // Strict 5 Habits Breakdown in exact requested order:
  // 1. Water Intake, 2. Deep Study, 3. Workout Progress, 4. Pomodoro Consistency, 5. Overall Consistency
  const waterMl = dashboard?.widgets?.os_metrics?.water_ml ?? 0;
  const waterGoal = dashboard?.widgets?.os_goals?.water_goal_ml || 3000;
  const waterRate = Math.min(100, Math.round((waterMl / waterGoal) * 100) || Math.round(data?.executive_summary?.water_consistency ?? 0));

  const studyMins = dashboard?.widgets?.os_metrics?.study_mins ?? 0;
  const studyGoal = dashboard?.widgets?.os_goals?.study_goal_mins || 120;
  const readingRate = Math.min(100, Math.round((studyMins / studyGoal) * 100) || Math.round(data?.executive_summary?.study_consistency ?? 0));

  const workoutEx = dashboard?.widgets?.os_metrics?.workout_exercises ?? 0;
  const workoutGoal = dashboard?.widgets?.os_goals?.workout_goal_exercises || 8;
  const hypertrophyRate = Math.min(100, Math.round((workoutEx / workoutGoal) * 100) || Math.round(data?.executive_summary?.workout_consistency ?? 0));

  const pomoSessions = dashboard?.widgets?.os_metrics?.pomodoro_sessions ?? 0;
  const pomodoroRate = Math.min(100, Math.round((pomoSessions / 4) * 100) || Math.round(data?.executive_summary?.pomodoro_consistency ?? 0));

  const consistencyRate = Math.min(
    100,
    Math.round(dashboard?.today?.stats?.completion_rate ?? dashboard?.widgets?.day_progress?.completion_rate ?? data?.summary?.avg_completion_rate ?? data?.executive_summary?.completion_percentage ?? 0)
  );

  const habitsList = [
    { name: "Water Intake", val: waterRate, color: "#06b6d4" },
    { name: "Deep Study", val: readingRate, color: "#3b82f6" },
    { name: "Workout Progress", val: hypertrophyRate, color: "#8b5cf6" },
    { name: "Pomodoro Consistency", val: pomodoroRate, color: "#f97316" },
    { name: "Overall Consistency", val: consistencyRate, color: "#10b981" },
  ];

  // Weekly Line Chart Data (exact 7 days from Dashboard / Weekly Analytics)
  const weeklyDaysSource = Array.isArray(dashboard?.widgets?.week_mini)
    ? dashboard.widgets.week_mini
    : Array.isArray(weeklyAnalytics?.days)
    ? weeklyAnalytics.days
    : weeklyHeatmap;
  const weeklyChartData = (Array.isArray(weeklyDaysSource) ? weeklyDaysSource : []).map((item: any, idx: number) => {
    let dayLabel = item.day || item.day_name || "";
    if (!dayLabel && item.date) {
      try {
        dayLabel = format(new Date(item.date), "EEE");
      } catch {}
    }
    if (!dayLabel) dayLabel = `D${idx + 1}`;
    const val = Math.round(item.completion_rate ?? item.rate ?? item.value ?? 0);
    return { day: dayLabel, value: val };
  });

  // Monthly Bar Chart Data (4-5 Weeks from Monthly Analytics / Heatmap)
  const monthlyBarData = [];
  const chunkSize = Math.ceil(last30Days.length / 4) || 7;
  for (let i = 0; i < 4; i++) {
    const chunk = last30Days.slice(i * chunkSize, (i + 1) * chunkSize);
    const avg = chunk.length > 0
      ? Math.round(chunk.reduce((acc: number, cur: any) => acc + (cur.completion_rate ?? cur.rate ?? 0), 0) / chunk.length)
      : 0;
    monthlyBarData.push({
      week: `Week ${i + 1}`,
      value: avg,
    });
  }

  // Quote selection
  const quoteIdx = (overallScore + completedTasks) % QUOTES.length;
  const activeQuote = QUOTES[quoteIdx] || QUOTES[0];

  return (
    <div
      id={id}
      className="relative w-full max-w-3xl mx-auto bg-[#fcfbf9] text-zinc-900 rounded-[32px] shadow-2xl border border-zinc-300/80 p-8 sm:p-14 md:p-16 transition-all duration-300 font-sans"
      style={{
        backgroundImage:
          "radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* ── 4 CORNER RIVETS / PINS (Pinned Paper Aesthetic) ── */}
      <div className="absolute top-5 left-5 sm:top-6 sm:left-6 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/50" />
      </div>
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/50" />
      </div>
      <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/50" />
      </div>
      <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md border border-zinc-600/80 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/50" />
      </div>

      {/* ── HEADER ── */}
      <div className="text-center space-y-1.5 border-b border-zinc-200/80 pb-8">
        <div className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.3em] text-zinc-500 uppercase">
          {reportTitle}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">
          {dateDisplay}
        </h1>
      </div>

      {/* ── TOP METRICS (2 Columns) ── */}
      <div className="grid grid-cols-2 gap-4 py-8 border-b border-zinc-200/80 text-center">
        <div className="border-r border-zinc-200/80 px-4">
          <div className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">
            Overall Score
          </div>
          <div className="text-5xl sm:text-6xl font-black text-emerald-700 mt-1.5 tracking-tight">
            {overallScore}%
          </div>
          <div className="text-xs sm:text-sm font-bold text-zinc-700 mt-1">
            {statusSubtext}
          </div>
        </div>

        <div className="px-4">
          <div className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">
            Completed
          </div>
          <div className="text-5xl sm:text-6xl font-black text-zinc-900 mt-1.5 tracking-tight">
            {rightMetricVal}
          </div>
          <div className="text-xs sm:text-sm font-bold text-zinc-700 mt-1">
            {rightMetricLabel}
          </div>
        </div>
      </div>

      {/* ── TIMEFRAME SPECIFIC SECTIONS ── */}

      {/* 1. DAILY REPORT SECTION */}
      {timeframe === "daily" && (
        <div className="py-8 space-y-10">
          {/* Habit Breakdown (Horizontal Green Bars) */}
          <div className="space-y-5">
            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 border-b border-zinc-200/80 pb-2">
              Habit Breakdown
            </div>
            <div className="space-y-4 pt-1">
              {habitsList.map((habit, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm font-bold text-zinc-800 w-44 sm:w-52 truncate">
                    {habit.name}
                  </span>
                  <div className="flex-1 h-3 bg-zinc-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${habit.val}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-bold text-zinc-900 w-12 text-right">
                    {habit.val}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Heatmap (Real Activity Only) */}
          <div className="space-y-4 pt-2">
            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 border-b border-zinc-200/80 pb-2">
              Today&apos;s Heatmap
            </div>
            <div className="p-6 rounded-2xl bg-zinc-100/60 border border-zinc-200/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-600">
                <span>Recent Empirical Telemetry (Last 14 Days)</span>
                <span className="font-mono text-[11px] text-zinc-500">100% Real Activity</span>
              </div>
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
                {recent14Days.map((cell: any, idx: number) => {
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
                  const rateVal = cell.rate ?? cell.completion_rate ?? (lvl * 25);
                  const tasksVal = cell.tasks_completed ?? cell.tasks ?? 0;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1"
                      title={`${cell.date || "Day"}: ${rateVal}% (${tasksVal} tasks)`}
                    >
                      <div className={`w-full h-8 sm:h-10 rounded-lg ${bg} transition-all`} />
                      <span className="text-[9px] font-mono text-zinc-500">
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
      {timeframe === "weekly" && (
        <div className="py-8 space-y-10">
          {/* Weekly Progress Line Chart */}
          <div className="space-y-4">
            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 border-b border-zinc-200/80 pb-2">
              Weekly Progress
            </div>
            <div className="h-44 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={{ stroke: "#e4e4e7" }}
                    tickLine={false}
                    tick={{ fill: "#52525b", fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    axisLine={{ stroke: "#e4e4e7" }}
                    tickLine={false}
                    tick={{ fill: "#52525b", fontSize: 11, fontWeight: 700 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={{ fill: "#7c3aed", r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Habit Breakdown Pie Chart */}
          <div className="space-y-6 pt-2">
            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 border-b border-zinc-200/80 pb-2">
              Habit Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 py-2">
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={habitsList}
                      dataKey="val"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={25}
                      isAnimationActive={false}
                    >
                      {habitsList.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 px-2">
                {habitsList.map((habit, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: habit.color }} />
                      <span className="text-xs sm:text-sm font-bold text-zinc-800">{habit.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-mono font-bold text-zinc-900">{habit.val}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MONTHLY REPORT SECTION */}
      {timeframe === "monthly" && (
        <div className="py-8 space-y-10">
          {/* Monthly Heatmap (GitHub Style) */}
          <div className="space-y-4">
            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 border-b border-zinc-200/80 pb-2">
              Monthly Heatmap
            </div>
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 pt-2">
              {last30Days.map((cell: any, idx: number) => {
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
                const rateVal = cell.completion_rate ?? cell.rate ?? (lvl * 25);

                return (
                  <div
                    key={idx}
                    className={`h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-all ${bg}`}
                    title={`${cell.date || ""}: ${rateVal}%`}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Overview (Small Bar Chart) */}
          <div className="space-y-4 pt-2">
            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 border-b border-zinc-200/80 pb-2">
              Progress Overview
            </div>
            <div className="h-44 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="week"
                    axisLine={{ stroke: "#e4e4e7" }}
                    tickLine={false}
                    tick={{ fill: "#52525b", fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    axisLine={{ stroke: "#e4e4e7" }}
                    tickLine={false}
                    tick={{ fill: "#52525b", fontSize: 11, fontWeight: 700 }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#7c3aed"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Habit Breakdown Pie Chart */}
          <div className="space-y-6 pt-2">
            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-500 border-b border-zinc-200/80 pb-2">
              Habit Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 py-2">
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={habitsList}
                      dataKey="val"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={25}
                      isAnimationActive={false}
                    >
                      {habitsList.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 px-2">
                {habitsList.map((habit, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: habit.color }} />
                      <span className="text-xs sm:text-sm font-bold text-zinc-800">{habit.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-mono font-bold text-zinc-900">{habit.val}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM MOTIVATIONAL QUOTE ── */}
      <div className="pt-8 mt-4 border-t border-zinc-200/80 text-center space-y-3">
        <div className="flex justify-center">
          <Crown className="w-5 h-5 text-zinc-800 fill-zinc-800/20" />
        </div>
        <blockquote className="text-sm sm:text-base md:text-lg font-serif italic text-zinc-800 max-w-lg mx-auto leading-relaxed">
          &quot;{activeQuote}&quot;
        </blockquote>
      </div>
    </div>
  );
};
