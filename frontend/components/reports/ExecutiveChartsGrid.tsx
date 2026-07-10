"use client";

import React, { useState } from "react";
import { SmartReportsData } from "@/types/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Activity,
  BarChart2,
  PieChart as PieIcon,
  Layers,
  Flame,
  Award,
  Clock,
  Dumbbell,
  BookOpen,
  Droplets,
  BrainCircuit,
  Target,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ExecutiveChartsGridProps {
  charts: SmartReportsData["charts"];
  theme?: "dark" | "light";
}

export const ExecutiveChartsGrid: React.FC<ExecutiveChartsGridProps> = ({
  charts,
  theme = "dark",
}) => {
  const isDark = theme === "dark";
  const [lifeScoreRange, setLifeScoreRange] = useState<"days_30" | "days_90" | "days_365">("days_30");
  const [xpRange, setXpRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const [volumeRange, setVolumeRange] = useState<"daily" | "weekly" | "monthly">("daily");

  const cardClass = cn(
    "p-6 rounded-3xl border transition-all duration-300 shadow-xl overflow-hidden relative",
    isDark
      ? "bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-zinc-950 border-zinc-800/80 text-white"
      : "bg-white border-zinc-200 text-zinc-900 shadow-lg"
  );

  const titleClass = "text-base font-bold flex items-center justify-between gap-2 mb-4";
  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const textColor = isDark ? "#a1a1aa" : "#52525b";

  return (
    <div className="space-y-6 md:space-y-12 py-4 md:py-6">
      {/* ── SECTION 1: MACRO VELOCITY & TRAJECTORY ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Macro Velocity & Trajectory</h3>
            <p className="text-xs text-zinc-400">Long-term consistency, XP generation, and execution speed.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Life Score Timeline */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                1. Life Score Timeline (Area Chart)
              </span>
              <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs">
                {(["days_30", "days_90", "days_365"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setLifeScoreRange(r)}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-all font-semibold",
                      lifeScoreRange === r ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {r.replace("days_", "")}d
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.life_score_timeline[lifeScoreRange] || []}>
                  <defs>
                    <linearGradient id="colorLife" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#8b5cf6", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLife)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: XP Growth */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                2. XP Growth Trajectory (Line Chart)
              </span>
              <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs">
                {(["daily", "weekly", "monthly"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setXpRange(r)}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-all font-semibold capitalize",
                      xpRange === r ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.xp_growth[xpRange] || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey={xpRange === "daily" ? "date" : xpRange === "weekly" ? "week" : "month"} stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#eab308", borderRadius: "12px" }} />
                  <Line type="monotone" dataKey="xp" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: "#eab308" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Execution Velocity */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                3. Execution Velocity (Planned vs Completed)
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.execution_velocity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#10b981", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="planned" stroke="#64748b" fill="#64748b" fillOpacity={0.2} name="Planned" />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.4} name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Consistency Trajectory */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                5. Consistency Trajectory & Momentum
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.consistency_trajectory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#f97316", borderRadius: "12px" }} />
                  <Line type="monotone" dataKey="discipline_trend" stroke="#f97316" strokeWidth={3} name="Discipline Trend %" />
                  <Line type="monotone" dataKey="consistency" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" name="Consistency Index" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: VOLUME & ACTIVITY ANALYSIS ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Volume & Activity Analysis</h3>
            <p className="text-xs text-zinc-400">Multi-axis activity distribution across tasks, physical training, and study blocks.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 4: Execution Volume */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                4. Execution Volume (Stacked Bar)
              </span>
              <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs">
                {(["daily", "weekly", "monthly"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setVolumeRange(r)}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-all font-semibold capitalize",
                      volumeRange === r ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.execution_volume[volumeRange] || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey={volumeRange === "daily" ? "date" : "period"} stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#6366f1", borderRadius: "12px" }} />
                  <Legend />
                  <Bar dataKey="tasks" stackId="a" fill="#8b5cf6" name="Tasks" />
                  <Bar dataKey="workouts" stackId="a" fill="#f43f5e" name="Workouts" />
                  <Bar dataKey="study" stackId="a" fill="#06b6d4" name="Study (hrs)" />
                  <Bar dataKey="pomodoro" stackId="a" fill="#eab308" name="Pomodoro" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 16: Most Productive Hours */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                16. Most Productive Hours (24-Hour Profile)
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.productive_hours || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="hour" stroke={textColor} fontSize={9} interval={2} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#06b6d4", borderRadius: "12px" }} />
                  <Bar dataKey="tasks_completed" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Tasks Done" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 7: GitHub Style Heatmap 365 Days */}
        <div className={cardClass}>
          <div className={titleClass}>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              7. GitHub Style 365-Day Activity Heatmap (100% Real Telemetry)
            </span>
            <span className="text-xs text-zinc-400 font-normal">No generated placeholders • Historical truth</span>
          </div>
          <div className="flex flex-wrap gap-1.5 py-2 max-h-52 overflow-y-auto">
            {(charts.heatmap_365 || []).map((day, idx) => {
              const bg =
                day.level === 4 ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" :
                day.level === 3 ? "bg-emerald-600" :
                day.level === 2 ? "bg-emerald-700/80" :
                day.level === 1 ? "bg-emerald-900/60" :
                isDark ? "bg-zinc-800/60" : "bg-zinc-100";
              return (
                <div
                  key={idx}
                  className={cn("w-3.5 h-3.5 rounded-[3px] transition-all hover:scale-125 cursor-pointer", bg)}
                  title={`${day.date}: ${day.tasks} tasks completed (${day.rate}%)`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 text-[11px] text-zinc-400 mt-3">
            <span>Less</span>
            <div className={cn("w-3 h-3 rounded-[3px]", isDark ? "bg-zinc-800" : "bg-zinc-100")} />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-900/60" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-700/80" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-600" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        {/* Chart 8: Weekly Performance Calendar */}
        <div className={cardClass}>
          <div className={titleClass}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              8. Weekly Performance Calendar Heatmap (0% to 100% Tiers)
            </span>
          </div>
          <div className="grid grid-cols-7 gap-3 py-4">
            {(charts.weekly_calendar_heatmap || []).map((d, i) => {
              const tierBg =
                d.tier === "100%" ? "from-purple-600 to-indigo-600 text-white shadow-purple-500/30" :
                d.tier === "75%" ? "from-purple-700/80 to-indigo-700/80 text-white" :
                d.tier === "50%" ? "from-purple-900/60 to-indigo-900/60 text-purple-200" :
                d.tier === "25%" ? "from-zinc-800 to-zinc-800/80 text-zinc-300" :
                "from-zinc-900 to-zinc-900/60 text-zinc-500";
              return (
                <div key={i} className={cn("p-4 rounded-2xl bg-gradient-to-br border border-zinc-800 flex flex-col items-center text-center shadow-md", tierBg)}>
                  <span className="text-xs font-bold uppercase opacity-80">{d.day}</span>
                  <span className="text-xl sm:text-2xl font-black mt-1">{d.rate}%</span>
                  <span className="text-[10px] mt-1 opacity-70">{d.tier} Tier</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: NEUROLOGICAL & FOCUS MASTERY ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Neurological & Focus Mastery</h3>
            <p className="text-xs text-zinc-400">Deep work retention, study consistency, training intensity, and hydration.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 6: Radar Chart */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                6. Life Balance Wheel (8-Axis Radar)
              </span>
              <span className="text-xs text-zinc-400">Instantly identifies weak dimensions</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={charts.radar_balance || []}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" stroke={textColor} fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={textColor} fontSize={10} />
                  <Radar name="Life Balance" dataKey="val" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#8b5cf6", borderRadius: "12px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 9: Focus Analytics */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                9. Focus Analytics (Multi-Line Chart)
              </span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.focus_analytics || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#f59e0b", borderRadius: "12px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="focus_time" stroke="#f59e0b" strokeWidth={3} name="Focus Time (m)" />
                  <Line type="monotone" dataKey="pomodoro_sessions" stroke="#8b5cf6" strokeWidth={2} name="Pomodoro Blocks" />
                  <Line type="monotone" dataKey="interruptions" stroke="#f43f5e" strokeWidth={2} strokeDasharray="3 3" name="Interruptions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 10: Deep Study Analytics */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                10. Deep Study Analytics (Hrs vs Goal Line)
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.study_analytics || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#06b6d4", borderRadius: "12px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="daily_study" stroke="#06b6d4" strokeWidth={3} name="Daily Study (hrs)" />
                  <Line type="step" dataKey="goal_line" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target Goal" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 11 & 12: Workout & Hydration */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-rose-400" />
                11 & 12. Training & Hydration Consistency
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.workout_analytics || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#f43f5e", borderRadius: "12px" }} />
                  <Legend />
                  <Bar dataKey="exercises_completed" fill="#f43f5e" name="Exercises Done" />
                  <Bar dataKey="goal" fill="#64748b" fillOpacity={0.3} name="Exercise Goal" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: MILESTONES & ACHIEVEMENTS ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Milestones & Personal Records</h3>
            <p className="text-xs text-zinc-400">Unbroken streak progression, unlocked badges, and all-time highs.</p>
          </div>
        </div>

        {/* Chart 13: Streak Timeline */}
        <div className={cardClass}>
          <div className={titleClass}>
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              13. Streak Milestone Trajectory (7, 30, 50, 100, 365 Days)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-4">
            {(charts.streak_milestones || []).map((m, i) => {
              const isDone = m.status === "achieved";
              const isProg = m.status === "in_progress";
              return (
                <div
                  key={i}
                  className={cn(
                    "p-4 rounded-2xl border flex flex-col items-center text-center transition-all",
                    isDone
                      ? "bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent border-orange-500/40 text-white shadow-lg shadow-orange-500/10"
                      : isProg
                      ? "bg-zinc-900/60 border-zinc-700 text-zinc-200"
                      : "bg-zinc-950/40 border-zinc-800/60 text-zinc-600"
                  )}
                >
                  <Flame className={cn("w-6 h-6 mb-2", isDone ? "text-orange-500 animate-bounce" : isProg ? "text-amber-400" : "text-zinc-700")} />
                  <span className="text-sm font-black">{m.milestone}</span>
                  <span className="text-xs text-zinc-400 mt-1">Progress: {m.current} / {m.target}d</span>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", isDone ? "bg-orange-500" : "bg-amber-400")}
                      style={{ width: `${min(100, int((m.current / m.target) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 14: Achievements Timeline */}
        <div className={cardClass}>
          <div className={titleClass}>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              14. Achievements & Badges Unlock History
            </span>
          </div>
          <div className="space-y-3 py-2 max-h-60 overflow-y-auto">
            {(charts.achievements_timeline || []).map((ach, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 font-bold text-lg">
                    {ach.icon || "🏆"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{ach.title}</div>
                    <div className="text-xs text-zinc-400">{ach.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-400">+{ach.xp_earned} XP</div>
                  <div className="text-[10px] text-zinc-500">{ach.date_achieved}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 26: Personal Records Cards */}
        <div className={cardClass}>
          <div className={titleClass}>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              26. All-Time Personal Records (Hall of Fame)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 py-2">
            {Object.entries(charts.personal_records || {}).map(([key, rec], idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-300 mt-2">
                  {rec.val}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1">{rec.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: STRATEGIC DISTRIBUTION & FUNNELS ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Strategic Distribution & Funnels</h3>
            <p className="text-xs text-zinc-400">Habit categorization, execution funnels, and difficulty vs completion scatter matrix.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 15: Habit Distribution Donut */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                15. Habit Distribution
              </span>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.habit_distribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4}>
                    {(charts.habit_distribution || []).map((entry, i) => (
                      <Cell key={i} fill={entry.color || "#8b5cf6"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#8b5cf6", borderRadius: "12px" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 21: Success Ratio Gauge */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                21. Execution Success Ratio
              </span>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.success_ratio || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} startAngle={180} endAngle={0}>
                    {(charts.success_ratio || []).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#10b981", borderRadius: "12px" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 24: Habit Completion Funnel */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                24. Completion Conversion Funnel
              </span>
            </div>
            <div className="space-y-4 py-2">
              {(charts.completion_funnel || []).map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{step.stage}</span>
                    <span className="text-purple-400 font-bold">{step.count} ({step.percentage}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-3 rounded-xl overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-lg transition-all"
                      style={{ width: `${step.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 25: Performance Matrix Scatter Plot */}
        <div className={cardClass}>
          <div className={titleClass}>
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              25. Performance Matrix (Difficulty vs Completion Rate vs XP Bubble)
            </span>
            <span className="text-xs text-zinc-400">Bubble size = XP generated</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" dataKey="difficulty" name="Difficulty" unit="/10" stroke={textColor} fontSize={11} domain={[0, 10]} />
                <YAxis type="number" dataKey="completion_rate" name="Completion Rate" unit="%" stroke={textColor} fontSize={11} domain={[0, 100]} />
                <ZAxis type="number" dataKey="xp_earned" range={[60, 400]} name="XP Earned" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#f43f5e", borderRadius: "12px" }} />
                <Scatter name="Routines" data={charts.performance_matrix || []} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── SECTION 6: COMPARATIVE GROWTH & AI PREDICTIONS ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Comparative Growth & AI Predictions</h3>
            <p className="text-xs text-zinc-400">Period-over-period comparisons, neurological AI forecasts, and executive coaching.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 17 & 18: Weekly & Monthly Comparison */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                17. Weekly Comparison (Current vs Prev Week)
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.weekly_comparison || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="day" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#10b981", borderRadius: "12px" }} />
                  <Legend />
                  <Bar dataKey="current_week" fill="#10b981" name="Current Week" />
                  <Bar dataKey="previous_week" fill="#64748b" fillOpacity={0.3} name="Prev Week" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 22: Life Score AI Prediction */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                22. Life Score AI Prediction (7, 30, 90 Day Forecast)
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.life_score_prediction || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="day" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#8b5cf6", borderRadius: "12px" }} />
                  <Line type="monotone" dataKey="predicted_score" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: "#8b5cf6" }} name="Predicted Life Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 18: Monthly Comparison */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                18. Monthly Comparison
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthly_comparison || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="week" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#6366f1", borderRadius: "12px" }} />
                  <Legend />
                  <Bar dataKey="current_month" fill="#6366f1" name="Current Mo" />
                  <Bar dataKey="previous_month" fill="#64748b" fillOpacity={0.3} name="Prev Mo" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 19: Quarterly Growth */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                19. Quarterly Growth Rate
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.quarterly_growth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="quarter" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#06b6d4", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="xp_growth" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} name="XP Growth %" />
                  <Area type="monotone" dataKey="avg_rate" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="Avg Rate %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 20: Yearly Growth */}
          <div className={cardClass}>
            <div className={titleClass}>
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                20. Yearly Overview
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.yearly_growth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={textColor} fontSize={11} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#f59e0b", borderRadius: "12px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="tasks_completed" stroke="#f59e0b" strokeWidth={3} name="Tasks Done" />
                  <Line type="monotone" dataKey="xp_generated" stroke="#8b5cf6" strokeWidth={2} name="XP (x10)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 23: Discipline Momentum */}
        <div className={cardClass}>
          <div className={titleClass}>
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              23. Discipline Momentum Curve (Neurological Trajectory)
            </span>
            <span className="text-xs text-zinc-400">Tracks acceleration vs deceleration of habit execution</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.discipline_momentum || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" stroke={textColor} fontSize={11} />
                <YAxis stroke={textColor} fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderColor: "#f43f5e", borderRadius: "12px" }} />
                <Area type="monotone" dataKey="momentum_curve" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} name="Momentum Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 27: Neural Coach Executive Report */}
        <div className={cn("p-8 rounded-3xl border shadow-2xl relative overflow-hidden", isDark ? "bg-gradient-to-r from-purple-950/50 via-zinc-900/90 to-zinc-950 border-purple-500/30" : "bg-purple-50 border-purple-200")}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <BrainCircuit className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h4 className="text-2xl font-black tracking-tight text-white print:text-black">27. NEURAL COACH EXECUTIVE SYNTHESIS</h4>
              <p className="text-xs text-purple-300">Automated diagnostic recommendations for next month&apos;s execution target.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Core Strengths
              </span>
              <ul className="space-y-2 text-xs text-zinc-300">
                {(charts.ai_coach_report?.strengths || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Friction Points
              </span>
              <ul className="space-y-2 text-xs text-zinc-300">
                {(charts.ai_coach_report?.weaknesses || []).map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Strategic Suggestions
              </span>
              <ul className="space-y-2 text-xs text-zinc-300">
                {(charts.ai_coach_report?.suggestions || []).map((sg, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>{sg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-purple-300 tracking-wider">Next Month Primary Target</span>
              <p className="text-lg font-black text-white mt-1">{charts.ai_coach_report?.next_month_target || "Ascend to Life Score 90+ (Excellent Tier)."}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
              Priority: High
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function min(a: number, b: number) { return Math.min(a, b); }
function int(n: number) { return Math.floor(n); }
