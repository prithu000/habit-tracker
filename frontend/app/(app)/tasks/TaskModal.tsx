"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, Tag, Repeat, Sparkles } from "lucide-react";
import { Task, TaskCategory, TaskFrequency } from "@/types/api";
import { useCreateTask, useUpdateTask } from "@/lib/queries/useTasks";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultCategory?: TaskCategory;
}

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: "fitness", label: "Fitness" },
  { value: "learning", label: "Learning" },
  { value: "work", label: "Work" },
  { value: "mental_health", label: "Mental Health" },
  { value: "health", label: "Health" },
  { value: "sleep", label: "Sleep" },
  { value: "finance", label: "Finance" },
  { value: "personal", label: "Personal" },
  { value: "discipline", label: "Discipline" },
];

export function TaskModal({
  isOpen,
  onClose,
  taskToEdit,
  defaultCategory = "personal",
}: TaskModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>(defaultCategory);
  const [frequency, setFrequency] = useState<TaskFrequency>("daily");
  const [duration, setDuration] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setDescription(taskToEdit.description || "");
      setCategory(taskToEdit.category || "personal");
      setFrequency(taskToEdit.frequency || "daily");
      setDuration(taskToEdit.duration_minutes ? String(taskToEdit.duration_minutes) : "");
      setDueDate(taskToEdit.due_date || "");
    } else {
      setName("");
      setDescription("");
      setCategory(defaultCategory);
      setFrequency("daily");
      setDuration("");
      setDueDate("");
    }
  }, [taskToEdit, defaultCategory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      frequency,
      duration_minutes: duration ? parseInt(duration, 10) : undefined,
      due_date: dueDate || null,
    };

    if (taskToEdit) {
      updateTask(
        { id: taskToEdit.id, data: payload },
        { onSuccess: () => onClose() }
      );
    } else {
      createTask(payload, { onSuccess: () => onClose() });
    }
  };

  if (!isOpen) return null;

  const isPending = isCreating || isUpdating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden z-10"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--fg)",
          }}
        >
          {/* Header */}
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>
                {taskToEdit ? "Edit Task" : "Create New Task"}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                Categorize across the 9 Life Score disciplines.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: "var(--fg-muted)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--fg-muted)" }}>
                Task Name <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 45-min Deep Focus Sprint"
                required
                autoFocus
                className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--fg-muted)" }}>
                Description <span className="font-normal" style={{ color: "var(--fg-faint)" }}>(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context, instructions, or target milestones..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors resize-none"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              />
            </div>

            {/* Category & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--fg-muted)" }}>
                  <Tag className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                  <span>Category</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                  style={{
                    background: "var(--surface-raised)",
                    borderColor: "var(--border)",
                    color: "var(--fg)",
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} style={{ background: "var(--surface)", color: "var(--fg)" }}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--fg-muted)" }}>
                  <Repeat className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                  <span>Frequency</span>
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as TaskFrequency)}
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                  style={{
                    background: "var(--surface-raised)",
                    borderColor: "var(--border)",
                    color: "var(--fg)",
                  }}
                >
                  <option value="daily" style={{ background: "var(--surface)", color: "var(--fg)" }}>Daily</option>
                  <option value="weekly" style={{ background: "var(--surface)", color: "var(--fg)" }}>Weekly</option>
                  <option value="anytime" style={{ background: "var(--surface)", color: "var(--fg)" }}>Anytime</option>
                </select>
              </div>
            </div>

            {/* Duration & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--fg-muted)" }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                  <span>Duration (Minutes)</span>
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 30"
                  min="1"
                  max="480"
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                  style={{
                    background: "var(--surface-raised)",
                    borderColor: "var(--border)",
                    color: "var(--fg)",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--fg-muted)" }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                  <span>Due Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                  style={{
                    background: "var(--surface-raised)",
                    borderColor: "var(--border)",
                    color: "var(--fg)",
                  }}
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                style={{ color: "var(--fg-muted)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isPending}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 shadow-sm"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                }}
              >
                {isPending ? "Saving..." : taskToEdit ? "Update Task" : "Create Task"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
