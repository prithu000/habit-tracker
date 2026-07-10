"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Palette,
  LayoutGrid,
  Trophy,
  Quote as QuoteIcon,
  Calendar,
  CheckCircle2,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Check,
  Plus,
  Eye,
} from "lucide-react";
import {
  useCustomizationStore,
  WALLPAPER_OPTIONS,
  ALL_WIDGETS,
  WallpaperType,
  WidgetId,
} from "@/lib/stores/customizationStore";
import { cn } from "@/lib/utils/cn";
import { useDashboard } from "@/lib/queries/useDashboard";

export function RightSidebar() {
  const {
    isRightSidebarOpen,
    toggleRightSidebar,
    wallpaper,
    setWallpaper,
    customWallpaperUrl,
    enabledWidgets,
    toggleWidget,
    blurLevel,
    setBlurLevel,
    cardRadius,
    setCardRadius,
    density,
    setDensity,
  } = useCustomizationStore();

  const { data: dashboard } = useDashboard();
  const [activeTab, setActiveTab] = useState<"customize" | "briefing">("customize");
  const [customUrlInput, setCustomUrlInput] = useState(customWallpaperUrl || "");

  if (!isRightSidebarOpen) return null;

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      setWallpaper("custom", customUrlInput.trim());
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 380, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 380, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed right-0 top-[64px] bottom-0 w-full sm:w-[380px] bg-[#0a0a0c]/98 backdrop-blur-3xl border-l border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[60] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forge-500/10 border border-forge-500/20 flex items-center justify-center text-forge-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-wide text-foreground">
                YOU VS YOU CONTROL
              </h2>
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
                YOU VS YOU Edition
              </p>
            </div>
          </div>
          <button
            onClick={toggleRightSidebar}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close Studio Control Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 p-2 gap-1 border-b border-white/[0.06] bg-black/40">
          <button
            onClick={() => setActiveTab("customize")}
            className={cn(
              "py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px]",
              activeTab === "customize"
                ? "bg-forge-500/20 text-forge-300 border border-forge-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Palette className="w-3.5 h-3.5" />
            Customize & Widgets
          </button>
          <button
            onClick={() => setActiveTab("briefing")}
            className={cn(
              "py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px]",
              activeTab === "briefing"
                ? "bg-forge-500/20 text-forge-300 border border-forge-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Trophy className="w-3.5 h-3.5" />
            Daily Briefing
          </button>
        </div>

        {/* Content Area with extra mobile bottom padding so no controls clip over BottomNav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 pb-28 sm:pb-6 space-y-6 custom-scrollbar">
          {activeTab === "customize" ? (
            <>
              {/* Wallpaper Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-forge-400" />
                    Atmosphere Wallpaper
                  </label>
                  <span className="text-[10px] text-forge-400 bg-forge-500/10 px-2 py-0.5 rounded-full border border-forge-500/20">
                    Live Blur
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {WALLPAPER_OPTIONS.map((wp) => {
                    const isSelected = wallpaper === wp.id;
                    return (
                      <button
                        key={wp.id}
                        onClick={() => setWallpaper(wp.id)}
                        className={cn(
                          "relative group h-16 rounded-xl overflow-hidden border transition-all text-left flex flex-col justify-end p-2.5",
                          isSelected
                            ? "border-forge-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] ring-1 ring-forge-500/50"
                            : "border-white/[0.08] hover:border-white/20 bg-white/[0.02]"
                        )}
                      >
                        {wp.thumbnail && (
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                            style={{ backgroundImage: `url(${wp.thumbnail})` }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span className="relative z-10 text-xs font-medium text-white flex items-center justify-between w-full">
                          {wp.name}
                          {isSelected && <Check className="w-3.5 h-3.5 text-forge-400" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom URL Input */}
                <form onSubmit={handleCustomUrlSubmit} className="pt-2 flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-forge-500"
                  />
                  <button
                    type="submit"
                    className="bg-forge-500/20 hover:bg-forge-500/30 text-forge-300 border border-forge-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Set
                  </button>
                </form>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <label className="flex-1 cursor-pointer bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-1.5 font-medium">
                    <ImageIcon className="w-3.5 h-3.5 text-forge-400" />
                    <span>Upload Local Wallpaper File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              setWallpaper("custom", reader.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Atmosphere Blur Controls */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Background Blur</span>
                  <div className="flex gap-1">
                    {(["none", "sm", "md", "lg", "xl"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setBlurLevel(lvl)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all",
                          blurLevel === lvl
                            ? "bg-forge-500 text-white"
                            : "bg-white/5 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Layout & Density */}
              <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-forge-400" />
                  Dashboard Geometry
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[11px] text-muted-foreground block mb-1">Card Radius</span>
                    <div className="flex gap-1">
                      {(["16px", "20px", "24px"] as const).map((rad) => (
                        <button
                          key={rad}
                          onClick={() => setCardRadius(rad)}
                          className={cn(
                            "flex-1 py-1 rounded text-xs font-medium transition-all",
                            cardRadius === rad
                              ? "bg-forge-500/20 text-forge-300 border border-forge-500/30"
                              : "bg-white/5 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {rad}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[11px] text-muted-foreground block mb-1">Density</span>
                    <div className="flex gap-1">
                      {(["comfortable", "compact"] as const).map((dens) => (
                        <button
                          key={dens}
                          onClick={() => setDensity(dens)}
                          className={cn(
                            "flex-1 py-1 rounded text-xs font-medium capitalize transition-all",
                            density === dens
                              ? "bg-forge-500/20 text-forge-300 border border-forge-500/30"
                              : "bg-white/5 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {dens.slice(0, 4)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget Selector */}
              <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-forge-400" />
                    Modular Widgets ({enabledWidgets.length}/16)
                  </label>
                </div>

                <div className="space-y-2">
                  {ALL_WIDGETS.map((widget) => {
                    const isEnabled = enabledWidgets.includes(widget.id);
                    return (
                      <div
                        key={widget.id}
                        onClick={() => toggleWidget(widget.id)}
                        className={cn(
                          "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none group",
                          isEnabled
                            ? "bg-white/[0.04] border-forge-500/30 shadow-[0_4px_20px_rgba(139,92,246,0.05)]"
                            : "bg-white/[0.01] border-white/[0.05] opacity-60 hover:opacity-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-4 h-4 rounded flex items-center justify-center text-white text-[10px] transition-colors",
                              isEnabled ? "bg-forge-500" : "bg-white/10 group-hover:bg-white/20"
                            )}
                          >
                            {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{widget.label}</p>
                            <p className="text-[10px] text-muted-foreground">{widget.description}</p>
                          </div>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
                          {widget.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Daily Quote */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-forge-500/10 via-purple-500/5 to-transparent border border-forge-500/20 relative overflow-hidden">
                <QuoteIcon className="w-8 h-8 text-forge-500/20 absolute -right-1 -bottom-1 rotate-12" />
                <p className="text-xs font-medium text-forge-200 leading-relaxed italic relative z-10">
                  &quot;We are what we repeatedly do. Excellence, then, is not an act, but a habit.&quot;
                </p>
                <p className="text-[10px] text-forge-400 font-semibold mt-2 relative z-10">
                  — Aristotle
                </p>
              </div>

              {/* Recent Achievements Preview */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Recent Achievements
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/30 flex flex-col items-center text-center gap-1.5 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-2xl">🔥</span>
                    <p className="text-xs font-bold text-foreground">First Ignite</p>
                    <p className="text-[10px] text-muted-foreground">Complete 1st task</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/30 flex flex-col items-center text-center gap-1.5 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-2xl">⚡</span>
                    <p className="text-xs font-bold text-foreground">Consistency</p>
                    <p className="text-[10px] text-muted-foreground">3-Day Streak</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Tasks Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Today&apos;s Agenda
                </h3>
                <div className="space-y-2">
                  {!dashboard || dashboard.today.routines.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground bg-white/[0.02] rounded-xl border border-white/[0.05]">
                      No scheduled routines for today.
                    </div>
                  ) : (
                    dashboard.today.routines.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                            style={{ backgroundColor: `${r.color}15`, color: r.color }}
                          >
                            {r.icon}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{r.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              {r.time_of_day} • {r.completed_count}/{r.task_count} tasks
                            </p>
                          </div>
                        </div>
                        {r.is_complete ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <span className="text-xs font-bold text-forge-400">
                            {r.completion_rate}%
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-black/60 text-center">
          <p className="text-[10px] text-muted-foreground">
            © 2026 YOU VS YOU • Engineer Your Best Self.
          </p>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
