"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Droplets,
  Plus,
  Minus,
  Clock,
  GitCommit,
  Calendar as CalendarIcon,
  Flame,
  Award,
  BookOpen,
  Dumbbell,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useCustomizationStore, WidgetId } from "@/lib/stores/customizationStore";
import { useFocusStore, TIMER_MODES } from "@/lib/stores/focusStore";
import { DashboardData } from "@/types/api";
import { cn } from "@/lib/utils/cn";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DASHBOARD_QUERY_KEY } from "@/lib/queries/useDashboard";
import { useAuthStore } from "@/lib/stores/authStore";

interface DynamicWidgetsGridProps {
  dashboard: DashboardData;
  isFreeMode?: boolean;
}

import { memo } from "react";
import { WidgetBuilderModal } from "./WidgetBuilderModal";

export const DynamicWidgetsGrid = memo(function DynamicWidgetsGrid({ dashboard, isFreeMode = false }: DynamicWidgetsGridProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [widgetToEdit, setWidgetToEdit] = useState<any>(null);

  const { enabledWidgets, cardRadius } = useCustomizationStore();
  const activeWidgets = isFreeMode
    ? enabledWidgets.filter((w) => ["xp", "level", "streak"].includes(w))
    : enabledWidgets;
  const { xp, streak } = dashboard.widgets;

  const {
    mode: focusMode,
    status: focusStatus,
    remainingTime: focusRemaining,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
  } = useFocusStore();
  const isPomoRunning = focusStatus === "running";

  // Clock State
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Water Tracker State (Strict Server State)
  

  
  
  const allWidgets = dashboard.widgets.custom_widgets || [];
  const dashboardWidgets = allWidgets.filter((w: any) => w.show_on_dashboard);
  
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
              {activeWidgets.length + dashboardWidgets.length} ACTIVE
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Customize which productivity and lifestyle widgets appear here via Studio Control.
          </p>
        </div>
        <button
          onClick={() => { setWidgetToEdit(null); setIsBuilderOpen(true); }}
          className="px-3 py-1.5 rounded-lg bg-forge-500/20 hover:bg-forge-500/30 text-forge-300 border border-forge-500/40 transition-colors text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          New Widget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. XP & Level Ring Widget */}
        {activeWidgets.includes("xp") && (
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
        {activeWidgets.includes("level") && (
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

        {/* 3. Pomodoro Clock */}
        {activeWidgets.includes("pomodoro") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-400" />
                Pomodoro Clock
              </span>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase",
                focusMode === "pomodoro" || focusMode === "deepWork" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}>
                {TIMER_MODES[focusMode]?.label || "Pomodoro"}
              </span>
            </div>
            <div className="my-3 text-center">
              <span className="text-4xl font-mono font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                {formatTimer(focusRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  if (focusStatus === "idle" || focusStatus === "completed") startSession();
                  else if (focusStatus === "running") pauseSession();
                  else if (focusStatus === "paused") resumeSession();
                }}
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
                onClick={() => resetSession()}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                title="Reset Pomodoro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
        {/* Dynamic Custom Widgets */}
        {dashboardWidgets.map((cw: any) => {
          const colorMap: Record<string, string> = {
            "blue-400": "bg-blue-500 text-blue-300 border-blue-500/40 shadow-[0_0_8px_#3b82f6]",
            "cyan-400": "bg-cyan-500 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_#06b6d4]",
            "rose-400": "bg-rose-500 text-rose-300 border-rose-500/40 shadow-[0_0_8px_#f43f5e]",
            "purple-400": "bg-purple-500 text-purple-300 border-purple-500/40 shadow-[0_0_8px_#8b5cf6]",
            "emerald-400": "bg-emerald-500 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_#10b981]",
            "amber-400": "bg-amber-500 text-amber-300 border-amber-500/40 shadow-[0_0_8px_#f59e0b]",
            "forge-400": "bg-forge-500 text-forge-300 border-forge-500/40 shadow-[0_0_8px_#8b5cf6]"
          };
          const baseColor = colorMap[cw.color] || colorMap["blue-400"];
          const Icon = cw.icon === "droplets" ? Droplets : cw.icon === "dumbbell" ? Dumbbell : cw.icon === "book-open" ? BookOpen : cw.icon === "clock" ? Clock : CheckCircle2;

          const isCompleted = cw.progress >= cw.goal;

          return (
            <motion.div 
              key={`cw-${cw.id}`} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className={cn(cardCls, isCompleted && "shadow-[0_0_20px_rgba(255,255,255,0.05)] border-white/20")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Icon className={cn("w-4 h-4", `text-${cw.color}`)} style={{ color: cw.color === 'blue-400' ? '#60a5fa' : cw.color === 'cyan-400' ? '#22d3ee' : cw.color === 'rose-400' ? '#fb7185' : cw.color === 'purple-400' ? '#c084fc' : cw.color === 'emerald-400' ? '#34d399' : cw.color === 'amber-400' ? '#fbbf24' : '#a78bfa' }} />
                  {cw.name}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setWidgetToEdit(cw); setIsBuilderOpen(true); }} className="text-white/30 hover:text-white transition-colors" title="Edit Widget">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10 uppercase">
                    Goal: {cw.goal} {cw.unit}
                  </span>
                </div>
              </div>
              <div className="my-2 flex items-baseline justify-between">
                <div>
                  {isCompleted ? (
                    <>
                      <span className="text-xl font-display font-black text-white flex items-center gap-1">🎉 Goal Completed!</span>
                      <span className="text-[11px] font-mono text-muted-foreground block mt-1">
                        Completed at: {cw.completed_at ? new Date(cw.completed_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "Just now"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-display font-black text-white">{cw.progress}</span>
                      <span className="text-xs font-mono text-muted-foreground ml-1">/ {cw.goal} {cw.unit}</span>
                    </>
                  )}
                </div>
                
                {isCompleted ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed Today
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async () => {
                        const next = Math.max(0, cw.progress - cw.step_size);
                        await api.post(`/analytics/widgets/${cw.id}/log/`, { progress: next });
                        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
                        queryClient.invalidateQueries({ queryKey: ["smartReports"] });
                        queryClient.invalidateQueries({ queryKey: ["analytics"] });
                      }}
                      className={cn(
                        "p-2 rounded-xl border transition-colors flex items-center justify-center",
                        `bg-${cw.color.replace("-400", "-500")}/10 hover:bg-${cw.color.replace("-400", "-500")}/20 text-${cw.color} border-${cw.color.replace("-400", "-500")}/30`
                      )}
                      style={{ color: cw.color === 'blue-400' ? '#60a5fa' : cw.color === 'cyan-400' ? '#22d3ee' : cw.color === 'rose-400' ? '#fb7185' : cw.color === 'purple-400' ? '#c084fc' : cw.color === 'emerald-400' ? '#34d399' : cw.color === 'amber-400' ? '#fbbf24' : '#a78bfa', borderColor: cw.color === 'blue-400' ? 'rgba(96,165,250,0.3)' : cw.color === 'cyan-400' ? 'rgba(34,211,238,0.3)' : cw.color === 'rose-400' ? 'rgba(251,113,133,0.3)' : cw.color === 'purple-400' ? 'rgba(192,132,252,0.3)' : cw.color === 'emerald-400' ? 'rgba(52,211,153,0.3)' : cw.color === 'amber-400' ? 'rgba(251,191,36,0.3)' : 'rgba(167,139,250,0.3)', backgroundColor: cw.color === 'blue-400' ? 'rgba(96,165,250,0.1)' : cw.color === 'cyan-400' ? 'rgba(34,211,238,0.1)' : cw.color === 'rose-400' ? 'rgba(251,113,133,0.1)' : cw.color === 'purple-400' ? 'rgba(192,132,252,0.1)' : cw.color === 'emerald-400' ? 'rgba(52,211,153,0.1)' : cw.color === 'amber-400' ? 'rgba(251,191,36,0.1)' : 'rgba(167,139,250,0.1)' }}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        const next = Math.min(cw.goal, cw.progress + cw.step_size);
                        if (next >= cw.goal && cw.progress < cw.goal) {
                          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                        }
                        await api.post(`/analytics/widgets/${cw.id}/log/`, { progress: next });
                        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
                        queryClient.invalidateQueries({ queryKey: ["smartReports"] });
                        queryClient.invalidateQueries({ queryKey: ["analytics"] });
                      }}
                      className={cn(
                        "px-3 py-2 rounded-xl border transition-colors text-xs font-semibold flex items-center gap-1",
                        `bg-${cw.color.replace("-400", "-500")}/20 hover:bg-${cw.color.replace("-400", "-500")}/30 text-${cw.color} border-${cw.color.replace("-400", "-500")}/40`
                      )}
                      style={{ color: cw.color === 'blue-400' ? '#60a5fa' : cw.color === 'cyan-400' ? '#22d3ee' : cw.color === 'rose-400' ? '#fb7185' : cw.color === 'purple-400' ? '#c084fc' : cw.color === 'emerald-400' ? '#34d399' : cw.color === 'amber-400' ? '#fbbf24' : '#a78bfa', borderColor: cw.color === 'blue-400' ? 'rgba(96,165,250,0.4)' : cw.color === 'cyan-400' ? 'rgba(34,211,238,0.4)' : cw.color === 'rose-400' ? 'rgba(251,113,133,0.4)' : cw.color === 'purple-400' ? 'rgba(192,132,252,0.4)' : cw.color === 'emerald-400' ? 'rgba(52,211,153,0.4)' : cw.color === 'amber-400' ? 'rgba(251,191,36,0.4)' : 'rgba(167,139,250,0.4)', backgroundColor: cw.color === 'blue-400' ? 'rgba(96,165,250,0.2)' : cw.color === 'cyan-400' ? 'rgba(34,211,238,0.2)' : cw.color === 'rose-400' ? 'rgba(251,113,133,0.2)' : cw.color === 'purple-400' ? 'rgba(192,132,252,0.2)' : cw.color === 'emerald-400' ? 'rgba(52,211,153,0.2)' : cw.color === 'amber-400' ? 'rgba(251,191,36,0.2)' : 'rgba(167,139,250,0.2)' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {cw.step_size}
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: cw.color === 'blue-400' ? '#60a5fa' : cw.color === 'cyan-400' ? '#22d3ee' : cw.color === 'rose-400' ? '#fb7185' : cw.color === 'purple-400' ? '#c084fc' : cw.color === 'emerald-400' ? '#34d399' : cw.color === 'amber-400' ? '#fbbf24' : '#a78bfa' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (cw.progress / cw.goal) * 100)}%` }}
                />
              </div>
            </motion.div>
          );
        })}

        {/* 9. World Clock */}
        {activeWidgets.includes("clock") && (
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

        {/* 8. GitHub Activity */}
        {activeWidgets.includes("github") && (
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
        {activeWidgets.includes("calendar") && (
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
        {activeWidgets.includes("quote") && (
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

      <WidgetBuilderModal 
        isOpen={isBuilderOpen} 
        onClose={() => setIsBuilderOpen(false)} 
        widgetToEdit={widgetToEdit} 
        existingWidgets={allWidgets}
      />
    </div>
  );
});
