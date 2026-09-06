"use client";

import { CategoryBlock, TaskCategory, TaskFrequency } from "@/types/api";
import { TaskItem } from "./TaskItem";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, BookOpen, Briefcase, Brain, HeartPulse,
  Moon, Wallet, User, Shield, CheckCircle2,
  ChevronDown, ChevronUp, Plus, Clock, ListTodo,
} from "lucide-react";
import { useState, memo } from "react";
import { useCustomizationStore } from "@/lib/stores/customizationStore";
import { useCreateTask } from "@/lib/queries/useTasks";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { MobileAddTaskSheet } from "./MobileAddTaskSheet";

const CATEGORY_ICONS: Record<string, any> = {
  fitness: Activity,
  learning: BookOpen,
  work: Briefcase,
  mental_health: Brain,
  health: HeartPulse,
  sleep: Moon,
  finance: Wallet,
  personal: User,
  discipline: Shield,
};

interface CategorySectionProps {
  category: CategoryBlock;
}

export const CategorySection = memo(function CategorySection({ category }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("");
  const [newTaskFrequency, setNewTaskFrequency] = useState<TaskFrequency>("daily");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { animationsEnabled } = useCustomizationStore();
  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask();

  const IconComponent = CATEGORY_ICONS[category.category] || ListTodo;

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    createTask({
      name: newTaskName.trim(),
      category: category.category,
      frequency: newTaskFrequency,
      duration_minutes: newTaskDuration ? parseInt(newTaskDuration, 10) : undefined,
    });
    setNewTaskName("");
    setNewTaskDuration("");
    setNewTaskFrequency("daily");
    setIsAddingTask(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddTask(); }
    else if (e.key === "Escape") { setIsAddingTask(false); }
  };

  const handleAddTaskClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) { setIsMobileSheetOpen(true); }
    else { setIsExpanded(true); setIsAddingTask(true); }
  };

  const handleMobileAddTask = (name: string, duration: number, _priority: string, repeat: string) => {
    const freq: TaskFrequency =
      repeat.toLowerCase() === "daily" ? "daily"
      : repeat.toLowerCase() === "weekly" ? "weekly"
      : "anytime";
    createTask({ name: name.trim(), category: category.category, frequency: freq, duration_minutes: duration || undefined });
    setIsMobileSheetOpen(false);
  };

  return (
    <motion.div
      whileHover={animationsEnabled ? { y: -1, transition: { duration: 0.15 } } : undefined}
      className="overflow-hidden mb-3 group relative rounded-xl transition-all"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer select-none transition-colors"
        style={{ borderBottom: isExpanded ? "1px solid var(--border-subtle)" : "none" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--fg-faint)",
            }}
          >
            <IconComponent className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="text-xs sm:text-sm font-semibold tracking-tight truncate"
                style={{ color: "var(--fg)" }}
              >
                {category.label}
              </h3>
              {category.is_complete && (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--success)" }} />
              )}
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--fg-faint)" }}>
              {category.completed_count} of {category.task_count} completed
            </p>
          </div>
        </div>

        {/* Right: progress + add + chevron */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-20 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${category.completion_rate}%`, background: "var(--accent)" }}
              />
            </div>
            <span className="text-[10px] font-mono min-w-[28px] text-right" style={{ color: "var(--fg-faint)" }}>
              {Math.round(category.completion_rate)}%
            </span>
          </div>

          <button
            onClick={handleAddTaskClick}
            className="p-1.5 rounded-md transition-colors"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--fg-muted)",
            }}
            title="Add task to this category"
          >
            <Plus className="w-3 h-3" />
          </button>

          <div style={{ color: "var(--fg-faint)" }}>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* Expandable Task List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-3 sm:p-3.5 space-y-1.5">
              {category.tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}

              {/* Inline Add Form */}
              {isAddingTask && (
                <div
                  className="p-3 rounded-xl space-y-2.5 animate-in fade-in duration-150"
                  style={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Task name..."
                    autoFocus
                    className="forge-input text-xs"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          color: "var(--fg-muted)",
                        }}
                      >
                        <Clock className="w-3 h-3" style={{ color: "var(--fg-faint)" }} />
                        <input
                          type="number"
                          value={newTaskDuration}
                          onChange={(e) => setNewTaskDuration(e.target.value)}
                          placeholder="Mins"
                          min="1"
                          max="300"
                          className="w-12 bg-transparent outline-none text-[11px]"
                          style={{ color: "var(--fg)" }}
                        />
                      </div>
                      <select
                        value={newTaskFrequency}
                        onChange={(e) => setNewTaskFrequency(e.target.value as TaskFrequency)}
                        className="text-[11px] px-2 py-1 rounded-lg outline-none"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          color: "var(--fg-muted)",
                        }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="anytime">Anytime</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => setIsAddingTask(false)}
                        className="px-2.5 py-1 text-[11px] rounded-lg transition-colors"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddTask}
                        disabled={!newTaskName.trim() || isCreatingTask}
                        className="px-3 py-1 text-[11px] font-semibold rounded-lg transition-all disabled:opacity-50"
                        style={{
                          background: "var(--accent)",
                          color: "var(--accent-fg)",
                        }}
                      >
                        {isCreatingTask ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom + Add Task button */}
              {!isAddingTask && (
                <button
                  type="button"
                  onClick={handleAddTaskClick}
                  className="w-full py-2 px-3 rounded-xl border border-dashed transition-colors text-xs font-medium flex items-center justify-center gap-1.5 select-none"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--fg-faint)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.background = "var(--accent-subtle)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--fg-faint)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileAddTaskSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        routineName={category.label}
        onAddTask={handleMobileAddTask}
        isCreating={isCreatingTask}
      />
    </motion.div>
  );
});
