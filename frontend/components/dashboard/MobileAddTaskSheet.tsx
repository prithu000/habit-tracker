"use client";

import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface MobileAddTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  routineName: string;
  onAddTask: (taskName: string, durationMinutes: number, priority: string, repeat: string) => void;
  isCreating?: boolean;
}

export function MobileAddTaskSheet({
  isOpen,
  onClose,
  routineName,
  onAddTask,
  isCreating = false,
}: MobileAddTaskSheetProps) {
  const [taskName, setTaskName] = useState("");
  const [duration, setDuration] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [repeat, setRepeat] = useState("None");
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragControls = useDragControls();

  // Reset state and auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      setTaskName("");
      setDuration("");
      setPriority("Medium");
      setRepeat("None");
      setShowOptions(false);
      // Small timeout to allow animation to start before focusing to prevent keyboard jump glitches
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!taskName.trim()) return;
    const durationMins = duration ? parseInt(duration, 10) : 0;
    onAddTask(taskName, durationMins || 0, priority, repeat);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false} // Only drag via handle
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-[#0a0a0c]/95 border-t border-white/10 rounded-t-[24px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden backdrop-blur-xl"
          >
            {/* Drag Handle */}
            <div 
              className="w-full flex justify-center pt-4 pb-2 cursor-grab touch-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2 no-scrollbar">
              <h2 className="text-xl font-bold text-white mb-1">Add New Task</h2>
              <p className="text-sm text-muted-foreground mb-6">Create a new task for <span className="font-semibold text-white/80">{routineName}</span>.</p>

              {/* Task Name */}
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Task Name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-forge-500/50 focus:ring-1 focus:ring-forge-500/50 transition-all"
                />

                {/* Options Accordion */}
                <div>
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="flex items-center gap-2 text-sm font-medium text-forge-400 py-2 w-full active:scale-[0.98] transition-transform"
                  >
                    More Options
                    <motion.div
                      animate={{ rotate: showOptions ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {showOptions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-4 pb-2 border-l border-white/10 pl-3 ml-1 mt-1">
                          {/* Duration */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Duration (Minutes)</label>
                            <input
                              type="number"
                              placeholder="e.g. 15"
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-forge-500/50 transition-all"
                            />
                          </div>
                          
                          {/* Priority */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Priority</label>
                            <div className="flex gap-2">
                              {["Low", "Medium", "High"].map((p) => (
                                <button
                                  key={p}
                                  onClick={() => setPriority(p)}
                                  className={cn(
                                    "flex-1 h-12 rounded-xl text-sm font-semibold border transition-all active:scale-[0.98]",
                                    priority === p 
                                      ? "bg-forge-500/20 border-forge-500/50 text-forge-300" 
                                      : "bg-white/5 border-white/10 text-white/70"
                                  )}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Repeat */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Repeat</label>
                            <div className="flex flex-wrap gap-2">
                              {["None", "Daily", "Weekly", "Monthly"].map((r) => (
                                <button
                                  key={r}
                                  onClick={() => setRepeat(r)}
                                  className={cn(
                                    "flex-1 min-w-[70px] h-12 rounded-xl text-sm font-semibold border transition-all active:scale-[0.98]",
                                    repeat === r 
                                      ? "bg-forge-500/20 border-forge-500/50 text-forge-300" 
                                      : "bg-white/5 border-white/10 text-white/70"
                                  )}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl border border-white/10 bg-transparent text-white/80 font-bold active:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!taskName.trim() || isCreating}
                  className="flex-[2] h-12 rounded-xl bg-forge-500 hover:bg-forge-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-[0.98]"
                >
                  {isCreating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Add Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
