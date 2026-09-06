"use client";

import { useEffect } from "react";
import { useCustomizationStore } from "@/lib/stores/customizationStore";

/**
 * ThemeApplier — mounts on the client and syncs the `data-theme` attribute
 * on <html> with the user's persisted theme preference from Zustand.
 * Runs after hydration so SSR always renders with `data-theme="light"`.
 */
export function ThemeApplier() {
  const theme = useCustomizationStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes first
    root.removeAttribute("data-theme");
    root.setAttribute("data-theme", theme);

    // Sync dark-mode class for Tailwind's `dark:` variants
    if (theme === "dark" || theme === "green") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return null;
}
