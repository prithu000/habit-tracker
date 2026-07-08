"use client";

import { Bell, Search, LogOut, PanelRight, Sparkles, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUserProfile } from "@/lib/queries/useUser";
import { useCustomizationStore } from "@/lib/stores/customizationStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { isRightSidebarOpen, toggleRightSidebar } = useCustomizationStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Ensure user profile is always loaded and synced with backend on page navigation
  useUserProfile();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const refresh = useAuthStore.getState().tokens?.refresh;
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      logout();
      toast.success("Logged out successfully");
      router.push("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-[64px] border-b border-white/[0.08] bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6 shrink-0 transition-all">
      {/* Quick Search / Command Palette Trigger (Linear/Raycast style) */}
      <div className="flex-1 max-w-md">
        <div 
          onClick={() => {
            const input = document.getElementById("topbar-search-input") as HTMLInputElement;
            if (input) input.focus();
          }}
          className="group relative flex items-center bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-forge-500/40 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        >
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-forge-400 transition-colors mr-2.5 shrink-0" />
          <input
            id="topbar-search-input"
            type="text"
            placeholder="Search tasks, routines, insights..."
            className="w-full bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none cursor-text"
          />
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-muted-foreground shrink-0">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Studio Control / Right Sidebar Toggle */}
        <button
          onClick={toggleRightSidebar}
          className={cn(
            "relative p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold",
            isRightSidebarOpen
              ? "bg-forge-500/20 text-forge-300 border-forge-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              : "bg-white/[0.03] text-muted-foreground border-white/[0.08] hover:text-foreground hover:bg-white/[0.06] hover:border-white/20"
          )}
          title="Studio Control Panel"
        >
          <PanelRight className="w-4 h-4" />
          <span className="hidden md:inline">Studio</span>
          <Sparkles className="w-3 h-3 text-forge-400 animate-pulse" />
        </button>

        <div className="w-px h-6 bg-white/[0.08] mx-1" />

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-forge-500 rounded-full border border-[#0a0a0c] shadow-[0_0_8px_#8b5cf6]" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/[0.05] transition-all focus:outline-none group border border-transparent hover:border-white/[0.08]"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forge-500 to-purple-600 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <div className="w-full h-full bg-[#0a0a0c] rounded-[7px] flex items-center justify-center text-forge-300 font-bold text-xs group-hover:bg-transparent group-hover:text-white transition-all">
                {user?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            <span className="inline-block text-xs font-semibold text-foreground max-w-[120px] truncate">
              {user?.display_name || user?.email?.split("@")[0] || "Operator"}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/[0.1] bg-[#0a0a0c]/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-1.5 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
                <p className="text-xs font-bold text-foreground truncate">{user?.display_name || "Operator"}</p>
                <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-forge-500/20 text-forge-300 border border-forge-500/30 uppercase tracking-widest">
                    PRO MEMBER
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
}
