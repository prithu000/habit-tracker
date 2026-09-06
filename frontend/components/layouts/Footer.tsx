"use client";

import React from "react";
import Link from "next/link";
import { Cpu, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="mt-10 md:mt-16 pt-8 md:pt-10 pb-8 print:hidden"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs"
                style={{ background: "var(--accent)" }}
              >
                YvY
              </div>
              <span className="font-bold text-base tracking-tight" style={{ color: "var(--fg)" }}>
                YOU VS YOU
              </span>
            </div>
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--accent)" }}
            >
              The Personal Operating System
            </p>
            <p
              className="text-xs font-medium max-w-sm leading-relaxed"
              style={{ color: "var(--fg-muted)" }}
            >
              Engineer Your Best Self.
              <br />
              Measure. Improve. Repeat.
            </p>
          </div>

          {/* System Protocol */}
          <div className="space-y-3">
            <h4
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--fg)" }}
            >
              System Protocol
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: "var(--fg-muted)" }}>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-[var(--accent)]">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="transition-colors hover:text-[var(--accent)]">
                  Tasks
                </Link>
              </li>
              <li>
                <Link href="/reports" className="transition-colors hover:text-[var(--accent)]">
                  Executive Reports
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-[var(--accent)]">
                  About YOU VS YOU
                </Link>
              </li>
            </ul>
          </div>

          {/* Philosophy */}
          <div className="space-y-3">
            <h4
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--fg)" }}
            >
              Philosophy
            </h4>
            <div className="text-xs space-y-1.5" style={{ color: "var(--fg-muted)" }}>
              <p className="flex items-center gap-1.5">
                <span style={{ color: "var(--accent)" }}>•</span> Measure.
              </p>
              <p className="flex items-center gap-1.5">
                <span style={{ color: "var(--accent)" }}>•</span> Improve.
              </p>
              <p className="flex items-center gap-1.5">
                <span style={{ color: "var(--accent)" }}>•</span> Repeat.
              </p>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--fg)" }}
            >
              Legal
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: "var(--fg-muted)" }}>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-[var(--accent)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-[var(--accent)]">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund" className="transition-colors hover:text-[var(--accent)]">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-[var(--accent)]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: "1px solid var(--border)", color: "var(--fg-faint)" }}
        >
          <p className="font-mono">© 2026 YOU VS YOU • Engineer Your Best Self.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              Neural Telemetry Active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
              End-to-End Audited
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
