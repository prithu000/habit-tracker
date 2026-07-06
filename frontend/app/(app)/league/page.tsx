"use client";

import { useLeague } from "@/lib/queries/useRewards";
import { PageTransition } from "@/components/layouts/PageTransition";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Trophy, Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export default function LeaguePage() {
  const { data: league, isLoading, isError } = useLeague();

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }

  if (isError || !league) {
    return (
      <EmptyState
        icon={Trophy}
        title="League data unavailable"
        description="We couldn't fetch the current leaderboard."
        action={<button onClick={() => window.location.reload()} className="btn-ghost">Retry</button>}
      />
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forge-500/20 text-forge-400 mb-6 border border-forge-500/30 shadow-[0_0_30px_rgba(98,84,248,0.2)]">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Discipline League</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Top performers for {league.season}. Rankings are anonymous and reset monthly. 
            Currently tracking <span className="text-foreground font-medium">{league.total_participants}</span> participants.
          </p>
        </div>

        {/* User's Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-10 border-forge-500/30 bg-forge-500/5 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-forge-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex items-center gap-2 text-sm font-medium text-forge-400 uppercase tracking-widest mb-6">
            <TrendingUp className="w-4 h-4" />
            Your Standing
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Rank</p>
              <p className="text-2xl font-bold font-mono">
                {league.your_rank.rank ? `#${league.your_rank.rank}` : "Unranked"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Top</p>
              <p className="text-2xl font-bold font-mono text-success">
                {league.your_rank.percentile ? `${league.your_rank.percentile}%` : "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Monthly XP</p>
              <p className="text-2xl font-bold font-mono text-forge-400">
                {league.your_rank.monthly_xp}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Streak</p>
              <p className="text-2xl font-bold font-mono text-warning flex items-center gap-1">
                {league.your_rank.current_streak} <Flame className="w-5 h-5 text-warning" />
              </p>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground ml-2 mb-4">
            Global Top 10
          </h2>
          
          {league.leaderboard.map((entry: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center p-4 rounded-xl border transition-all",
                entry.is_self 
                  ? "bg-forge-500/10 border-forge-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
              )}
            >
              <div className="w-12 text-center font-mono font-bold text-lg text-muted-foreground">
                {entry.rank}
              </div>
              
              <div className="flex-1 ml-4">
                <span className={cn("font-medium", entry.is_self && "text-forge-300 font-bold")}>
                  {entry.label}
                </span>
                {entry.is_self && (
                  <span className="ml-2 text-xs bg-forge-500 text-white px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 text-warning" title="Current Streak">
                  <Flame className="w-4 h-4" />
                  <span className="font-mono font-medium">{entry.current_streak}</span>
                </div>
                
                <div className="w-24 text-right">
                  <span className="font-mono font-bold text-forge-400">{entry.monthly_xp}</span>
                  <span className="text-xs text-muted-foreground ml-1">XP</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
