"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function ReportsSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Controls Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="w-56 sm:w-72 h-8 bg-white/15 rounded-xl animate-pulse" />
          <div className="w-64 sm:w-80 h-4 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-10 rounded-xl bg-white/10 animate-pulse" />
          <div className="w-32 h-10 rounded-xl bg-forge-500/30 animate-pulse" />
        </div>
      </div>

      {/* A4 Report Page Preview Skeleton */}
      <div className="w-full max-w-4xl mx-auto min-h-[500px] rounded-3xl bg-[#121216] border border-white/10 p-8 md:p-12 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
        <ContextualLoader context="reports" />
      </div>

    </div>
  );
}
