"use client";

import { LogOut, Bell, User as UserIcon, Menu, X, Sun, Moon, Leaf, PanelLeftClose, PanelLeftOpen, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUiStore } from "@/lib/stores/uiStore";
import { useCustomizationStore, AppTheme } from "@/lib/stores/customizationStore";
import { useRouter, usePathname } from "next/navigation";
import { useState, memo } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useLogout } from "@/lib/utils/logout";

export const Topbar = memo(function Topbar() {
  const { user, _hasHydrated } = useAuthStore();
  const { isMobileDrawerOpen, toggleMobileDrawer, isSidebarCollapsed, toggleSidebarCollapsed } = useUiStore();
  const { theme, setTheme } = useCustomizationStore();
  const router = useRouter();
  const pathname = usePathname();
  const performLogout = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const THEME_CYCLE: AppTheme[] = ["light", "dark", "cream", "green"];
  const THEME_ICONS: Record<AppTheme, React.ReactNode> = {
    light: <Sun className="w-3.5 h-3.5" />,
    dark: <Moon className="w-3.5 h-3.5" />,
    cream: <Leaf className="w-3.5 h-3.5" />,
    green: <Leaf className="w-3.5 h-3.5" />,
  };
  const THEME_LABELS: Record<AppTheme, string> = {
    light: "Light",
    dark: "Dark",
    cream: "Cream",
    green: "Forest",
  };
  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await performLogout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (e) {
      console.error("Logout error", e);
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userInitial =
    user?.display_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";
  const displayName =
    user?.display_name || user?.email?.split("@")[0] || "Operator";

  const { subscription } = useSubscription();
  const isPremiumActive = subscription?.is_premium_active;
  const isExpired = subscription?.subscription_status === "expired";

  return (
    <header
      className="h-[60px] min-h-[60px] fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 lg:px-6 shrink-0 w-full gap-3"
      style={{
        background: "var(--topbar-bg)",
        borderBottom: "1px solid var(--topbar-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* ── Left: Hamburger (mobile only) & Back or Collapse Toggle ── */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleMobileDrawer}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg-muted)",
          }}
          aria-label={isMobileDrawerOpen ? "Close navigation" : "Open navigation"}
        >
          {isMobileDrawerOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex p-2 rounded-lg transition-colors"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg-muted)",
          }}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Center: YOU VS YOU — Your Personal Operating System ── */}
      <div className="flex-1 flex items-center justify-center px-2 text-center min-w-0 pointer-events-auto">
        <Link href="/dashboard" className="flex flex-col items-center justify-center leading-tight group transition-transform active:scale-95">
          <span className="font-extrabold text-xs sm:text-sm tracking-[0.18em] uppercase transition-colors group-hover:opacity-80" style={{ color: "var(--fg)" }}>
            YOU VS YOU
          </span>
          <span className="text-[8px] sm:text-[9.5px] tracking-[0.12em] uppercase font-semibold opacity-75 whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
            Your Personal Operating System
          </span>
        </Link>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Theme Cycler */}
        <button
          onClick={cycleTheme}
          className="hidden sm:flex items-center gap-1.5 w-8 h-8 justify-center rounded-lg transition-colors"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg-muted)",
          }}
          title={`Switch theme (current: ${THEME_LABELS[theme]})`}
        >
          {THEME_ICONS[theme]}
        </button>

        {/* Bell */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors relative"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg-muted)",
          }}
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* PRO Badge */}
        {_hasHydrated && (
          <Link
            href="/pricing"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all shrink-0 whitespace-nowrap"
            style={
              isPremiumActive
                ? {
                    background: "var(--accent)",
                    color: "var(--accent-fg)",
                  }
                : isExpired
                ? {
                    background: "rgba(192,57,43,0.1)",
                    color: "var(--danger)",
                    border: "1px solid rgba(192,57,43,0.2)",
                  }
                : {
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    color: "var(--fg-muted)",
                  }
            }
          >
            {isPremiumActive ? (
              <>
                <span>👑</span>
                <span>PRO</span>
              </>
            ) : isExpired ? (
              <span>RENEW</span>
            ) : (
              <span>PRO</span>
            )}
          </Link>
        )}

        {/* Avatar + Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0"
            style={{
              background: "var(--accent-subtle)",
              border: "1.5px solid var(--accent-border)",
              color: "var(--accent)",
            }}
            aria-label="Profile menu"
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
          >
            {userInitial}
          </button>

          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl py-1 overflow-hidden z-50"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--card-shadow-hover)",
                }}
                role="menu"
              >
                <div
                  className="px-3.5 py-2.5"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface-raised)",
                  }}
                >
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: "var(--fg)" }}
                  >
                    {displayName}
                  </p>
                  <p
                    className="text-[10px] truncate mt-0.5 font-mono"
                    style={{ color: "var(--fg-faint)" }}
                  >
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/profile");
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 transition-colors"
                    style={{ color: "var(--fg-muted)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "var(--surface-raised)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "transparent")
                    }
                    role="menuitem"
                  >
                    <UserIcon className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                    Profile Settings
                  </button>
                </div>
                <div
                  className="py-1"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                    style={{ color: "var(--danger)" }}
                    role="menuitem"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {isLoggingOut ? "Logging out..." : "Log out"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
});
