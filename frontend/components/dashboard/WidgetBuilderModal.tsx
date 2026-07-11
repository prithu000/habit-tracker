"use client";

import { useState, useEffect, useEffect as useMountEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DASHBOARD_QUERY_KEY } from "@/lib/queries/useDashboard";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "react-hot-toast";

interface WidgetBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetToEdit?: any;
  existingWidgets?: any[];
}

export function WidgetBuilderModal({ isOpen, onClose, widgetToEdit, existingWidgets = [] }: WidgetBuilderModalProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  const [name, setName] = useState("");
  const [goal, setGoal] = useState<number | "">("");
  const [unit, setUnit] = useState("");
  const [stepSize, setStepSize] = useState<number | "">("");
  const [color, setColor] = useState("blue-400");
  const [icon, setIcon] = useState("check");
  const [showOnDashboard, setShowOnDashboard] = useState(true);
  const [validationError, setValidationError] = useState("");

  const colors = ["blue-400", "cyan-400", "rose-400", "purple-400", "emerald-400", "amber-400", "forge-400"];

  useEffect(() => {
    if (isOpen) {
      setName(widgetToEdit?.name || "");
      setGoal(widgetToEdit?.goal || 10);
      setUnit(widgetToEdit?.unit || "");
      setStepSize(widgetToEdit?.step_size || 1);
      setColor(widgetToEdit?.color || "blue-400");
      setIcon(widgetToEdit?.icon || "check");
      setShowOnDashboard(widgetToEdit?.show_on_dashboard ?? true);
      setValidationError("");
    }
  }, [isOpen, widgetToEdit]);

  const validate = () => {
    if (!name.trim()) return "Widget name is required.";
    if (!goal || Number(goal) <= 0) return "Goal must be a positive number.";
    if (!unit.trim()) return "Unit is required.";
    if (!stepSize || Number(stepSize) <= 0) return "Step size must be a positive number.";
    
    const isDuplicate = existingWidgets.some(
      (w) => w.name.trim().toLowerCase() === name.trim().toLowerCase() && w.id !== widgetToEdit?.id
    );
    if (isDuplicate) return "A widget with this name already exists.";
    
    return "";
  };

  const { mutate: saveWidget, isPending } = useMutation({
    mutationFn: async () => {
      const err = validate();
      if (err) throw new Error(err);

      const data = {
        name: name.trim(), 
        goal: Number(goal), 
        unit: unit.trim(), 
        step_size: Number(stepSize), 
        color, 
        icon,
        show_on_dashboard: showOnDashboard
      };
      
      if (widgetToEdit) {
        await api.patch(`/analytics/widgets/${widgetToEdit.id}/`, data);
      } else {
        await api.post("/analytics/widgets/", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      queryClient.invalidateQueries({ queryKey: ["smartReports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(widgetToEdit ? "Widget updated successfully!" : "Widget created successfully!");
      onClose();
    },
    onError: (error: any) => {
      setValidationError(error.message || "Failed to save widget.");
      toast.error(error.message || "Failed to save widget.");
    }
  });

  const { mutate: deleteWidget, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      await api.delete(`/analytics/widgets/${widgetToEdit.id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      queryClient.invalidateQueries({ queryKey: ["smartReports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Widget archived successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to archive widget.");
    }
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isPending && !isDeleting ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-[calc(100%-32px)] max-w-[560px] max-h-[90vh] bg-[#0a0a0c] border border-white/10 rounded-[20px] shadow-2xl flex flex-col z-[101] overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 shrink-0 bg-[#0a0a0c]">
              <h2 className="text-lg font-display font-bold text-white">
                {widgetToEdit ? "Edit Custom Widget" : "Create Custom Widget"}
              </h2>
              <button 
                onClick={onClose} 
                disabled={isPending || isDeleting}
                className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {validationError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{validationError}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Widget Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setValidationError(""); }}
                  placeholder="e.g. Reading, Coding, Meditation"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-forge-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Daily Goal</label>
                  <input
                    type="number"
                    value={goal}
                    onChange={(e) => { setGoal(e.target.value ? Number(e.target.value) : ""); setValidationError(""); }}
                    placeholder="e.g. 10"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forge-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => { setUnit(e.target.value); setValidationError(""); }}
                    placeholder="e.g. pages, hrs"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-forge-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Quick Add Step Size</label>
                <input
                  type="number"
                  value={stepSize}
                  onChange={(e) => { setStepSize(e.target.value ? Number(e.target.value) : ""); setValidationError(""); }}
                  placeholder="e.g. 1"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forge-500 transition-colors"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">How much progress to add when you click the quick-add button.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Color Theme</label>
                <div className="flex gap-3">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-transform",
                        color === c ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "border-transparent opacity-50 hover:opacity-100",
                        `bg-${c.replace("-400", "-500")}`
                      )}
                      style={{ backgroundColor: c === 'blue-400' ? '#60a5fa' : c === 'cyan-400' ? '#22d3ee' : c === 'rose-400' ? '#fb7185' : c === 'purple-400' ? '#c084fc' : c === 'emerald-400' ? '#34d399' : c === 'amber-400' ? '#fbbf24' : '#a78bfa' }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Display Settings</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={showOnDashboard}
                      onChange={(e) => setShowOnDashboard(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/5 border-white/10 text-forge-500 focus:ring-forge-500/50"
                    />
                    <div>
                      <span className="text-sm font-semibold text-white/90 block">Show on Dashboard</span>
                      <span className="text-xs text-muted-foreground block">Display this widget in your daily tracking grid.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-white/5 bg-[#0a0a0c] shrink-0">
              {widgetToEdit ? (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to archive this widget? History will be preserved, but it will be removed from your dashboard.")) {
                      deleteWidget();
                    }
                  }}
                  disabled={isDeleting || isPending}
                  className="px-4 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  {isDeleting ? "Archiving..." : "Archive Widget"}
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isPending || isDeleting}
                  className="px-5 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveWidget()}
                  disabled={isPending || isDeleting}
                  className="px-6 py-2.5 rounded-xl bg-forge-500 hover:bg-forge-400 text-white transition-colors flex items-center gap-2 text-sm font-semibold disabled:opacity-50 min-w-[140px] justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
