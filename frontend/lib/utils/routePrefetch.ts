/**
 * Route Prefetch Utility
 * 
 * Intelligently prefetches routes during idle time to make navigation feel instant.
 * Uses requestIdleCallback to avoid blocking user interactions.
 */

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// High-priority routes to prefetch immediately after login
export const HIGH_PRIORITY_ROUTES = [
  "/dashboard",
  "/life-score",
  "/routines",
  "/analytics",
  "/focus",
  "/calendar",
  "/reports",
];

// Medium-priority routes to prefetch during idle time
export const MEDIUM_PRIORITY_ROUTES = [
  "/leagues",
  "/settings",
  "/about",
  "/help",
  "/profile",
  "/pricing",
];

// Low-priority routes (prefetch only if very idle)
export const LOW_PRIORITY_ROUTES = [
  "/analytics/monthly",
  "/analytics/heatmap",
];

/**
 * Prefetch routes in order of priority during browser idle time
 */
export function prefetchRoutes(router: AppRouterInstance, routes: string[]) {
  if (typeof window === "undefined") return;

  const prefetchQueue = [...routes];

  const prefetchNext = () => {
    if (prefetchQueue.length === 0) return;

    const route = prefetchQueue.shift();
    if (!route) return;

    try {
      router.prefetch(route);
    } catch (error) {
      console.warn(`[Prefetch] Failed to prefetch ${route}:`, error);
    }

    // Schedule next prefetch during idle time
    if (prefetchQueue.length > 0) {
      scheduleIdlePrefetch(prefetchNext);
    }
  };

  // Start prefetching
  scheduleIdlePrefetch(prefetchNext);
}

/**
 * Schedule a task to run during browser idle time
 * Falls back to setTimeout if requestIdleCallback is not available
 */
function scheduleIdlePrefetch(callback: () => void) {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 50);
  }
}

/**
 * Prefetch high-priority routes immediately (non-blocking)
 */
export function prefetchHighPriority(router: AppRouterInstance) {
  // Use setTimeout to avoid blocking initial render
  setTimeout(() => {
    prefetchRoutes(router, HIGH_PRIORITY_ROUTES);
  }, 100);
}

/**
 * Prefetch medium-priority routes during idle time
 */
export function prefetchMediumPriority(router: AppRouterInstance) {
  scheduleIdlePrefetch(() => {
    prefetchRoutes(router, MEDIUM_PRIORITY_ROUTES);
  });
}

/**
 * Prefetch low-priority routes (only when very idle)
 */
export function prefetchLowPriority(router: AppRouterInstance) {
  // Wait longer before prefetching low-priority routes
  setTimeout(() => {
    scheduleIdlePrefetch(() => {
      prefetchRoutes(router, LOW_PRIORITY_ROUTES);
    });
  }, 5000);
}

/**
 * Prewarm bundles by dynamically importing page components during idle time
 * This loads the JavaScript bundles in the background
 */
export function prewarmBundles() {
  if (typeof window === "undefined") return;

  scheduleIdlePrefetch(async () => {
    try {
      // Prewarm Reports page
      await import("@/app/(app)/reports/page");
    } catch (error) {
      console.warn("[Prewarm] Failed to prewarm reports:", error);
    }
  });

  scheduleIdlePrefetch(async () => {
    try {
      // Prewarm Analytics page
      await import("@/app/(app)/analytics/page");
    } catch (error) {
      console.warn("[Prewarm] Failed to prewarm analytics:", error);
    }
  });

  scheduleIdlePrefetch(async () => {
    try {
      // Prewarm Life Score page
      await import("@/app/(app)/life-score/page");
    } catch (error) {
      console.warn("[Prewarm] Failed to prewarm life-score:", error);
    }
  });

  scheduleIdlePrefetch(async () => {
    try {
      // Prewarm Calendar page
      await import("@/app/(app)/calendar/page");
    } catch (error) {
      console.warn("[Prewarm] Failed to prewarm calendar:", error);
    }
  });
}
