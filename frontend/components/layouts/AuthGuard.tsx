"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { AlertTriangle, RotateCcw, LayoutDashboard, LogOut } from "lucide-react";
import { useLogout } from "@/lib/utils/logout";
import { useUserProfile } from "@/lib/queries/useUser";
import { useSubscription } from "@/lib/hooks/useSubscription";

const PUBLIC_PATHS = ["/", "/login", "/register", "/about"];
const AUTH_ONLY_PATHS = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);
  
  // CRITICAL FIX: Mount these global queries here so they stay active across the app.
  // This enables `refetchOnWindowFocus` to trigger, which syncs fresh API data to Zustand.
  const { refetch: refetchUser } = useUserProfile();

  const router = useRouter();
  const pathname = usePathname();
  const performLogout = useLogout();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isAuthOnlyPath = AUTH_ONLY_PATHS.includes(pathname);

  const [isTimedOut, setIsTimedOut] = useState(false);
  const isNavigatingRef = useRef<string | null>(null);

  // 1. Immediate sync check if Zustand persist already finished hydrating before mount
  useEffect(() => {
    if (!hasHydrated) {
      if (useAuthStore.persist.hasHydrated()) {
        setHasHydrated(true);
      } else {
        useAuthStore.persist.rehydrate();
        setTimeout(() => setHasHydrated(true), 50);
      }
    }
  }, [hasHydrated, setHasHydrated]);

  // 2. Maximum 8-second loading timeout safety
  useEffect(() => {
    if (hasHydrated || isPublicPath) {
      setIsTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [hasHydrated, isPublicPath]);

  // 3. Race-condition free route guard
  useEffect(() => {
    if (!hasHydrated) return;

    let targetRoute: string | null = null;

    if (!isPublicPath && !isAuthenticated) {
      targetRoute = "/login";
    } else if (isAuthOnlyPath && isAuthenticated) {
      targetRoute = user?.onboarding_completed ? "/dashboard" : "/onboarding";
    } else if (isAuthenticated && !isPublicPath && !user?.onboarding_completed && pathname !== "/onboarding") {
      targetRoute = "/onboarding";
    }

    if (targetRoute && pathname !== targetRoute && isNavigatingRef.current !== targetRoute) {
      isNavigatingRef.current = targetRoute;
      router.replace(targetRoute);
    } else if (!targetRoute) {
      isNavigatingRef.current = null;
    }
  }, [hasHydrated, isAuthenticated, isPublicPath, isAuthOnlyPath, pathname, router, user?.onboarding_completed]);

  // Public paths: render immediately, no spinner
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Protected paths: show spinner until hydration completes (or timeout kicks in)
  if (!hasHydrated) {
    if (isTimedOut) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white p-6 relative overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md glass-card p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-black tracking-tight text-white">Something took longer than expected.</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We encountered a delay initializing your session state or connecting to the telemetry engine.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-forge-500 hover:bg-forge-400 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => {
                  setHasHydrated(true);
                  router.push("/dashboard");
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </button>
              <button
                onClick={async () => {
                  await performLogout();
                  window.location.href = "/login";
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Refresh Session</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white p-6 relative overflow-hidden">
        {/* Background mesh glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forge-500 to-purple-600 p-[1px] shadow-[0_0_40px_rgba(139,92,246,0.3)]">
            <div className="w-full h-full bg-[#0a0a0c] rounded-[15px] flex items-center justify-center font-black text-xl tracking-tighter text-white">
              YvY
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-black tracking-tight text-white uppercase">YOU VS YOU</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-forge-400">
              Loading Your Personal Operating System...
            </p>
            <p className="text-xs text-zinc-500 font-medium">
              Preparing your intelligence engine...
            </p>
          </div>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-forge-500 to-cyan-400 w-1/2 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated on a protected path, do NOT mount children during the redirect transition
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-forge-500 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If authenticated on an auth-only path (/login or /register), do NOT mount login/register children while redirecting
  if (isAuthOnlyPath) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-forge-500 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Redirecting to workspace...</p>
        </div>
      </div>
    );
  }

  // Hydrated and authenticated → render content
  return <>{children}</>;
}
