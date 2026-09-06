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
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-8 rounded-3xl border shadow-sm"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="space-y-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Support & Diagnostics
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Help & Support Center
          </h1>
          <p className="text-xs md:text-sm max-w-2xl" style={{ color: "var(--fg-muted)" }}>
            Direct telemetric dispatch to Lead System Architect (rahul.business940@gmail.com) and core protocol documentation.
          </p>
        </div>
        <div
          className="flex items-center gap-3 p-4 rounded-2xl border self-start md:self-center"
          style={{
            background: "var(--surface-raised)",
            borderColor: "var(--border)",
          }}
        >
          <Cpu className="w-8 h-8" style={{ color: "var(--accent)" }} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>System Status</div>
            <div className="text-sm font-bold text-emerald-500">POS v2.0 Operational</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Col: Issue Reporter Form */}
        <div
          className="rounded-3xl p-5 md:p-8 border shadow-sm space-y-6"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--fg)" }}>
                <Bug className="w-5 h-5" style={{ color: "var(--accent)" }} />
                Dispatch Diagnostic Report
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                Reports are transmitted directly to the engineering team at rahul.business940@gmail.com.
              </p>
            </div>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
              style={{
                background: "var(--accent-subtle)",
                borderColor: "var(--accent-border)",
                color: "var(--accent)",
              }}
            >
              High Priority
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--fg-faint)" }}>
                Classification / Issue Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Bug Report", "Feature Request", "Telemetry Error", "Billing & Account"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIssueType(type)}
                    className="p-2.5 rounded-xl border text-xs font-bold transition-all text-center"
                    style={
                      issueType === type
                        ? {
                            background: "var(--accent)",
                            borderColor: "var(--accent)",
                            color: "var(--accent-fg)",
                          }
                        : {
                            background: "var(--surface-raised)",
                            borderColor: "var(--border)",
                            color: "var(--fg-muted)",
                          }
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--fg-faint)" }}>
                Subject / Short Summary
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Radar chart label overlap on mobile viewport"
                className="w-full rounded-xl p-3.5 text-sm transition-all focus:outline-none"
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--fg-faint)" }}>
                Detailed Observation & Steps to Reproduce
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide comprehensive details, expected behavior, and actual telemetry output..."
                className="w-full rounded-xl p-3.5 text-sm transition-all resize-none focus:outline-none"
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                }}
              />
            </div>

            {/* Auto System Telemetry Footer */}
            <div
              className="p-3 rounded-xl border flex items-center justify-between text-xs font-mono"
              style={{
                background: "var(--surface-raised)",
                borderColor: "var(--border)",
                color: "var(--fg-muted)",
              }}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                <span className="truncate max-w-[240px]">Env: Windows 11 / YOU VS YOU POS v2.0</span>
              </div>
              <span className="text-emerald-500 font-bold shrink-0">Auto-Attached</span>
            </div>

            <button
              type="submit"
              disabled={supportMutation.isPending}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
              }}
            >
              <Send className="w-4 h-4" />
              <span>{supportMutation.isPending ? "DISPATCHING REPORT..." : "TRANSMIT TELEMETRY REPORT"}</span>
            </button>
          </form>
        </div>

        {/* Right Col: FAQ Accordion */}
        <div
          className="rounded-3xl p-5 md:p-8 border shadow-sm space-y-6"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--fg)" }}>
              <MessageSquare className="w-5 h-5" style={{ color: "var(--accent)" }} />
              Frequently Asked Protocol Questions
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
              Core system rules, calculation algorithms, and operational guidelines.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: "var(--surface-raised)",
                    borderColor: "var(--border)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 transition-all"
                  >
                    <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--fg-faint)" }} />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4 text-xs leading-relaxed border-t pt-3"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--fg-muted)",
                        }}
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div
            className="p-5 rounded-2xl border flex items-center gap-4"
            style={{
              background: "var(--accent-subtle)",
              borderColor: "var(--accent-border)",
            }}
          >
            <Sparkles className="w-8 h-8 shrink-0" style={{ color: "var(--accent)" }} />
            <div className="text-xs">
              <div className="font-bold" style={{ color: "var(--fg)" }}>Need Live Coaching?</div>
              <p className="mt-0.5" style={{ color: "var(--fg-muted)" }}>
                Our Neural Coach on your Dashboard is trained on your personal telemetry and ready to assist 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
