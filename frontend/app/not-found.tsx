"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full p-8 sm:p-10 rounded-[32px] bg-[#0f0a1c]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_25px_rgba(244,63,94,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-mono px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 uppercase tracking-widest font-bold inline-block">
            ERROR 404 • PROTOCOL DEVIATION
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white">
            Wrong Path.
          </h1>
          <p className="text-sm text-zinc-300 font-medium leading-relaxed pt-1">
            The future you&apos;re building isn&apos;t here.<br />
            <span className="text-zinc-500 text-xs">Return to your dashboard.</span>
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-forge-500 to-purple-600 hover:from-forge-400 hover:to-purple-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="mt-12 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
        YOU VS YOU • THE PERSONAL OPERATING SYSTEM
      </div>
    </div>
  );
}
