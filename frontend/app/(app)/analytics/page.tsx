"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { usePaywallStore } from "@/lib/stores/paywallStore";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Loader2 } from "lucide-react";
import { useWeeklyAnalytics, useDisciplineScore } from "@/lib/queries/useAnalytics";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const WeeklyAnalyticsAreaChart = dynamic(
  () => import("@/components/analytics/WeeklyAnalyticsAreaChart").then((m) => m.WeeklyAnalyticsAreaChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full rounded-2xl bg-zinc-900/60" /> }
);

export default function WeeklyAnalyticsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { openPaywall } = usePaywallStore();
  const { isFreeMode } = useSubscription();

  useEffect(() => {
    if (isFreeMode) {
      openPaywall();
      router.replace("/pricing");
    }
  }, [isFreeMode, router, openPaywall]);
  if (isFreeMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return <WeeklyAnalyticsPageContent />;
}

function WeeklyAnalyticsPageContent() {
  const { data: weekly, isLoading: isWeeklyLoading, isError: isWeeklyError } = useWeeklyAnalytics();
  const { data: score, isLoading: isScoreLoading } = useDisciplineScore();

  if (isWeeklyLoading || isScoreLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (isWeeklyError || !weekly) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Failed to load analytics"
        description="We couldn't fetch your weekly data."
        action={<button onClick={() => window.location.reload()} className="btn-ghost">Retry</button>}
      />
    );
  }

  // Format data for Recharts
  const chartData = weekly.days.map((day: any) => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    rate: day.completion_rate,
    completed: day.tasks_completed,
    total: day.tasks_scheduled,
  }));

  // Check if user has any data
  const hasData = weekly.days.some((day: any) => day.tasks_completed > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Completion Trend Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Weekly Completion Trend</h3>
            <p className="text-sm text-muted-foreground">Your task completion rate over the last 7 days.</p>
          </div>
          
          {!hasData ? (
            <div className="h-[300px] w-full flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-white/10 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground mb-2">📈 Weekly Trend Locked</h4>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Complete your first routine to unlock your weekly trend graph.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <WeeklyAnalyticsAreaChart chartData={chartData} />
            </div>
          )}
        </motion.div>

        {/* Discipline Score Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-forge-500/10 rounded-full blur-[50px] -mr-10 -mt-10" />
          
          <div>
            <h3 className="text-lg font-semibold mb-1">Discipline Score</h3>
            <p className="text-sm text-muted-foreground mb-4 md:mb-8">Overall consistency metric</p>
            
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl font-display font-bold text-forge-400">
                {score?.score || 0}
              </span>
              <span className="text-muted-foreground mb-2">/ 100</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {score?.trend === 'up' ? (
                <span className="flex items-center text-success"><TrendingUp className="w-4 h-4 mr-1" /> Trending up</span>
              ) : score?.trend === 'down' ? (
                <span className="flex items-center text-danger"><TrendingDown className="w-4 h-4 mr-1" /> Trending down</span>
              ) : (
                <span className="text-muted-foreground">Stable</span>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2 uppercase tracking-widest">
              <span>Current Status</span>
              <span className="text-forge-400 font-medium">{score?.grade ? `Grade ${score.grade}` : (score?.category || (score?.is_initializing ? "Initializing" : "Neutral"))}</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full bg-forge-500"
                initial={{ width: 0 }}
                animate={{ width: `${score?.score || 0}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
