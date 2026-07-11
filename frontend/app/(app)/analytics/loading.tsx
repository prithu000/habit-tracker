import { Skeleton } from "@/components/shared/Skeleton";
import { BarChart3 } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-forge-400 shrink-0" />
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">
              Loading Analytics...
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Preparing your performance insights
          </p>
        </div>
      </div>

      {/* Analytics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>

      {/* Chart Skeleton */}
      <Skeleton className="h-[400px] w-full rounded-3xl" />
    </div>
  );
}
