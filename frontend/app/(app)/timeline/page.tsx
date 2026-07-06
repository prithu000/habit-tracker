"use client";

import React, { useState } from "react";
import { useTimeline } from "@/lib/queries/useOS";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  History,
  Award,
  Flame,
  Zap,
  Sparkles,
  Crown,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const ICON_MAP: Record<string, any> = {
  Award,
  Flame,
  Zap,
  Crown,
  Sparkles,
  CheckCircle2,
  TrendingUp,
};

export default function TimelinePage() {
  const { data, isLoading, isError } = useTimeline();
  const [filter, setFilter] = useState<string>("all");

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Chronicle Telemetry Offline</h3>
        <p className="text-zinc-400">Unable to synchronize historical life events.</p>
      </div>
    );
  }

  const { timeline } = data;

  const filtered = timeline?.filter((item: any) => {
    if (filter === "all") return true;
    return item.type === filter;
  }) || [];

  return (
    <PageTransition className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-zinc-900/60 to-zinc-900/40 p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <History className="w-3.5 h-3.5 animate-pulse" />
            Chronological Telemetry
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            LIFE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">TIMELINE</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            Complete historical audit of your discipline milestones, trophy acquisitions, and system promotions.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800 self-start md:self-center">
          {[
            { key: "all", label: "All Events" },
            { key: "achievement", label: "Trophies" },
            { key: "streak", label: "Streaks" },
            { key: "milestone", label: "Milestones" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                filter === btn.key
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-10 border-l-2 border-purple-500/30 space-y-8 my-8 ml-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800/60 rounded-3xl">
            <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-400">No historical events recorded for this category yet.</p>
          </div>
        ) : (
          filtered.map((item: any, idx: number) => {
            const Icon = ICON_MAP[item.icon] || Sparkles;
            const isAchievement = item.type === "achievement";
            const isMilestone = item.type === "milestone";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="relative group"
              >
                {/* Timeline Node Circle */}
                <div className={cn(
                  "absolute -left-[35px] sm:-left-[51px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-4 border-zinc-950 shadow-lg transition-transform group-hover:scale-125",
                  isAchievement ? "bg-gradient-to-br from-amber-400 to-purple-600 text-white shadow-purple-500/50" :
                  isMilestone ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-pink-500/50" :
                  "bg-indigo-600 text-white"
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Event Card */}
                <div className={cn(
                  "bg-zinc-900/40 border rounded-3xl p-6 backdrop-blur-md transition-all shadow-xl hover:border-purple-500/50",
                  isAchievement ? "border-purple-500/40 bg-gradient-to-br from-purple-950/20 via-zinc-900/50 to-zinc-900/40" :
                  isMilestone ? "border-pink-500/40 bg-gradient-to-br from-pink-950/20 via-zinc-900/50 to-zinc-900/40" :
                  "border-zinc-800/80"
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border",
                        isAchievement ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                        isMilestone ? "bg-pink-500/20 text-pink-300 border-pink-500/30" :
                        "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      )}>
                        {item.type}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {item.xp > 0 && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 self-start sm:self-center">
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>+{item.xp} XP</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </PageTransition>
  );
}
