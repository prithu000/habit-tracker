"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function LifeScoreSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="w-48 sm:w-64 h-8 bg-white/15 rounded-xl animate-pulse" />
          <div className="w-64 sm:w-80 h-4 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="w-28 h-10 rounded-xl bg-purple-500/20 animate-pulse" />
      </div>

      {/* Main Radar & Pillar Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[450px] rounded-3xl bg-[#111116] border border-white/[0.08] p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <ContextualLoader context="life-score" />
        </div>
        <div className="h-[450px] rounded-3xl bg-[#111116] border border-white/[0.08] p-6 space-y-4">
          <div className="w-36 h-5 bg-white/15 rounded animate-pulse mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-13 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 flex items-center justify-between">
              <div className="w-1/2 h-4 bg-white/10 rounded animate-pulse" />
              <div className="w-12 h-4 bg-purple-400/30 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
