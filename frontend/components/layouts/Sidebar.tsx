"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ListTodo,
  BarChart3,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Timer,
  Calendar,
  FileText,
  HelpCircle,
} from "lucide-react";
import { memo } from "react";
import { useUiStore } from "@/lib/stores/uiStore";
import { useCustomizationStore } from "@/lib/stores/customizationStore";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/life-score", label: "Life Score", icon: Sparkles },
  { href: "/routines", label: "Routines", icon: ListTodo },
  { href: "/focus", label: "Focus Mode", icon: Timer },
  { href: "/calendar", label: "Planner", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/leagues", label: "Arena", icon: Trophy },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/about", label: "About YvY", icon: Sparkles },
  { href: "/help", label: "Help & Bugs", icon: HelpCircle },
];

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();
  const { sidebarStyle } = useCustomizationStore();

  const styleClasses = {
    glass: "h-screen bg-[#0a0a0c]/75 backdrop-blur-2xl border-r border-white/[0.08] sticky top-0 shrink-0 z-40 transition-all duration-300",
    matte: "h-screen bg-[#0a0a0c] border-r border-white/[0.08] sticky top-0 shrink-0 z-40 transition-all duration-300",
    floating: "h-[calc(100vh-24px)] bg-[#0a0a0c]/85 backdrop-blur-2xl border border-white/[0.08] m-3 rounded-[20px] shadow-[0_0_40px_rgba(0,0,0,0.8)] sticky top-3 shrink-0 z-40 transition-all duration-300",
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 80 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={styleClasses[sidebarStyle] || styleClasses.floating}
    >
      {/* Logo */}
      <div className="h-[64px] flex items-center px-4 border-b border-white/[0.08]">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="flex items-center justify-center min-w-9 min-h-9 rounded-xl bg-gradient-to-br from-forge-500/20 to-purple-600/10 border border-forge-500/30 group-hover:border-forge-500/60 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-forge-400 group-hover:scale-110 transition-transform">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={cn(
            "flex flex-col overflow-hidden transition-opacity duration-300",
            isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            <span className="font-display font-black text-lg tracking-wider text-foreground flex items-center gap-1.5">
              YOU VS YOU
              <Sparkles className="w-3 h-3 text-forge-400" />
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground -mt-1">
              PERSONAL OS
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              prefetch={true} 
              onMouseEnter={() => router.prefetch(item.href)}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <div
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all select-none",
                  isActive
                    ? "bg-gradient-to-r from-forge-500/20 via-forge-500/10 to-transparent text-forge-200 border-l-2 border-forge-500 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                  isSidebarCollapsed && "justify-center px-0 border-l-0"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-all group-hover:scale-110",
                    isActive ? "text-forge-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isSidebarCollapsed && (
                  <span className="whitespace-nowrap tracking-wide">{item.label}</span>
                )}
                {/* Active Glow Dot for collapsed state */}
                {isActive && isSidebarCollapsed && (
                  <motion.div
                    layoutId="activeNavIndicatorCollapsed"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-forge-500 rounded-full shadow-[0_0_8px_#8b5cf6]"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/[0.08] flex flex-col gap-1.5">
        <Link 
          href="/settings" 
          prefetch={true} 
          onMouseEnter={() => router.prefetch("/settings")}
          title={isSidebarCollapsed ? "Settings" : undefined}
        >
          <div
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all select-none",
              pathname.startsWith("/settings")
                ? "bg-gradient-to-r from-forge-500/20 via-forge-500/10 to-transparent text-forge-200 border-l-2 border-forge-500"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
              isSidebarCollapsed && "justify-center px-0 border-l-0"
            )}
          >
            <Settings className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:rotate-45 transition-all" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap tracking-wide">Settings</span>}
          </div>
        </Link>
        
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-white/[0.04] hover:text-foreground transition-colors border border-transparent hover:border-white/[0.06]"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
});
