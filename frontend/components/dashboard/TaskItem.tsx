"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Sparkles, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Task } from "@/types/api";
import { useCompleteTask, useUndoCompletion } from "@/lib/queries/useDashboard";
import { useUpdateTask, useDeleteTask } from "@/lib/queries/useTasks";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const completeMutation = useCompleteTask();
  const undoMutation = useUndoCompletion();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [showPopup, setShowPopup] = useState(false);
  const [xpEarned, setXpEarned] = useState(25);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editDuration, setEditDuration] = useState(task.duration_minutes ? String(task.duration_minutes) : "");

  const toggleTask = () => {
    if (isEditing) return;
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

  const handleSaveEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!editName.trim()) {
      toast.error("Task name cannot be empty");
      return;
    }
    const durationNum = editDuration ? parseInt(editDuration, 10) : undefined;
    updateMutation.mutate(
      {
        id: task.id,
        data: {
          name: editName.trim(),
          duration_minutes: durationNum,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete habit "${task.name}"?`)) {
      deleteMutation.mutate(task.id);
    }
  };

  if (isEditing) {
    return (
      <div
        className="p-3 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--accent-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Habit name"
          autoFocus
          className="flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none transition-colors"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--fg)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveEdit();
            if (e.key === "Escape") setIsEditing(false);
          }}
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={editDuration}
            onChange={(e) => setEditDuration(e.target.value)}
            placeholder="mins"
            className="w-16 px-2 py-1.5 text-xs rounded-lg border text-center font-mono focus:outline-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") setIsEditing(false);
            }}
          />
          <button
            onClick={handleSaveEdit}
            disabled={updateMutation.isPending}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
            }}
          >
            {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Save</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
              setEditName(task.name);
              setEditDuration(task.duration_minutes ? String(task.duration_minutes) : "");
            }}
            className="p-1.5 rounded-lg text-xs hover:bg-[var(--surface-hover)] transition-colors"
            style={{ color: "var(--fg-muted)" }}
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

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

      <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
        {/* Duration badge */}
        {task.duration_minutes > 0 && !task.is_completed && (
          <div
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded shrink-0"
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

        {/* Quick Edit & Delete Actions (Always accessible on mobile, hover on desktop) */}
        <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 rounded-md transition-colors"
            style={{ color: "var(--fg-muted)" }}
            title="Edit habit"
            aria-label="Edit habit"
          >
            <Pencil className="w-3 h-3 hover:text-[var(--accent)]" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1 rounded-md transition-colors hover:text-red-500"
            style={{ color: "var(--fg-muted)" }}
            title="Delete habit"
            aria-label="Delete habit"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
