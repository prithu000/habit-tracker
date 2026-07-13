"use client";

import { LogOut, PanelRight, Sparkles, User as UserIcon, Menu } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCustomizationStore } from "@/lib/stores/customizationStore";
import { useUiStore } from "@/lib/stores/uiStore";
import { useRouter } from "next/navigation";
import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useLogout } from "@/lib/utils/logout";

export const Topbar = memo(function Topbar() {
  const { user } = useAuthStore();
  const { isRightSidebarOpen, toggleRightSidebar } = useCustomizationStore();
  const { toggleMobileDrawer } = useUiStore();
  const router = useRouter();
  const performLogout = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);

  const TAGLINES = [
    "Discipline equals freedom.",
    "Every action you complete today shapes tomorrow's version of you.",
    "Engineer Your Best Self.",
    "Consistency is the ultimate competitive advantage."
  ];

  useEffect(() => {
    const taglineInterval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 12000); // 12 second rotation
    return () => clearInterval(taglineInterval);
  }, []);

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

  const userInitial = user?.display_name?.charAt(0).toUpperCase()
    || user?.email?.charAt(0).toUpperCase()
    || "U";
  const displayName = user?.display_name || user?.email?.split("@")[0] || "Operator";

  const { countdown } = useSubscription();

  return (
    <header 
      className="h-[60px] min-h-[60px] border-b border-white/[0.08] bg-[#0a0a0c]/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 lg:px-6 shrink-0 w-full gap-2"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
    >

      {/* ── Left: Hamburger + Compact Logo ── */}
      <div className="flex items-center gap-2 shrink-0 min-w-0">
        {/* Hamburger — visible only on < lg */}
        <button
          onClick={toggleMobileDrawer}
          className="lg:hidden p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-opacity active:scale-95"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Compact Logo — visible only on mobile (< lg) */}
        <Link
          href="/dashboard"
          className="lg:hidden flex items-center gap-2 font-black text-sm tracking-tighter text-white shrink-0 min-w-0 max-w-[140px]"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-forge-500 to-purple-700 flex items-center justify-center text-white text-[10px] font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)] shrink-0">
            Y
          </div>
          <span className="truncate">YOU VS YOU</span>
        </Link>
      </div>

      {/* ── Center: Rotating Taglines (flex-1) ── */}
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <div className="relative h-6 w-full max-w-md flex items-center justify-center overflow-hidden">
          {TAGLINES.map((tagline, idx) => (
            <div
              key={idx}
              className={cn(
                "absolute text-xs font-medium tracking-wide text-zinc-400 transition-all duration-1000",
                idx === taglineIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              {tagline}
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop Search Removed ── */}

      {/* ── Right: Actions (Responsive Priority) ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Subscription Badge */}
        <Link
          href="/pricing"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight transition-opacity active:scale-95 shrink-0 border whitespace-nowrap",
            countdown.isActivePaid
              ? "bg-forge-500/20 border-forge-500/30 text-forge-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
              : countdown.isExpired
              ? "bg-white/5 border-white/10 text-muted-foreground"
              : "bg-white/5 border-white/20 text-white"
          )}
          title="Click to view plans and subscription status"
        >
          {countdown.isActivePaid ? (
            <>
              <span className="text-xs shrink-0">👑</span>
              <span className="uppercase tracking-widest font-bold">PRO MEMBER</span>
            </>
          ) : user?.plan_type === "free" ? (
            <span className="uppercase tracking-widest font-bold text-muted-foreground">FREE</span>
          ) : countdown.isExpired ? (
            <span>Trial Expired</span>
          ) : (
            <span>Trial • {countdown.endsToday ? "Ends Today" : `${countdown.daysRemaining} Days Left`}</span>
          )}
        </Link>

        {/* Search Mobile Removed */}

        {/* Studio — Icon only on <1024px, "Studio" text on ≥1024px */}
        {/* Hide on <380px (iPhone SE) */}
        <button
          onClick={toggleRightSidebar}
          className={cn(
            "hidden min-[380px]:flex p-2 lg:px-3 rounded-xl border transition-opacity active:scale-95 items-center gap-1.5 text-xs font-semibold shrink-0 h-10",
            isRightSidebarOpen
              ? "bg-forge-500/20 text-forge-300 border-forge-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              : "bg-white/[0.03] text-muted-foreground border-white/[0.08] hover:text-foreground hover:bg-white/[0.06] hover:border-white/20"
          )}
          title="Studio Control Panel"
          aria-label="Toggle Studio Wallpaper & Customization"
        >
          <PanelRight className="w-4 h-4 shrink-0" />
          <span className="hidden lg:inline whitespace-nowrap">Studio</span>
          <Sparkles className="hidden lg:inline w-3 h-3 text-forge-400 animate-pulse shrink-0" />
        </button>

        {/* Notifications Removed */}

        {/* Avatar — Fixed 36x36, Always Visible */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/[0.05] transition-opacity active:scale-95 focus:outline-none group border border-transparent hover:border-white/[0.08] w-9 h-9 shrink-0"
            aria-label="Profile menu"
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
          >
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-forge-500 to-purple-600 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <div className="w-full h-full bg-[#0a0a0c] rounded-[7px] flex items-center justify-center text-forge-300 font-bold text-xs group-hover:bg-transparent group-hover:text-white transition-all">
                {userInitial}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/[0.1] bg-[#0a0a0c]/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-1.5 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
                <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border",
                    countdown.isActivePaid 
                      ? "bg-forge-500/20 text-forge-300 border-forge-500/30" 
                      : "bg-white/5 text-muted-foreground border-white/10"
                  )}>
                    {countdown.isActivePaid ? "PRO MEMBER" : user?.plan_type === "free" ? "FREE" : countdown.isExpired ? "TRIAL EXPIRED" : "FREE TRIAL"}
                  </span>
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/profile");
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors flex items-center gap-2.5"
                  role="menuitem"
                >
                  <UserIcon className="w-3.5 h-3.5 text-forge-400" />
                  Profile Settings
                </button>
              </div>
              <div className="border-t border-white/[0.08] py-1">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2.5 transition-colors disabled:opacity-50"
                  role="menuitem"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});
