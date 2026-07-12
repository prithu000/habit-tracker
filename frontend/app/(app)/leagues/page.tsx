"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
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
    <PageTransition className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-forge-900/40 via-zinc-900/60 to-zinc-900/40 p-8 rounded-3xl border border-forge-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forge-500/20 border border-forge-500/30 text-forge-300 text-xs font-semibold uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5 animate-pulse" />
            Lifetime Progression
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 to-purple-400">ARENA</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            Your cumulative lifetime execution tier. Prove your discipline daily and rise through the ranks to Godlike status.
          </p>
        </div>

        {/* Current User Division Badge */}
        <div className="flex items-center gap-4 bg-zinc-950/80 p-5 rounded-2xl border border-forge-500/30 shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forge-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-forge-500/30">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Current Rank</div>
            <div className="text-xl font-black text-white uppercase tracking-wider">
              {currentTier.name}
            </div>
            <div className="text-xs text-forge-400 font-semibold mt-0.5">
              {currentXp.toLocaleString()} Lifetime XP
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress to Next Rank */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-8 backdrop-blur-md shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-forge-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forge-400" />
                Rank Progression
              </h3>
              {nextTier && (
                <div className="text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-muted-foreground">
                  {xpIntoTier.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Current Tier</span>
                <span className={cn("text-2xl font-black uppercase", currentTier.color.split(' ')[0])}>
                  {currentTier.name}
                </span>
              </div>
              
              {nextTier && (
                <>
                  <ChevronRight className="w-8 h-8 text-zinc-700 mx-4" />
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Next Tier</span>
                    <span className={cn("text-2xl font-black uppercase", nextTier.color.split(' ')[0])}>
                      {nextTier.name}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="relative w-full bg-zinc-950 h-6 rounded-full overflow-hidden border border-white/10 mt-6 shadow-inner">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-forge-600 to-purple-400 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-overlay">
                 <span className="text-[10px] font-black text-white/80 tracking-widest">
                   {nextTier ? `${Math.floor(progressPercent)}% TO NEXT RANK` : "MAXIMUM RANK ACHIEVED"}
                 </span>
              </div>
            </div>
            
            {nextTier && (
              <p className="text-sm text-zinc-400 mt-4 text-center">
                Earn <strong className="text-white">{(nextTier.xp - currentXp).toLocaleString()} more XP</strong> to unlock the next rank.
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                 <Flame className="w-6 h-6 text-amber-500" />
               </div>
               <div className="text-3xl font-black text-white font-mono">{user.current_streak}</div>
               <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-bold">Day Streak</div>
             </div>
             
             <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 rounded-full bg-forge-500/10 border border-forge-500/20 flex items-center justify-center mb-3">
                 <Award className="w-6 h-6 text-forge-400" />
               </div>
               <div className="text-3xl font-black text-white font-mono">{currentXp.toLocaleString()}</div>
               <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-bold">Lifetime XP</div>
             </div>
          </div>
        </div>

        {/* Right Column: All Tiers List */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl h-[600px] overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 sticky top-0 bg-zinc-900/90 py-2 backdrop-blur-md z-10 flex items-center gap-2 border-b border-zinc-800">
            <Target className="w-4 h-4 text-forge-400" />
            Tier System
          </h3>
          <div className="space-y-2 relative pb-8">
            {TIERS.map((tier, idx) => {
              const isUnlocked = currentXp >= tier.xp;
              const isCurrent = currentTierIndex === idx;
              
              return (
                <div 
                  key={tier.name}
                  className={cn(
                    "p-3 rounded-xl border transition-all flex items-center justify-between",
                    isCurrent ? "bg-forge-500/20 border-forge-500/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]" :
                    isUnlocked ? "bg-white/5 border-white/10" : "bg-zinc-950/50 border-zinc-900 opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                      tier.color
                    )}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className={cn("text-sm font-black uppercase tracking-wider", isUnlocked ? "text-white" : "text-zinc-600")}>
                        {tier.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {tier.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-forge-300 bg-forge-950 px-2 py-1 rounded-full">
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
