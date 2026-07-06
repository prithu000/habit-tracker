"use client";

import React from "react";
import { useLifeScore } from "@/lib/queries/useOS";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  Activity,
  BookOpen,
  Briefcase,
  Smile,
  Heart,
  Moon,
  DollarSign,
  User,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export default function LifeScorePage() {
  const { data, isLoading, isError } = useLifeScore();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[450px] w-full rounded-3xl" />
          <Skeleton className="h-[450px] lg:col-span-2 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Life Score Telemetry Offline</h3>
        <p className="text-zinc-400">Unable to synchronize neuro-systems diagnostic data.</p>
      </div>
    );
  }

  const { overall_score, title, categories, history, ai_analysis, suggestions } = data;

  const radarData = [
    { subject: "Fitness", A: categories.fitness, fullMark: 100 },
    { subject: "Learning", A: categories.learning, fullMark: 100 },
    { subject: "Work", A: categories.work, fullMark: 100 },
    { subject: "Mental", A: categories.mental_health, fullMark: 100 },
    { subject: "Health", A: categories.health, fullMark: 100 },
    { subject: "Sleep", A: categories.sleep, fullMark: 100 },
    { subject: "Finance", A: categories.finance, fullMark: 100 },
    { subject: "Personal", A: categories.personal, fullMark: 100 },
    { subject: "Discipline", A: categories.discipline, fullMark: 100 },
  ];

  const categoryConfigs = [
    { key: "fitness", label: "Fitness", val: categories.fitness, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-500" },
    { key: "learning", label: "Learning", val: categories.learning, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10", bar: "bg-blue-500" },
    { key: "work", label: "Work", val: categories.work, icon: Briefcase, color: "text-indigo-400", bg: "bg-indigo-500/10", bar: "bg-indigo-500" },
    { key: "mental_health", label: "Mental Health", val: categories.mental_health, icon: Smile, color: "text-purple-400", bg: "bg-purple-500/10", bar: "bg-purple-500" },
    { key: "health", label: "Health", val: categories.health, icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", bar: "bg-rose-500" },
    { key: "sleep", label: "Sleep", val: categories.sleep, icon: Moon, color: "text-cyan-400", bg: "bg-cyan-500/10", bar: "bg-cyan-500" },
    { key: "finance", label: "Finance", val: categories.finance, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10", bar: "bg-amber-500" },
    { key: "personal", label: "Personal", val: categories.personal, icon: User, color: "text-pink-400", bg: "bg-pink-500/10", bar: "bg-pink-500" },
    { key: "discipline", label: "Discipline", val: categories.discipline, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", bar: "bg-purple-500" },
  ];

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-zinc-900/60 to-zinc-900/40 p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
            Core Flagship Telemetry
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            LIFE SCORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">STUDIO</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            Real-time 9-dimensional neuro-systems telemetry combining physical vitality, mental clarity, and execution discipline.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 shadow-inner">
          <div className="text-right">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Classification</div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-wider">
              {title}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-purple-500/30">
            {overall_score}
          </div>
        </div>
      </div>

      {/* Main Grid: Gauge & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Overall Gauge & Breakdown */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Overall Equilibrium
            </h3>
            
            {/* Animated Circular Gauge */}
            <div className="relative flex items-center justify-center my-8">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-zinc-800"
                  fill="transparent"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#purpleGradient)"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - overall_score / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - overall_score / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black tracking-tighter text-white">{overall_score}</span>
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-widest mt-1">{title}</span>
              </div>
            </div>
          </div>

          {/* Quick Axis Summary */}
          <div className="space-y-3 pt-4 border-t border-zinc-800/80">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Top Axis: <strong className="text-white">Discipline ({categories.discipline})</strong></span>
              <span>Focus Area: <strong className="text-amber-400">Finance ({categories.finance})</strong></span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Life Score 2.0 uses a weighted algorithm: 25% Task Completion Rate, 20% Consistency Streak, 15% Discipline (missed tasks penalty), and 40% OS Habit Execution (water, workout, study, pomodoro, sleep).
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Radar Chart & AI Diagnostic */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between shadow-xl">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              9-Axis Radar Diagnostic
            </h3>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" tick={false} />
                  <Radar
                    name="Life Score"
                    dataKey="A"
                    stroke="#c084fc"
                    fill="#8b5cf6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-gradient-to-br from-purple-950/40 via-zinc-900/60 to-zinc-900/40 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                AI Neural Diagnostic
              </div>
              <h4 className="text-lg font-bold text-white mb-3">System Synthesis</h4>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/80 mb-4">
                &ldquo;{ai_analysis}&rdquo;
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                Actionable Protocols
              </h5>
              <div className="space-y-2">
                {suggestions.map((sug: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 9-Axis Detailed Breakdown Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Dimensional Metrics Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryConfigs.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-sm hover:border-zinc-700 transition-all shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl", cat.bg, cat.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cat.label}</h4>
                      <span className="text-xs text-zinc-500">System Index</span>
                    </div>
                  </div>
                  <span className={cn("text-xl font-black", cat.color)}>{cat.val}</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", cat.bar)}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.val}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Trend */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              14-Day Life Score Trajectory
            </h3>
            <p className="text-xs text-zinc-400">Historical progression of your combined neuro-systems telemetry.</p>
          </div>
          <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Live Synchronized
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} />
              <YAxis domain={[50, 100]} stroke="#52525b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fff" }}
              />
              <Line type="monotone" dataKey="score" stroke="#c084fc" strokeWidth={3} dot={{ r: 4, fill: "#c084fc" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageTransition>
  );
}
