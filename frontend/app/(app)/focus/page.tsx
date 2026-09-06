"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { usePaywallStore } from "@/lib/stores/paywallStore";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Loader2 } from "lucide-react";
import { useDashboard } from "@/lib/queries/useDashboard";
import { usePomodoroEmail } from "@/lib/queries/useOS";
import { useFocusStore, TimerMode } from "@/lib/stores/focusStore";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  Sparkles,
  CheckCircle2,
  Flame,
  Zap,
  Maximize2,
  Minimize2,
  Coffee,
  Brain,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

const MODES: Record<TimerMode, { label: string; duration: number; icon: any; color: string }> = {
  pomodoro: { label: "Pomodoro (25m)", duration: 25 * 60, icon: Flame, color: "text-[#8B5CF6] border-[#8B5CF6] bg-[#18181D]" },
  shortBreak: { label: "Short Break (5m)", duration: 5 * 60, icon: Coffee, color: "text-[#34D399] border-[#34D399] bg-[#18181D]" },
  longBreak: { label: "Long Break (15m)", duration: 15 * 60, icon: Sparkles, color: "text-[#60A5FA] border-[#60A5FA] bg-[#18181D]" },
  deepWork: { label: "Deep Work (50m)", duration: 50 * 60, icon: Brain, color: "text-[#A78BFA] border-[#A78BFA] bg-[#18181D]" },
};

export default function FocusModePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { openPaywall } = usePaywallStore();
  const { isFreeMode } = useSubscription();

  useEffect(() => {
    if (isFreeMode) {
      openPaywall();
    }
  }, [isFreeMode, openPaywall]);

  return <FocusPageContent />;
}

function FocusPageContent() {
      const { data: dashboard } = useDashboard();
      const sendEmailMutation = usePomodoroEmail();

      const {
        mode,
        status,
        remainingTime,
        duration,
        selectedTask,
        ambientSound,
        isPlayingSound,
        setMode,
        setSelectedTask,
        setAmbientSound,
        setIsPlayingSound,
        startSession,
        pauseSession,
        resumeSession,
        resetSession,
      } = useFocusStore();

      const [isFullScreen, setIsFullScreen] = useState(false);

      const isActive = status === "running";
      const timeLeft = remainingTime;

      const toggleTimer = () => {
        if (status === "idle" || status === "completed") {
          startSession(mode, duration, selectedTask);
          toast.success("⏳ Focus protocol initiated. Telemetry email dispatched.");
          sendEmailMutation.mutate({
            task_name: selectedTask,
            start_time: new Date().toLocaleTimeString(),
            end_time: new Date(Date.now() + duration * 1000).toLocaleTimeString(),
            duration_mins: Math.round(duration / 60),
            xp_earned: 50,
            current_streak: dashboard?.today?.stats?.current_streak || 1,
            event_type: "start",
            session_type: mode,
          });
        } else if (status === "running") {
          pauseSession();
          toast("⏸️ Focus protocol paused.");
        } else if (status === "paused") {
          resumeSession();
          toast.success("▶️ Focus protocol resumed.");
        }
      };

      const resetTimer = () => {
        resetSession();
        toast("🔄 Timer reset.");
      };

      const toggleSound = (soundKey: string) => {
        if (ambientSound === soundKey && isPlayingSound) {
          setIsPlayingSound(false);
          setAmbientSound("none");
        } else {
          setAmbientSound(soundKey);
          setIsPlayingSound(true);
          toast.success(`🎧 Playing ambient soundscape: ${soundKey}`);
        }
      };

      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      };

      const progress = ((MODES[mode].duration - timeLeft) / MODES[mode].duration) * 100;

      // Extract tasks from dashboard
      const allTasks: string[] = ["Core Strategic Routine", "Deep System Code Review", "Fitness Vitality Protocol", "High-Priority Deliverable"];
      if (dashboard?.today?.routines) {
        dashboard.today.routines.forEach((r) => {
          r.tasks.forEach((t) => {
            if (!t.is_completed && !allTasks.includes(t.name)) {
              allTasks.push(t.name);
            }
          });
        });
      }

      return (
        <PageTransition className={cn("space-y-6 md:space-y-8 max-w-5xl mx-auto pb-8 md:pb-16 transition-all", isFullScreen && "fixed inset-0 z-50 p-12 max-w-none flex flex-col justify-center items-center")} style={isFullScreen ? { background: "var(--bg)" } : undefined}>
          {/* Top Bar */}
          <div 
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm w-full"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div>
              <div 
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium uppercase tracking-wider mb-1"
                style={{
                  background: "var(--accent-subtle)",
                  borderColor: "var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                <Timer className="w-3.5 h-3.5" />
                Distraction-Free Sanctuary
              </div>
              <h1 className="text-xl font-bold" style={{ color: "var(--fg)" }}>NEURAL FOCUS MODE</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2.5 rounded-xl border transition-colors hover:bg-[var(--surface-hover)]"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--fg-muted)",
                }}
                title="Toggle Fullscreen"
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {(Object.keys(MODES) as TimerMode[]).map((m) => {
              const cfg = MODES[m];
              const Icon = cfg.icon;
              const isSelected = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                  }}
                  className={cn(
                    "p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all font-medium text-xs shadow-sm",
                    isSelected
                      ? "border font-bold shadow-md"
                      : "hover:border-[var(--border)]"
                  )}
                  style={
                    isSelected
                      ? {
                          background: "var(--accent-subtle)",
                          borderColor: "var(--accent-border)",
                          color: "var(--accent)",
                        }
                      : {
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                          color: "var(--fg-muted)",
                        }
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Timer Ring */}
          <div 
            className="relative border rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center shadow-sm w-full"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="relative flex items-center justify-center my-6">
              <svg className="w-72 h-72 sm:w-80 sm:h-80 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="130"
                  stroke="currentColor"
                  className="text-[var(--border)]"
                  strokeWidth="10"
                  fill="transparent"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="130"
                  stroke="var(--accent)"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 130}
                  strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  initial={{ strokeDashoffset: 2 * Math.PI * 130 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 130 * (1 - progress / 100) }}
                  transition={{ duration: 0.5, ease: "linear" }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-6xl sm:text-7xl font-bold tracking-tighter font-mono" style={{ color: "var(--fg)" }}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest mt-2" style={{ color: "var(--accent)" }}>
                  {isActive ? "Telemetry Active" : "Ready to Execute"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full sm:w-auto">
              <button
                onClick={toggleTimer}
                className={cn(
                  "px-8 py-3 rounded-xl font-medium text-sm flex justify-center items-center gap-2.5 transition-colors shadow-sm w-full sm:w-auto"
                )}
                style={
                  isActive
                    ? {
                        background: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        color: "var(--fg)",
                        border: "1px solid var(--border)",
                      }
                    : {
                        background: "var(--accent)",
                        color: "var(--accent-fg)",
                      }
                }
              >
                {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isActive ? "PAUSE SESSION" : "START SESSION"}</span>
              </button>
              <button
                onClick={resetTimer}
                className="p-3 rounded-xl border transition-colors w-full sm:w-auto flex justify-center items-center hover:bg-[var(--surface-hover)]"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--fg-muted)",
                }}
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Task Selector & Ambient Sounds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
            {/* Task Selector */}
            <div 
              className="border rounded-3xl p-6 backdrop-blur-md shadow-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--fg-muted)" }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
                Active Target Task
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {allTasks.map((task, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      "w-full p-3 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between"
                    )}
                    style={
                      selectedTask === task
                        ? {
                            background: "var(--accent-subtle)",
                            borderColor: "var(--accent-border)",
                            color: "var(--accent)",
                            fontWeight: "bold",
                          }
                        : {
                            background: "var(--surface-raised)",
                            borderColor: "var(--border)",
                            color: "var(--fg-muted)",
                          }
                    }
                  >
                    <span>{task}</span>
                    {selectedTask === task && <Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Soundscape Generator */}
            <div 
              className="border rounded-3xl p-6 backdrop-blur-md shadow-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--fg-muted)" }}>
                  <Headphones className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  Acoustic Soundscapes
                </h3>
                {isPlayingSound && (
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                    Audio Active
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "rain", label: "Kyoto Rain", desc: "Soothing pink noise" },
                  { key: "cyberDrone", label: "Cyber Drone", desc: "Low frequency sub-bass" },
                  { key: "deltaWaves", label: "Delta Waves", desc: "220Hz neural binaural" },
                  { key: "pinkNoise", label: "Deep Atmosphere", desc: "Gentle background hum" },
                ].map((snd) => {
                  const isPlaying = ambientSound === snd.key && isPlayingSound;
                  return (
                    <button
                      key={snd.key}
                      onClick={() => toggleSound(snd.key)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all flex flex-col justify-between"
                      )}
                      style={
                        isPlaying
                          ? {
                              background: "var(--accent-subtle)",
                              borderColor: "var(--accent-border)",
                              color: "var(--accent)",
                            }
                          : {
                              background: "var(--surface-raised)",
                              borderColor: "var(--border)",
                              color: "var(--fg-muted)",
                            }
                      }
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold" style={{ color: isPlaying ? "var(--accent)" : "var(--fg)" }}>{snd.label}</span>
                        {isPlaying ? <Volume2 className="w-4 h-4" style={{ color: "var(--accent)" }} /> : <VolumeX className="w-4 h-4 opacity-50" />}
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--fg-faint)" }}>{snd.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </PageTransition>
      );
    }
