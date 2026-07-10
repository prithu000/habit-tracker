"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function LeaguesSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="w-52 h-8 bg-white/15 rounded-xl animate-pulse" />
          <div className="w-72 h-4 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="w-36 h-10 rounded-xl bg-amber-500/20 animate-pulse" />
      </div>

      <div className="min-h-[500px] rounded-3xl bg-[#111116] border border-white/[0.08] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <ContextualLoader context="leagues" />
      </div>
    </div>
  );
}
