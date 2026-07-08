"use client";

import { useMonthlyAnalytics } from "@/lib/queries/useAnalytics";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const MonthlyAnalyticsBarChart = dynamic(
  () => import("@/components/analytics/MonthlyAnalyticsBarChart").then((m) => m.MonthlyAnalyticsBarChart),
  { ssr: false, loading: () => <Skeleton className="h-[350px] w-full rounded-2xl bg-zinc-900/60" /> }
);

export default function MonthlyAnalyticsPage() {
  const { data: monthly, isLoading, isError } = useMonthlyAnalytics();

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !monthly) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Failed to load monthly data"
        description="We couldn't fetch your monthly analytics."
        action={<button onClick={() => window.location.reload()} className="btn-ghost">Retry</button>}
      />
    );
  }

  const days = (monthly.calendar_grid?.weeks || []).flat().filter((d: any) => d !== null) as any[];
  const chartData = days.map((day: any) => ({
    name: day.day.toString(),
    rate: day.completion_rate,
  }));

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Monthly Performance</h3>
          <p className="text-sm text-muted-foreground">Your task completion rate over the last 30 days.</p>
        </div>
        
        <div className="h-[350px] w-full">
          <MonthlyAnalyticsBarChart chartData={chartData} />
        </div>
      </motion.div>
    </div>
  );
}
