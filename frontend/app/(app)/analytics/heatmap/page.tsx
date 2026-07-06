"use client";

import { useHeatmapAnalytics } from "@/lib/queries/useAnalytics";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { YearHeatmap } from "@/components/analytics/YearHeatmap";
import { Calendar } from "lucide-react";

export default function HeatmapPage() {
  const { data: heatmapData, isLoading, isError } = useHeatmapAnalytics();

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (isError || !heatmapData) {
    return (
      <EmptyState
        icon={Calendar}
        title="Failed to load heatmap"
        description="We couldn't fetch your calendar data."
        action={<button onClick={() => window.location.reload()} className="btn-ghost">Retry</button>}
      />
    );
  }

  // Transform backend format to expected format if needed
  // Backend returns: { "2026-07-05": { completion_rate: 100, tasks_completed: 3, tasks_scheduled: 3 } }
  
  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-1">Consistency Heatmap</h3>
        <p className="text-sm text-muted-foreground">Your daily task completion rate over the year.</p>
      </div>

      <YearHeatmap data={heatmapData.heatmap || heatmapData} />
    </div>
  );
}
