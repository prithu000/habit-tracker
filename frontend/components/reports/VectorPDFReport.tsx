"use client";

import React from "react";
import { SmartReportsData } from "@/types/api";
import { useAuthStore } from "@/lib/stores/authStore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Shield,
  Sparkles,
  Zap,
  Flame,
  Target,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface VectorPDFReportProps {
  data: SmartReportsData;
}

const COLORS = ["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#06b6d4"];

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-rose-400" />;
  return <Minus className="w-3 h-3 text-zinc-500" />;
};

export const VectorPDFReport: React.FC<VectorPDFReportProps> = ({ data }) => {
  const user = useAuthStore((state) => state.user);
  const userName = user?.display_name || user?.email?.split("@")[0] || "Executive Operator";
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { executive_summary, extra_analytics, charts } = data;
  const isInit = data.is_initializing;

  // Determine simple trends based on metrics
  const getTrend = (val: number, threshold: number) => {
    if (val > threshold) return "up";
    if (val < threshold) return "down";
    return "stable";
  };

  const lsTrend = getTrend(executive_summary.overall_life_score, 80);
  const discTrend = getTrend(extra_analytics?.discipline_index || 0, 75);
  const consTrend = getTrend(executive_summary.completion_percentage, 80);

  return (
    <>
      {/* 
        This style block enforces exact color printing and sets up A4 pages.
        It is hidden on screen and only applies when window.print() is called.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          #vector-pdf-report { display: none; }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #vector-pdf-report, #vector-pdf-report * {
            visibility: visible;
          }
          #vector-pdf-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            display: block;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #050505;
          }
          .pdf-page {
            width: 210mm;
            height: 296.5mm;
            page-break-after: always;
            break-after: page;
            box-sizing: border-box;
            background-color: #0a0a0c;
            color: white;
            overflow: hidden;
            position: relative;
          }
        }
      `}} />

      <div id="vector-pdf-report" className="font-sans text-white">
        
        {/* =========================================================
            PAGE 1: EXECUTIVE COVER
            ========================================================= */}
        <div className="pdf-page p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-8 mb-10">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-3xl bg-purple-600 text-white font-black text-4xl tracking-tighter shadow-2xl shadow-purple-500/20">
                  YvY
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-white uppercase">YOU VS YOU</h1>
                  <p className="text-sm font-bold uppercase tracking-widest text-purple-400 mt-1">
                    The Personal Operating System
                  </p>
                  <p className="text-xs text-zinc-500 font-medium tracking-wide mt-1">
                    Engineer Your Best Self.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                  Confidential Personal Report
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  {data.timeframe.toUpperCase()} REPORT
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/60">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Operator Name</span>
                  <div className="text-xl font-black text-white mt-1">{userName}</div>
                </div>
                <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/60">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Report Period</span>
                  <div className="text-xl font-black text-white mt-1">{data.start_date} — {data.end_date}</div>
                </div>
                <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/60">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Generated Date</span>
                  <div className="text-xl font-black text-purple-400 mt-1">{generatedDate}</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-zinc-900/80 p-8 rounded-3xl border border-purple-500/30 flex flex-col justify-center items-center text-center">
                <Shield className="w-12 h-12 text-purple-400 mb-4" />
                <span className="text-purple-400 text-sm font-bold uppercase tracking-widest">Life Score 2.0</span>
                <div className="text-8xl font-black text-white tracking-tighter my-2">
                  {isInit ? "0" : executive_summary.overall_life_score}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <TrendIcon trend={lsTrend} />
                  <span className={lsTrend === "up" ? "text-emerald-400" : lsTrend === "down" ? "text-rose-400" : "text-zinc-400"}>
                    {lsTrend === "up" ? "▲ Improvement" : lsTrend === "down" ? "▼ Decline" : "▬ Stable"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-10">
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block mb-1">Discipline Score</span>
                <span className="text-3xl font-black text-white">{isInit ? "-" : executive_summary.discipline_grade}</span>
                <div className="flex justify-center mt-2"><TrendIcon trend={discTrend} /></div>
              </div>
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">Level</span>
                <span className="text-3xl font-black text-white">{user?.current_level || 1}</span>
              </div>
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 block mb-1">Total XP</span>
                <span className="text-3xl font-black text-white">{executive_summary.xp_earned.toLocaleString()}</span>
              </div>
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 block mb-1">Streak</span>
                <span className="text-3xl font-black text-white">{executive_summary.current_streak}d</span>
              </div>
            </div>

            <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/80">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">
                <Sparkles className="w-4 h-4" />
                Executive Summary
              </div>
              <p className="text-lg text-zinc-300 leading-relaxed font-medium">
                {isInit ? "Complete your first days of execution to unlock full AI telemetry and performance analysis." : executive_summary.ai_summary}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest border-t border-zinc-800 pt-6">
            <span>Page 1 / 5</span>
            <span>YOU VS YOU • CONFIDENTIAL PERSONAL REPORT</span>
          </div>
        </div>

        {/* =========================================================
            PAGE 2: PERFORMANCE OVERVIEW
            ========================================================= */}
        <div className="pdf-page p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-6 mb-8">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs text-white">02</div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">Performance Overview</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800/60 h-48 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Life Score Trend</span>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.life_score_timeline?.days_30 || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} domain={[0, 100]} tickLine={false} axisLine={false} />
                      <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.2} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800/60 h-48 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">Discipline Trend</span>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.consistency_trajectory || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} domain={[0, 100]} tickLine={false} axisLine={false} />
                      <Line type="monotone" dataKey="discipline_trend" stroke="#f97316" strokeWidth={2} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800/60 h-48 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Execution Velocity</span>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.execution_velocity || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                      <Area type="monotone" dataKey="planned" stroke="#52525b" fill="#52525b" fillOpacity={0.2} isAnimationActive={false} />
                      <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.4} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800/60 h-48 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-2">XP Growth Curve</span>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.xp_growth?.daily || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                      <Line type="stepAfter" dataKey="xp" stroke="#f59e0b" strokeWidth={2} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800/60 h-48 flex flex-col col-span-2">
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Deep Work & Focus Progress</span>
                <div className="flex-1 w-full flex items-center justify-center gap-12">
                  <div className="text-center">
                    <span className="text-3xl font-black text-white">{extra_analytics?.deep_work_hours || 0}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Deep Work Hours</span>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-black text-white">{extra_analytics?.focus_index || 0}/100</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Focus Index</span>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-black text-white">{extra_analytics?.learning_index || 0}/100</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Learning Index</span>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-black text-white">{extra_analytics?.health_index || 0}/100</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Health Index</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest border-t border-zinc-800 pt-6">
            <span>Page 2 / 5</span>
            <span>YOU VS YOU • CONFIDENTIAL PERSONAL REPORT</span>
          </div>
        </div>

        {/* =========================================================
            PAGE 3: PERSONAL OPERATING SYSTEM ANALYSIS
            ========================================================= */}
        <div className="pdf-page p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-6 mb-8">
              <div className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center font-black text-xs text-white">03</div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">OS Analysis & Breakdown</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800/60 h-72 flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 w-full">9-Axis Radar</span>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={charts.radar_balance || []}>
                      <PolarGrid stroke="#27272a" />
                      <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={10} />
                      <PolarRadiusAxis stroke="#52525b" fontSize={8} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Dimensions" dataKey="val" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} isAnimationActive={false} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800/60 h-72 flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2 w-full">Category Distribution</span>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.habit_distribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={50}
                        label={({ name }) => name}
                        labelLine={false}
                        isAnimationActive={false}
                        stroke="none"
                      >
                        {(charts.habit_distribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Identity Score", val: extra_analytics?.identity_score, color: "text-purple-400" },
                { label: "Momentum Score", val: extra_analytics?.momentum_score, color: "text-indigo-400" },
                { label: "Growth Index", val: extra_analytics?.growth_index, color: "text-emerald-400" },
                { label: "Recovery Index", val: extra_analytics?.recovery_index, color: "text-orange-400" },
                { label: "Failure Recovery Rate", val: `${extra_analytics?.failure_recovery_rate}%`, color: "text-rose-400" },
                { label: "Weekend Consistency", val: `${extra_analytics?.weekend_consistency}%`, color: "text-yellow-400" },
                { label: "Morning Discipline", val: `${extra_analytics?.morning_discipline}%`, color: "text-cyan-400" },
                { label: "Night Discipline", val: `${extra_analytics?.night_discipline}%`, color: "text-blue-400" },
                { label: "Task Difficulty Index", val: extra_analytics?.task_difficulty_index, color: "text-pink-400" },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</span>
                  <span className={`text-xl font-black ${item.color}`}>{item.val || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest border-t border-zinc-800 pt-6">
            <span>Page 3 / 5</span>
            <span>YOU VS YOU • CONFIDENTIAL PERSONAL REPORT</span>
          </div>
        </div>

        {/* =========================================================
            PAGE 4: AI EXECUTIVE COACH
            ========================================================= */}
        <div className="pdf-page p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-6 mb-8">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-xs text-white">04</div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">AI Executive Coach</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-emerald-950/20 p-6 rounded-3xl border border-emerald-500/30">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-2">Greatest Strength</span>
                <p className="text-sm text-zinc-200 font-medium">{charts.ai_coach_report?.greatest_strength}</p>
              </div>
              <div className="bg-rose-950/20 p-6 rounded-3xl border border-rose-500/30">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block mb-2">Biggest Bottleneck</span>
                <p className="text-sm text-zinc-200 font-medium">{charts.ai_coach_report?.biggest_bottleneck}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { title: "Consistency Analysis", val: charts.ai_coach_report?.consistency_analysis },
                { title: "Recovery Analysis", val: charts.ai_coach_report?.recovery_analysis },
                { title: "Execution Analysis", val: charts.ai_coach_report?.execution_analysis },
                { title: "Identity Analysis", val: charts.ai_coach_report?.identity_analysis },
                { title: "Behavior Pattern", val: charts.ai_coach_report?.behavior_pattern },
                { title: "Momentum Prediction", val: charts.ai_coach_report?.momentum_prediction },
              ].map((b, i) => (
                <div key={i} className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">{b.title}</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{b.val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-zinc-900/30 p-6 rounded-3xl border border-zinc-800/60">
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-4">Top 5 Improvements</span>
                <ul className="space-y-3">
                  {(charts.ai_coach_report?.top_5_improvements || []).map((imp, i) => (
                    <li key={i} className="flex gap-3 text-xs text-zinc-300 items-start">
                      <span className="text-cyan-500 font-bold">{i + 1}.</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-900/30 p-6 rounded-3xl border border-zinc-800/60">
                <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 block mb-4">Top 5 Achievements</span>
                <ul className="space-y-3">
                  {(charts.ai_coach_report?.top_5_achievements || []).map((ach, i) => (
                    <li key={i} className="flex gap-3 text-xs text-zinc-300 items-start">
                      <span className="text-yellow-500 font-bold">★</span> {ach}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-purple-900/30 p-6 rounded-3xl border border-purple-500/30 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 block mb-1">Probability of Goals</span>
              <p className="text-base text-white font-bold">{charts.ai_coach_report?.probability_of_goals}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest border-t border-zinc-800 pt-6">
            <span>Page 4 / 5</span>
            <span>YOU VS YOU • CONFIDENTIAL PERSONAL REPORT</span>
          </div>
        </div>

        {/* =========================================================
            PAGE 5: MONTHLY POSTER
            ========================================================= */}
        <div className="pdf-page p-12 flex flex-col justify-between bg-gradient-to-br from-zinc-950 via-[#0a0a0c] to-purple-950/20">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-12">
            
            <div className="p-6 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-400 font-black text-6xl tracking-tighter shadow-2xl shadow-purple-500/10">
              YvY
            </div>

            <div>
              <div className="text-[150px] font-black text-white leading-none tracking-tighter drop-shadow-2xl">
                {isInit ? "0" : executive_summary.overall_life_score}
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-purple-400 mt-4">
                Life Score 2.0
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 w-full max-w-md mx-auto">
              <div>
                <div className="text-5xl font-black text-white tracking-tight">{isInit ? "-" : executive_summary.discipline_grade}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Discipline</div>
              </div>
              <div>
                <div className="text-5xl font-black text-white tracking-tight">{executive_summary.current_streak}d</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Unbroken Streak</div>
              </div>
            </div>

          </div>

          <div className="text-center space-y-8 pb-8">
            <p className="text-2xl font-black italic text-zinc-300 tracking-tight">
              &quot;I&apos;m becoming the person I promised myself I&apos;d become.&quot;
            </p>
            <div className="w-16 h-1 bg-purple-600 mx-auto rounded-full"></div>
            <div className="text-xs text-zinc-600 font-bold uppercase tracking-widest">
              YOU VS YOU • FORGE TELEMETRY ENGINE
            </div>
          </div>
        </div>

      </div>
    </>
  );
};
