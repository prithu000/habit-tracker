"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Save, Loader2, GripVertical, CheckCircle2, Circle, ActivitySquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useDashboard } from "@/lib/queries/useDashboard";

interface ReportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

/** Represents a Routine selectable for the Habit Breakdown report section. */
interface RoutineItem {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function ReportSettingsModal({ isOpen, onClose, onSaved }: ReportSettingsModalProps) {
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // All active routines from the dashboard — same objects shown on the Dashboard page.
  // This is the SINGLE source of truth: Routine → Task → Completion.
  const { data: dashboard } = useDashboard();

  const allRoutines: RoutineItem[] = (dashboard?.today?.routines || []).map((r: any) => ({
    id: String(r.id),
    name: r.name,
    icon: r.icon || "🔥",
    color: r.color || "#8b5cf6",
  }));

  // Fetch saved settings whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    fetchSettings();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/analytics/report-settings/");
      const raw = res.data.data || res.data;
      // selected_widget_ids now contains Routine UUIDs (backend validates against Routine model)
      const ids: (string | number)[] =
        raw.selected_widget_ids || raw.selected_habit_breakdown || [];
      setSelectedRoutineIds(ids.map(String));
    } catch (err) {
      console.error("[ReportSettings] Failed to fetch:", err);
      setSelectedRoutineIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Send Routine UUIDs — backend report_settings_view validates against Routine model
      const payload = { selected_widget_ids: selectedRoutineIds };
      await api.put("/analytics/report-settings/", payload);
      toast.success("Report settings saved!");
      onSaved();
      onClose();
    } catch (err: any) {
      console.error("[ReportSettings] Save failed:", err);
      toast.error(err.response?.data?.error || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedRoutineIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rId) => rId !== id);
      } else {
        if (prev.length >= 4) {
          toast.error("Maximum 4 habits can be included in reports.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const onReorder = (newIds: string[]) => {
    setSelectedRoutineIds(newIds);
  };

  if (!isOpen) return null;

  // Build ordered selected list — map IDs to routine objects preserving order
  const selectedRoutines: RoutineItem[] = selectedRoutineIds
    .map((id) => allRoutines.find((r) => r.id === id))
    .filter(Boolean) as RoutineItem[];

  // Unselected routines — all that are not in selectedRoutineIds
  const unselectedRoutines: RoutineItem[] = allRoutines
    .filter((r) => !selectedRoutineIds.includes(r.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const isLimitReached = selectedRoutines.length >= 4;
  const showSpinner = isLoading;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 shrink-0">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Report Settings</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Choose which routines appear in your Habit Breakdown.
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {showSpinner ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : allRoutines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 mb-2">
                  <ActivitySquare className="w-8 h-8" />
                </div>
                <p className="text-zinc-400 font-medium px-8 leading-relaxed">
                  No routines scheduled for today.
                  <br />
                  Create a routine from the Dashboard first.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Info callout */}
                <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                  <p className="text-sm text-zinc-300 font-medium">
                    Select up to <strong className="text-purple-400">4 routines</strong> to display in the
                    Habit Breakdown section of your report. Drag to reorder their priority.
                  </p>
                </div>

                {/* Habit Breakdown Order */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                    Habit Breakdown Order
                  </h3>

                  {/* Overall Consistency — always locked first */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-2 opacity-70">
                    <div className="w-6 flex justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        Overall Consistency
                        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 uppercase tracking-widest font-bold">
                          Locked First
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 uppercase">all routines</span>
                    </div>
                  </div>

                  {/* Reorderable selected routines */}
                  <Reorder.Group
                    axis="y"
                    values={selectedRoutines.map((r) => r.id)}
                    onReorder={onReorder}
                    className="space-y-2"
                  >
                    {selectedRoutines.map((routine, index) => (
                      <Reorder.Item
                        key={routine.id}
                        value={routine.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 cursor-grab active:cursor-grabbing hover:bg-purple-500/20 transition-colors"
                      >
                        <div className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 shrink-0">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSelection(routine.id)}
                          className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                            <span className="text-lg leading-none">{routine.icon}</span>
                            <span className="text-sm font-semibold text-white/90">{routine.name}</span>
                            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Priority #{index + 1}
                            </span>
                          </div>
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  {selectedRoutines.length === 0 && (
                    <p className="text-xs text-zinc-600 text-center py-4">
                      Select routines from below to include them in your report.
                    </p>
                  )}
                </div>

                {/* Available Routines */}
                {unselectedRoutines.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                      Available Routines
                    </h3>
                    <div className="space-y-2">
                      {unselectedRoutines.map((routine) => (
                        <div
                          key={routine.id}
                          role="button"
                          tabIndex={0}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                            isLimitReached
                              ? "opacity-50 bg-white/5 border-transparent cursor-not-allowed"
                              : "cursor-pointer hover:bg-white/10 bg-white/5 border-transparent"
                          )}
                          onClick={() => {
                            if (!isLimitReached) toggleSelection(routine.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isLimitReached) toggleSelection(routine.id);
                          }}
                        >
                          <div className="w-6 flex justify-center shrink-0">
                            <Circle
                              className={cn(
                                "w-5 h-5",
                                isLimitReached ? "text-zinc-600" : "text-zinc-400"
                              )}
                            />
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <span className="text-lg leading-none">{routine.icon}</span>
                            <span className="text-sm font-semibold text-zinc-400">{routine.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-2 text-sm font-semibold disabled:opacity-50 min-w-[140px] justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
