"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  Shield,
  Cpu,
  Target,
  Flame,
  BarChart2,
  BrainCircuit,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  Users,
} from "lucide-react";
import { PageTransition } from "@/components/layouts/PageTransition";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils/cn";

export default function AboutPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ctaHref = isAuthenticated ? "/dashboard" : "/register";

  return (
    <PageTransition className="space-y-8 md:space-y-12 max-w-5xl mx-auto pb-12 md:pb-20">
      {/* 1. Hero Section */}
      <section className="relative text-center space-y-4 pt-6 md:pt-10 pb-4 md:pb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--accent)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>The Personal Operating System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight"
          style={{ color: "var(--fg)" }}
        >
          YOU <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#60A5FA]">VS</span> YOU
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base sm:text-lg font-medium max-w-2xl mx-auto"
          style={{ color: "var(--fg)" }}
        >
          Engineer Your Best Self.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-xs sm:text-sm max-w-xl mx-auto leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          Every day, your actions create data. Every habit shapes your identity.<br />
          YOU VS YOU transforms that data into clarity, discipline, and measurable growth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="pt-2 flex items-center justify-center gap-4 flex-wrap"
        >
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-colors shadow-sm"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* 2. Why We Built This */}
      <section className="p-6 sm:p-8 md:p-10 rounded-2xl space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8B5CF6] uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            <span>01 • The Problem & The Solution</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Why We Built This
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Most productivity tools treat you like a machine—endless checklists without soul, biological feedback, or accountability. They track chores, but ignore the human psyche.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            <strong style={{ color: "var(--fg)" }}>YOU VS YOU transforms discipline into measurable identity.</strong> We don&apos;t build to-do lists; we engineer self-trust. When you complete a difficult routine when nobody is watching, you aren&apos;t just checking a box—you are generating empirical proof of who you are becoming.
          </p>
        </div>
      </section>

      {/* 3. Our Philosophy */}
      <section className="space-y-5">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#60A5FA] uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>02 • Core Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Our Philosophy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Measure.",
              desc: "You cannot master what you do not measure. We translate daily habits, focus blocks, and routines into empirical, quantifiable telemetry.",
              iconColor: "text-[#8B5CF6]",
              icon: BarChart2,
            },
            {
              title: "Improve.",
              desc: "By observing real behavioral patterns over time, our Neural Coach eliminates guesswork and emotion, highlighting exact friction points to optimize.",
              iconColor: "text-[#60A5FA]",
              icon: Zap,
            },
            {
              title: "Repeat.",
              desc: "Consistency over time builds unbeatable momentum. Every completed day permanently compounds into your all-time execution history.",
              iconColor: "text-[#34D399]",
              icon: CheckCircle2,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-xl transition-colors space-y-3 flex flex-col justify-between"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                  <item.icon className={cn("w-5 h-5", item.iconColor)} />
                </div>
                <h3 className="text-lg font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>{item.desc}</p>
              </div>
              <div className="pt-3 font-mono text-[10px] uppercase tracking-wider" style={{ borderTop: "1px solid var(--border)", color: "var(--fg-faint)" }}>
                Protocol Phase 0{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. What YOU VS YOU Measures */}
      <section className="p-6 sm:p-8 md:p-10 rounded-2xl space-y-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8B5CF6] uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>03 • Telemetry Dimensions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            What YOU VS YOU Measures
          </h2>
          <p className="text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            We reject estimates and fake motivation. Every metric in your dashboard is mathematically derived from your physical actions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Life Score", desc: "A holistic 0-100 index blending routine completion, focus depth, and streak retention.", badge: "Core Metric" },
            { label: "Discipline Score", desc: "An unforgiving ratio of promises kept versus broken across morning and evening checkpoints.", badge: "Uncompromising" },
            { label: "Consistency Index", desc: "Long-term execution stability tracking behavioral variance over 7, 30, and 365-day horizons.", badge: "Stability" },
            { label: "XP & Leveling", desc: "A gamified biological dopamine reward architecture that turns hard daily work into tangible progression.", badge: "Progression" },
            { label: "Neural Coach", desc: "Real-time cognitive synthesis trained exclusively on your completion telemetry and habit velocity.", badge: "AI Synthesis" },
            { label: "Vector Reports", desc: "Consulting-grade PDF performance audits designed for executive review and physical print.", badge: "Executive" },
          ].map((m, i) => (
            <div key={i} className="p-4 rounded-xl space-y-2.5" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--accent)" }}>{m.badge}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{m.label}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Our Mission & Built For */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="p-6 sm:p-8 rounded-2xl space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8B5CF6] uppercase tracking-wider">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>04 • Our Mission</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            The Most Advanced Personal Execution Engine
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Our mission is simple: to build the ultimate personal operating system for individuals who refuse to stay average. We provide the empirical structure, AI cognitive support, and executive accountability required to master self-leadership.
          </p>
        </section>

        <section className="p-6 sm:p-8 rounded-2xl space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#60A5FA] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>05 • Who This Is Built For</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Engineered For Elite Operators
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            YOU VS YOU is built for high performers, software engineers, athletes, founders, researchers, and disciplined creators who want an uncompromising, data-driven environment to track their life&apos;s work without distraction.
          </p>
        </section>
      </div>

      {/* 6. Privacy & Data Integrity */}
      <section className="p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#34D399] uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>06 • Privacy & Data Integrity</span>
          </div>
          <h3 className="text-lg sm:text-xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Your Telemetry is Your Competitive Advantage
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            We enforce strict end-to-end data integrity from database to UI. Your execution logs, focus timestamps, and neural coach syntheses remain private, secure, and audited. No artificial score inflation. No data selling.
          </p>
        </div>
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--success)" }}>
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* 7. Closing Section */}
      <section className="text-center py-10 sm:py-14 px-6 rounded-2xl space-y-5 relative overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="space-y-2.5 relative z-10">
          <div className="text-xs font-mono text-[#8B5CF6] uppercase tracking-wider">
            The Clock is Running
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Today is Day One.
          </h2>
          <p className="text-xs sm:text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Stop negotiating with your future. Measure your habits, master your consistency, and become impossible to ignore.
          </p>
        </div>

        <div className="pt-2 relative z-10">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-3 rounded-xl font-medium text-xs sm:text-sm transition-colors shadow-sm"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
