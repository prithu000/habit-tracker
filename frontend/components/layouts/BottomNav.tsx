"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
          bg-[#0a0a0c]/95 backdrop-blur-2xl
          border-t border-white/[0.08]
          shadow-[0_-8px_32px_rgba(0,0,0,0.6)]
          transition-all
        "
        style={{
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
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                  usePaywallStore.getState().openPaywall();
                }
              }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 py-1 min-w-[52px] group",
                isLocked && "opacity-65"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator pill directly centered above icon */}
              <AnimatePresence>
                {isActive && !isLocked && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-forge-500 shadow-[0_0_8px_#8b5cf6]"
                    initial={{ opacity: 0, scaleX: 0.5 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon container */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-150 shrink-0",
                  isActive && !isLocked
                    ? "bg-forge-500/15 text-forge-300"
                    : "text-muted-foreground group-hover:text-foreground group-hover:bg-white/[0.04]"
                )}
              >
                {/* Glow behind active icon */}
                {isActive && !isLocked && (
                  <span className="absolute inset-0 rounded-xl bg-forge-500/10 blur-sm" />
                )}
                <Icon
                  className={cn(
                    "relative w-4 h-4 sm:w-5 sm:h-5 transition-all duration-150 shrink-0",
                    isActive && !isLocked
                      ? "text-forge-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.9)]"
                      : "group-hover:scale-110"
                  )}
                />
                {isLocked && (
                  <Lock className="absolute -top-0.5 -right-0.5 w-3 h-3 text-amber-400/90 bg-[#0a0a0c] rounded-full p-0.5 border border-amber-500/30" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide transition-colors duration-150 leading-none text-center truncate max-w-full px-0.5",
                  isActive && !isLocked ? "text-forge-300 font-bold" : "text-muted-foreground group-hover:text-foreground"
                )}
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
