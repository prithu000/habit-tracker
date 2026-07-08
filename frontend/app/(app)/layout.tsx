"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layouts/Sidebar";
import { Topbar } from "@/components/layouts/Topbar";
import { RightSidebar } from "@/components/layouts/RightSidebar";
import { Footer } from "@/components/layouts/Footer";
import { GlobalFocusController } from "@/components/focus/GlobalFocusController";
import { useCustomizationStore, WALLPAPER_OPTIONS } from "@/lib/stores/customizationStore";
import { cn } from "@/lib/utils/cn";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { wallpaper, customWallpaperUrl, blurLevel, overlayOpacity } = useCustomizationStore();

  const getWallpaperUrl = () => {
    if (wallpaper === "custom") return customWallpaperUrl;
    const found = WALLPAPER_OPTIONS.find((w) => w.id === wallpaper);
    return found ? found.url : "";
  };

  const bgUrl = getWallpaperUrl();

  const blurClasses = {
    none: "backdrop-blur-none",
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0c] text-foreground relative selection:bg-forge-500/30 selection:text-forge-200">
      {/* Background Wallpaper Layer */}
      {bgUrl && wallpaper !== "gradient" && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105 pointer-events-none"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}

      {/* Animated Mesh Gradient Layer */}
      {wallpaper === "gradient" && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-[700px] h-[700px] bg-indigo-600/30 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] bg-pink-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "4s" }} />
        </div>
      )}

      {/* Dark Gradient Overlay + Blur */}
      {bgUrl && (
        <div
          className={cn(
            "fixed inset-0 z-0 pointer-events-none transition-all duration-500",
            blurClasses[blurLevel] || "backdrop-blur-md"
          )}
          style={{
            backgroundColor: `rgba(10, 10, 12, ${overlayOpacity})`,
          }}
        />
      )}

      {/* Global Background Focus Controller & Floating Mini Player */}
      <GlobalFocusController />

      {/* Main Layout Elements */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 custom-scrollbar flex flex-col justify-between">
          <div className="mx-auto max-w-7xl transition-all duration-300 w-full">
            {children}
          </div>
          <Footer />
        </main>
      </div>

      <RightSidebar />
    </div>
  );
}
