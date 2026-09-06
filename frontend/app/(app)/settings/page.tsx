"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useUpdateUser, useChangePassword } from "@/lib/queries/useUser";
import { PageTransition } from "@/components/layouts/PageTransition";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SubscriptionTab } from "./SubscriptionTab";
import {
  User,
  Lock,
  Save,
  Palette,
  LayoutGrid,
  Download,
  Shield,
  Sparkles,
  Check,
  Sliders,
  Image as ImageIcon,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import {
  useCustomizationStore,
  WALLPAPER_OPTIONS,
  ACCENT_COLORS,
  ALL_WIDGETS,
} from "@/lib/stores/customizationStore";
import { cn } from "@/lib/utils/cn";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const updateMutation = useUpdateUser();
  const passwordMutation = useChangePassword();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab") as any;

  const {
    theme,
    setTheme,
    wallpaper,
    setWallpaper,
    blurLevel,
    setBlurLevel,
    accentColor,
    setAccentColor,
    sidebarStyle,
    setSidebarStyle,
    cardRadius,
    setCardRadius,
    animationsEnabled,
    setAnimationsEnabled,
    density,
    setDensity,
    enabledWidgets,
    toggleWidget,
    resetToDefaults,
  } = useCustomizationStore();

  const [activeTab, setActiveTab] = useState<
    "profile" | "subscription" | "appearance" | "widgets" | "security" | "data"
  >(tabQuery && ["profile", "subscription", "appearance", "widgets", "security", "data"].includes(tabQuery) ? tabQuery : "profile");

  const [profileData, setProfileData] = useState({
    display_name: "",
    identity_statement: "",
    time_preference: "morning",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  // Local notification toggles removed

  useEffect(() => {
    if (user) {
      setProfileData({
        display_name: user.display_name || "",
        identity_statement: user.identity_statement || "",
        time_preference: (user as any).time_preference || "morning",
      });
    }
  }, [user]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(profileData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.current_password || !passwordData.new_password) return;

    passwordMutation.mutate(passwordData, {
      onSuccess: () => {
        setPasswordData({ current_password: "", new_password: "", new_password_confirm: "" });
      },
    });
  };

  const handleExportData = () => {
    const data = {
      user: {
        email: user?.email,
        display_name: user?.display_name,
        identity_statement: user?.identity_statement,
      },
      customization: useCustomizationStore.getState(),
      exportDate: new Date().toISOString(),
      engine: "YOU VS YOU Personal OS V2.4",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `you-vs-you-telemetry-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success("Telemetry data exported to JSON");
  };

  const navTabs = [
    { id: "profile", label: "Profile & Identity", icon: User },
    { id: "subscription", label: "Subscription & Billing", icon: CreditCard },
    { id: "appearance", label: "Studio & Appearance", icon: Palette },
    { id: "widgets", label: "Modules & Widgets", icon: LayoutGrid },
    { id: "security", label: "Security & Auth", icon: Lock },
    { id: "data", label: "Data & Privacy", icon: Shield },
  ] as const;

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto pb-8 md:pb-16">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292930]">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight text-[#F5F5F7] flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span>Studio Configuration</span>
              <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#18181D] text-[#A78BFA] border border-[#292930] shrink-0 whitespace-nowrap">
                PRO CONTROL
              </span>
            </h1>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Manage your personal biological identity telemetry and UI engine aesthetics.
            </p>
          </div>
          <button
            onClick={() => {
              resetToDefaults();
              toast.success("Studio layout reset to defaults");
            }}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#18181D] hover:bg-[#202026] border border-[#292930] text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors flex items-center gap-1.5 min-h-[38px] shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset Studio Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Navigation Sidebar — swipeable pill navigation bar on mobile (< lg), vertical stack on desktop (lg+) */}
          <div className="lg:col-span-1 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none snap-x">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 text-left select-none shrink-0 snap-start min-h-[40px]",
                    isActive
                      ? "border-l-2 font-bold shadow-sm"
                      : "hover:bg-[var(--surface-hover)]"
                  )}
                  style={
                    isActive
                      ? {
                          background: "var(--accent-subtle)",
                          color: "var(--accent)",
                          borderColor: "var(--accent)",
                        }
                      : {
                          color: "var(--fg-muted)",
                        }
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? "var(--accent)" : "var(--fg-muted)" }} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "subscription" && <SubscriptionTab />}

            {/* 1. PROFILE TAB */}
            {activeTab === "profile" && (
              <div 
                className="p-6 rounded-2xl border shadow-sm"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              >
                <div className="pb-4 mb-6 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                  <div 
                    className="p-2 rounded-xl border"
                    style={{
                      background: "var(--accent-subtle)",
                      borderColor: "var(--accent-border)",
                      color: "var(--accent)",
                    }}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Profile & Identity</h2>
                    <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Configure your display moniker and identity affirmation.</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--fg-muted)" }}>
                      Display Moniker
                    </label>
                    <input
                      type="text"
                      value={profileData.display_name}
                      onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                      className="w-full max-w-md px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        background: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        color: "var(--fg)",
                      }}
                      placeholder="How should the neural engine address you?"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--fg-muted)" }}>
                      Identity Statement
                    </label>
                    <textarea
                      value={profileData.identity_statement}
                      onChange={(e) => setProfileData({ ...profileData, identity_statement: e.target.value })}
                      className="w-full max-w-xl h-24 resize-none px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        background: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        color: "var(--fg)",
                      }}
                      placeholder="I am the type of person who executes without friction..."
                    />
                    <p className="text-[11px] mt-2" style={{ color: "var(--fg-faint)" }}>
                      This statement is rendered daily on your Studio Header to reinforce neural identity loops.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--fg-muted)" }}>
                      Primary Biological Preference
                    </label>
                    <select
                      value={profileData.time_preference}
                      onChange={(e) => setProfileData({ ...profileData, time_preference: e.target.value })}
                      className="w-full max-w-xs px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        background: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        color: "var(--fg)",
                      }}
                    >
                      <option value="morning">Morning (05:00 - 11:59)</option>
                      <option value="afternoon">Afternoon (12:00 - 17:59)</option>
                      <option value="evening">Evening (18:00 - 23:59)</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                    <button 
                      type="submit" 
                      disabled={updateMutation.isPending} 
                      className="px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
                      style={{
                        background: "var(--accent)",
                        color: "var(--accent-fg)",
                      }}
                    >
                      <Save className="w-4 h-4" />
                      {updateMutation.isPending ? "Synchronizing..." : "Save Identity Protocol"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. APPEARANCE TAB */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                {/* ── THEME SWITCHER ── */}
                <div
                  className="p-6 rounded-2xl space-y-4"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--card-shadow)",
                  }}
                >
                  <div
                    className="pb-4 flex items-center gap-3"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div
                      className="p-2 rounded-xl"
                      style={{
                        background: "var(--accent-subtle)",
                        border: "1px solid var(--accent-border)",
                      }}
                    >
                      <Palette className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold" style={{ color: "var(--fg)" }}>
                        Theme
                      </h2>
                      <p className="text-xs mt-0.5" style={{ color: "var(--fg-faint)" }}>
                        Choose your visual identity. Changes apply instantly.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {([
                      {
                        id: "light" as const,
                        name: "Forest Light",
                        desc: "Warm ivory, forest green",
                        bg: "#F7F6F3",
                        surface: "#FFFFFF",
                        accent: "#2C5F2A",
                        border: "#E4E1DA",
                        fg: "#1A1916",
                      },
                      {
                        id: "dark" as const,
                        name: "Dark Premium",
                        desc: "Charcoal, emerald green",
                        bg: "#0F1011",
                        surface: "#181A1C",
                        accent: "#4CAF50",
                        border: "#282C30",
                        fg: "#F0EFEC",
                      },
                      {
                        id: "cream" as const,
                        name: "Cream Editorial",
                        desc: "Warm parchment, brass",
                        bg: "#FBF7F0",
                        surface: "#FFFCF7",
                        accent: "#7B5C38",
                        border: "#DDD3C0",
                        fg: "#1C1510",
                      },
                      {
                        id: "green" as const,
                        name: "Premium Forest",
                        desc: "Deep forest, vivid green",
                        bg: "#0A1209",
                        surface: "#111B10",
                        accent: "#3DB84E",
                        border: "#213020",
                        fg: "#E4EEE3",
                      },
                    ]).map((t) => {
                      const isActive = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className="relative text-left rounded-xl p-4 transition-all overflow-hidden"
                          style={{
                            background: t.bg,
                            border: isActive
                              ? `2px solid ${t.accent}`
                              : `1px solid ${t.border}`,
                            boxShadow: isActive
                              ? `0 0 0 3px ${t.accent}25`
                              : undefined,
                          }}
                        >
                          {/* Mini preview */}
                          <div className="flex gap-1 mb-3">
                            <div
                              className="w-4 h-8 rounded-md"
                              style={{ background: t.surface, border: `1px solid ${t.border}` }}
                            />
                            <div className="flex-1 space-y-1">
                              <div
                                className="h-2 rounded-full w-3/4"
                                style={{ background: t.fg, opacity: 0.15 }}
                              />
                              <div
                                className="h-1.5 rounded-full w-1/2"
                                style={{ background: t.fg, opacity: 0.08 }}
                              />
                              <div
                                className="h-2 rounded-md w-full mt-1"
                                style={{ background: t.accent, opacity: 0.85 }}
                              />
                            </div>
                          </div>
                          <p
                            className="text-xs font-bold leading-tight"
                            style={{ color: t.fg }}
                          >
                            {t.name}
                          </p>
                          <p
                            className="text-[10px] mt-0.5 leading-tight"
                            style={{ color: t.fg, opacity: 0.5 }}
                          >
                            {t.desc}
                          </p>
                          {isActive && (
                            <div
                              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: t.accent }}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wallpaper Gallery */}
                <div
                  className="p-6 rounded-2xl space-y-4"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="pb-4 border-b border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-display font-bold text-white">Atmospheric Wallpapers</h2>
                        <p className="text-xs text-muted-foreground">Select a high-fidelity background with real-time blur.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {WALLPAPER_OPTIONS.map((wp) => {
                      const isSelected = wallpaper === wp.id;
                      return (
                        <button
                          key={wp.id}
                          onClick={() => setWallpaper(wp.id)}
                          className={cn(
                            "relative group h-24 rounded-2xl overflow-hidden border transition-all text-left flex flex-col justify-end p-3",
                            isSelected
                              ? "border-forge-500 shadow-[0_0_25px_rgba(139,92,246,0.4)] ring-2 ring-forge-500/50"
                              : "border-white/[0.08] hover:border-white/30 bg-white/[0.02]"
                          )}
                        >
                          {wp.thumbnail && (
                            <div
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-50 group-hover:opacity-70"
                              style={{ backgroundImage: `url(${wp.thumbnail})` }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          <span className="relative z-10 text-xs font-bold text-white flex items-center justify-between w-full">
                            {wp.name}
                            {isSelected && <Check className="w-4 h-4 text-forge-400" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Blur Level Selector */}
                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Background Blur Intensity</span>
                    <div className="flex gap-1.5">
                      {(["none", "sm", "md", "lg", "xl"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setBlurLevel(lvl)}
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all",
                            blurLevel === lvl
                              ? "bg-forge-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                              : "bg-white/5 text-muted-foreground hover:text-white"
                          )}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Studio Geometry & Theme */}
                <div 
                  className="p-6 rounded-[24px] border space-y-6"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    boxShadow: "var(--card-shadow)",
                    color: "var(--fg)",
                  }}
                >
                  <div className="pb-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                    <div 
                      className="p-2.5 rounded-xl border"
                      style={{
                        background: "var(--accent-subtle)",
                        borderColor: "var(--accent-border)",
                        color: "var(--accent)",
                      }}
                    >
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-display font-bold" style={{ color: "var(--fg)" }}>Studio Geometry & Style</h2>
                      <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Adjust card radius, sidebar mode, and UI density.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card Radius */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: "var(--fg-muted)" }}>
                        Card Border Radius
                      </label>
                      <div className="flex gap-2">
                        {(["16px", "20px", "24px"] as const).map((rad) => (
                          <button
                            key={rad}
                            onClick={() => setCardRadius(rad)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                              cardRadius === rad
                                ? "shadow-sm"
                                : "hover:bg-[var(--surface-hover)]"
                            )}
                            style={
                              cardRadius === rad
                                ? {
                                    background: "var(--accent-subtle)",
                                    borderColor: "var(--accent-border)",
                                    color: "var(--accent)",
                                  }
                                : {
                                    background: "var(--surface-raised)",
                                    borderColor: "var(--border)",
                                    color: "var(--fg-muted)",
                                  }
                            }
                          >
                            {rad}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar Style */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: "var(--fg-muted)" }}>
                        Sidebar Architecture
                      </label>
                      <div className="flex gap-2">
                        {(["glass", "matte", "floating"] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => setSidebarStyle(style)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border",
                              sidebarStyle === style
                                ? "shadow-sm"
                                : "hover:bg-[var(--surface-hover)]"
                            )}
                            style={
                              sidebarStyle === style
                                ? {
                                    background: "var(--accent-subtle)",
                                    borderColor: "var(--accent-border)",
                                    color: "var(--accent)",
                                  }
                                : {
                                    background: "var(--surface-raised)",
                                    borderColor: "var(--border)",
                                    color: "var(--fg-muted)",
                                  }
                            }
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Density */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: "var(--fg-muted)" }}>
                        Layout Density
                      </label>
                      <div className="flex gap-2">
                        {(["comfortable", "compact"] as const).map((dens) => (
                          <button
                            key={dens}
                            onClick={() => setDensity(dens)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border",
                              density === dens
                                ? "shadow-sm"
                                : "hover:bg-[var(--surface-hover)]"
                            )}
                            style={
                              density === dens
                                ? {
                                    background: "var(--accent-subtle)",
                                    borderColor: "var(--accent-border)",
                                    color: "var(--accent)",
                                  }
                                : {
                                    background: "var(--surface-raised)",
                                    borderColor: "var(--border)",
                                    color: "var(--fg-muted)",
                                  }
                            }
                          >
                            {dens}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Animations Toggle */}
                  <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <span className="text-xs font-bold block" style={{ color: "var(--fg)" }}>Framer Motion Micro-Animations</span>
                      <span className="text-[11px]" style={{ color: "var(--fg-muted)" }}>Enable smooth hover lifts and fluid progress transitions.</span>
                    </div>
                    <button
                      onClick={() => setAnimationsEnabled(!animationsEnabled)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative p-1",
                        animationsEnabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full bg-white transition-transform",
                          animationsEnabled ? "translate-x-6" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. WIDGETS TAB */}
            {activeTab === "widgets" && (
              <div 
                className="p-6 rounded-[24px] border space-y-6"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--card-shadow)",
                  color: "var(--fg)",
                }}
              >
                <div className="pb-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-xl border"
                      style={{
                        background: "var(--accent-subtle)",
                        borderColor: "var(--accent-border)",
                        color: "var(--accent)",
                      }}
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-display font-bold" style={{ color: "var(--fg)" }}>Modular Dashboard Widgets</h2>
                      <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Toggle which productivity and lifestyle widgets appear on your dashboard grid.</p>
                    </div>
                  </div>
                  <span 
                    className="text-xs font-mono font-bold px-3 py-1 rounded-xl border"
                    style={{
                      background: "var(--accent-subtle)",
                      borderColor: "var(--accent-border)",
                      color: "var(--accent)",
                    }}
                  >
                    {enabledWidgets.length} / 16 ENABLED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ALL_WIDGETS.map((widget) => {
                    const isEnabled = enabledWidgets.includes(widget.id);
                    return (
                      <div
                        key={widget.id}
                        onClick={() => toggleWidget(widget.id)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none group"
                        )}
                        style={
                          isEnabled
                            ? {
                                background: "var(--accent-subtle)",
                                borderColor: "var(--accent-border)",
                              }
                            : {
                                background: "var(--surface-raised)",
                                borderColor: "var(--border)",
                                opacity: 0.6,
                              }
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-all shrink-0"
                            )}
                            style={
                              isEnabled
                                ? { background: "var(--accent)", color: "var(--accent-fg)" }
                                : { background: "var(--border)", color: "transparent" }
                            }
                          >
                            {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate" style={{ color: "var(--fg)" }}>{widget.label}</p>
                            <p className="text-[10px] truncate" style={{ color: "var(--fg-muted)" }}>{widget.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. SECURITY TAB */}
            {activeTab === "security" && (
              <div 
                className="p-6 rounded-[24px] border space-y-6"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--card-shadow)",
                  color: "var(--fg)",
                }}
              >
                <div className="pb-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                  <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold" style={{ color: "var(--fg)" }}>Security & Authentication</h2>
                    <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Manage password credentials and active JWT token sessions.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--fg-muted)" }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        background: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        color: "var(--fg)",
                      }}
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--fg-muted)" }}>
                      New Password (min. 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        background: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        color: "var(--fg)",
                      }}
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--fg-muted)" }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordData.new_password_confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                      style={{
                        background: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        color: "var(--fg)",
                      }}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={passwordMutation.isPending}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                    >
                      {passwordMutation.isPending ? "Updating Credentials..." : "Update Password Credentials"}
                    </button>
                  </div>
                </form>
              </div>
            )}



            {/* 6. DATA & PRIVACY TAB */}
            {activeTab === "data" && (
              <div 
                className="p-6 rounded-[24px] border space-y-6"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--card-shadow)",
                  color: "var(--fg)",
                }}
              >
                <div className="pb-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                  <div 
                    className="p-2.5 rounded-xl border"
                    style={{
                      background: "var(--accent-subtle)",
                      borderColor: "var(--accent-border)",
                      color: "var(--accent)",
                    }}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold" style={{ color: "var(--fg)" }}>Data Export & Privacy</h2>
                    <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Export your telemetry or manage account privacy.</p>
                  </div>
                </div>

                <div 
                  className="p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  style={{
                    background: "var(--surface-raised)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div>
                    <h3 className="text-xs font-bold" style={{ color: "var(--fg)" }}>Export Exhaustive Telemetry JSON</h3>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--fg-muted)" }}>
                      Download all your customization settings, habits, and biological progress data as a portable JSON file.
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 shrink-0 shadow-sm hover:opacity-90"
                    style={{
                      background: "var(--accent)",
                      color: "var(--accent-fg)",
                      borderColor: "var(--accent)",
                    }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
