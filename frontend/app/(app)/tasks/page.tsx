"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  BookOpen,
  Briefcase,
  Brain,
  HeartPulse,
  Moon,
  Wallet,
  User,
  Shield,
} from "lucide-react";
import { PageTransition } from "@/components/layouts/PageTransition";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTasks, useDeleteTask } from "@/lib/queries/useTasks";
import { Task, TaskCategory, TaskFrequency } from "@/types/api";
import { TaskModal } from "./TaskModal";
import { cn } from "@/lib/utils/cn";

const CATEGORY_TABS: { value: TaskCategory | "all"; label: string; icon: any }[] = [
  { value: "all", label: "All Tasks", icon: ListTodo },
  { value: "fitness", label: "Fitness", icon: Activity },
  { value: "learning", label: "Learning", icon: BookOpen },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "mental_health", label: "Mental Health", icon: Brain },
  { value: "health", label: "Health", icon: HeartPulse },
  { value: "sleep", label: "Sleep", icon: Moon },
  { value: "finance", label: "Finance", icon: Wallet },
  { value: "personal", label: "Personal", icon: User },
  { value: "discipline", label: "Discipline", icon: Shield },
];

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

export default function TasksPage() {
  const { data: tasks, isLoading, isError } = useTasks();
  const { mutate: deleteTask } = useDeleteTask();

  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all">("all");
  const [selectedFrequency, setSelectedFrequency] = useState<TaskFrequency | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      if (selectedCategory !== "all" && task.category !== selectedCategory) {
        return false;
      }
      if (selectedFrequency !== "all" && task.frequency !== selectedFrequency) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(query);
        const matchesDesc = (task.description || "").toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [tasks, selectedCategory, selectedFrequency, searchQuery]);

  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-xl shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !tasks) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load tasks"
        description="We couldn't fetch your tasks. Please check your connection."
        action={
          <button onClick={() => window.location.reload()} className="btn-ghost">
            Retry
          </button>
        }
      />
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 md:space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
                Tasks
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ background: "var(--surface-raised)", color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                {tasks.length} TOTAL
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--fg-muted)" }}>
              Flat execution protocols categorized across the 9 Life Score axes.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-colors shrink-0 min-h-[38px] shadow-sm"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="space-y-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.value;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedCategory(tab.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border shrink-0",
                    isSelected
                      ? "shadow-sm"
                      : "bg-transparent hover:bg-[var(--surface-hover)]"
                  )}
                  style={
                    isSelected
                      ? {
                          background: "var(--accent-subtle)",
                          color: "var(--accent)",
                          borderColor: "var(--accent-border)",
                        }
                      : {
                          color: "var(--fg-muted)",
                          borderColor: "transparent",
                        }
                  }
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? "var(--accent)" : "var(--fg-muted)" }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search + Frequency Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by name or description..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              />
            </div>

            {/* Frequency Segmented Control */}
            <div className="flex items-center gap-1 border p-1 rounded-xl self-start sm:self-auto" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              {(["all", "daily", "weekly", "anytime"] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setSelectedFrequency(freq)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors",
                    selectedFrequency === freq
                      ? "border font-bold shadow-sm"
                      : "hover:text-[var(--fg)]"
                  )}
                  style={
                    selectedFrequency === freq
                      ? {
                          background: "var(--surface-raised)",
                          color: "var(--fg)",
                          borderColor: "var(--border)",
                        }
                      : {
                          color: "var(--fg-muted)",
                        }
                  }
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Cards Grid */}
        {filteredTasks.length === 0 ? (
          <div className="p-12 rounded-2xl border text-center space-y-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="w-12 h-12 rounded-xl border flex items-center justify-center mx-auto" style={{ background: "var(--surface-raised)", borderColor: "var(--border)", color: "var(--fg-muted)" }}>
              <ListTodo className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>No tasks found</h3>
            <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--fg-muted)" }}>
              {searchQuery || selectedCategory !== "all" || selectedFrequency !== "all"
                ? "No tasks match your current filter criteria."
                : "Create your first task to start building your daily discipline."}
            </p>
            <div className="pt-2">
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-sm"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task, idx) => {
              const CategoryIcon = CATEGORY_ICONS[task.category || "personal"] || ListTodo;
              const formattedCategory = (task.category || "personal")
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="p-4 rounded-xl border hover:border-[var(--accent)]/50 transition-colors flex flex-col justify-between group relative"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    boxShadow: "var(--card-shadow)",
                  }}
                >
                  <div>
                    {/* Top row: Category tag + actions */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--fg-muted)" }}>
                        <CategoryIcon className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                        <span className="font-medium tracking-wide">{formattedCategory}</span>
                      </div>

                      {/* Frequency Badge */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase" style={{ background: "var(--surface-raised)", borderColor: "var(--border)", color: "var(--fg-muted)" }}>
                        {task.frequency || "daily"}
                      </span>
                    </div>

                    {/* Task Title */}
                    <h3 className="text-sm font-medium transition-colors" style={{ color: "var(--fg)" }}>
                      {task.name}
                    </h3>

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs line-clamp-2 mt-1 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom row: Meta & Actions */}
                  <div className="pt-3 mt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--fg-muted)" }}>
                      {task.duration_minutes ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.duration_minutes}m</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
                        style={{ color: "var(--fg-muted)" }}
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          taskToEdit={taskToEdit}
          defaultCategory={selectedCategory !== "all" ? selectedCategory : "personal"}
        />

        {/* Delete Confirmation Modal */}
        {taskToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 rounded-2xl border shadow-xl space-y-4"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Delete Task</h3>
                <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>
                  Are you sure you want to delete &ldquo;{taskToDelete.name}&rdquo;? Historical completion records will remain intact.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
