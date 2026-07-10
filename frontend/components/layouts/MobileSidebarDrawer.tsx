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
  Calendar,
  FileText,
  HelpCircle,
  User,
  Lock,
  X,
} from "lucide-react";
import { memo, useEffect, useRef } from "react";
import { useUiStore } from "@/lib/stores/uiStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePaywallStore } from "@/lib/stores/paywallStore";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { href: "/life-score", label: "Life Score",   icon: Sparkles },
  { href: "/routines",   label: "Routines",     icon: ListTodo },
  { href: "/focus",      label: "Focus Mode",   icon: Timer, locked: true },
  { href: "/calendar",   label: "Planner",      icon: Calendar, locked: true },
  { href: "/analytics",  label: "Analytics",    icon: BarChart3, locked: true },
  { href: "/leagues",    label: "Arena",        icon: Trophy, locked: true },
  { href: "/reports",    label: "Reports",      icon: FileText, locked: true },
  { href: "/about",      label: "About YvY",    icon: Sparkles },
  { href: "/help",       label: "Help & Bugs",  icon: HelpCircle },
];

export const MobileSidebarDrawer = memo(function MobileSidebarDrawer() {
  const { isMobileDrawerOpen, closeMobileDrawer } = useUiStore();
  const { user } = useAuthStore();
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
            className="fixed left-0 top-0 bottom-0 z-[70] w-[280px] flex flex-col lg:hidden
                       bg-[#0a0a0c]/97 backdrop-blur-2xl border-r border-white/[0.08]
                       shadow-[4px_0_40px_rgba(0,0,0,0.8)]"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className="h-[64px] min-h-[64px] flex items-center justify-between px-4 border-b border-white/[0.08] shrink-0">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 group"
                onClick={closeMobileDrawer}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-forge-500/20 to-purple-600/10 border border-forge-500/30 group-hover:border-forge-500/60 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-forge-400">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-sm tracking-wider text-foreground flex items-center gap-1">
                    YOU VS YOU
                    <Sparkles className="w-3 h-3 text-forge-400" />
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground -mt-0.5">
                    PERSONAL OS
                  </span>
                </div>
              </Link>
              <button
                onClick={closeMobileDrawer}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors border border-transparent hover:border-white/[0.08]"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Card */}
            {user && (
              <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.01] shrink-0">
                <Link
                  href="/profile"
                  onClick={closeMobileDrawer}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forge-500 to-purple-600 p-[1px] shadow-[0_0_12px_rgba(139,92,246,0.3)] shrink-0">
                    <div className="w-full h-full bg-[#0a0a0c] rounded-[10px] flex items-center justify-center text-forge-300 font-bold text-sm group-hover:bg-transparent group-hover:text-white transition-all">
                      {user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{user.display_name || "Operator"}</p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{user.email}</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
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
                        usePaywallStore.getState().openPaywall();
                        router.push("/pricing");
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors select-none",
                        isActive
                          ? "bg-gradient-to-r from-forge-500/20 via-forge-500/10 to-transparent text-forge-200 border-l-2 border-forge-500 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                        isLocked && "opacity-65 hover:opacity-90"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-forge-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" : "text-muted-foreground"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {isLocked && (
                        <Lock className="w-3.5 h-3.5 text-amber-400/90 shrink-0 ml-auto" />
                      )}
                      {isActive && !isLocked && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-forge-500 shadow-[0_0_8px_#8b5cf6]" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom — Settings */}
            <div className="p-3 border-t border-white/[0.08] shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]">
              <Link
                href="/settings"
                prefetch={true}
                onClick={closeMobileDrawer}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors select-none",
                    pathname.startsWith("/settings")
                      ? "bg-gradient-to-r from-forge-500/20 via-forge-500/10 to-transparent text-forge-200 border-l-2 border-forge-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <Settings className="w-4 h-4 shrink-0 text-muted-foreground" />
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
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors select-none",
                    pathname.startsWith("/profile")
                      ? "bg-gradient-to-r from-forge-500/20 via-forge-500/10 to-transparent text-forge-200 border-l-2 border-forge-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <User className="w-4 h-4 shrink-0 text-muted-foreground" />
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
