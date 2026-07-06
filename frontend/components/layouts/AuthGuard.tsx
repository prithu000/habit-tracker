"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();
  const pathname = usePathname();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    // Don't run guard logic until Zustand has loaded from localStorage
    if (!hasHydrated) return;

    if (!isPublicPath && !isAuthenticated) {
      // Protected route, not logged in → go to login
      router.replace("/login");
    } else if (isPublicPath && isAuthenticated) {
      // Auth page, already logged in → redirect away
      if (user?.onboarding_completed) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    } else if (isAuthenticated && !isPublicPath && !user?.onboarding_completed && pathname !== "/onboarding") {
      // Logged in but onboarding incomplete
      router.replace("/onboarding");
    }
  }, [hasHydrated, isAuthenticated, isPublicPath, pathname, router, user?.onboarding_completed]);

  // Public paths: render immediately, no spinner
  // (Authenticated users will be redirected by the effect above)
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Protected paths: show spinner until hydration completes
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-forge-500/30 border-t-forge-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Hydrated and authenticated → render content
  // (Unauthenticated users are redirected by the effect above)
  return <>{children}</>;
}
