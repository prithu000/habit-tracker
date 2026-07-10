"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="w-48 sm:w-64 h-8 bg-white/15 rounded-xl animate-pulse" />
          <div className="w-64 sm:w-80 h-4 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="w-32 h-10 rounded-xl bg-white/10 animate-pulse" />
      </div>

      {/* Heatmap Grid Skeleton */}
      <div className="w-full h-64 sm:h-80 rounded-3xl bg-[#111116] border border-white/[0.08] p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <ContextualLoader context="analytics" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-72 rounded-3xl bg-[#111116] border border-white/[0.08] p-5 flex flex-col justify-between">
          <div className="w-36 h-5 bg-white/15 rounded animate-pulse" />
          <div className="w-full h-44 bg-white/[0.04] rounded-2xl animate-pulse" />
        </div>
        <div className="h-72 rounded-3xl bg-[#111116] border border-white/[0.08] p-5 flex flex-col justify-between">
          <div className="w-36 h-5 bg-white/15 rounded animate-pulse" />
          <div className="w-full h-44 bg-white/[0.04] rounded-2xl animate-pulse" />
        </div>
      </div>

    </div>
  );
}
