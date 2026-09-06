"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Life Score Summary Skeleton */}
      <div 
        className="w-full h-44 sm:h-52 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden border shadow-sm"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-32 h-4 bg-[var(--surface-raised)] rounded-full animate-pulse" />
            <div className="w-48 sm:w-64 h-7 bg-[var(--surface-raised)] rounded-xl animate-pulse" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface-raised)] animate-pulse" />
        </div>
        <div className="w-full h-3 bg-[var(--surface-raised)] rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-[var(--accent)]/40 animate-pulse rounded-full" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="h-28 rounded-2xl p-4 flex flex-col justify-between border shadow-sm"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <div className="w-20 h-3 bg-[var(--surface-raised)] rounded animate-pulse" />
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-raised)] animate-pulse" />
            </div>
            <div className="w-24 h-6 bg-[var(--surface-raised)] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Split Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div 
          className="lg:col-span-2 h-96 rounded-3xl p-6 flex flex-col items-center justify-center border shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <ContextualLoader context="dashboard" />
        </div>
        <div 
          className="h-96 rounded-3xl p-6 space-y-4 border shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="w-32 h-5 bg-[var(--surface-raised)] rounded animate-pulse mb-4" />
          {[1, 2, 3, 4].map((j) => (
            <div 
              key={j} 
              className="h-14 rounded-xl p-3 flex items-center justify-between border"
              style={{ background: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
            >
              <div className="w-2/3 h-4 bg-[var(--surface)] rounded animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-[var(--surface)] animate-pulse" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
