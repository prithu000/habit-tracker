"use client";

import React, { useState } from "react";
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
  pomodoro: { label: "Pomodoro (25m)", duration: 25 * 60, icon: Flame, color: "text-purple-400 border-purple-500/50 bg-purple-500/10" },
  shortBreak: { label: "Short Break (5m)", duration: 5 * 60, icon: Coffee, color: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10" },
  longBreak: { label: "Long Break (15m)", duration: 15 * 60, icon: Sparkles, color: "text-blue-400 border-blue-500/50 bg-blue-500/10" },
  deepWork: { label: "Deep Work (50m)", duration: 50 * 60, icon: Brain, color: "text-rose-400 border-rose-500/50 bg-rose-500/10" },
};

export default function FocusPage() {
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
    <PageTransition className={cn("space-y-8 max-w-5xl mx-auto pb-16 transition-all", isFullScreen && "fixed inset-0 z-50 bg-zinc-950 p-12 max-w-none flex flex-col justify-center items-center")}>
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/80 backdrop-blur-xl shadow-xl w-full">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Timer className="w-3.5 h-3.5" />
            Distraction-Free Sanctuary
          </div>
          <h1 className="text-2xl font-black text-white">NEURAL FOCUS MODE</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700/50"
            title="Toggle Fullscreen"
          >
            {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
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
                "p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all font-bold text-sm",
                isSelected
                  ? cn("border-2 shadow-lg scale-[1.02]", cfg.color)
                  : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Timer Ring */}
      <div className="relative bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border border-zinc-800/80 rounded-3xl p-12 flex flex-col items-center justify-center shadow-2xl w-full">
        <div className="relative flex items-center justify-center my-6">
          <svg className="w-72 h-72 sm:w-80 sm:h-80 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="130"
              stroke="currentColor"
              strokeWidth="14"
              className="text-zinc-800/80"
              fill="transparent"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="130"
              stroke="url(#focusGradient)"
              strokeWidth="14"
              strokeDasharray={2 * Math.PI * 130}
              strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
              strokeLinecap="round"
              fill="transparent"
              initial={{ strokeDashoffset: 2 * Math.PI * 130 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 130 * (1 - progress / 100) }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-6xl sm:text-7xl font-black tracking-tighter text-white font-mono drop-shadow-lg">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mt-2">
              {isActive ? "Telemetry Active" : "Ready to Execute"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={toggleTimer}
            className={cn(
              "px-8 py-4 rounded-2xl font-black text-base flex items-center gap-3 transition-all shadow-lg transform active:scale-95",
              isActive
                ? "bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-amber-500/20"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30"
            )}
          >
            {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            <span>{isActive ? "PAUSE SESSION" : "START SESSION"}</span>
          </button>
          <button
            onClick={resetTimer}
            className="p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700/50"
            title="Reset Timer"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Task Selector & Ambient Sounds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Task Selector */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            Active Target Task
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {allTasks.map((task, i) => (
              <button
                key={i}
                onClick={() => setSelectedTask(task)}
                className={cn(
                  "w-full p-3 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between",
                  selectedTask === task
                    ? "bg-purple-500/20 border-purple-500/50 text-white font-bold"
                    : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                <span>{task}</span>
                {selectedTask === task && <Sparkles className="w-4 h-4 text-purple-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Ambient Soundscape Generator */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Headphones className="w-4 h-4 text-indigo-400" />
              Acoustic Soundscapes
            </h3>
            {isPlayingSound && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
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
                    "p-3 rounded-xl border text-left transition-all flex flex-col justify-between",
                    isPlaying
                      ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                      : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{snd.label}</span>
                    {isPlaying ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
                  </div>
                  <span className="text-[10px] text-zinc-500">{snd.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
