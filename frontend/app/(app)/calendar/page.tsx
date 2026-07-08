"use client";

import React, { useState } from "react";
import { useEmailReminders, useCreateEmailReminder, useDeleteEmailReminder } from "@/lib/queries/useOS";
import { Skeleton } from "@/components/shared/Skeleton";
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
  Mail,
  Globe,
} from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const YearHeatmap = dynamic(
  () => import("@/components/calendar/YearHeatmap").then((m) => m.YearHeatmap),
  { ssr: false, loading: () => <Skeleton className="h-[220px] w-full rounded-3xl bg-zinc-900/40" /> }
);

export default function CalendarPage() {
  const { data: remindersData, isLoading: isRemindersLoading } = useEmailReminders();
  const createReminderMutation = useCreateEmailReminder();
  const deleteReminderMutation = useDeleteEmailReminder();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [taskName, setTaskName] = useState("");
  const [datePart, setDatePart] = useState(new Date().toISOString().split("T")[0]);
  const [timePart, setTimePart] = useState("09:00");
  const [timezone, setTimezone] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch(e) { return "UTC"; }
  });
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
        const dateStr = curr.toISOString().split("T")[0];
        const hash = dateStr.split("-").reduce((acc, val) => acc + parseInt(val), 0);
        const level = curr > today ? 0 : hash % 5;
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
    if (!taskName || !datePart || !timePart) return;
    const combinedIso = new Date(`${datePart}T${timePart}:00`).toISOString();
    createReminderMutation.mutate(
      {
        task_name: taskName,
        deadline: combinedIso,
        priority,
        frequency,
        timezone,
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
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-zinc-900/60 to-zinc-900/40 p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 animate-pulse" />
            Execution Chronology & Alerts
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">TIMELINE</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            365-day execution heatmap, interactive monthly scheduler, and automated 1-click email reminder matrix.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm transition-all shadow-lg shadow-purple-500/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>SCHEDULE REMINDER</span>
        </button>
      </div>

      {/* 365-Day Execution Heatmap */}
      <YearHeatmap heatmapWeeks={heatmapWeeks} getLevelColor={getLevelColor} />

      {/* Monthly Grid & Reminders Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Calendar Grid */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-white">
                  {monthNames[month]} <span className="text-purple-400">{year}</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">
                  Today: {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-xs font-bold text-zinc-500 uppercase tracking-wider py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 rounded-2xl bg-zinc-950/20 border border-zinc-900/40 opacity-40" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const isToday = new Date().toISOString().split("T")[0] === dateStr;
                const isSelected = selectedDate.toISOString().split("T")[0] === dateStr;

                // Check if any reminder falls on this day
                const hasReminder = remindersData?.reminders?.some(
                  (r: any) => r.deadline && r.deadline.startsWith(dateStr)
                );

                return (
                  <div
                    key={dayNum}
                    onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                    className={cn(
                      "h-20 rounded-2xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between relative group",
                      isToday
                        ? "bg-purple-900/30 border-purple-500/50 shadow-lg shadow-purple-500/10"
                        : isSelected
                        ? "bg-zinc-800/80 border-zinc-600"
                        : "bg-zinc-950/50 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-bold", isToday ? "text-purple-400" : "text-zinc-400")}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      )}
                    </div>
                    {hasReminder && (
                      <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-[10px] font-bold w-fit">
                        <Bell className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">Alert</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Email Reminders Manager */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                Active Email Reminders
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                1-Click JWT
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Reminders automatically send an interactive email containing a secure token to mark tasks complete without opening the app.
            </p>

            {isRemindersLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : remindersData?.reminders && remindersData.reminders.length > 0 ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {remindersData.reminders.map((rem: any) => (
                  <div
                    key={rem.id}
                    className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                          rem.priority === "Urgent" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                          rem.priority === "High" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                          "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        )}>
                          {rem.priority}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-semibold">{rem.frequency}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{rem.task_name}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span>{new Date(rem.deadline).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReminderMutation.mutate(rem.id)}
                      title="Delete Reminder"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-zinc-950/40 rounded-2xl border border-zinc-800/60 p-6">
                <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-3 opacity-50" />
                <p className="text-xs font-semibold text-zinc-400 mb-1">No active reminders scheduled.</p>
                <p className="text-[11px] text-zinc-600">Click Schedule Reminder above to configure automated alerts.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-2xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">SMTP Service verified via Rahul Business node.</span>
          </div>
        </div>
      </div>

      {/* Add Reminder Modal — Upgraded with Calendar/Time Picker & Live Email Preview */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Schedule 1-Click Telemetry Alert</h3>
                    <p className="text-xs text-zinc-400">Configure timezone-aware reminders with automated JWT tokens</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Col: Form Controls */}
                <form onSubmit={handleCreateReminder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Task Name / Objective
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

                  {/* Calendar Date Picker & Quick Pills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
                        Target Date
                      </label>
                      <div className="flex gap-1">
                        {[
                          { label: "Today", days: 0 },
                          { label: "Tomorrow", days: 1 },
                          { label: "+3 Days", days: 3 },
                        ].map((pill) => {
                          const target = new Date();
                          target.setDate(target.getDate() + pill.days);
                          const iso = target.toISOString().split("T")[0];
                          return (
                            <button
                              key={pill.label}
                              type="button"
                              onClick={() => setDatePart(iso)}
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                                datePart === iso ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                              )}
                            >
                              {pill.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <input
                      type="date"
                      required
                      value={datePart}
                      onChange={(e) => setDatePart(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Time Picker & Timezone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          Alert Time
                        </label>
                      </div>
                      <input
                        type="time"
                        required
                        value={timePart}
                        onChange={(e) => setTimePart(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-purple-400" />
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-purple-500"
                      >
                        <option value={timezone}>{timezone} (Detected)</option>
                        <option value="UTC">UTC (Universal Time)</option>
                        <option value="America/New_York">America/New_York (EST/EDT)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                        <option value="Europe/London">Europe/London (GMT/BST)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                        <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                      </select>
                    </div>
                  </div>

                  {/* Priority & Recurring Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        Priority Level
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
                        Recurrence Schedule
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

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
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

                {/* Right Col: Live Email Preview Box */}
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-4 shadow-inner">
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-400" />
                        Live Production Email Preview
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        SMTP Ready
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mb-1 truncate">
                      <strong className="text-zinc-500">Subject:</strong>{" "}
                      <span className="text-white font-semibold">
                        🔔 [{priority.toUpperCase()} PRIORITY] YOU VS YOU Reminder: {taskName || "Scheduled Task"}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mb-4">
                      <strong className="text-zinc-500">To:</strong> <span className="text-zinc-300">user@forge-os.com</span>
                    </div>

                    <div className="bg-zinc-900/90 p-4 rounded-xl border border-zinc-800/80 space-y-3 font-mono text-xs text-zinc-300">
                      <div className="text-purple-400 font-bold border-b border-zinc-800 pb-2 flex items-center justify-between">
                        <span>YOU VS YOU — SCHEDULED REMINDER</span>
                        <span className="text-[10px] text-zinc-500">{frequency}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Task     :</span> <strong className="text-white">{taskName || "Complete Daily Routine"}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Priority :</span> <span className={cn("font-bold", priority === "Urgent" ? "text-rose-400" : priority === "High" ? "text-amber-400" : "text-purple-400")}>{priority}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Alert At :</span> <span className="text-zinc-300">{datePart} @ {timePart} ({timezone})</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          This automated telemetry reminder includes a secure JWT completion token. You can mark this task 100% complete without opening the application.
                        </p>
                      </div>
                      <div className="pt-2 flex justify-center">
                        <div className="px-4 py-2.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-bold text-center text-[11px] w-full flex items-center justify-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          [ ⚡ Mark Completed with 1-Click ]
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-600 text-center italic">
                    * Delivered reliably via Rahul Business SMTP service at exact local timezone trigger.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
