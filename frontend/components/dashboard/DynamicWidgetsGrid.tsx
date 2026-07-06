"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Droplets,
  Plus,
  Clock,
  CloudSun,
  Music,
  GitCommit,
  Calendar as CalendarIcon,
  Flame,
  Award,
  Zap,
  BookOpen,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";
import { useCustomizationStore, WidgetId } from "@/lib/stores/customizationStore";
import { DashboardData } from "@/types/api";
import { cn } from "@/lib/utils/cn";

interface DynamicWidgetsGridProps {
  dashboard: DashboardData;
}

export function DynamicWidgetsGrid({ dashboard }: DynamicWidgetsGridProps) {
  const { enabledWidgets, cardRadius } = useCustomizationStore();
  const { xp, streak, day_progress } = dashboard.widgets;

  // Clock State
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Pomodoro State (25 mins = 1500 secs)
  const [pomoSeconds, setPomoSeconds] = useState(1500);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<"work" | "break">("work");
  useEffect(() => {
    let interval: any = null;
    if (isPomoRunning && pomoSeconds > 0) {
      interval = setInterval(() => setPomoSeconds((s) => s - 1), 1000);
    } else if (pomoSeconds === 0) {
      setIsPomoRunning(false);
      if (pomoMode === "work") {
        setPomoMode("break");
        setPomoSeconds(300); // 5 min break
      } else {
        setPomoMode("work");
        setPomoSeconds(1500);
      }
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoSeconds, pomoMode]);

  // Water Tracker State
  const [waterMl, setWaterMl] = useState(dashboard.widgets.os_metrics?.water_ml ?? 0);
  const [waterGoal, setWaterGoal] = useState(dashboard.widgets.os_goals?.water_goal_ml ?? 3000);

  // Workout / Study States
  const [workoutDone, setWorkoutDone] = useState(dashboard.widgets.os_metrics?.workout_exercises ?? 0);
  const [workoutGoal, setWorkoutGoal] = useState(dashboard.widgets.os_goals?.workout_goal_exercises ?? 8);

  const [studyMins, setStudyMins] = useState(dashboard.widgets.os_metrics?.study_mins ?? 0);
  const [studyGoal, setStudyGoal] = useState(dashboard.widgets.os_goals?.study_goal_mins ?? 120);

  const updateMetric = async (key: string, val: number) => {
    try {
      await fetch("/api/v1/analytics/metrics/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: JSON.stringify({ [key]: val }),
      });
    } catch (e) {}
  };

  const updateGoal = async (key: string, val: number) => {
    try {
      await fetch("/api/v1/analytics/goals/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: JSON.stringify({ [key]: val }),
      });
    } catch (e) {}
  };

  const radiusClasses = {
    "16px": "rounded-[16px]",
    "20px": "rounded-[20px]",
    "24px": "rounded-[24px]",
  };
  const cardCls = cn(
    "p-5 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden group",
    radiusClasses[cardRadius] || "rounded-[20px]"
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div>
          <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
            Interactive Modular Widgets
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
              {enabledWidgets.length} ACTIVE
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Customize which productivity and lifestyle widgets appear here via Studio Control.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* 1. XP & Level Ring Widget */}
        {enabledWidgets.includes("xp") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-forge-400" />
                Experience Points
              </span>
              <span className="text-xs font-mono text-forge-300 font-bold">LVL {xp.current_level}</span>
            </div>
            <div className="my-2 flex items-center justify-between">
              <div>
                <span className="text-3xl font-display font-black text-white">{xp.total_xp}</span>
                <span className="text-xs font-mono text-muted-foreground ml-1">XP</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">+{xp.xp_earned_today} earned today</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-forge-500/10 border border-forge-500/30 flex items-center justify-center font-display font-bold text-forge-400 text-sm shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                {Math.round(xp.level_progress)}%
              </div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
              <motion.div
                className="bg-gradient-to-r from-forge-500 to-purple-400 h-full rounded-full shadow-[0_0_8px_#8b5cf6]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xp.level_progress)}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* 2. Level Status Badge */}
        {enabledWidgets.includes("level") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Mastery Rank
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase">
                Tier {Math.floor(xp.current_level / 5) + 1}
              </span>
            </div>
            <div className="my-3">
              <h3 className="text-xl font-display font-black text-white tracking-wide">
                {xp.level_title || (xp.current_level >= 10 ? "Neural Architect" : xp.current_level >= 5 ? "Discipline Vanguard" : "Habit Initiate")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {xp.xp_to_next_level} XP required for next rank promotion.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-forge-300 font-mono">
              <span>Current Level: {xp.current_level}</span>
              <span>Next: {xp.current_level + 1}</span>
            </div>
          </motion.div>
        )}

        {/* 3. Habit Score */}
        {enabledWidgets.includes("habit_score") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Consistency Score
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                +4.2%
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-4xl font-display font-black text-white">
                {Math.min(100, Math.round((day_progress.completion_rate * 0.7) + 30))}
              </span>
              <span className="text-xs font-mono text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on 7-day completion consistency and streak retention.
            </p>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
              <motion.div
                className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_#10b981]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round((day_progress.completion_rate * 0.7) + 30))}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* 4. Focus Timer */}
        {enabledWidgets.includes("focus_timer") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Focus Stopwatch
              </span>
              <span className="text-[10px] font-mono text-cyan-400">DEEP WORK</span>
            </div>
            <div className="my-3 text-center">
              <span className="text-4xl font-mono font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                {formatTimer(timerSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={cn(
                  "flex-1 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5",
                  isTimerRunning
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                )}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTimerRunning ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 5. Pomodoro Clock */}
        {enabledWidgets.includes("pomodoro") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-400" />
                Pomodoro Clock
              </span>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase",
                pomoMode === "work" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}>
                {pomoMode === "work" ? "25m Work" : "5m Break"}
              </span>
            </div>
            <div className="my-3 text-center">
              <span className="text-4xl font-mono font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                {formatTimer(pomoSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => setIsPomoRunning(!isPomoRunning)}
                className={cn(
                  "flex-1 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5",
                  isPomoRunning
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                )}
              >
                {isPomoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPomoRunning ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  setPomoSeconds(pomoMode === "work" ? 1500 : 300);
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                title="Reset Pomodoro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 6. Water Tracker */}
        {enabledWidgets.includes("water_tracker") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Hydration Log
              </span>
              <select
                value={waterGoal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWaterGoal(val);
                  updateGoal("water_goal_ml", val);
                }}
                className="bg-black/40 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-400"
              >
                {[1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000].map((g) => (
                  <option key={g} value={g}>{g} ml</option>
                ))}
              </select>
            </div>
            <div className="my-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-display font-black text-white">{waterMl}</span>
                <span className="text-xs font-mono text-muted-foreground ml-1">/ {waterGoal} ml</span>
              </div>
              <button
                onClick={() => {
                  const next = Math.min(waterGoal, waterMl + 250);
                  setWaterMl(next);
                  updateMetric("water_ml", next);
                }}
                className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                250ml
              </button>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
              <motion.div
                className="bg-cyan-400 h-full rounded-full shadow-[0_0_8px_#06b6d4]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (waterMl / waterGoal) * 100)}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* 7. Workout Progress */}
        {enabledWidgets.includes("workout_progress") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-rose-400" />
                Hypertrophy Push
              </span>
              <select
                value={workoutGoal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWorkoutGoal(val);
                  updateGoal("workout_goal_exercises", val);
                }}
                className="bg-black/40 border border-rose-500/30 text-[10px] font-mono text-rose-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-rose-400"
              >
                {[5, 8, 10, 12, 15, 20].map((g) => (
                  <option key={g} value={g}>{g} Ex</option>
                ))}
              </select>
            </div>
            <div className="my-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-display font-black text-white">{workoutDone}</span>
                <span className="text-xs font-mono text-muted-foreground ml-1">/ {workoutGoal} Ex</span>
              </div>
              <button
                onClick={() => {
                  const next = Math.min(workoutGoal, workoutDone + 1);
                  setWorkoutDone(next);
                  updateMetric("workout_exercises", next);
                }}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors text-xs font-semibold"
              >
                +1 Ex
              </button>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
              <motion.div
                className="bg-rose-500 h-full rounded-full shadow-[0_0_8px_#f43f5e]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (workoutDone / workoutGoal) * 100)}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* 8. Study Progress */}
        {enabledWidgets.includes("study_progress") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Deep Study
              </span>
              <select
                value={studyGoal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStudyGoal(val);
                  updateGoal("study_goal_mins", val);
                }}
                className="bg-black/40 border border-purple-500/30 text-[10px] font-mono text-purple-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-purple-400"
              >
                {[60, 120, 240, 360, 480, 720].map((g) => (
                  <option key={g} value={g}>{g / 60} hr</option>
                ))}
              </select>
            </div>
            <div className="my-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-display font-black text-white">{studyMins}</span>
                <span className="text-xs font-mono text-muted-foreground ml-1">/ {studyGoal} mins</span>
              </div>
              <button
                onClick={() => {
                  const next = Math.min(studyGoal, studyMins + 15);
                  setStudyMins(next);
                  updateMetric("study_mins", next);
                }}
                className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors text-xs font-semibold"
              >
                +15m
              </button>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
              <motion.div
                className="bg-purple-500 h-full rounded-full shadow-[0_0_8px_#8b5cf6]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (studyMins / studyGoal) * 100)}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* 9. World Clock */}
        {enabledWidgets.includes("clock") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-forge-400" />
                World Time
              </span>
              <span className="text-[10px] font-mono text-forge-300 uppercase">LOCAL ZONE</span>
            </div>
            <div className="my-2 text-center">
              <span className="text-3xl font-mono font-black text-white tracking-wider">
                {currentTime ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "12:00:00"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {currentTime ? currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : "Today"}
              </p>
            </div>
          </motion.div>
        )}

        {/* 10. Cyber Weather */}
        {enabledWidgets.includes("weather") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-400" />
                Cyber Weather
              </span>
              <span className="text-[10px] font-mono text-amber-300">NEO TOKYO</span>
            </div>
            <div className="my-2 flex items-center justify-between">
              <div>
                <span className="text-3xl font-display font-black text-white">22°C</span>
                <p className="text-xs text-muted-foreground mt-0.5">Clear Sky • Hum: 45%</p>
              </div>
              <CloudSun className="w-10 h-10 text-amber-400 animate-pulse" />
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-muted-foreground">
              <span>High: 25°C</span>
              <span>Low: 16°C</span>
              <span>AQI: 28 Good</span>
            </div>
          </motion.div>
        )}

        {/* 11. Spotify Player */}
        {enabledWidgets.includes("spotify") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Music className="w-4 h-4 text-emerald-400" />
                Spotify Stream
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                PLAYING
              </span>
            </div>
            <div className="my-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-purple-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Music className="w-6 h-6 animate-bounce" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">Deep Work Lo-Fi Beats</p>
                <p className="text-[11px] text-muted-foreground truncate">ChilledCow • Synthwave Focus</p>
              </div>
            </div>
            {/* Animated Equalizer Bars */}
            <div className="flex items-end gap-1 h-3 pt-1">
              {[40, 80, 50, 90, 60, 30, 70, 100, 50, 80, 40].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-emerald-400 rounded-full"
                  animate={{ height: [`${Math.max(20, h - 30)}%`, `${h}%`, `${Math.max(20, h - 20)}%`] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* 12. GitHub Activity */}
        {enabledWidgets.includes("github") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-forge-400" />
                GitHub Sync
              </span>
              <span className="text-[10px] font-mono text-forge-300 font-bold">STREAK: {streak.current}D</span>
            </div>
            <div className="my-2">
              <p className="text-xs font-semibold text-white">
                {dashboard.widgets.github_history?.reduce((acc, h) => acc + h.tasks_completed, 0) ?? 0} tasks completed
              </p>
              <p className="text-[11px] text-muted-foreground">repo: youvsyou/habit-engine</p>
            </div>
            <div className="flex gap-1 pt-2">
              {(dashboard.widgets.github_history || Array.from({ length: 14 }, () => ({ level: 0, active: false }))).map((item, i) => (
                <div
                  key={i}
                  title={item.active ? `Completed ${item.level} tier` : "Inactive / Before Join"}
                  className={cn(
                    "flex-1 h-3 rounded-[2px]",
                    !item.active ? "bg-white/[0.03] border border-white/5 opacity-40" :
                    item.level === 4 ? "bg-forge-500 shadow-[0_0_6px_#8b5cf6]" :
                    item.level === 3 ? "bg-forge-500/70" :
                    item.level === 2 ? "bg-forge-500/40" :
                    item.level === 1 ? "bg-forge-500/20" : "bg-white/10"
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* 13. Mini Calendar */}
        {enabledWidgets.includes("calendar") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-cyan-400" />
                July 2026
              </span>
              <span className="text-[10px] font-mono text-cyan-300">WEEK 27</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono my-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="text-muted-foreground font-bold">{d}</span>
              ))}
              {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
                <span
                  key={d}
                  className={cn(
                    "p-1 rounded font-semibold",
                    d === 5 ? "bg-cyan-500 text-[#0a0a0c] font-black shadow-[0_0_8px_#06b6d4]" : "text-white/80 hover:bg-white/5"
                  )}
                >
                  {d}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 15. Daily Wisdom Quote */}
        {enabledWidgets.includes("quote") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Daily Wisdom
              </span>
              <span className="text-[10px] font-mono text-amber-300">STOICISM</span>
            </div>
            <p className="text-xs text-amber-100 italic my-2 leading-relaxed">
              &quot;First say to yourself what you would be; and then do what you have to do.&quot;
            </p>
            <p className="text-[11px] text-amber-400 font-bold text-right">— Epictetus</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
