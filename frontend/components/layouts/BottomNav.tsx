"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Timer,
  FileText,
  User,
  Lock,
} from "lucide-react";
import { memo } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePaywallStore } from "@/lib/stores/paywallStore";
import { cn } from "@/lib/utils/cn";

const bottomNavItems = [
  { href: "/dashboard",  label: "Home",     icon: LayoutDashboard },
  { href: "/life-score", label: "Life",     icon: Sparkles },
  { href: "/focus",      label: "Focus",    icon: Timer, locked: true },
  { href: "/reports",    label: "Reports",  icon: FileText, locked: true },
  { href: "/profile",    label: "Profile",  icon: User },
];

export const BottomNav = memo(function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const isFreeMode = user?.subscription_status === "expired" || user?.is_premium_active === false;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden select-none"
      aria-label="Mobile navigation"
    >
      {/* Glass bar with exact safe area handling and 68-76px height bounds */}
      <div
        className="
          flex items-center justify-around w-full max-w-lg mx-auto
          px-2 pt-1.5
          backdrop-blur-xl
          border-t
          shadow-[0_-8px_30px_rgba(0,0,0,0.2)]
          transition-all
        "
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))",
          minHeight: "68px",
          maxHeight: "76px",
        }}
      >
        {bottomNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const isLocked = item.locked && isFreeMode;
          return (
            <Link
              key={item.href}
              href={isLocked ? "/pricing" : item.href}
              prefetch={!isLocked}
              onMouseEnter={() => !isLocked && router.prefetch(item.href)}
              onTouchStart={() => !isLocked && router.prefetch(item.href)}
              onFocus={() => !isLocked && router.prefetch(item.href)}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                  usePaywallStore.getState().openPaywall();
                }
              }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 py-1 min-w-[52px] group",
                isLocked && "opacity-60"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator pill directly centered above icon */}
              <AnimatePresence>
                {isActive && !isLocked && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full"
                    style={{ background: "var(--accent)" }}
                    initial={{ opacity: 0, scaleX: 0.5 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon container */}
              <div
                className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0"
                style={{
                  background: isActive && !isLocked ? "var(--accent-subtle)" : undefined,
                }}
              >
                <Icon
                  className="relative w-4 h-4 transition-colors shrink-0"
                  style={{
                    color: isActive && !isLocked ? "var(--accent)" : "var(--fg-muted)",
                  }}
                />
                {isLocked && (
                  <Lock 
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full p-0.5 border" 
                    style={{
                      background: "var(--surface-raised)",
                      borderColor: "var(--border)",
                      color: "var(--warning)",
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-medium tracking-tight transition-colors leading-none text-center truncate max-w-full px-0.5"
                style={{
                  color: isActive && !isLocked ? "var(--accent)" : "var(--fg-muted)",
                  fontWeight: isActive && !isLocked ? 600 : 500,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
