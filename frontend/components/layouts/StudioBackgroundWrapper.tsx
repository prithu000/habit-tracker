"use client";

import React, { memo } from "react";
import { useCustomizationStore, WALLPAPER_OPTIONS } from "@/lib/stores/customizationStore";
import { GlobalFocusController } from "@/components/focus/GlobalFocusController";
import { cn } from "@/lib/utils/cn";

export const StudioBackgroundWrapper = memo(function StudioBackgroundWrapper() {
  const { wallpaper, customWallpaperUrl, blurLevel, overlayOpacity, theme } =
    useCustomizationStore();

  // Only render wallpaper/dark overlay for dark themes — light & cream use clean CSS var backgrounds
  const isDarkTheme = theme === "dark" || theme === "green";

  const getWallpaperUrl = () => {
    if (wallpaper === "custom") return customWallpaperUrl;
    const found = WALLPAPER_OPTIONS.find((w) => w.id === wallpaper);
    return found ? found.url : "";
  };

  const bgUrl = getWallpaperUrl();

  const blurClasses: Record<string, string> = {
    none: "blur-none",
    sm: "blur-sm",
    md: "blur-md",
    lg: "blur-lg",
    xl: "blur-xl",
  };

  return (
    <>
      {/* Wallpaper — only show if user has explicitly set one AND it's a dark theme */}
      {bgUrl && wallpaper !== "gradient" && isDarkTheme && (
        <div
          className={cn(
            "fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 scale-105 pointer-events-none transform-gpu",
            blurClasses[blurLevel] || "blur-none"
          )}
          style={{ backgroundImage: `url(${bgUrl})`, transform: "translateZ(0)" }}
        />
      )}

      {/* Animated mesh gradient — dark themes only */}
      {wallpaper === "gradient" && isDarkTheme && (
        <div
          className="fixed inset-0 z-0 overflow-hidden pointer-events-none transform-gpu"
          style={{ transform: "translateZ(0)" }}
        >
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px] animate-pulse" />
          <div
            className="absolute top-1/3 -right-40 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[160px] animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] bg-pink-600/15 rounded-full blur-[150px] animate-pulse"
            style={{ animationDelay: "4s" }}
          />
        </div>
      )}

      {/* Dark overlay — only when there's a wallpaper on a dark theme */}
      {bgUrl && isDarkTheme && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 transform-gpu"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${Math.max(0.75, overlayOpacity)})`,
            transform: "translateZ(0)",
          }}
        />
      )}

      {/* Global Background Focus Controller & Floating Mini Player */}
      <GlobalFocusController />
    </>
  );
});
