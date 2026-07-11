/**
 * useRoutePrefetch Hook
 * 
 * Automatically prefetches routes after component mounts
 * to make navigation feel instant.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  prefetchHighPriority,
  prefetchMediumPriority,
  prefetchLowPriority,
  prewarmBundles,
} from "@/lib/utils/routePrefetch";

/**
 * Hook to prefetch routes intelligently
 * Call this in your main app layout or dashboard
 */
export function useRoutePrefetch() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch high-priority routes immediately
    prefetchHighPriority(router);

    // Prefetch medium-priority routes during idle time
    prefetchMediumPriority(router);

    // Prefetch low-priority routes when very idle
    prefetchLowPriority(router);

    // Prewarm bundles in the background
    prewarmBundles();
  }, [router]);
}
