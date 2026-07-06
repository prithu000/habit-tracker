"use client";

import React, { useState } from "react";
import { useLeagues } from "@/lib/queries/useOS";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Globe,
  Users,
  MapPin,
  GraduationCap,
  Flame,
  TrendingUp,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const DIVISIONS = [
  { name: "Bronze", color: "text-amber-700 bg-amber-950/40 border-amber-800/50" },
  { name: "Silver", color: "text-zinc-400 bg-zinc-800/40 border-zinc-600/50" },
  { name: "Gold", color: "text-amber-400 bg-amber-500/10 border-amber-500/40" },
  { name: "Platinum", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/40" },
  { name: "Diamond", color: "text-blue-400 bg-blue-500/10 border-blue-500/40" },
  { name: "Master", color: "text-purple-400 bg-purple-500/10 border-purple-500/40" },
  { name: "Grandmaster", color: "text-rose-400 bg-rose-500/10 border-rose-500/40" },
  { name: "Legend", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/40" },
  { name: "Mythic", color: "text-pink-400 bg-pink-500/10 border-pink-500/40" },
  { name: "Immortal", color: "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-pink-300 border-purple-500/60 bg-purple-900/30" },
];

export default function LeaguesPage() {
  const [scope, setScope] = useState("global");
  const { data, isLoading, isError } = useLeagues(scope);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Arena Telemetry Offline</h3>
        <p className="text-zinc-400">Unable to synchronize leaderboard rankings.</p>
      </div>
    );
  }

  const { user_league, leaderboard } = data;

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-zinc-900/60 to-zinc-900/40 p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 animate-pulse" />
            Competitive Discipline Arena
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            DISCIPLINE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">LEAGUES</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            Real-time global division standings, peer execution telemetry, and competitive leaderboard rankings.
          </p>
        </div>

        {/* Current User Division Badge */}
        <div className="flex items-center gap-4 bg-zinc-950/80 p-5 rounded-2xl border border-purple-500/30 shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Your Division</div>
            <div className="text-xl font-black text-white uppercase tracking-wider">
              {user_league?.division || "Gold"} Division
            </div>
            <div className="text-xs text-purple-400 font-semibold mt-0.5">
              Rank #{user_league?.rank || 6} • {user_league?.score || 4500} Rating
            </div>
          </div>
        </div>
      </div>

      {/* Division Progression Tier Bar */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl overflow-x-auto">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          Division Hierarchy (Bronze to Immortal)
        </h3>
        <div className="flex items-center gap-2 min-w-[800px]">
          {DIVISIONS.map((div, i) => {
            const isCurrent = user_league?.division === div.name;
            return (
              <div
                key={div.name}
                className={cn(
                  "flex-1 p-3 rounded-2xl border text-center transition-all relative overflow-hidden",
                  div.color,
                  isCurrent && "ring-2 ring-purple-400 shadow-lg scale-105 bg-purple-500/20"
                )}
              >
                <div className="text-xs font-black uppercase tracking-wider">{div.name}</div>
                {isCurrent && (
                  <span className="text-[9px] font-bold text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded-full block mt-1">
                    YOU
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scope Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
          {[
            { key: "global", label: "Global", icon: Globe },
            { key: "friends", label: "Friends", icon: Users },
            { key: "city", label: `City (${user_league?.city || "SF"})`, icon: MapPin },
            { key: "country", label: `Country (${user_league?.country || "USA"})`, icon: MapPin },
            { key: "university", label: "University", icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = scope === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setScope(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                  isSelected
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Standings refresh automatically every 3 minutes.
        </div>
      </div>

      {/* Leaderboard Table or Under Construction Message */}
      {scope !== "global" ? (
        <div className="bg-zinc-900/40 border border-purple-500/30 rounded-3xl p-16 text-center backdrop-blur-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg shadow-purple-500/20">
            🚧
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">We&apos;re working on it</h3>
          <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
            This division is currently under active development. Standings and telemetry for <span className="text-purple-400 font-bold capitalize">{scope}</span> leagues will be deploying in the next system update.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              GLOBAL LEADERBOARD STANDINGS
            </h3>
            <span className="text-xs font-semibold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
              Season 14 Active
            </span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {leaderboard?.map((entry: any) => {
              const isUser = entry.is_user;
              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: entry.rank * 0.03 }}
                  className={cn(
                    "p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:bg-zinc-800/30",
                    isUser && "bg-purple-500/10 border-l-4 border-l-purple-500 shadow-inner"
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Rank Badge */}
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0",
                      entry.rank === 1 ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/30" :
                      entry.rank === 2 ? "bg-zinc-300 text-zinc-950 shadow-md" :
                      entry.rank === 3 ? "bg-amber-700 text-white shadow-md" :
                      "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                    )}>
                      {entry.rank === 1 ? <Crown className="w-4 h-4 fill-current" /> : entry.rank}
                    </div>

                    {/* Avatar & Name */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn("text-sm sm:text-base font-bold truncate", isUser ? "text-purple-300" : "text-white")}>
                          {entry.name}
                        </h4>
                        {isUser && (
                          <span className="text-[10px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="text-zinc-300 font-semibold">{entry.division}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-amber-400 font-medium">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          <span>{entry.streak}d streak</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-lg font-black text-white font-mono">
                      {entry.score.toLocaleString()}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Rating PTS
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
