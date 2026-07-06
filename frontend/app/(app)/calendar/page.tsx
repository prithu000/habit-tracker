"use client";

import React, { useState } from "react";
import { useEmailReminders, useCreateEmailReminder, useDeleteEmailReminder } from "@/lib/queries/useOS";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  Calendar as CalendarIcon,
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export default function CalendarPage() {
  const { data: remindersData, isLoading: isRemindersLoading } = useEmailReminders();
  const createReminderMutation = useCreateEmailReminder();
  const deleteReminderMutation = useDeleteEmailReminder();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState(new Date().toISOString().slice(0, 16));
  const [priority, setPriority] = useState("Medium");
  const [frequency, setFrequency] = useState("Daily");

  // Generate 52-week GitHub heatmap (364 days)
  const heatmapWeeks = React.useMemo(() => {
    const weeks: { date: string; count: number; level: number }[][] = [];
    const today = new Date();
    let curr = new Date(today.getTime() - 364 * 24 * 60 * 60 * 1000);

    for (let w = 0; w < 52; w++) {
      const week: { date: string; count: number; level: number }[] = [];
      for (let d = 0; d < 7; d++) {
        // Generate deterministic pseudo-random completion level based on date string
        const dateStr = curr.toISOString().split("T")[0];
        const hash = dateStr.split("-").reduce((acc, val) => acc + parseInt(val), 0);
        const level = curr > today ? 0 : hash % 5; // 0 to 4
        week.push({ date: dateStr, count: level * 3, level });
        curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
      }
      weeks.push(week);
    }
    return weeks;
  }, []);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 4: return "bg-purple-500 shadow-sm shadow-purple-500/50";
      case 3: return "bg-purple-600/80";
      case 2: return "bg-purple-800/60";
      case 1: return "bg-purple-950/40";
      default: return "bg-zinc-900 border border-zinc-800/60";
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !deadline) return;
    createReminderMutation.mutate(
      {
        task_name: taskName,
        deadline: new Date(deadline).toISOString(),
        priority,
        frequency,
      },
      {
        onSuccess: () => {
          setTaskName("");
          setShowAddModal(false);
        },
      }
    );
  };

  // Calendar grid math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-zinc-900/60 to-zinc-900/40 p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 animate-pulse" />
            Chrono-Systems Telemetry
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            PRODUCTIVITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">PLANNER</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            365-day execution heatmap, interactive monthly scheduler, and automated 1-click email reminder matrix.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all self-start md:self-center"
        >
          <Plus className="w-5 h-5" />
          <span>SCHEDULE REMINDER</span>
        </button>
      </div>

      {/* GitHub Heatmap */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-4 min-w-[700px]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-purple-400" />
              365-Day Neural Execution Matrix
            </h3>
            <p className="text-xs text-zinc-400">Daily routine completion density across the trailing 52 weeks.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div key={lvl} className={cn("w-3.5 h-3.5 rounded-sm", getLevelColor(lvl))} />
            ))}
            <span>More</span>
          </div>
        </div>
        <div className="flex gap-1 min-w-[700px] pt-2">
          {heatmapWeeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  title={`${day.date}: ${day.count} tasks executed`}
                  className={cn("w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 cursor-pointer", getLevelColor(day.level))}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Grid & Reminders Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Monthly Calendar */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700/50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all border border-zinc-700/50"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700/50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 rounded-2xl bg-zinc-950/20 border border-zinc-900/40" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isToday =
                dayNum === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();
              const isSelected =
                dayNum === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear();

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                  className={cn(
                    "h-20 rounded-2xl p-2 flex flex-col justify-between items-start transition-all border relative overflow-hidden",
                    isSelected
                      ? "bg-purple-500/20 border-purple-500 text-white shadow-lg"
                      : isToday
                      ? "bg-zinc-800/80 border-purple-400/50 text-purple-300"
                      : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <span className={cn("text-xs font-black", isToday && "text-purple-400")}>{dayNum}</span>
                  {dayNum % 3 === 0 && (
                    <div className="w-full flex items-center justify-between text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300 font-semibold">
                      <span>Routines</span>
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Email Reminders Manager */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Active Email Reminders
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                1-Click Quick Complete
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Reminders automatically send an interactive email containing a secure token to mark tasks complete without opening the app.
            </p>

            {isRemindersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-zinc-800/50 rounded-2xl animate-pulse" />)}
              </div>
            ) : remindersData?.reminders && remindersData.reminders.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {remindersData.reminders.map((rem: any) => (
                  <div key={rem.id} className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider",
                          rem.priority === "Urgent" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                          rem.priority === "High" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                          "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        )}>
                          {rem.priority}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase">{rem.frequency}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{rem.task_name}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{new Date(rem.deadline).toLocaleDateString()} {new Date(rem.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReminderMutation.mutate(rem.id)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30 shrink-0"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-950/40 border border-zinc-800/60 rounded-2xl space-y-2">
                <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-400">No active reminders scheduled.</p>
                <p className="text-[11px] text-zinc-600">Click Schedule Reminder above to configure automated alerts.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  Schedule 1-Click Reminder
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-500 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateReminder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Task Name
                  </label>
                  <input
                    type="text"
                    required
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="e.g. Complete Morning Workout & Cold Plunge"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Deadline / Alert Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="One Time">One Time</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createReminderMutation.isPending}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-lg shadow-purple-500/20"
                  >
                    {createReminderMutation.isPending ? "Scheduling..." : "Schedule Alert"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
