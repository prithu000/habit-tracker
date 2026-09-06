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
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
          style={{ background: "var(--bg)", color: "var(--fg)" }}
        >
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20" style={{ background: "var(--accent)" }} />
          <div
            className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md p-8 rounded-3xl border shadow-2xl"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow-hover)",
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>Something took longer than expected.</h2>
              <p className="text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                We encountered a delay initializing your session state or connecting to the telemetry engine.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => {
                  setHasHydrated(true);
                  router.push("/dashboard");
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </button>
              <button
                onClick={async () => {
                  await performLogout();
                  window.location.href = "/login";
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
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
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: "var(--bg)", color: "var(--fg)" }}
      >
        {/* Background mesh glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 animate-pulse" style={{ background: "var(--accent-subtle)" }} />
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl p-[1px] shadow-sm flex items-center justify-center border"
            style={{
              background: "var(--surface-raised)",
              borderColor: "var(--accent-border)",
            }}
          >
            <span className="font-bold text-xl tracking-tight" style={{ color: "var(--accent)" }}>
              YvY
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold tracking-tight uppercase" style={{ color: "var(--fg)" }}>YOU VS YOU</h2>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              Loading Your Personal Operating System...
            </p>
            <p className="text-xs font-medium" style={{ color: "var(--fg-muted)" }}>
              Preparing your intelligence engine...
            </p>
          </div>
          <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div className="h-full w-1/2 animate-pulse rounded-full" style={{ background: "var(--accent)" }} />
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated on a protected path, do NOT mount children during the redirect transition
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: "var(--bg)", color: "var(--fg)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--fg-muted)" }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If authenticated on an auth-only path (/login or /register), do NOT mount login/register children while redirecting
  if (isAuthOnlyPath) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: "var(--bg)", color: "var(--fg)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--fg-muted)" }}>Redirecting to workspace...</p>
        </div>
      </div>
    );
  }

  // Hydrated and authenticated → render content
  return <>{children}</>;
}
