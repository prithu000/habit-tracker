"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useFocusStore, TIMER_MODES } from "@/lib/stores/focusStore";
import { useDashboard } from "@/lib/queries/useDashboard";
import { usePomodoroEmail } from "@/lib/queries/useOS";
import { Play, Pause, Square, Flame, Coffee, Sparkles, Brain, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

export function GlobalFocusController() {
  const router = useRouter();
  const pathname = usePathname();
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
    tick,
    pauseSession,
    resumeSession,
    stopSession,
  } = useFocusStore();

  const prevStatusRef = useRef(status);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Web Audio API Ambient Sound Generator (Persistent across all routes)
  useEffect(() => {
    if (isPlayingSound && ambientSound !== "none") {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (ambientSound === "pinkNoise" || ambientSound === "rain") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(110, ctx.currentTime); // A2 note frequency
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
        } else if (ambientSound === "cyberDrone") {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(55, ctx.currentTime); // Deep cyber sub-bass
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
        } else if (ambientSound === "deltaWaves") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
      } catch (e) {
        console.error("Audio Web API error:", e);
      }
    } else {
      if (oscRef.current) {
        try { oscRef.current.stop(); oscRef.current.disconnect(); } catch (e) {}
        oscRef.current = null;
      }
    }
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (e) {}
      }
    };
  }, [isPlayingSound, ambientSound]);

  // Background tick interval (every 500ms for responsiveness)
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 500);
    return () => clearInterval(interval);
  }, [tick]);

  // Browser Tab Title Sync
  useEffect(() => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (status === "running") {
      document.title = `🍅 ${formatTime(remainingTime)} • Focus`;
    } else if (status === "paused") {
      document.title = `⏸️ ${formatTime(remainingTime)} • Focus (Paused)`;
    } else {
      document.title = "YOU VS YOU • Personal Operating System";
    }

    return () => {
      document.title = "YOU VS YOU • Personal Operating System";
    };
  }, [status, remainingTime]);

  // Handle completion effects when status transitions to "completed"
  useEffect(() => {
    if (prevStatusRef.current !== "completed" && status === "completed") {
      const modeConfig = TIMER_MODES[mode] || { label: "Session", duration: 1500 };
      toast.success(`🎉 ${modeConfig.label} completed! +50 XP Generated!`);

      // Play triumphant 4-note Web Audio chime
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.15, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.8);
        });
      } catch (e) {
        console.error("Failed to play completion chime:", e);
      }

      // Send telemetry email
      sendEmailMutation.mutate({
        task_name: selectedTask,
        start_time: new Date(Date.now() - duration * 1000).toLocaleTimeString(),
        end_time: new Date().toLocaleTimeString(),
        duration_mins: Math.round(duration / 60),
        xp_earned: 50,
        current_streak: dashboard?.today?.stats?.current_streak || 1,
        event_type: "end",
        session_type: mode,
      });

      // After 3 seconds, reset to idle
      const timer = setTimeout(() => {
        stopSession();
      }, 3000);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = status;
  }, [status, mode, duration, selectedTask, dashboard, sendEmailMutation, stopSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getModeIcon = () => {
    switch (mode) {
      case "pomodoro": return <Flame className="w-4 h-4 text-purple-400" />;
      case "shortBreak": return <Coffee className="w-4 h-4 text-emerald-400" />;
      case "longBreak": return <Sparkles className="w-4 h-4 text-blue-400" />;
      case "deepWork": return <Brain className="w-4 h-4 text-rose-400" />;
      default: return <Flame className="w-4 h-4 text-purple-400" />;
    }
  };

  if (status === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full sm:w-80 hidden lg:block"
      >
        <div
          onClick={() => {
            if (pathname !== "/focus") {
              router.push("/focus");
            }
          }}
          className={cn(
            "p-4 rounded-2xl bg-[#0a0a0c]/90 backdrop-blur-2xl border border-purple-500/40 hover:border-purple-500/80 shadow-[0_10px_40px_rgba(139,92,246,0.3)] transition-all cursor-pointer group flex items-center justify-between gap-3 relative overflow-hidden",
            status === "completed" && "border-emerald-500/60 shadow-[0_10px_40px_rgba(16,185,129,0.3)]"
          )}
        >
          {/* Subtle animated background glow */}
          <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-purple-600/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-purple-500/20 transition-colors">
              {getModeIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 truncate flex items-center gap-1">
                  🍅 Focus Session
                </span>
                {pathname !== "/focus" && (
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                )}
              </div>
              <p className="text-xs text-white font-medium truncate mt-0.5" title={selectedTask}>
                {selectedTask}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 shrink-0">
            <div className="text-right mr-1">
              <span className="text-lg font-mono font-black tracking-tight text-white block leading-none">
                {formatTime(remainingTime)}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block mt-0.5">
                {status === "paused" ? "PAUSED" : status === "completed" ? "DONE" : "LIVE"}
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (status === "running") pauseSession();
                  else if (status === "paused") resumeSession();
                }}
                className={cn(
                  "p-2 rounded-xl border transition-all flex items-center justify-center",
                  status === "running"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                    : "bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30"
                )}
                title={status === "running" ? "Pause" : "Resume"}
              >
                {status === "running" ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stopSession();
                }}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                title="Stop Session"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
