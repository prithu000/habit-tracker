"use client";

import { RoutineBlock } from "@/types/api";
import { TaskItem } from "./TaskItem";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, MoreVertical, Edit2, Copy, Archive, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState, memo } from "react";
import { useCustomizationStore } from "@/lib/stores/customizationStore";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DeleteRoutineModal } from "../routines/DeleteRoutineModal";
import { useArchiveRoutine, useDuplicateRoutine, useCreateTask } from "@/lib/queries/useRoutines";
import { useRouter } from "next/navigation";

interface RoutineCardProps {
  routine: RoutineBlock;
}

export const RoutineCard = memo(function RoutineCard({ routine }: RoutineCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskRepeat, setNewTaskRepeat] = useState("None");

  const { cardRadius, animationsEnabled } = useCustomizationStore();
  const router = useRouter();
  
  const { mutate: archiveRoutine } = useArchiveRoutine();
  const { mutate: duplicateRoutine } = useDuplicateRoutine();
  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask();

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    
    createTask({
      routineId: routine.id,
      taskData: {
        name: newTaskName,
        duration_minutes: newTaskDuration ? parseInt(newTaskDuration, 10) : 0,
      }
    });

    setNewTaskName("");
    setNewTaskDuration("");
    setNewTaskPriority("Medium");
    setNewTaskRepeat("None");
    setIsAddingTask(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === "Escape") {
      setIsAddingTask(false);
    }
  };

  const radiusClasses = {
    "16px": "rounded-[16px]",
    "20px": "rounded-[20px]",
    "24px": "rounded-[24px]",
  };

  return (
    <motion.div
      whileHover={animationsEnabled ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "bg-[#0a0a0c]/80 backdrop-blur-2xl border transition-colors duration-200 overflow-hidden mb-5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] group relative",
        radiusClasses[cardRadius] || "rounded-[20px]",
        routine.is_complete
          ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-[#0a0a0c]/80 to-[#0a0a0c]/80 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          : "border-white/[0.08] hover:border-forge-500/40"
      )}
    >
      {/* Top Subtle Gradient Border Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${routine.color || "#8b5cf6"}, transparent)`,
        }}
      />

      {/* Header */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer select-none relative z-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-[0_0_20px_rgba(0,0,0,0.4)] border transition-transform group-hover:scale-105 duration-300"
            style={{
              backgroundColor: `${routine.color}18`,
              color: routine.color,
              borderColor: `${routine.color}40`,
            }}
          >
            {routine.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
                {routine.name}
              </h3>
              {routine.is_complete && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" />
                  Done
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono font-bold text-forge-400 uppercase tracking-widest bg-forge-500/10 px-2 py-0.5 rounded-md border border-forge-500/20">
                {routine.time_of_day}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-xs text-muted-foreground font-medium">
                {routine.completed_count}/{routine.task_count} tasks
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end gap-1.5 w-36">
            <div className="flex items-center justify-between w-full text-xs font-mono">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold text-white">{routine.completion_rate}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/[0.05]">
              <motion.div
                className="h-full rounded-full shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                style={{ backgroundColor: routine.color || "#8b5cf6" }}
                initial={{ width: 0 }}
                animate={{ width: `${routine.completion_rate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
          
          <button
            className="px-3 py-1.5 rounded-lg bg-forge-500/20 text-forge-400 hover:bg-forge-500/30 transition-colors text-xs font-bold shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
              setIsAddingTask(true);
            }}
          >
            + Add Task
          </button>

          <button
            className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-muted-foreground hover:text-white transition-all flex items-center justify-center shrink-0"
            title={isExpanded ? "Collapse Routine" : "Expand Routine"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-muted-foreground hover:text-white transition-all flex items-center justify-center outline-none focus:ring-2 focus:ring-forge-500/50"
                  aria-label="Routine options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-[#121214]/95 p-1 text-white shadow-2xl backdrop-blur-xl animate-in fade-in-80 zoom-in-95"
                  sideOffset={8}
                  align="end"
                >
                  <DropdownMenu.Item 
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:bg-white/10"
                    onClick={() => router.push(`/routines/${routine.id}`)}
                  >
                    <Edit2 className="w-4 h-4 text-forge-400" />
                    Edit Routine
                  </DropdownMenu.Item>
                  
                  <DropdownMenu.Item 
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:bg-white/10"
                    onClick={() => duplicateRoutine(routine.id)}
                  >
                    <Copy className="w-4 h-4 text-emerald-400" />
                    Duplicate Routine
                  </DropdownMenu.Item>

                  {routine.is_active && (
                    <DropdownMenu.Item 
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:bg-white/10"
                      onClick={() => archiveRoutine(routine.id)}
                    >
                      <Archive className="w-4 h-4 text-amber-400" />
                      Archive Routine
                    </DropdownMenu.Item>
                  )}

                  <DropdownMenu.Separator className="my-1 h-[1px] bg-white/10" />

                  <DropdownMenu.Item 
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 outline-none transition-colors focus:bg-red-500/10"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Routine
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>

      {/* Task List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-white/[0.06]"
          >
            <div className="p-4 bg-black/40 space-y-2">
              {isAddingTask && (
                <div 
                  className="p-4 bg-white/[0.02] border border-white/[0.1] rounded-xl mb-4 space-y-4"
                  onClick={(e) => e.stopPropagation()} // Prevent card collapse
                >
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Task Name"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-forge-500/50 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Optional Time (HH:MM)"
                      value={newTaskDuration}
                      onChange={(e) => setNewTaskDuration(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-40 bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-forge-500/50 transition-colors"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Priority</label>
                      <select 
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-forge-500/50"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Repeat</label>
                      <select 
                        value={newTaskRepeat}
                        onChange={(e) => setNewTaskRepeat(e.target.value)}
                        className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-forge-500/50"
                      >
                        <option value="None">None</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <button 
                        onClick={() => setIsAddingTask(false)}
                        className="px-4 py-1.5 rounded-lg border border-white/[0.1] text-xs font-bold text-white/70 hover:bg-white/[0.05] transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddTask}
                        disabled={!newTaskName.trim() || isCreatingTask}
                        className="px-4 py-1.5 rounded-lg bg-forge-500 text-white text-xs font-bold hover:bg-forge-600 disabled:opacity-50 transition-colors"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {routine.tasks.length === 0 && !isAddingTask ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-muted-foreground font-medium">
                    This routine is empty.
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(true);
                      setIsAddingTask(true);
                    }}
                    className="text-[10px] text-forge-400 font-mono mt-1 hover:text-forge-300 transition-colors"
                  >
                    + Add your first task
                  </button>
                </div>
              ) : (
                routine.tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteRoutineModal 
        routine={routine}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </motion.div>
  );
});
