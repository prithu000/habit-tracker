"use client";

import React from "react";
import Link from "next/link";
import { Cpu, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-10 md:mt-20 pt-8 md:pt-12 pb-8 md:pb-12 border-t border-white/[0.08] bg-gradient-to-b from-transparent to-[#0a0a0c]/80 text-muted-foreground print:hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-12">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-forge-500 to-purple-600 p-[1px] flex items-center justify-center font-black text-white text-xs shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                YvY
              </div>
              <span className="font-display font-black text-lg tracking-tight text-white">YOU VS YOU</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-forge-400">
              The Personal Operating System
            </p>
            <p className="text-xs text-zinc-400 font-medium tracking-wide max-w-sm leading-relaxed">
              Engineer Your Best Self.<br />
              Measure. Improve. Repeat.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">System Protocol</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/routines" className="hover:text-white transition-colors">Routines</Link></li>
              <li><Link href="/reports" className="hover:text-white transition-colors">Executive Reports</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About YOU VS YOU</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Philosophy</h4>
            <div className="text-xs space-y-1.5 text-zinc-400">
              <p className="flex items-center gap-1.5"><span className="text-forge-400">•</span> Measure.</p>
              <p className="flex items-center gap-1.5"><span className="text-cyan-400">•</span> Improve.</p>
              <p className="flex items-center gap-1.5"><span className="text-purple-400">•</span> Repeat.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="font-mono text-zinc-500">
            © 2026 YOU VS YOU • Engineer Your Best Self.
          </p>
          <div className="flex items-center gap-4 text-zinc-500">
            <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-forge-400" /> Neural Telemetry Active</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Audited</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
