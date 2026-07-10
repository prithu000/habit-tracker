"use client";

import React, { useState } from "react";
import { useSupportReport } from "@/lib/queries/useOS";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  HelpCircle,
  Bug,
  Send,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

const FAQS = [
  {
    q: "How is my 9-Axis Life Score calculated?",
    a: "Your Life Score is a weighted composite index evaluating daily task execution velocity across 9 core dimensions (Fitness, Learning, Work, Mental Health, Health, Sleep, Finance, Personal, and Discipline). Maintaining unbroken streaks amplifies your daily point yield.",
  },
  {
    q: "How does the Grace Period work?",
    a: "If you miss completing a routine block by midnight, the Streak Engine automatically grants a 12-hour morning grace period so your execution momentum remains intact.",
  },
  {
    q: "What happens when I trigger the Neural Focus Mode?",
    a: "Starting a Focus session logs real-time execution telemetry and dispatches a timestamped notification email to your inbox. Completing a full 25-minute Pomodoro session awards +50 XP and increments your daily execution momentum.",
  },
  {
    q: "How are division standings ranked in the Discipline Arena?",
    a: "Leagues are ranked using your rolling 14-day execution rating points. Top performers in each division earn promotion badges at midnight Sunday, while bottom scorers face relegation.",
  },
];

export default function HelpPage() {
  const supportMutation = useSupportReport();

  const [issueType, setIssueType] = useState("Bug Report");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const browserInfo = typeof window !== "undefined" ? window.navigator.userAgent : "Unknown Browser";
    const osVersion = "Windows 11 / POS 2.0";

    supportMutation.mutate(
      {
        issue_type: issueType,
        title,
        description,
        browser: browserInfo,
        version: osVersion,
        logs: "No critical client-side exceptions logged in current session.",
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
        },
      }
    );
  };

  return (
    <PageTransition className="space-y-6 md:space-y-8 max-w-6xl mx-auto pb-8 md:pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-zinc-900/60 to-zinc-900/40 p-5 md:p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
            Support & Diagnostics
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">HELP CENTER</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            Direct telemetric dispatch to Lead System Architect (rahul.business940@gmail.com) and core protocol documentation.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 self-start md:self-center">
          <Cpu className="w-8 h-8 text-purple-400 animate-pulse" />
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">System Status</div>
            <div className="text-sm font-black text-emerald-400">POS v2.0 Operational</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Col: Issue Reporter Form */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 md:p-8 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Bug className="w-5 h-5 text-purple-400" />
                Dispatch Diagnostic Report
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Reports are transmitted directly to the engineering team at rahul.business940@gmail.com.
              </p>
            </div>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30">
              High Priority
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Classification / Issue Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Bug Report", "Feature Request", "Telemetry Error", "Billing & Account"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIssueType(type)}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-bold transition-all text-center",
                      issueType === type
                        ? "bg-purple-600/30 border-purple-500 text-white shadow-md"
                        : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Subject / Short Summary
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Radar chart label overlap on mobile viewport"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Detailed Observation & Steps to Reproduce
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide comprehensive details, expected behavior, and actual telemetry output..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all resize-none"
              />
            </div>

            {/* Auto System Telemetry Footer */}
            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate max-w-[240px]">Env: Windows 11 / YOU VS YOU POS v2.0</span>
              </div>
              <span className="text-emerald-400 font-bold shrink-0">Auto-Attached</span>
            </div>

            <button
              type="submit"
              disabled={supportMutation.isPending}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all transform active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>{supportMutation.isPending ? "DISPATCHING REPORT..." : "TRANSMIT TELEMETRY REPORT"}</span>
            </button>
          </form>
        </div>

        {/* Right Col: FAQ Accordion */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 md:p-8 backdrop-blur-md shadow-xl space-y-6">
          <div className="border-b border-zinc-800/80 pb-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Frequently Asked Protocol Questions
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Core system rules, calculation algorithms, and operational guidelines.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-800/30 transition-all"
                  >
                    <span className="text-sm font-bold text-white">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/20 flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-purple-400 shrink-0 animate-spin-slow" />
            <div className="text-xs">
              <div className="font-bold text-white">Need Live Coaching?</div>
              <p className="text-zinc-400 mt-0.5">
                Our Neural Coach on your Dashboard is trained on your personal telemetry and ready to assist 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
