import { Skeleton } from "@/components/shared/Skeleton";
import { Sparkles } from "lucide-react";

export default function LifeScoreLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-forge-400 shrink-0" />
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">
              Calculating Life Score...
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Analyzing your life balance metrics
          </p>
        </div>
      </div>

      {/* Score Card Skeleton */}
      <Skeleton className="h-48 w-full rounded-3xl" />

      {/* Chart Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    </div>
  );
}
