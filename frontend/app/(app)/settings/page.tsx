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
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black tracking-tight text-white flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span>Studio Configuration</span>
              <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-forge-500/10 text-forge-400 border border-forge-500/20 shrink-0 whitespace-nowrap">
                PRO CONTROL
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your personal biological identity telemetry and UI engine aesthetics.
            </p>
          </div>
          <button
            onClick={() => {
              resetToDefaults();
              toast.success("Studio layout reset to defaults");
            }}
            className="self-start sm:self-auto px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-muted-foreground hover:text-white transition-all flex items-center gap-1.5 min-h-[44px] shrink-0"
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
                    "px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 sm:gap-3 text-left select-none shrink-0 snap-start min-h-[44px]",
                    isActive
                      ? "bg-gradient-to-r from-forge-500/20 via-forge-500/10 to-transparent text-forge-200 border-l-2 lg:border-l-2 border-forge-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-forge-400" : "text-muted-foreground")} />
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
              <div className="p-6 rounded-[24px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="pb-4 mb-6 border-b border-white/[0.08] flex items-center gap-3">
                  <div className="p-2.5 bg-forge-500/10 text-forge-400 rounded-xl border border-forge-500/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold text-white">Profile & Identity</h2>
                    <p className="text-xs text-muted-foreground">Configure your display moniker and identity affirmation.</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                      Display Moniker
                    </label>
                    <input
                      type="text"
                      value={profileData.display_name}
                      onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                      className="forge-input max-w-md bg-white/[0.03] border-white/[0.08] focus:border-forge-500 text-xs"
                      placeholder="How should the neural engine address you?"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                      Identity Statement
                    </label>
                    <textarea
                      value={profileData.identity_statement}
                      onChange={(e) => setProfileData({ ...profileData, identity_statement: e.target.value })}
                      className="forge-input max-w-xl h-24 resize-none bg-white/[0.03] border-white/[0.08] focus:border-forge-500 text-xs"
                      placeholder="I am the type of person who executes without friction..."
                    />
                    <p className="text-[11px] text-muted-foreground mt-2">
                      This statement is rendered daily on your Studio Header to reinforce neural identity loops.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                      Primary Biological Preference
                    </label>
                    <select
                      value={profileData.time_preference}
                      onChange={(e) => setProfileData({ ...profileData, time_preference: e.target.value })}
                      className="forge-input max-w-xs bg-[#0a0a0c] border-white/[0.08] focus:border-forge-500 text-xs"
                    >
                      <option value="morning">Morning (05:00 - 11:59)</option>
                      <option value="afternoon">Afternoon (12:00 - 17:59)</option>
                      <option value="evening">Evening (18:00 - 23:59)</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-white/[0.08]">
                    <button type="submit" disabled={updateMutation.isPending} className="btn-forge text-xs inline-flex items-center gap-2">
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
                {/* Wallpaper Gallery */}
                <div className="p-6 rounded-[24px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-4">
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
                <div className="p-6 rounded-[24px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-6">
                  <div className="pb-4 border-b border-white/[0.08] flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-display font-bold text-white">Studio Geometry & Style</h2>
                      <p className="text-xs text-muted-foreground">Adjust card radius, sidebar mode, and UI density.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card Radius */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                        Card Border Radius
                      </label>
                      <div className="flex gap-2">
                        {(["16px", "20px", "24px"] as const).map((rad) => (
                          <button
                            key={rad}
                            onClick={() => setCardRadius(rad)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                              cardRadius === rad
                                ? "bg-forge-500/20 text-forge-300 border border-forge-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                : "bg-white/[0.03] border border-white/[0.08] text-muted-foreground hover:text-white"
                            )}
                          >
                            {rad}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar Style */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                        Sidebar Architecture
                      </label>
                      <div className="flex gap-2">
                        {(["glass", "matte", "floating"] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => setSidebarStyle(style)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                              sidebarStyle === style
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                : "bg-white/[0.03] border border-white/[0.08] text-muted-foreground hover:text-white"
                            )}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Density */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                        Layout Density
                      </label>
                      <div className="flex gap-2">
                        {(["comfortable", "compact"] as const).map((dens) => (
                          <button
                            key={dens}
                            onClick={() => setDensity(dens)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                              density === dens
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                : "bg-white/[0.03] border border-white/[0.08] text-muted-foreground hover:text-white"
                            )}
                          >
                            {dens}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Animations Toggle */}
                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Framer Motion Micro-Animations</span>
                      <span className="text-[11px] text-muted-foreground">Enable smooth hover lifts and fluid progress transitions.</span>
                    </div>
                    <button
                      onClick={() => setAnimationsEnabled(!animationsEnabled)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative p-1",
                        animationsEnabled ? "bg-forge-500" : "bg-white/10"
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
              <div className="p-6 rounded-[24px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-6">
                <div className="pb-4 border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-display font-bold text-white">Modular Dashboard Widgets</h2>
                      <p className="text-xs text-muted-foreground">Toggle which productivity and lifestyle widgets appear on your dashboard grid.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
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
                          "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none group",
                          isEnabled
                            ? "bg-white/[0.04] border-forge-500/40 shadow-[0_4px_20px_rgba(139,92,246,0.1)]"
                            : "bg-white/[0.01] border-white/[0.05] opacity-50 hover:opacity-100"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-lg flex items-center justify-center text-white text-xs transition-all shrink-0",
                              isEnabled ? "bg-forge-500 shadow-[0_0_10px_#8b5cf6]" : "bg-white/10 group-hover:bg-white/20"
                            )}
                          >
                            {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{widget.label}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{widget.description}</p>
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
              <div className="p-6 rounded-[24px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-6">
                <div className="pb-4 border-b border-white/[0.08] flex items-center gap-3">
                  <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold text-white">Security & Authentication</h2>
                    <p className="text-xs text-muted-foreground">Manage password credentials and active JWT token sessions.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="forge-input bg-white/[0.03] border-white/[0.08] focus:border-rose-500 text-xs"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                      New Password (min. 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="forge-input bg-white/[0.03] border-white/[0.08] focus:border-rose-500 text-xs"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordData.new_password_confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
                      className="forge-input bg-white/[0.03] border-white/[0.08] focus:border-rose-500 text-xs"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={passwordMutation.isPending}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    >
                      {passwordMutation.isPending ? "Updating Credentials..." : "Update Password Credentials"}
                    </button>
                  </div>
                </form>
              </div>
            )}



            {/* 6. DATA & PRIVACY TAB */}
            {activeTab === "data" && (
              <div className="p-6 rounded-[24px] bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] space-y-6">
                <div className="pb-4 border-b border-white/[0.08] flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold text-white">Data Export & Privacy</h2>
                    <p className="text-xs text-muted-foreground">Export your telemetry or manage account privacy.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-white">Export Exhaustive Telemetry JSON</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Download all your customization settings, habits, and biological progress data as a portable JSON file.
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all flex items-center gap-2 shrink-0"
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
