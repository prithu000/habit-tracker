"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-20" style={{ background: "var(--accent)" }} />

      <div
        className="relative z-10 max-w-md w-full p-8 sm:p-10 rounded-[32px] backdrop-blur-2xl border shadow-2xl text-center space-y-6"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--card-shadow-hover)",
        }}
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-mono px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 uppercase tracking-widest font-bold inline-block">
            ERROR 404 • PROTOCOL DEVIATION
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Wrong Path.
          </h1>
          <p className="text-sm font-medium leading-relaxed pt-1" style={{ color: "var(--fg-muted)" }}>
            The future you&apos;re building isn&apos;t here.<br />
            <span className="text-xs" style={{ color: "var(--fg-faint)" }}>Return to your dashboard.</span>
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition-all"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="mt-12 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--fg-faint)" }}>
        YOU VS YOU • THE PERSONAL OPERATING SYSTEM
      </div>
    </div>
  );
}
