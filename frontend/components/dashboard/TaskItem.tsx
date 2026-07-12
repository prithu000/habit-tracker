"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Sparkles } from "lucide-react";
import { Task } from "@/types/api";
import { useCompleteTask, useUndoCompletion } from "@/lib/queries/useDashboard";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const completeMutation = useCompleteTask();
  const undoMutation = useUndoCompletion();
  const [showPopup, setShowPopup] = useState(false);

  const toggleTask = () => {
    if (task.is_completed) {
      if (task.completion_id) {
        undoMutation.mutate(task.completion_id);
      } else {
        toast.error("Cannot undo task right now.");
      }
    } else {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
      completeMutation.mutate({ taskId: task.id });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.005, x: 2 }}
      whileTap={{ scale: 0.995 }}
      onClick={toggleTask}
      className={cn(
        "group relative flex items-center justify-between p-3.5 rounded-xl border transition-colors duration-200 cursor-pointer select-none",
        task.is_completed
          ? "bg-emerald-500/[0.04] border-emerald-500/20 text-muted-foreground"
          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-forge-500/40 shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-foreground"
      )}
    >
      {/* Animated XP & Coin Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -38, scale: 1.1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="absolute -top-6 left-4 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-zinc-950 font-black text-[11px] shadow-lg shadow-purple-500/50 whitespace-nowrap pointer-events-none border border-amber-300"
          >
            <Sparkles className="w-3 h-3 fill-current" />
            <span>+25 XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Checkbox with Ripple & Neon Glow */}
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 relative overflow-hidden",
            task.is_completed
              ? "border-emerald-500 bg-emerald-500 text-[#0a0a0c] shadow-[0_0_15px_rgba(16,185,129,0.6)] scale-105"
              : "border-white/20 group-hover:border-forge-400 group-hover:bg-forge-500/10"
          )}
        >
          {/* Pure CSS Ripple effect on hover when not completed (0 JS/Framer Motion layout thrashing) */}
          {!task.is_completed && (
            <div className="absolute inset-0 bg-forge-500/20 rounded-lg scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-30 transition-transform duration-300 pointer-events-none" />
          )}

          <motion.div
            initial={false}
            animate={{
              scale: task.is_completed ? 1 : 0,
              opacity: task.is_completed ? 1 : 0,
              rotate: task.is_completed ? 0 : -45,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Check className="h-4 w-4" strokeWidth={3.5} />
          </motion.div>
        </div>

        {/* Task Content */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-semibold transition-all duration-200 text-xs sm:text-sm truncate",
                task.is_completed
                  ? "text-muted-foreground/60 line-through decoration-emerald-500/50"
                  : "text-foreground group-hover:text-white"
              )}
            >
              {task.name}
            </span>
            {task.is_completed && (
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0 animate-pulse" />
            )}
          </div>
          {task.description && !task.is_completed && (
            <span className="text-[11px] text-muted-foreground mt-0.5 truncate font-normal">
              {task.description}
            </span>
          )}
        </div>
      </div>

      {/* Duration badge */}
      {task.duration_minutes > 0 && !task.is_completed && (
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-muted-foreground bg-white/5 border border-white/10 px-2 py-1 rounded-lg shrink-0 ml-3 transition-colors group-hover:bg-forge-500/10 group-hover:text-forge-300 group-hover:border-forge-500/30">
          <Clock className="w-3 h-3" />
          <span>{task.duration_minutes}m</span>
        </div>
      )}
    </motion.div>
  );
}
