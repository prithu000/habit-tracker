"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { createPortal } from "react-dom";
import {
  X,
  Save,
  Loader2,
  GripVertical,
  CheckCircle2,
  Circle,
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
import { cn } from "@/lib/utils/cn";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface ReportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface CategoryItem {
  id: string;
  name: string;
  icon: any;
}

const ALL_CATEGORIES: CategoryItem[] = [
  { id: "fitness", name: "Fitness", icon: Activity },
  { id: "learning", name: "Learning", icon: BookOpen },
  { id: "work", name: "Work", icon: Briefcase },
  { id: "mental_health", name: "Mental Health", icon: Brain },
  { id: "health", name: "Health", icon: HeartPulse },
  { id: "sleep", name: "Sleep", icon: Moon },
  { id: "finance", name: "Finance", icon: Wallet },
  { id: "personal", name: "Personal", icon: User },
  { id: "discipline", name: "Discipline", icon: Shield },
];

export function ReportSettingsModal({ isOpen, onClose, onSaved }: ReportSettingsModalProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/analytics/report-settings/");
      const raw = res.data.data || res.data;
      const ids: string[] =
        raw.selected_widget_ids || raw.selected_habit_breakdown || [];
      setSelectedCategoryIds(ids.map(String));
    } catch (err) {
      console.error("[ReportSettings] Failed to fetch:", err);
      setSelectedCategoryIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchSettings();
  }, [isOpen, fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { selected_widget_ids: selectedCategoryIds };
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
    setSelectedCategoryIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cId) => cId !== id);
      } else {
        if (prev.length >= 4) {
          toast.error("Maximum 4 categories can be included in reports.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const onReorder = (newIds: string[]) => {
    setSelectedCategoryIds(newIds);
  };

  if (!isOpen) return null;

  const categoryMap = new Map(ALL_CATEGORIES.map((c) => [c.id, c]));
  const selectedCategories = selectedCategoryIds
    .map((id) => categoryMap.get(id))
    .filter(Boolean) as CategoryItem[];

  const unselectedCategories = ALL_CATEGORIES.filter(
    (c) => !selectedCategoryIds.includes(c.id)
  );

  const isLimitReached = selectedCategoryIds.length >= 4;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-[#0c0c0e] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Subtle Brass Accent */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
            <div>
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                Report Settings
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize which categories appear in your Executive Report Habit Breakdown (up to 4).
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              </div>
            ) : (
              <>
                {/* Habit Breakdown Order */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                    Habit Breakdown Order ({selectedCategories.length}/4)
                  </h3>

                  {/* Overall Consistency — locked first */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-2 opacity-70">
                    <div className="w-6 flex justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        Overall Consistency
                        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 uppercase tracking-widest font-bold">
                          Locked First
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 uppercase">all categories</span>
                    </div>
                  </div>

                  {/* Reorderable selected categories */}
                  <Reorder.Group
                    axis="y"
                    values={selectedCategories.map((c) => c.id)}
                    onReorder={onReorder}
                    className="space-y-2"
                  >
                    {selectedCategories.map((cat, index) => {
                      const Icon = cat.icon;
                      return (
                        <Reorder.Item
                          key={cat.id}
                          value={cat.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-grab active:cursor-grabbing hover:bg-amber-500/20 transition-colors"
                        >
                          <div className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 shrink-0">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSelection(cat.id)}
                            className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                              <Icon className="w-4 h-4 text-zinc-300 shrink-0" />
                              <span className="text-sm font-semibold text-white/90">{cat.name}</span>
                              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Priority #{index + 1}
                              </span>
                            </div>
                          </button>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>

                  {selectedCategories.length === 0 && (
                    <p className="text-xs text-zinc-600 text-center py-4">
                      Select categories below to highlight them in your report.
                    </p>
                  )}
                </div>

                {/* Available Categories */}
                {unselectedCategories.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                      Available Categories
                    </h3>
                    <div className="space-y-2">
                      {unselectedCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <div
                            key={cat.id}
                            role="button"
                            tabIndex={0}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                              isLimitReached
                                ? "opacity-50 bg-white/5 border-transparent cursor-not-allowed"
                                : "cursor-pointer hover:bg-white/10 bg-white/5 border-transparent"
                            )}
                            onClick={() => !isLimitReached && toggleSelection(cat.id)}
                            onKeyDown={(e) => {
                              if ((e.key === "Enter" || e.key === " ") && !isLimitReached) {
                                e.preventDefault();
                                toggleSelection(cat.id);
                              }
                            }}
                          >
                            <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
                            <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span className="text-sm font-semibold text-white/80">{cat.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/[0.08]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="btn-forge text-xs flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Settings</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
