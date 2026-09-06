"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Lock,
  PanelLeftClose,
} from "lucide-react";
import { memo } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUiStore } from "@/lib/stores/uiStore";
import { usePaywallStore } from "@/lib/stores/paywallStore";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/life-score", label: "Life Score", icon: Sparkles },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/focus", label: "Focus Mode", icon: Timer, locked: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3, locked: true },
  { href: "/leagues", label: "Arena (Leagues)", icon: Trophy, locked: true },
  { href: "/reports", label: "Reports", icon: FileText, locked: true },
  { href: "/about", label: "About YOU VS YOU", icon: Sparkles },
  { href: "/help", label: "Help & Bugs", icon: HelpCircle },
];

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useUiStore();
  const isFreeMode =
    user?.subscription_status === "expired" || user?.is_premium_active === false;

  const userInitial =
    user?.display_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";
  const displayName =
    user?.display_name || user?.email?.split("@")[0] || "User";
  const isPro = user?.is_premium_active;

  return (
    /* Desktop-only */
    <div className="hidden lg:contents">
      <aside
        className={cn(
          "h-screen shrink-0 sticky top-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
          isSidebarCollapsed
            ? "w-0 min-w-0 opacity-0 pointer-events-none -translate-x-full overflow-hidden"
            : "w-[220px] opacity-100"
        )}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: isSidebarCollapsed ? "none" : "1px solid var(--sidebar-border)",
        }}
      >
        {/* ── Top Header: Collapse button (Site logo removed as requested) ── */}
        <div
          className="h-[60px] flex items-center justify-between px-4 shrink-0"
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <span
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: "var(--fg-faint)" }}
          >
            Menu
          </span>
          <button
            onClick={toggleSidebarCollapsed}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            style={{ color: "var(--fg-muted)" }}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* ── Nav Items ── */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            const isLocked = item.locked && isFreeMode;

            return (
              <Link
                key={item.href}
                href={isLocked ? "#" : item.href}
                prefetch={!isLocked}
                onMouseEnter={() => !isLocked && router.prefetch(item.href)}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    usePaywallStore.getState().openPaywall();
                  }
                }}
              >
                <div
                  className={cn(
                    "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all select-none",
                    isActive
                      ? "font-semibold"
                      : "hover:bg-[var(--surface-hover)]",
                    isLocked && "opacity-55"
                  )}
                  style={{
                    color: isActive ? "var(--accent)" : "var(--fg-muted)",
                    background: isActive ? "var(--accent-subtle)" : undefined,
                  }}
                >
                  <Icon
                    className="w-[15px] h-[15px] shrink-0 transition-colors"
                    style={{
                      color: isActive ? "var(--accent)" : "var(--fg-faint)",
                    }}
                  />
                  <span className="whitespace-nowrap flex-1">{item.label}</span>
                  {isLocked && (
                    <Lock
                      className="w-3 h-3 shrink-0 ml-auto"
                      style={{ color: "var(--warning)" }}
                    />
                  )}
                  {/* Active dot */}
                  {isActive && (
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom: Settings + Profile ── */}
        <div
          className="px-3 py-3 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--sidebar-border)" }}
        >
          {/* Settings */}
          <Link href="/settings" prefetch>
            <div
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all",
                pathname.startsWith("/settings")
                  ? "font-semibold"
                  : "hover:bg-[var(--surface-hover)]"
              )}
              style={{
                color: pathname.startsWith("/settings")
                  ? "var(--accent)"
                  : "var(--fg-muted)",
                background: pathname.startsWith("/settings")
                  ? "var(--accent-subtle)"
                  : undefined,
              }}
            >
              <Settings
                className="w-[15px] h-[15px] shrink-0"
                style={{
                  color: pathname.startsWith("/settings")
                    ? "var(--accent)"
                    : "var(--fg-faint)",
                }}
              />
              <span>Settings</span>
            </div>
          </Link>

          {/* User profile row */}
          <Link href="/profile">
            <div
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all hover:bg-[var(--surface-hover)] mt-1"
              style={{ color: "var(--fg-muted)" }}
            >
              {/* Avatar */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: "var(--accent-subtle)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-border)",
                }}
              >
                {userInitial}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className="text-xs font-semibold truncate leading-tight"
                  style={{ color: "var(--fg)" }}
                >
                  {displayName}
                </span>
                <span
                  className="text-[10px] leading-tight mt-0.5"
                  style={{ color: "var(--fg-faint)" }}
                >
                  {isPro ? "Pro Member" : "Free Plan"}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </aside>
    </div>
  );
});
