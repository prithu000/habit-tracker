"use client";

import { useState, useEffect, memo } from "react";
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
import { useCustomizationStore } from "@/lib/stores/customizationStore";
import { useFocusStore, TIMER_MODES } from "@/lib/stores/focusStore";
import { DashboardData } from "@/types/api";
import { cn } from "@/lib/utils/cn";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { DASHBOARD_QUERY_KEY } from "@/lib/queries/useDashboard";
import { useAuthStore } from "@/lib/stores/authStore";
import { WidgetBuilderModal } from "./WidgetBuilderModal";

interface DynamicWidgetsGridProps {
  dashboard: DashboardData;
  isFreeMode?: boolean;
}

export const DynamicWidgetsGrid = memo(function DynamicWidgetsGrid({ dashboard, isFreeMode = false }: DynamicWidgetsGridProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [widgetToEdit, setWidgetToEdit] = useState<any>(null);

  const { enabledWidgets, cardRadius } = useCustomizationStore();
  const activeWidgets = isFreeMode
    ? enabledWidgets.filter((w) => ["streak"].includes(w))
    : enabledWidgets;
  const { streak } = dashboard.widgets;

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

  const allWidgets = dashboard.widgets.custom_widgets || [];
  const dashboardWidgets = allWidgets.filter((w: any) => w.show_on_dashboard);
  
  const radiusClasses = {
    "16px": "rounded-xl",
    "20px": "rounded-xl",
    "24px": "rounded-2xl",
  };
  const cardCls = cn(
    "p-4 transition-colors flex flex-col justify-between relative overflow-hidden group border",
    radiusClasses[cardRadius] || "rounded-xl"
  );
  const cardStyle = {
    background: "var(--surface)",
    borderColor: "var(--border)",
    boxShadow: "var(--card-shadow)",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--fg)" }}>
            Interactive Modular Widgets
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded border"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border)",
                color: "var(--fg-faint)",
              }}
            >
              {dashboardWidgets.length} ACTIVE
            </span>
          </h2>
          <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
            Customize which productivity and lifestyle widgets appear here via Studio Control.
          </p>
        </div>
        <button
          onClick={() => { setWidgetToEdit(null); setIsBuilderOpen(true); }}
          className="px-2.5 py-1.5 rounded-lg border transition-colors text-xs font-medium flex items-center gap-1.5"
          style={{
            background: "var(--surface-raised)",
            borderColor: "var(--border)",
            color: "var(--accent)",
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Widget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        
        {/* 3. Pomodoro Clock */}
        {activeWidgets.includes("pomodoro") && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cardCls} style={cardStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-faint)" }}>
                <Clock className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                Pomodoro Clock
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase"
                style={{
                  background: "var(--accent-subtle)",
                  borderColor: "var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                {TIMER_MODES[focusMode]?.label || "Pomodoro"}
              </span>
            </div>
            <div className="my-2.5 text-center">
              <span className="text-3xl font-mono font-bold tracking-tight" style={{ color: "var(--fg)" }}>
                {formatTimer(focusRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => {
                  if (focusStatus === "idle" || focusStatus === "completed") startSession();
                  else if (focusStatus === "running") pauseSession();
                  else if (focusStatus === "paused") resumeSession();
                }}
                className="flex-1 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                style={
                  isPomoRunning
                    ? {
                        background: "var(--surface-raised)",
                        color: "var(--warning)",
                        border: "1px solid var(--border)",
                      }
                    : {
                        background: "var(--accent)",
                        color: "var(--accent-fg)",
                      }
                }
              >
                {isPomoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPomoRunning ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => resetSession()}
                className="p-1.5 rounded-lg border transition-colors"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--fg-muted)",
                }}
                title="Reset Pomodoro"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Dynamic Custom Widgets */}
        {dashboardWidgets.length === 0 && (
          <div className="col-span-full p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center text-center space-y-4 shadow-inner min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-forge-500/10 border border-forge-500/20 text-forge-400 flex items-center justify-center mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold text-white">No custom widgets yet.</h3>
            <p className="text-sm text-muted-foreground max-w-sm">Create your first habit to begin your journey.</p>
            <button onClick={() => { setWidgetToEdit(null); setIsBuilderOpen(true); }} className="btn-forge text-xs mt-2 inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Create First Widget
            </button>
          </div>
        )}
        {dashboardWidgets.map((cw: any) => {
          const Icon = cw.icon === "droplets" ? Droplets : cw.icon === "dumbbell" ? Dumbbell : cw.icon === "book-open" ? BookOpen : cw.icon === "clock" ? Clock : CheckCircle2;
          const isCompleted = cw.progress >= cw.goal;

          return (
            <motion.div 
              key={`cw-${cw.id}`} 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className={cardCls}
              style={cardStyle}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-faint)" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                  {cw.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => { setWidgetToEdit(cw); setIsBuilderOpen(true); }} className="transition-colors p-1" style={{ color: "var(--fg-faint)" }} title="Edit Widget">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase"
                    style={{
                      background: "var(--surface-raised)",
                      borderColor: "var(--border)",
                      color: "var(--fg-faint)",
                    }}
                  >
                    Goal: {cw.goal} {cw.unit}
                  </span>
                </div>
              </div>
              <div className="my-2 flex items-baseline justify-between">
                <div>
                  {isCompleted ? (
                    <>
                      <span className="text-base font-semibold flex items-center gap-1.5" style={{ color: "var(--fg)" }}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Goal Completed
                      </span>
                      <span className="text-[10px] font-mono block mt-0.5" style={{ color: "var(--fg-faint)" }}>
                        {cw.completed_at ? new Date(cw.completed_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "Today"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold font-mono" style={{ color: "var(--fg)" }}>{cw.progress}</span>
                      <span className="text-xs font-mono ml-1.5" style={{ color: "var(--fg-faint)" }}>/ {cw.goal} {cw.unit}</span>
                    </>
                  )}
                </div>
                
                {isCompleted ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase tracking-wider font-medium">
                    Done
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        const next = Math.max(0, cw.progress - cw.step_size);
                        const previousDashboard = queryClient.getQueryData<DashboardData>(DASHBOARD_QUERY_KEY(userId));
                        if (previousDashboard) {
                          const updatedDashboard = JSON.parse(JSON.stringify(previousDashboard));
                          const widgetIdx = updatedDashboard.widgets.custom_widgets.findIndex((w: any) => w.id === cw.id);
                          if (widgetIdx > -1) {
                            updatedDashboard.widgets.custom_widgets[widgetIdx].progress = next;
                            queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), updatedDashboard);
                          }
                        }
                        try {
                          await api.post(`/analytics/widgets/${cw.id}/log/`, { progress: next });
                          queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
                          queryClient.invalidateQueries({ queryKey: ["smartReports"] });
                          queryClient.invalidateQueries({ queryKey: ["analytics"] });
                        } catch (err) {
                          if (previousDashboard) queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), previousDashboard);
                          toast.error("Unable to update progress. Please try again.");
                        }
                      }}
                      className="p-1.5 rounded-md border transition-colors"
                      style={{
                        background: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        color: "var(--fg-muted)",
                      }}
                      title="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={async () => {
                        const next = Math.min(cw.goal, cw.progress + cw.step_size);
                        if (next >= cw.goal && cw.progress < cw.goal) {
                          confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
                        }
                        
                        const previousDashboard = queryClient.getQueryData<DashboardData>(DASHBOARD_QUERY_KEY(userId));
                        if (previousDashboard) {
                          const updatedDashboard = JSON.parse(JSON.stringify(previousDashboard));
                          const widgetIdx = updatedDashboard.widgets.custom_widgets.findIndex((w: any) => w.id === cw.id);
                          if (widgetIdx > -1) {
                            updatedDashboard.widgets.custom_widgets[widgetIdx].progress = next;
                            if (next >= cw.goal && !updatedDashboard.widgets.custom_widgets[widgetIdx].completed_at) {
                               updatedDashboard.widgets.custom_widgets[widgetIdx].completed_at = new Date().toISOString();
                            }
                            queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), updatedDashboard);
                          }
                        }

                        try {
                          await api.post(`/analytics/widgets/${cw.id}/log/`, { progress: next });
                          queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
                          queryClient.invalidateQueries({ queryKey: ["smartReports"] });
                          queryClient.invalidateQueries({ queryKey: ["analytics"] });
                        } catch (err) {
                          if (previousDashboard) queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), previousDashboard);
                          toast.error("Unable to update progress. Please try again.");
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-md border transition-colors text-xs font-medium flex items-center gap-1"
                      style={{
                        background: "var(--accent-subtle)",
                        borderColor: "var(--accent-border)",
                        color: "var(--accent)",
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      {cw.step_size}
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden mt-2.5" style={{ background: "var(--border)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--accent)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (cw.progress / cw.goal) * 100)}%` }}
                />
              </div>
            </motion.div>
          );
        })}

        {/* 9. World Clock */}
        {activeWidgets.includes("clock") && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cardCls} style={cardStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-faint)" }}>
                <Clock className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                World Time
              </span>
              <span className="text-[10px] font-mono uppercase" style={{ color: "var(--fg-faint)" }}>LOCAL</span>
            </div>
            <div className="my-2.5 text-center">
              <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight" style={{ color: "var(--fg)" }}>
                {currentTime ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "12:00:00"}
              </span>
              <p className="text-xs mt-1 font-mono" style={{ color: "var(--fg-muted)" }}>
                {currentTime ? currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : "Today"}
              </p>
            </div>
          </motion.div>
        )}

        {/* 8. GitHub Activity */}
        {activeWidgets.includes("github") && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cardCls} style={cardStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-faint)" }}>
                <GitCommit className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                GitHub Sync
              </span>
              <span className="text-[10px] font-mono" style={{ color: "var(--fg-faint)" }}>STREAK: {streak.current}D</span>
            </div>
            <div className="my-2">
              <p className="text-xs font-medium" style={{ color: "var(--fg)" }}>
                {dashboard.widgets.github_history?.reduce((acc, h) => acc + h.tasks_completed, 0) ?? 0} tasks completed
              </p>
              <p className="text-[10px] font-mono" style={{ color: "var(--fg-faint)" }}>repo: youvsyou/habit-engine</p>
            </div>
            <div className="flex gap-1 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              {(dashboard.widgets.github_history || Array.from({ length: 14 }, () => ({ level: 0, active: false }))).map((item, i) => (
                <div
                  key={i}
                  title={item.active ? `Completed ${item.level} tier` : "Inactive"}
                  className="flex-1 h-2.5 rounded-[2px]"
                  style={{
                    background: !item.active
                      ? "var(--surface-raised)"
                      : item.level >= 3
                      ? "var(--accent)"
                      : "var(--accent-subtle)",
                    border: !item.active ? "1px solid var(--border)" : "none",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* 13. Mini Calendar */}
        {activeWidgets.includes("calendar") && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cardCls} style={cardStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-faint)" }}>
                <CalendarIcon className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                Calendar
              </span>
              <span className="text-[10px] font-mono" style={{ color: "var(--fg-faint)" }}>JULY 2026</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono my-1.5">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="font-medium" style={{ color: "var(--fg-faint)" }}>{d}</span>
              ))}
              {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
                <span
                  key={d}
                  className="p-1 rounded font-medium"
                  style={
                    d === 5
                      ? { background: "var(--accent)", color: "var(--accent-fg)", fontWeight: "bold" }
                      : { color: "var(--fg-muted)" }
                  }
                >
                  {d}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 15. Daily Wisdom Quote */}
        {activeWidgets.includes("quote") && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cardCls} style={cardStyle}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-faint)" }}>
                <Award className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                Daily Wisdom
              </span>
              <span className="text-[10px] font-mono" style={{ color: "var(--fg-faint)" }}>STOICISM</span>
            </div>
            <p className="text-xs italic my-2 leading-relaxed font-normal" style={{ color: "var(--fg-muted)" }}>
              &quot;First say to yourself what you would be; and then do what you have to do.&quot;
            </p>
            <p className="text-[11px] font-medium text-right" style={{ color: "var(--fg-faint)" }}>— Epictetus</p>
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
