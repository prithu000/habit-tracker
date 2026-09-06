"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Sparkles } from "lucide-react";
import { Task } from "@/types/api";
import { useCompleteTask, useUndoCompletion } from "@/lib/queries/useDashboard";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const completeMutation = useCompleteTask();
  const undoMutation = useUndoCompletion();
  const [showPopup, setShowPopup] = useState(false);
  const [xpEarned, setXpEarned] = useState(25);

  const toggleTask = () => {
    if (task.is_completed) {
      if (task.completion_id) {
        undoMutation.mutate(task.completion_id);
      } else {
        toast.error("Cannot undo task right now.");
      }
    } else {
      setXpEarned(25);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
      completeMutation.mutate(
        { taskId: task.id },
        {
          onSuccess: (data) => {
            if (data && typeof data.xp_earned === "number") {
              setXpEarned(data.xp_earned);
            }
          },
        }
      );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      onClick={toggleTask}
      className="group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none"
      style={{
        background: task.is_completed ? "var(--surface-raised)" : "var(--surface)",
        borderColor: task.is_completed ? "var(--border-subtle)" : "var(--border)",
        opacity: task.is_completed ? 0.65 : 1,
      }}
      onMouseEnter={(e) => {
        if (!task.is_completed) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
          (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = task.is_completed
          ? "var(--border-subtle)"
          : "var(--border)";
        (e.currentTarget as HTMLElement).style.background = task.is_completed
          ? "var(--surface-raised)"
          : "var(--surface)";
      }}
    >
      {/* XP Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -36, scale: 0.8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute -top-4 left-4 z-50 flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] whitespace-nowrap pointer-events-none shadow-md"
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <Sparkles className="w-3 h-3 fill-current" />
            <span>+{xpEarned} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Checkbox */}
        <div
          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all"
          style={
            task.is_completed
              ? {
                  background: "var(--accent)",
                  borderColor: "var(--accent)",
                  color: "var(--accent-fg)",
                }
              : {
                  background: "transparent",
                  borderColor: "var(--border)",
                }
          }
        >
          <motion.div
            initial={false}
            animate={{ scale: task.is_completed ? 1 : 0, opacity: task.is_completed ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </motion.div>
        </div>

        {/* Task content */}
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-medium text-xs truncate transition-colors"
            style={{
              color: task.is_completed ? "var(--fg-faint)" : "var(--fg)",
              textDecoration: task.is_completed ? "line-through" : "none",
            }}
          >
            {task.name}
          </span>
          {task.description && !task.is_completed && (
            <span
              className="text-[11px] mt-0.5 truncate font-normal"
              style={{ color: "var(--fg-faint)" }}
            >
              {task.description}
            </span>
          )}
        </div>
      </div>

      {/* Duration badge */}
      {task.duration_minutes > 0 && !task.is_completed && (
        <div
          className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ml-2.5"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg-faint)",
          }}
        >
          <Clock className="w-3 h-3" />
          <span>{task.duration_minutes}m</span>
        </div>
      )}
    </motion.div>
  );
}
