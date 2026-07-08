"use client";

import { DashboardData } from "@/types/api";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Flame, Star, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface SidebarWidgetsProps {
  widgets: DashboardData["widgets"];
}

export function SidebarWidgets({ widgets }: SidebarWidgetsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Day Progress Ring */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
          <Link href="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">Today&apos;s Progress</h3>
        
        <ProgressRing 
          progress={widgets.day_progress.completion_rate} 
          size={160} 
          strokeWidth={12}
          color={widgets.day_progress.is_perfect_day ? "var(--forge-success, #34D399)" : "var(--forge-500, #6254f8)"}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl font-display font-bold">
              {widgets.day_progress.completion_rate}%
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {widgets.day_progress.tasks_completed} of {widgets.day_progress.tasks_scheduled} tasks
            </span>
          </div>
        </ProgressRing>

        {widgets.day_progress.is_perfect_day && (
          <div className="mt-6 text-sm font-medium text-success bg-success/10 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Perfect Day
          </div>
        )}
      </motion.div>

      {/* Streak Widget */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Streak</h3>
          <Flame className={cn("w-5 h-5", widgets.streak.current > 0 ? "text-warning animate-flame" : "text-muted-foreground")} />
        </div>
        
        <div className="flex items-end gap-2">
          <span className="text-4xl font-display font-bold">{widgets.streak.current}</span>
          <span className="text-muted-foreground mb-1">days</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-xs">
          <span className="text-muted-foreground">Longest: {widgets.streak.longest}</span>
          <span className="text-forge-400 capitalize">{widgets.streak.level} Level</span>
        </div>
      </motion.div>

      {/* XP Widget */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Experience</h3>
          <Star className="w-5 h-5 text-forge-400" />
        </div>
        
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-2xl font-display font-bold">Level {widgets.xp.current_level}</div>
            <div className="text-xs text-forge-400 font-medium">{widgets.xp.level_title}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono">{widgets.xp.total_xp} XP</div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{widgets.xp.xp_to_next_level} to next</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full bg-forge-500"
              initial={{ width: 0 }}
              animate={{ width: `${widgets.xp.level_progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Week Mini Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card p-5"
      >
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Last 7 Days</h3>
        <div className="flex items-end justify-between h-24 gap-1.5">
          {widgets.week_mini.map((day, i) => (
            <div key={day.date} className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full relative h-full flex items-end justify-center group cursor-help">
                <div 
                  className={cn(
                    "w-full max-w-[24px] rounded-sm transition-colors duration-200",
                    day.is_today ? "bg-forge-500" : "bg-white/10 group-hover:bg-forge-500/50"
                  )}
                  style={{ height: `${Math.max(5, day.completion_rate)}%` }}
                />
                
                {/* Tooltip */}
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg z-10 pointer-events-none whitespace-nowrap border border-border">
                  {day.completion_rate}% ({day.tasks_completed} done)
                </div>
              </div>
              <span className={cn(
                "text-[10px] uppercase tracking-wider",
                day.is_today ? "text-forge-400 font-bold" : "text-muted-foreground"
              )}>
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
