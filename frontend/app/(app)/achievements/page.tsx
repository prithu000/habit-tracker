"use client";

import React, { useState } from "react";
import { useHardcoreAchievements } from "@/lib/queries/useOS";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  Trophy,
  Award,
  Crown,
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldAlert,
  Star,
  Activity,
  Target,
  Dumbbell,
  BookOpen,
  Smile,
  ShieldCheck,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const ICON_MAP: Record<string, any> = {
  Flame,
  Zap,
  Award,
  CheckCircle2,
  Target,
  Activity,
  Dumbbell,
  BookOpen,
  Smile,
  Crown,
  Star,
  ShieldCheck,
  Trophy,
};

const RARITY_STYLES: Record<string, { label: string; badge: string; border: string; glow: string }> = {
  Hidden: { label: "Hidden", badge: "bg-zinc-800 text-zinc-400 border-zinc-700", border: "border-zinc-800", glow: "" },
  Secret: { label: "Secret", badge: "bg-purple-950/60 text-purple-400 border-purple-800/50", border: "border-purple-900/40", glow: "hover:border-purple-500/50" },
  Legendary: { label: "Legendary", badge: "bg-amber-950/60 text-amber-400 border-amber-800/50", border: "border-amber-900/40", glow: "hover:border-amber-500/50" },
  Mythic: { label: "Mythic", badge: "bg-rose-950/60 text-rose-400 border-rose-800/50", border: "border-rose-900/50", glow: "shadow-lg shadow-rose-500/10 hover:border-rose-500/60" },
  Impossible: { label: "Impossible", badge: "bg-gradient-to-r from-purple-900 via-pink-900 to-amber-900 text-amber-200 border-amber-500/60", border: "border-amber-500/40", glow: "shadow-xl shadow-amber-500/20 hover:border-amber-400" },
};

export default function AchievementsPage() {
  const { data, isLoading, isError } = useHardcoreAchievements();
  const [selectedRarity, setSelectedRarity] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Trophy Vault Offline</h3>
        <p className="text-zinc-400">Unable to synchronize Hardcore Achievement records.</p>
      </div>
    );
  }

  const { achievements, total, unlocked_count } = data;

  const filtered = achievements.filter((ach: any) => {
    const matchesRarity = selectedRarity === "All" || ach.rarity === selectedRarity;
    const matchesCategory = selectedCategory === "All" || ach.category === selectedCategory;
    return matchesRarity && matchesCategory;
  });

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-zinc-900/60 to-zinc-900/40 p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 animate-pulse" />
            Hardcore Trophy Vault
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            MYTHIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">TROPHY ROOM</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            100+ Secret, Mythic, and Impossible achievements designed for uncompromising execution discipline.
          </p>
        </div>

        {/* Unlocked Summary Badge */}
        <div className="flex items-center gap-4 bg-zinc-950/80 p-5 rounded-2xl border border-purple-500/30 shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Vault Progress</div>
            <div className="text-2xl font-black text-white">
              {unlocked_count} <span className="text-sm font-semibold text-zinc-400">/ {total}</span>
            </div>
            <div className="text-xs text-amber-400 font-semibold mt-0.5">
              {Math.round((unlocked_count / max(1, total)) * 100)}% Acquired
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Rarity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {["All", "Secret", "Legendary", "Mythic", "Impossible"].map((rar) => (
            <button
              key={rar}
              onClick={() => setSelectedRarity(rar)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                selectedRarity === rar
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              )}
            >
              {rar}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {[
            { key: "All", label: "All Systems" },
            { key: "streak", label: "Streaks" },
            { key: "tasks", label: "Execution" },
            { key: "workouts", label: "Vitality" },
            { key: "reading", label: "Scholar" },
            { key: "xp", label: "Ascension" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                selectedCategory === cat.key
                  ? "bg-zinc-800 text-white border border-purple-500/40"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ach: any, idx: number) => {
          const Icon = ICON_MAP[ach.icon] || Trophy;
          const style = RARITY_STYLES[ach.rarity] || RARITY_STYLES.Secret;
          const progressPercent = Math.min(100, Math.round((ach.progress / ach.target_value) * 100));

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.03 }}
              className={cn(
                "bg-zinc-900/40 border rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between transition-all relative overflow-hidden",
                style.border,
                style.glow,
                ach.unlocked ? "bg-gradient-to-br from-purple-950/20 via-zinc-900/50 to-zinc-900/40" : "opacity-75 bg-zinc-950/40"
              )}
            >
              {/* Background watermark */}
              <Icon className={cn("absolute -bottom-6 -right-6 w-36 h-36 opacity-5 pointer-events-none", ach.unlocked ? "text-purple-400" : "text-zinc-700")} />

              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                    ach.unlocked
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-purple-500/30"
                      : "bg-zinc-800/80 text-zinc-500 border border-zinc-700/50"
                  )}>
                    {ach.unlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider", style.badge)}>
                    {style.label}
                  </span>
                </div>

                <h3 className={cn("text-base font-bold mb-1.5", ach.unlocked ? "text-white" : "text-zinc-400")}>
                  {ach.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {ach.description}
                </p>
              </div>

              {/* Progress & Reward Footer */}
              <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500">Progress</span>
                  <span className={cn(ach.unlocked ? "text-purple-400" : "text-zinc-400 font-mono")}>
                    {ach.progress} / {ach.target_value} ({progressPercent}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      ach.unlocked ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-purple-600/60"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>+{ach.xp_reward} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                    <Coins className="w-3.5 h-3.5 text-purple-400" />
                    <span>+{ach.coin_reward} Coins</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </PageTransition>
  );
}

function max(a: number, b: number) {
  return a > b ? a : b;
}
