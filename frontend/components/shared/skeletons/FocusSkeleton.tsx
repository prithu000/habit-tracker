"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function FocusSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="w-52 h-8 bg-white/15 rounded-xl animate-pulse" />
          <div className="w-72 h-4 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="w-32 h-10 rounded-xl bg-amber-500/20 animate-pulse" />
      </div>

      {/* Focus Timer Center Chamber Skeleton */}
      <div className="h-[460px] rounded-3xl bg-[#111116] border border-white/[0.08] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <ContextualLoader context="focus" />
      </div>

      {/* Ambient Sound Mode / Settings Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#111116] border border-white/[0.08] p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse shrink-0" />
            <div className="space-y-2 w-full">
              <div className="w-3/4 h-4 bg-white/15 rounded animate-pulse" />
              <div className="w-1/2 h-3 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
