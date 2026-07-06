import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WallpaperType =
  | "none"
  | "nature"
  | "cyberpunk"
  | "mountains"
  | "ocean"
  | "sunset"
  | "galaxy"
  | "minimal"
  | "anime"
  | "abstract"
  | "gradient"
  | "custom";

export interface WallpaperOption {
  id: WallpaperType;
  name: string;
  url: string;
  thumbnail: string;
}

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  { id: "none", name: "Matte Black", url: "", thumbnail: "" },
  {
    id: "cyberpunk",
    name: "Cyberpunk City",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "galaxy",
    name: "Deep Galaxy",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2070&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "nature",
    name: "Nordic Forest",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "mountains",
    name: "Alpine Peaks",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2071&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "sunset",
    name: "Neon Sunset",
    url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=2064&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "minimal",
    name: "Dark Minimal",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "anime",
    name: "Neo Tokyo",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2070&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "abstract",
    name: "Fluid 3D",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "gradient",
    name: "Aurora Mesh",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=300&auto=format&fit=crop",
  },
];

export type AccentColor = "#8b5cf6" | "#06b6d4" | "#10b981" | "#f43f5e" | "#f59e0b" | "#6366f1" | "#ffffff";

export const ACCENT_COLORS: { label: string; value: AccentColor; bgClass: string; textClass: string; borderClass: string }[] = [
  { label: "Neon Purple", value: "#8b5cf6", bgClass: "bg-purple-500", textClass: "text-purple-400", borderClass: "border-purple-500/50" },
  { label: "Cyber Cyan", value: "#06b6d4", bgClass: "bg-cyan-500", textClass: "text-cyan-400", borderClass: "border-cyan-500/50" },
  { label: "Matrix Emerald", value: "#10b981", bgClass: "bg-emerald-500", textClass: "text-emerald-400", borderClass: "border-emerald-500/50" },
  { label: "Laser Rose", value: "#f43f5e", bgClass: "bg-rose-500", textClass: "text-rose-400", borderClass: "border-rose-500/50" },
  { label: "Solar Amber", value: "#f59e0b", bgClass: "bg-amber-500", textClass: "text-amber-400", borderClass: "border-amber-500/50" },
  { label: "Electric Indigo", value: "#6366f1", bgClass: "bg-indigo-500", textClass: "text-indigo-400", borderClass: "border-indigo-500/50" },
  { label: "Monochrome Chrome", value: "#ffffff", bgClass: "bg-white", textClass: "text-white", borderClass: "border-white/50" },
];

export type WidgetId =
  | "xp"
  | "level"
  | "calendar"
  | "clock"
  | "weather"
  | "quote"
  | "spotify"
  | "github"
  | "focus_timer"
  | "pomodoro"
  | "ai_coach"
  | "water_tracker"
  | "workout_progress"
  | "study_progress"
  | "habit_score";

export const ALL_WIDGETS: { id: WidgetId; label: string; category: "productivity" | "metrics" | "lifestyle" | "integrations"; description: string }[] = [
  { id: "ai_coach", label: "AI Coach & Insight", category: "productivity", description: "Daily AI suggestions and focus tips" },
  { id: "focus_timer", label: "Focus Timer", category: "productivity", description: "Quick stopwatch for deep work sessions" },
  { id: "pomodoro", label: "Pomodoro Clock", category: "productivity", description: "25/5 interval productivity clock" },
  { id: "xp", label: "XP & Level Ring", category: "metrics", description: "Real-time experience points and progress" },
  { id: "level", label: "Level Status", category: "metrics", description: "Current rank title and mastery tier" },
  { id: "habit_score", label: "Consistency Score", category: "metrics", description: "Algorithmic rating of routine discipline" },
  { id: "clock", label: "World Clock", category: "lifestyle", description: "Digital time display with date" },
  { id: "weather", label: "Cyber Weather", category: "lifestyle", description: "Current conditions and temperature" },
  { id: "quote", label: "Daily Wisdom", category: "lifestyle", description: "Curated philosophical quotes" },
  { id: "water_tracker", label: "Water Tracker", category: "lifestyle", description: "Daily hydration log and goal" },
  { id: "workout_progress", label: "Hypertrophy Push", category: "lifestyle", description: "Physical fitness routine tracker" },
  { id: "study_progress", label: "Deep Study", category: "lifestyle", description: "Learning and deep study goals" },
  { id: "calendar", label: "Mini Calendar", category: "integrations", description: "Monthly date overview" },
  { id: "spotify", label: "Spotify Player", category: "integrations", description: "Focus lo-fi beats stream" },
  { id: "github", label: "GitHub Activity", category: "integrations", description: "Commit graph & streak sync" },
];

interface CustomizationState {
  wallpaper: WallpaperType;
  customWallpaperUrl: string;
  blurLevel: "none" | "sm" | "md" | "lg" | "xl";
  overlayOpacity: number;
  accentColor: AccentColor;
  sidebarStyle: "glass" | "matte" | "floating";
  dashboardLayout: "grid" | "compact" | "wide";
  cardRadius: "16px" | "20px" | "24px";
  animationsEnabled: boolean;
  density: "comfortable" | "compact";
  enabledWidgets: WidgetId[];
  isRightSidebarOpen: boolean;

  // Actions
  setWallpaper: (type: WallpaperType, customUrl?: string) => void;
  setBlurLevel: (level: "none" | "sm" | "md" | "lg" | "xl") => void;
  setOverlayOpacity: (opacity: number) => void;
  setAccentColor: (color: AccentColor) => void;
  setSidebarStyle: (style: "glass" | "matte" | "floating") => void;
  setDashboardLayout: (layout: "grid" | "compact" | "wide") => void;
  setCardRadius: (radius: "16px" | "20px" | "24px") => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setDensity: (density: "comfortable" | "compact") => void;
  toggleWidget: (id: WidgetId) => void;
  setEnabledWidgets: (widgets: WidgetId[]) => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULT_ENABLED_WIDGETS: WidgetId[] = [
  "ai_coach",
  "xp",
  "habit_score",
  "focus_timer",
  "quote",
  "water_tracker",
  "weather",
  "spotify",
];

export const useCustomizationStore = create<CustomizationState>()(
  persist(
    (set) => ({
      wallpaper: "cyberpunk",
      customWallpaperUrl: "",
      blurLevel: "md",
      overlayOpacity: 0.78,
      accentColor: "#8b5cf6",
      sidebarStyle: "floating",
      dashboardLayout: "grid",
      cardRadius: "20px",
      animationsEnabled: true,
      density: "comfortable",
      enabledWidgets: DEFAULT_ENABLED_WIDGETS,
      isRightSidebarOpen: false,

      setWallpaper: (type, customUrl = "") => set({ wallpaper: type, customWallpaperUrl: customUrl }),
      setBlurLevel: (level) => set({ blurLevel: level }),
      setOverlayOpacity: (opacity) => set({ overlayOpacity: opacity }),
      setAccentColor: (color) => set({ accentColor: color }),
      setSidebarStyle: (style) => set({ sidebarStyle: style }),
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      setCardRadius: (radius) => set({ cardRadius: radius }),
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      setDensity: (density) => set({ density: density }),
      toggleWidget: (id) =>
        set((state) => ({
          enabledWidgets: state.enabledWidgets.includes(id)
            ? state.enabledWidgets.filter((w) => w !== id)
            : [...state.enabledWidgets, id],
        })),
      setEnabledWidgets: (widgets) => set({ enabledWidgets: widgets }),
      toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
      setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
      resetToDefaults: () =>
        set({
          wallpaper: "cyberpunk",
          customWallpaperUrl: "",
          blurLevel: "md",
          overlayOpacity: 0.78,
          accentColor: "#8b5cf6",
          sidebarStyle: "floating",
          dashboardLayout: "grid",
          cardRadius: "20px",
          animationsEnabled: true,
          density: "comfortable",
          enabledWidgets: DEFAULT_ENABLED_WIDGETS,
        }),
    }),
    {
      name: "forge-customization-storage",
    }
  )
);
