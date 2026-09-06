"use client";

import React from "react";
import { ArrowRight, Leaf } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DashboardHero() {
  const { user } = useAuthStore();
  const firstName =
    user?.display_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";
  const greeting = getGreeting();
  const today = getFormattedDate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 pb-6">
      {/* ── Left: Hero copy ── */}
      <div className="space-y-4">
        {/* Greeting label */}
        <p
          className="text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5"
          style={{ color: "var(--fg-faint)" }}
        >
          {greeting}, {firstName.toUpperCase()}{" "}
          <span className="text-sm">🌱</span>
        </p>

        {/* Main headline */}
        <h1
          className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold leading-[1.15] tracking-tight"
          style={{ color: "var(--fg)" }}
        >
          Progress is a reflection
          <br />
          <span style={{ color: "var(--fg)" }}>of who you choose to be.</span>
        </h1>

        {/* Sub-copy */}
        <p
          className="text-sm leading-relaxed max-w-xl"
          style={{ color: "var(--fg-muted)" }}
        >
          Build habits. Execute routines. Measure consistency. Become a better
          version of yourself every single day.
        </p>

        {/* Track → Analyze → Evolve pills */}
        <div className="flex items-center gap-2 pt-1">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          >
            Track
          </span>
          <ArrowRight
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "var(--fg-faint)" }}
          />
          <span
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          >
            Analyze
          </span>
          <ArrowRight
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "var(--fg-faint)" }}
          />
          <span
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
            }}
          >
            Evolve
          </span>
        </div>
      </div>

      {/* ── Right: Cards column ── */}
      <div className="flex flex-col gap-3">
        {/* Quote card */}
        <div
          className="flex-1 p-4 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <p
            className="text-sm leading-relaxed italic"
            style={{ color: "var(--fg-muted)" }}
          >
            &ldquo;Every action you complete today shapes tomorrow&apos;s
            version of you.&rdquo;
          </p>
          <p
            className="mt-2.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--fg-faint)" }}
          >
            — YOU VS YOU
          </p>
        </div>

        {/* Date / Keep going card */}
        <div
          className="p-4 rounded-xl flex items-start justify-between gap-3"
          style={{
            background: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
          }}
        >
          <div>
            <p
              className="text-[11px] font-medium uppercase tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              {today}
            </p>
            <p
              className="text-lg font-bold mt-0.5 tracking-tight"
              style={{ color: "var(--fg)" }}
            >
              Keep going.
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--fg-muted)" }}
            >
              A better you is already in progress.
            </p>
          </div>
          <Leaf
            className="w-8 h-8 shrink-0 mt-0.5 opacity-60"
            style={{ color: "var(--accent)" }}
          />
        </div>
      </div>
    </div>
  );
}
