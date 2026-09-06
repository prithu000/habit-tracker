"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Flame, Star, BarChart2 } from "lucide-react";
import { DashboardData } from "@/types/api";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

interface StatsBarProps {
  stats: DashboardData["today"]["stats"];
  widgets?: DashboardData["widgets"];
}

export const StatsBar = memo(function StatsBar({ stats, widgets }: StatsBarProps) {
  const lifeScoreValue = (widgets as any)?.life_score?.overall_score ?? (widgets as any)?.life_score ?? null;
  const totalXp = widgets?.xp?.total_xp ?? null;

  const statCards = [
    {
      id: "completion",
      label: "Completion",
      primary: `${Math.round(stats.completion_rate)}%`,
      secondary: `${stats.completed_tasks}/${stats.total_tasks} tasks`,
      icon: CheckCircle2,
      iconColor: "var(--success)",
    },
    {
      id: "streak",
      label: "Current Streak",
      primary: `${stats.current_streak}`,
      secondary: stats.current_streak > 0 ? "Keep the momentum!" : "Start today",
      icon: Flame,
      iconColor: "var(--warning)",
      suffix: "day",
    },
    {
      id: "lifescore",
      label: "Life Score",
      primary: lifeScoreValue !== null ? `${Math.round(lifeScoreValue)}` : "—",
      secondary: "+8% vs last week",
      icon: BarChart2,
      iconColor: "var(--accent)",
    },
    {
      id: "xp",
      label: "XP Earned Today",
      primary: `+${stats.xp_earned_today}`,
      secondary: totalXp !== null ? `Total: ${totalXp.toLocaleString()}` : "experience",
      icon: Star,
      iconColor: "var(--warning)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {statCards.map((stat, i) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.05 }}
          className="p-4 rounded-xl relative overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] font-medium uppercase tracking-wider mb-2"
                style={{ color: "var(--fg-faint)" }}
              >
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-bold tracking-tight tabular-nums"
                  style={{ color: "var(--fg)" }}
                >
                  {stat.primary}
                </span>
                {stat.suffix && (
                  <span className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: "var(--fg-muted)" }}
              >
                {stat.secondary}
              </p>
            </div>

            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
              }}
            >
              <stat.icon className="w-4 h-4" style={{ color: stat.iconColor }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});
