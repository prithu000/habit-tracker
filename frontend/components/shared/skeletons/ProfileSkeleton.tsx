"use client";

import React from "react";
import { ContextualLoader } from "@/components/shared/ContextualLoader";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="min-h-[500px] rounded-3xl bg-[#111116] border border-white/[0.08] p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <ContextualLoader context="profile" />
      </div>
    </div>
  );
}
