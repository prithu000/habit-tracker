import { Skeleton } from "@/components/shared/Skeleton";
import { Settings } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-forge-400 shrink-0" />
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">
              Loading Settings...
            </h1>
          </div>
        </div>
      </div>

      {/* Settings Tabs Skeleton */}
      <div className="flex gap-2 border-b border-white/[0.08] pb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-xl" />
        ))}
      </div>

      {/* Settings Content Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}
