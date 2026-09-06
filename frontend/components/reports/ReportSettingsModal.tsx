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
          className="w-full max-w-xl border rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--fg)" }}
        >
          {/* Subtle Brass Accent */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="text-lg font-display font-bold flex items-center gap-2" style={{ color: "var(--fg)" }}>
                Report Settings
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                Customize which categories appear in your Executive Report Habit Breakdown (up to 4).
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors"
              style={{ color: "var(--fg-muted)" }}
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
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border mb-2 opacity-80"
                    style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
                  >
                    <div className="w-6 flex justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--fg)" }}>
                        Overall Consistency
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold"
                          style={{ background: "var(--border)", color: "var(--fg-muted)" }}
                        >
                          Locked First
                        </span>
                      </div>
                      <span className="text-xs uppercase" style={{ color: "var(--fg-muted)" }}>all categories</span>
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
                          className="flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-colors"
                          style={{ background: "var(--accent-subtle)", borderColor: "var(--accent-border)" }}
                        >
                          <div className="cursor-grab active:cursor-grabbing shrink-0" style={{ color: "var(--fg-muted)" }}>
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSelection(cat.id)}
                            className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                              <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--fg-muted)" }} />
                              <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{cat.name}</span>
                              <span
                                className="hidden sm:inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border"
                                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--accent)" }}
                              >
                                Priority #{index + 1}
                              </span>
                            </div>
                          </button>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>

                  {selectedCategories.length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: "var(--fg-muted)" }}>
                      Select categories below to highlight them in your report.
                    </p>
                  )}
                </div>

                {/* Available Categories */}
                {unselectedCategories.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--fg-muted)" }}>
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
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:opacity-80"
                            )}
                            style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
                            onClick={() => !isLimitReached && toggleSelection(cat.id)}
                            onKeyDown={(e) => {
                              if ((e.key === "Enter" || e.key === " ") && !isLimitReached) {
                                e.preventDefault();
                                toggleSelection(cat.id);
                              }
                            }}
                          >
                            <Circle className="w-5 h-5 shrink-0" style={{ color: "var(--fg-faint)" }} />
                            <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--fg-muted)" }} />
                            <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{cat.name}</span>
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
          <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold transition-colors"
              style={{ color: "var(--fg-muted)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-opacity"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
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
