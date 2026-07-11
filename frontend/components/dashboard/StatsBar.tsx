"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Flame, Star, Trophy } from "lucide-react";
import { DashboardData } from "@/types/api";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { cn } from "@/lib/utils/cn";

import { memo } from "react";

interface StatsBarProps {
  stats: DashboardData["today"]["stats"];
}

export const StatsBar = memo(function StatsBar({ stats }: StatsBarProps) {
  const statCards = [
    {
      label: "Completion",
      value: `${stats.completion_rate}%`,
      subtext: `${stats.completed_tasks}/${stats.total_tasks} tasks`,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
      highlight: stats.is_perfect_day,
    },
    {
      label: "Current Streak",
      value: stats.current_streak,
      subtext: "days",
      icon: Flame,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
      highlight: stats.current_streak > 0,
    },
    {
      label: "XP Earned Today",
      value: `+${stats.xp_earned_today}`,
      subtext: "experience",
      icon: Star,
      color: "text-forge-400",
      bg: "bg-forge-500/10",
      border: "border-forge-500/20",
      highlight: stats.xp_earned_today > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {statCards.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className={cn(
            "glass-card p-5 flex items-center gap-4 relative overflow-hidden transition-colors duration-200",
            stat.highlight && `border-${stat.border.split('-')[1]} shadow-[0_0_15px_rgba(0,0,0,0.1)]`
          )}
        >
          {stat.highlight && (
            <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-current", stat.color)} />
          )}
          
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-full shrink-0", stat.bg)}>
            <stat.icon className={cn("h-6 w-6", stat.color)} />
          </div>
          
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono">
                {typeof stat.value === "number" ? (
                  <AnimatedCounter value={stat.value} />
                ) : (
                  stat.value
                )}
              </span>
              <span className="text-sm text-muted-foreground">{stat.subtext}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});
