"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

const PUBLIC_PATHS = ["/", "/login", "/register", "/about"];
const AUTH_ONLY_PATHS = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();
  const pathname = usePathname();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isAuthOnlyPath = AUTH_ONLY_PATHS.includes(pathname);

  useEffect(() => {
    // Don't run guard logic until Zustand has loaded from localStorage
    if (!hasHydrated) return;

    if (!isPublicPath && !isAuthenticated) {
      // Protected route, not logged in → go to login
      router.replace("/login");
    } else if (isAuthOnlyPath && isAuthenticated) {
      // Auth page (/login or /register), already logged in → redirect away
      if (user?.onboarding_completed) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    } else if (isAuthenticated && !isPublicPath && !user?.onboarding_completed && pathname !== "/onboarding") {
      // Logged in but onboarding incomplete
      router.replace("/onboarding");
    }
  }, [hasHydrated, isAuthenticated, isPublicPath, isAuthOnlyPath, pathname, router, user?.onboarding_completed]);

  // Public paths: render immediately, no spinner
  // (Authenticated users will be redirected by the effect above)
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Protected paths: show spinner until hydration completes
  if (!hasHydrated) {
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

  // Hydrated and authenticated → render content
  // (Unauthenticated users are redirected by the effect above)
  return <>{children}</>;
}
