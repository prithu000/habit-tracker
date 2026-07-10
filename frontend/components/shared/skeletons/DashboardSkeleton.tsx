"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Life Score Summary Skeleton */}
      <div className="w-full h-44 sm:h-52 rounded-3xl bg-[#121216] border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-32 h-4 bg-white/10 rounded-full animate-pulse" />
            <div className="w-48 sm:w-64 h-7 bg-white/15 rounded-xl animate-pulse" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 animate-pulse" />
        </div>
        <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-forge-500/40 animate-pulse rounded-full" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#111116] border border-white/[0.08] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-20 h-3 bg-white/10 rounded animate-pulse" />
              <div className="w-7 h-7 rounded-lg bg-white/10 animate-pulse" />
            </div>
            <div className="w-24 h-6 bg-white/15 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Split Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 rounded-3xl bg-[#111116] border border-white/[0.08] p-6 flex flex-col items-center justify-center">
          <ContextualLoader context="dashboard" />
        </div>
        <div className="h-96 rounded-3xl bg-[#111116] border border-white/[0.08] p-6 space-y-4">
          <div className="w-32 h-5 bg-white/15 rounded animate-pulse mb-4" />
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-14 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 flex items-center justify-between">
              <div className="w-2/3 h-4 bg-white/10 rounded animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
