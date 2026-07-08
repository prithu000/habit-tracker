"use client";

import { useDashboard } from "@/lib/queries/useDashboard";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { RoutineCard } from "@/components/dashboard/RoutineCard";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { AICoachWidget } from "@/components/dashboard/AICoachWidget";
import { DynamicWidgetsGrid } from "@/components/dashboard/DynamicWidgetsGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";
import { CheckCircle2, AlertCircle, Plus, Sparkles, Sliders } from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/layouts/PageTransition";
import { useCustomizationStore } from "@/lib/stores/customizationStore";
import { cn } from "@/lib/utils/cn";

export default function DashboardPage() {
  const { data: dashboard, isLoading, isError, error } = useDashboard();
  const { enabledWidgets, dashboardLayout, density, toggleRightSidebar } = useCustomizationStore();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <EmptyState 
        icon={AlertCircle}
        title="Failed to load telemetry"
        description={(error as any)?.response?.data?.error?.message || "There was a problem connecting to the DeepMind neural engine. Please verify server status."}
        action={<button onClick={() => window.location.reload()} className="btn-forge">Retry Sync</button>}
      />
    );
  }

  const gapCls = density === "compact" ? "space-y-5" : "space-y-8";

  return (
    <PageTransition>
      <div className={cn("pb-12", gapCls)}>
        {/* Top Section: Greeting & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <GreetingHeader 
            displayName={dashboard.user.display_name} 
            identityStatement={dashboard.user.identity_statement} 
          />
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <Link
              href="/routines"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-forge-500 to-purple-600 hover:from-forge-400 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Quick Add Routine</span>
            </Link>
            <button
              onClick={toggleRightSidebar}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-muted-foreground hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Customize Studio Layout"
            >
              <Sliders className="w-4 h-4 text-forge-400" />
              <span className="hidden md:inline">Layout</span>
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <StatsBar stats={dashboard.today.stats} />

        {/* 1. Neural Coach Section */}
        {enabledWidgets.includes("ai_coach") && (
          <section id="ai-coach-section" className="scroll-mt-20">
            <AICoachWidget dashboard={dashboard} />
          </section>
        )}

        {/* 2. Today's Routines Section */}
        <section id="routines-section" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-forge-500 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
              <h2 className="text-base font-display font-bold tracking-tight text-white">
                Today&apos;s Execution Protocol
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                {dashboard.today.routines.length} ROUTINES
              </span>
            </div>
            <Link href="/routines" className="text-xs font-semibold text-forge-400 hover:text-forge-300 transition-colors flex items-center gap-1 group">
              <span>Manage Protocol</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          {dashboard.today.routines.length === 0 ? (
            <div className="p-10 rounded-[24px] bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/[0.08] text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-forge-500/10 border border-forge-500/20 flex items-center justify-center text-forge-400 mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-bold text-white">Nothing here... yet.</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Every remarkable transformation begins with a single completed task.<br />
                <span className="text-forge-400 font-semibold mt-1 block">Today is Day One.</span>
              </p>
              <div className="pt-2">
                <Link href="/routines" className="btn-forge text-xs inline-flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Create First Routine</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              dashboardLayout === "wide" ? "grid-cols-1" : dashboardLayout === "compact" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            )}>
              {dashboard.today.routines.map((routine) => (
                <RoutineCard key={routine.id} routine={routine} />
              ))}
              
              {dashboard.today.stats.is_perfect_day && dashboard.today.stats.total_tasks > 0 && (
                <div className="p-6 text-center text-emerald-300 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-[#0a0a0c]/80 to-emerald-500/10 rounded-[24px] shadow-[0_0_40px_rgba(16,185,129,0.15)] flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <p className="font-display font-black text-base">Perfect Protocol Execution Achieved!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">You&apos;ve completed 100% of your scheduled tasks today. Rest and recover.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 3. Interactive Modular Widgets Grid */}
        <section id="widgets-grid-section" className="scroll-mt-20 pt-4">
          <DynamicWidgetsGrid dashboard={dashboard} />
        </section>

        {/* 4. Performance & Analytics Studio */}
        <section id="analytics-studio-section" className="scroll-mt-20 pt-4">
          <DashboardAnalytics dashboard={dashboard} />
        </section>
      </div>
    </PageTransition>
  );
}
