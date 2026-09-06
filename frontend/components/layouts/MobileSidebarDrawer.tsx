"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  BarChart3,
  Trophy,
  Settings,
  Sparkles,
  Timer,
  FileText,
  HelpCircle,
  User,
  Lock,
  X,
  PanelRight,
  Palette,
  Sun,
  Moon,
  Leaf,
  Check,
} from "lucide-react";
import { memo, useEffect, useRef } from "react";
import { useUiStore } from "@/lib/stores/uiStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCustomizationStore, AppTheme } from "@/lib/stores/customizationStore";
import { usePaywallStore } from "@/lib/stores/paywallStore";
import { cn } from "@/lib/utils/cn";
import { toast } from "react-hot-toast";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { href: "/life-score", label: "Life Score",   icon: Sparkles },
  { href: "/tasks",      label: "Tasks",        icon: ListTodo },
  { href: "/focus",      label: "Focus Mode",   icon: Timer, locked: true },
  { href: "/analytics",  label: "Analytics",    icon: BarChart3, locked: true },
  { href: "/leagues",    label: "Arena (Leagues)", icon: Trophy, locked: true },
  { href: "/reports",    label: "Reports",      icon: FileText, locked: true },
  { href: "/about",      label: "About YOU VS YOU", icon: Sparkles },
  { href: "/help",       label: "Help & Bugs",  icon: HelpCircle },
];

const THEME_OPTIONS: { id: AppTheme; label: string; icon: any; color: string }[] = [
  { id: "green", label: "Green", icon: Leaf, color: "#3DB84E" },
  { id: "dark", label: "Dark", icon: Moon, color: "#8A8D92" },
  { id: "cream", label: "Cream", icon: Sparkles, color: "#B48348" },
  { id: "light", label: "Light", icon: Sun, color: "#EAB308" },
];

export const MobileSidebarDrawer = memo(function MobileSidebarDrawer() {
  const { isMobileDrawerOpen, closeMobileDrawer } = useUiStore();
  const { user } = useAuthStore();
  const { theme, setTheme, isRightSidebarOpen, toggleRightSidebar } = useCustomizationStore();
  const isFreeMode = user?.subscription_status === "expired" || user?.is_premium_active === false;
  const pathname = usePathname();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on route change
  useEffect(() => {
    closeMobileDrawer();
  }, [pathname, closeMobileDrawer]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileDrawer();
    };
    if (isMobileDrawerOpen) {
      document.addEventListener("keydown", handleKey);
      // Prevent body scroll while drawer open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen, closeMobileDrawer]);

  // Touch swipe-to-close (swipe left)
  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (diff > 60) closeMobileDrawer(); // swipe left > 60px = close
    };
    const el = drawerRef.current;
    el?.addEventListener("touchstart", handleTouchStart, { passive: true });
    el?.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el?.removeEventListener("touchstart", handleTouchStart);
      el?.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobileDrawerOpen, closeMobileDrawer]);

  return (
    <AnimatePresence>
      {isMobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={closeMobileDrawer}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer-panel"
            ref={drawerRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
            className="fixed left-0 top-0 bottom-0 z-[70] w-[270px] flex flex-col lg:hidden border-r shadow-2xl"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            id="mobile-sidebar-drawer"
          >
            {/* Header */}
            <div 
              className="h-[60px] min-h-[60px] flex items-center justify-between px-4 border-b shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-3 group"
                onClick={closeMobileDrawer}
              >
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-lg border"
                  style={{
                    background: "var(--accent-subtle)",
                    borderColor: "var(--accent-border)",
                    color: "var(--accent)",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight" style={{ color: "var(--fg)" }}>
                    YOU VS YOU
                  </span>
                  <span className="text-[9px] font-mono tracking-wider -mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    PERSONAL OS
                  </span>
                </div>
              </Link>
              <button
                onClick={closeMobileDrawer}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                style={{ color: "var(--fg-muted)" }}
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Card */}
            {user && (
              <div 
                className="px-4 py-3 border-b shrink-0"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                }}
              >
                <Link
                  href="/profile"
                  onClick={closeMobileDrawer}
                  className="flex items-center gap-3 group"
                >
                  <div 
                    className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs"
                    style={{
                      background: "var(--accent-subtle)",
                      borderColor: "var(--accent-border)",
                      color: "var(--accent)",
                    }}
                  >
                    {user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--fg)" }}>{user.display_name || "Operator"}</p>
                    <p className="text-[10px] font-mono truncate" style={{ color: "var(--fg-muted)" }}>{user.email}</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                const isLocked = item.locked && isFreeMode;
                return (
                  <Link
                    key={item.href}
                    href={isLocked ? "/pricing" : item.href}
                    prefetch={!isLocked}
                    onMouseEnter={() => !isLocked && router.prefetch(item.href)}
                    onClick={(e) => {
                      closeMobileDrawer();
                      if (isLocked) {
                        e.preventDefault();
                        router.push("/pricing");
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors select-none",
                        !isActive && "hover:bg-[var(--surface-hover)]",
                        isLocked && "opacity-60 hover:opacity-85"
                      )}
                      style={{
                        background: isActive ? "var(--accent-subtle)" : undefined,
                        color: isActive ? "var(--accent)" : "var(--fg-muted)",
                        border: isActive ? "1px solid var(--accent-border)" : "1px solid transparent",
                      }}
                    >
                      <Icon
                        className="w-4 h-4 shrink-0 transition-colors"
                        style={{
                          color: isActive ? "var(--accent)" : "var(--fg-faint)",
                        }}
                      />
                      <span className="flex-1">{item.label}</span>
                      {isLocked && (
                        <Lock className="w-3 h-3 shrink-0 ml-auto" style={{ color: "var(--warning)" }} />
                      )}
                      {isActive && !isLocked && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* ── Change UI Theme Section ── */}
            <div
              className="px-3 py-2.5 border-t shrink-0 space-y-2"
              style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg-muted)" }}>
                  <Palette className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  Change UI Theme
                </span>
                <span
                  className="text-[9px] font-mono capitalize px-1.5 py-0.5 rounded border font-semibold"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--accent)" }}
                >
                  {theme}
                </span>
              </div>

              {/* 4 Theme Selection Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {THEME_OPTIONS.map((t) => {
                  const isCurrent = theme === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        toast.success(`${t.label} UI activated!`, { duration: 1800 });
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all border text-center relative",
                        isCurrent
                          ? "shadow-sm ring-1"
                          : "hover:opacity-80"
                      )}
                      style={{
                        background: isCurrent ? "var(--accent-subtle)" : "var(--surface)",
                        borderColor: isCurrent ? "var(--accent)" : "var(--border)",
                        color: isCurrent ? "var(--accent)" : "var(--fg-muted)",
                      }}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1 shrink-0" style={{ color: t.color }} />
                      <span className="text-[10px] font-semibold tracking-tight leading-none truncate max-w-full">
                        {t.label}
                      </span>
                      {isCurrent && (
                        <div className="w-1 h-1 rounded-full mt-1 shrink-0" style={{ background: "var(--accent)" }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Studio Customization Trigger */}
              <button
                onClick={() => {
                  toggleRightSidebar();
                  closeMobileDrawer();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--fg-muted)",
                }}
              >
                <div className="flex items-center gap-2">
                  <PanelRight className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  <span>Wallpapers & Studio</span>
                </div>
                <span className="text-[9px] uppercase font-mono" style={{ color: "var(--fg-faint)" }}>Open →</span>
              </button>
            </div>

            {/* Bottom — Settings */}
            <div 
              className="p-3 border-t shrink-0 pb-[max(12px,env(safe-area-inset-bottom))] space-y-1"
              style={{ borderColor: "var(--border)" }}
            >
              <Link
                href="/settings"
                prefetch={true}
                onClick={closeMobileDrawer}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors select-none",
                    !pathname.startsWith("/settings") && "hover:bg-[var(--surface-hover)]"
                  )}
                  style={{
                    background: pathname.startsWith("/settings") ? "var(--accent-subtle)" : undefined,
                    color: pathname.startsWith("/settings") ? "var(--accent)" : "var(--fg-muted)",
                    border: pathname.startsWith("/settings") ? "1px solid var(--accent-border)" : "1px solid transparent",
                  }}
                >
                  <Settings 
                    className="w-4 h-4 shrink-0" 
                    style={{ color: pathname.startsWith("/settings") ? "var(--accent)" : "var(--fg-faint)" }} 
                  />
                  <span>Settings</span>
                </div>
              </Link>

              <Link
                href="/profile"
                prefetch={true}
                onClick={closeMobileDrawer}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors select-none",
                    !pathname.startsWith("/profile") && "hover:bg-[var(--surface-hover)]"
                  )}
                  style={{
                    background: pathname.startsWith("/profile") ? "var(--accent-subtle)" : undefined,
                    color: pathname.startsWith("/profile") ? "var(--accent)" : "var(--fg-muted)",
                    border: pathname.startsWith("/profile") ? "1px solid var(--accent-border)" : "1px solid transparent",
                  }}
                >
                  <User 
                    className="w-4 h-4 shrink-0" 
                    style={{ color: pathname.startsWith("/profile") ? "var(--accent)" : "var(--fg-faint)" }} 
                  />
                  <span>Profile</span>
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
