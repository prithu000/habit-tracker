"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function RoutinesSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="w-60 h-8 bg-white/15 rounded-xl animate-pulse" />
          <div className="w-80 h-4 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-10 rounded-xl bg-white/10 animate-pulse" />
          <div className="w-36 h-10 rounded-xl bg-forge-500/30 animate-pulse" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[460px] rounded-3xl bg-[#111116] border border-white/[0.08] p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <ContextualLoader context="routines" />
        </div>
        <div className="h-[460px] rounded-3xl bg-[#111116] border border-white/[0.08] p-6 space-y-4">
          <div className="w-40 h-5 bg-white/15 rounded animate-pulse mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 flex items-center justify-between">
              <div className="space-y-1.5 w-2/3">
                <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse" />
                <div className="w-1/2 h-3 bg-white/[0.06] rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
