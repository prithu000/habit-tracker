"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="w-56 h-8 bg-white/15 rounded-xl animate-pulse" />
          <div className="w-72 h-4 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Settings Grid / Tabs Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-white/10 animate-pulse shrink-0" />
              <div className="w-2/3 h-4 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main Settings Panel */}
        <div className="md:col-span-3 min-h-[440px] rounded-3xl bg-[#111116] border border-white/[0.08] p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <ContextualLoader context="settings" />
        </div>
      </div>
    </div>
  );
}
