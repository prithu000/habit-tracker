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

export default function AboutPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ctaHref = isAuthenticated ? "/dashboard" : "/register";

  return (
    <PageTransition className="space-y-8 md:space-y-16 max-w-5xl mx-auto pb-12 md:pb-24 text-white">
      {/* 1. Hero Section */}
      <section className="relative text-center space-y-5 pt-6 md:pt-12 pb-6 md:pb-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/10 to-transparent rounded-full blur-[140px] pointer-events-none animate-pulse" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-forge-500/20 via-purple-500/20 to-cyan-500/20 border border-forge-500/30 text-forge-300 text-xs font-black uppercase tracking-widest shadow-[0_0_25px_rgba(139,92,246,0.25)]"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow text-forge-400" />
          <span>The Personal Operating System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-display font-black tracking-tight uppercase"
        >
          YOU <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 via-cyan-400 to-purple-500">VS</span> YOU
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-2xl font-bold uppercase tracking-widest text-zinc-300 max-w-3xl mx-auto"
        >
          Engineer Your Best Self.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Every day, your actions create data. Every habit shapes your identity.<br />
          YOU VS YOU transforms that data into clarity, discipline, and measurable growth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-4 flex items-center justify-center gap-4 flex-wrap"
        >
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center w-full sm:w-auto gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-forge-500 to-purple-600 hover:from-forge-400 hover:to-purple-500 text-white font-black text-sm tracking-wide shadow-[0_0_35px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </motion.div>
      </section>

      {/* 2. Why We Built This */}
      <section className="p-5 sm:p-8 md:p-12 rounded-[32px] bg-gradient-to-br from-[#0f0a1c]/90 via-[#0a0a0c]/90 to-[#0a0a0c]/90 border border-white/[0.08] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-forge-400">
            <Target className="w-4 h-4" />
            <span>01 • The Problem & The Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight">
            Why We Built This
          </h2>
          <p className="text-zinc-300 text-base leading-relaxed">
            Most productivity tools treat you like a machine—endless checklists without soul, biological feedback, or accountability. They track chores, but ignore the human psyche.
          </p>
          <p className="text-zinc-300 text-base leading-relaxed">
            <strong className="text-white">YOU VS YOU transforms discipline into measurable identity.</strong> We don&apos;t build to-do lists; we engineer self-trust. When you complete a difficult routine when nobody is watching, you aren&apos;t just checking a box—you are generating empirical proof of who you are becoming.
          </p>
        </div>
      </section>

      {/* 3. Our Philosophy */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            <Flame className="w-4 h-4" />
            <span>02 • Core Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight">
            Our Philosophy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Measure.",
              desc: "You cannot master what you do not measure. We translate daily habits, focus blocks, and routines into empirical, quantifiable telemetry.",
              color: "from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400",
              icon: BarChart2,
            },
            {
              title: "Improve.",
              desc: "By observing real behavioral patterns over time, our Neural Coach eliminates guesswork and emotion, highlighting exact friction points to optimize.",
              color: "from-cyan-500/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400",
              icon: Zap,
            },
            {
              title: "Repeat.",
              desc: "Consistency over time builds unbeatable momentum. Every completed day permanently compounds into your all-time execution history.",
              color: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400",
              icon: CheckCircle2,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-5 sm:p-8 rounded-3xl bg-gradient-to-br ${item.color} border backdrop-blur-xl shadow-xl space-y-4 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-display font-black tracking-tight text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">{item.desc}</p>
              </div>
              <div className="pt-4 border-t border-white/10 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                Protocol Phase 0{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. What YOU VS YOU Measures */}
      <section className="p-5 sm:p-8 md:p-12 rounded-[32px] bg-[#0f0a1c]/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6 md:space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-forge-400">
            <Cpu className="w-4 h-4" />
            <span>03 • Telemetry Dimensions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight">
            What YOU VS YOU Measures
          </h2>
          <p className="text-zinc-400 text-sm max-w-2xl">
            We reject estimates and fake motivation. Every metric in your dashboard is mathematically derived from your physical actions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Life Score", desc: "A holistic 0-100 index blending routine completion, focus depth, and streak retention.", badge: "Core Metric" },
            { label: "Discipline Score", desc: "An unforgiving ratio of promises kept versus broken across morning and evening checkpoints.", badge: "Uncompromising" },
            { label: "Consistency Index", desc: "Long-term execution stability tracking behavioral variance over 7, 30, and 365-day horizons.", badge: "Stability" },
            { label: "XP & Leveling", desc: "A gamified biological dopamine reward architecture that turns hard daily work into tangible progression.", badge: "Progression" },
            { label: "Neural Coach", desc: "Real-time cognitive synthesis trained exclusively on your completion telemetry and habit velocity.", badge: "AI Synthesis" },
            { label: "Vector Reports", desc: "Consulting-grade PDF performance audits designed for executive review and physical print.", badge: "Executive" },
          ].map((m, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-forge-500/40 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-forge-400">{m.badge}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">{m.label}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Our Mission & Built For */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
        <section className="p-5 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#0a0a0c] to-[#0a0a0c] border border-purple-500/30 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-purple-400">
            <BrainCircuit className="w-4 h-4" />
            <span>04 • Our Mission</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-black">
            The Most Advanced Personal Execution Engine
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Our mission is simple: to build the ultimate personal operating system for individuals who refuse to stay average. We provide the empirical structure, AI cognitive support, and executive accountability required to master self-leadership.
          </p>
        </section>

        <section className="p-5 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-[#0a0a0c] to-[#0a0a0c] border border-cyan-500/30 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            <Users className="w-4 h-4" />
            <span>05 • Who This Is Built For</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-black">
            Engineered For Elite Operators
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">
            YOU VS YOU is built for high performers, software engineers, athletes, founders, researchers, and disciplined creators who want an uncompromising, data-driven environment to track their life&apos;s work without distraction.
          </p>
        </section>
      </div>

      {/* 6. Privacy & Data Integrity */}
      <section className="p-5 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-r from-zinc-900/80 via-zinc-900/40 to-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            <Lock className="w-4 h-4" />
            <span>06 • Privacy & Data Integrity</span>
          </div>
          <h3 className="text-2xl font-display font-black text-white">
            Your Telemetry is Your Competitive Advantage
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            We enforce strict end-to-end data integrity from database to UI. Your execution logs, focus timestamps, and neural coach syntheses remain private, secure, and audited. No artificial score inflation. No data selling.
          </p>
        </div>
        <div className="shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <Shield className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* 7. Closing Section */}
      <section className="text-center py-8 md:py-16 px-6 rounded-[36px] bg-gradient-to-b from-purple-950/60 via-[#0f0a1c] to-[#0a0a0c] border border-forge-500/40 shadow-[0_20px_80px_rgba(139,92,246,0.25)] space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0,transparent_70%)] pointer-events-none" />
        
        <div className="space-y-3 relative z-10">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-forge-400">
            The Clock is Running
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white uppercase">
            Today is Day One.
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto font-medium">
            Stop negotiating with your future. Measure your habits, master your consistency, and become impossible to ignore.
          </p>
        </div>

        <div className="pt-4 relative z-10">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center w-full sm:w-auto gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-forge-500 via-purple-600 to-cyan-500 hover:from-forge-400 hover:to-cyan-400 text-white font-black text-base tracking-wide shadow-[0_0_50px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-95 transition-all"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
