"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Crown,
  Flame,
  Award,
  Swords,
  ChevronRight,
  TrendingUp,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const TIERS = [
  { name: "Bronze I", xp: 0, color: "text-amber-700 bg-amber-950/40 border-amber-800/50" },
  { name: "Bronze II", xp: 500, color: "text-amber-700 bg-amber-950/40 border-amber-800/50" },
  { name: "Bronze III", xp: 1000, color: "text-amber-700 bg-amber-950/40 border-amber-800/50" },
  { name: "Silver I", xp: 2500, color: "text-zinc-400 bg-zinc-800/40 border-zinc-600/50" },
  { name: "Silver II", xp: 5000, color: "text-zinc-400 bg-zinc-800/40 border-zinc-600/50" },
  { name: "Silver III", xp: 7500, color: "text-zinc-400 bg-zinc-800/40 border-zinc-600/50" },
  { name: "Gold I", xp: 10000, color: "text-amber-400 bg-amber-500/10 border-amber-500/40" },
  { name: "Gold II", xp: 15000, color: "text-amber-400 bg-amber-500/10 border-amber-500/40" },
  { name: "Gold III", xp: 25000, color: "text-amber-400 bg-amber-500/10 border-amber-500/40" },
  { name: "Platinum I", xp: 35000, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/40" },
  { name: "Platinum II", xp: 50000, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/40" },
  { name: "Platinum III", xp: 75000, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/40" },
  { name: "Diamond I", xp: 100000, color: "text-blue-400 bg-blue-500/10 border-blue-500/40" },
  { name: "Diamond II", xp: 150000, color: "text-blue-400 bg-blue-500/10 border-blue-500/40" },
  { name: "Diamond III", xp: 200000, color: "text-blue-400 bg-blue-500/10 border-blue-500/40" },
  { name: "Master I", xp: 300000, color: "text-purple-400 bg-purple-500/10 border-purple-500/40" },
  { name: "Master II", xp: 400000, color: "text-purple-400 bg-purple-500/10 border-purple-500/40" },
  { name: "Master III", xp: 500000, color: "text-purple-400 bg-purple-500/10 border-purple-500/40" },
  { name: "Grandmaster", xp: 750000, color: "text-rose-400 bg-rose-500/10 border-rose-500/40" },
  { name: "Legend", xp: 1000000, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/40" },
  { name: "Mythic", xp: 1250000, color: "text-pink-400 bg-pink-500/10 border-pink-500/40" },
  { name: "Godlike", xp: 1500000, color: "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-pink-300 border-purple-500/60 bg-purple-900/30" },
];

function ArenaLeaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["arenaLeaderboard"],
    queryFn: async () => {
      const res = await api.get("/arena/leaderboard?limit=5");
      return res.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  if (isLoading) {
    return (
      <div
        className="w-full rounded-2xl border p-6 mb-8 flex flex-col gap-4"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <h2 className="font-bold text-lg" style={{ color: "var(--fg)" }}>GLOBAL TOP 5</h2>
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const leaderboard = data?.data?.leaderboard || data?.leaderboard || [];

  if (leaderboard.length === 0) {
    return (
      <div
        className="w-full rounded-2xl border p-6 sm:p-8 mb-8 text-center"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <Crown className="w-8 h-8 mx-auto mb-2 opacity-40" style={{ color: "var(--accent)" }} />
        <h3 className="font-semibold text-sm" style={{ color: "var(--fg)" }}>No Leaderboard Operators Yet</h3>
        <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>Operators are climbing the ranks. Complete routines to claim a spot in the Top 5!</p>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-2xl border p-6 sm:p-8 mb-8 shadow-sm"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{
              background: "var(--accent-subtle)",
              borderColor: "var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl tracking-wide" style={{ color: "var(--fg)" }}>
              GLOBAL LEADERBOARD
            </h2>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>
              Top 5 Most Consistent Operators
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {leaderboard.map((user: any, index: number) => {
          const isTop3 = index < 3;
          const rankColors = [
            "text-amber-400 bg-amber-500/10 border-amber-500/30",
            "text-slate-300 bg-slate-400/10 border-slate-400/30",
            "text-orange-400 bg-orange-500/10 border-orange-500/30",
          ];
          const badgeClass = isTop3 ? rankColors[index] : "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-colors group"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border shadow-sm ${badgeClass}`}
                >
                  #{user.rank}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm sm:text-base" style={{ color: "var(--fg)" }}>
                    {user.display_name}
                  </span>
                  {user.title_name && (
                    <span 
                      className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5 group-hover:text-[var(--accent)] transition-colors" 
                      style={{ color: "var(--fg-muted)" }}
                      title={user.description}
                    >
                      {user.title_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="font-mono font-bold text-sm sm:text-base" style={{ color: "var(--fg)" }}>
                  {user.lifetime_xp.toLocaleString()} <span className="text-xs text-muted-foreground ml-0.5">XP</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ArenaPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  const currentXp = user.total_xp || 0;
  
  // Find current tier
  let currentTierIndex = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (currentXp >= TIERS[i].xp) {
      currentTierIndex = i;
    } else {
      break;
    }
  }

  const currentTier = TIERS[currentTierIndex];
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;
  
  const xpIntoTier = currentXp - currentTier.xp;
  const xpNeededForNext = nextTier ? nextTier.xp - currentTier.xp : 0;
  const progressPercent = nextTier ? Math.min(100, Math.max(0, (xpIntoTier / xpNeededForNext) * 100)) : 100;

  return (
    <PageTransition className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border shadow-sm"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="space-y-2">
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border"
            style={{
              background: "var(--accent-subtle)",
              borderColor: "var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <Swords className="w-3.5 h-3.5" />
            Lifetime Progression
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            THE ARENA
          </h1>
          <p className="text-xs sm:text-sm max-w-2xl" style={{ color: "var(--fg-muted)" }}>
            Your cumulative lifetime execution tier. Prove your discipline daily and rise through the ranks.
          </p>
        </div>

        {/* Current User Division Badge */}
        <div
          className="flex items-center gap-4 p-4 rounded-xl border"
          style={{
            background: "var(--surface-raised)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl border flex items-center justify-center"
            style={{
              background: "var(--surface)",
              borderColor: "var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>Current Rank</div>
            <div className="text-base font-bold uppercase tracking-wide" style={{ color: "var(--fg)" }}>
              {currentTier.name}
            </div>
            <div className="text-xs font-mono mt-0.5" style={{ color: "var(--accent)" }}>
              {currentXp.toLocaleString()} Lifetime XP
            </div>
          </div>
        </div>
      </div>

      {/* Global Leaderboard */}
      <ArenaLeaderboard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress to Next Rank */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="border rounded-2xl p-6 shadow-sm relative overflow-hidden"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--fg)" }}>
                <TrendingUp className="w-4 h-4" style={{ color: "var(--accent)" }} />
                Rank Progression
              </h3>
              {nextTier && (
                <div
                  className="text-xs font-mono px-3 py-1 rounded-lg border"
                  style={{
                    background: "var(--surface-raised)",
                    borderColor: "var(--border)",
                    color: "var(--fg-muted)",
                  }}
                >
                  {xpIntoTier.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "var(--fg-faint)" }}>Current Tier</span>
                <span className={cn("text-xl font-bold uppercase", currentTier.color.split(' ')[0])}>
                  {currentTier.name}
                </span>
              </div>
              
              {nextTier && (
                <>
                  <ChevronRight className="w-6 h-6 mx-4" style={{ color: "var(--fg-faint)" }} />
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "var(--fg-faint)" }}>Next Tier</span>
                    <span className={cn("text-xl font-bold uppercase", nextTier.color.split(' ')[0])}>
                      {nextTier.name}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div
              className="relative w-full h-3.5 rounded-full overflow-hidden border mt-4"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border)",
              }}
            >
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ background: "var(--accent)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            {nextTier && (
              <p className="text-xs mt-3 text-center" style={{ color: "var(--fg-muted)" }}>
                Earn <strong style={{ color: "var(--fg)" }}>{(nextTier.xp - currentXp).toLocaleString()} more XP</strong> to unlock the next rank.
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div
               className="border rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center text-center"
               style={{
                 background: "var(--surface)",
                 borderColor: "var(--border)",
                 boxShadow: "var(--card-shadow)",
               }}
             >
               <div
                 className="w-10 h-10 rounded-xl border flex items-center justify-center mb-2"
                 style={{
                   background: "var(--surface-raised)",
                   borderColor: "var(--border)",
                   color: "var(--accent)",
                 }}
               >
                 <Flame className="w-5 h-5" />
               </div>
               <div className="text-2xl font-bold font-mono" style={{ color: "var(--fg)" }}>{user.current_streak}</div>
               <div className="text-[10px] uppercase tracking-wider mt-1 font-mono" style={{ color: "var(--fg-faint)" }}>Day Streak</div>
             </div>
             
             <div
               className="border rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center text-center"
               style={{
                 background: "var(--surface)",
                 borderColor: "var(--border)",
                 boxShadow: "var(--card-shadow)",
               }}
             >
               <div
                 className="w-10 h-10 rounded-xl border flex items-center justify-center mb-2"
                 style={{
                   background: "var(--surface-raised)",
                   borderColor: "var(--border)",
                   color: "var(--accent)",
                 }}
               >
                 <Award className="w-5 h-5" />
               </div>
               <div className="text-2xl font-bold font-mono" style={{ color: "var(--fg)" }}>{currentXp.toLocaleString()}</div>
               <div className="text-[10px] uppercase tracking-wider mt-1 font-mono" style={{ color: "var(--fg-faint)" }}>Lifetime XP</div>
             </div>
          </div>
        </div>

        {/* Right Column: All Tiers List */}
        <div
          className="border rounded-2xl p-5 shadow-sm h-[540px] overflow-y-auto custom-scrollbar"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-4 sticky top-0 py-2 backdrop-blur-md z-10 flex items-center gap-2 border-b"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          >
            <Target className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            Tier System
          </h3>
          <div className="space-y-1.5 relative pb-6">
            {TIERS.map((tier, idx) => {
              const isUnlocked = currentXp >= tier.xp;
              const isCurrent = currentTierIndex === idx;
              
              return (
                <div 
                  key={tier.name}
                  className="p-2.5 rounded-xl border transition-colors flex items-center justify-between"
                  style={
                    isCurrent
                      ? {
                          background: "var(--accent-subtle)",
                          borderColor: "var(--accent)",
                        }
                      : isUnlocked
                      ? {
                          background: "var(--surface-raised)",
                          borderColor: "var(--border)",
                        }
                      : {
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                          opacity: 0.45,
                        }
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                      tier.color
                    )}>
                      {idx + 1}
                    </div>
                    <div>
                      <div
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: isUnlocked ? "var(--fg)" : "var(--fg-faint)" }}
                      >
                        {tier.name}
                      </div>
                      <div className="text-[10px] font-mono" style={{ color: "var(--fg-faint)" }}>
                        {tier.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                  {isCurrent && (
                    <span
                      className="text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md border"
                      style={{
                        background: "var(--surface-raised)",
                        borderColor: "var(--accent-border)",
                        color: "var(--accent)",
                      }}
                    >
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
