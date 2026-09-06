"use client";

import dynamic from "next/dynamic";
import { useDashboard } from "@/lib/queries/useDashboard";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { CheckCircle2, AlertCircle, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/layouts/PageTransition";
import { useCustomizationStore } from "@/lib/stores/customizationStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRoutePrefetch } from "@/lib/hooks/useRoutePrefetch";
import { cn } from "@/lib/utils/cn";
import { useSubscription } from "@/lib/hooks/useSubscription";

const DynamicWidgetsGrid = dynamic(
  () => import("@/components/dashboard/DynamicWidgetsGrid").then((m) => m.DynamicWidgetsGrid),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-2xl" /> }
);

export default function DashboardPage() {
  const { data: dashboard, isLoading, isError, error } = useDashboard();
  const { enabledWidgets, dashboardLayout, density } = useCustomizationStore();
  const { user } = useAuthStore();
  const { isFreeMode } = useSubscription();

  useRoutePrefetch();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load dashboard"
        description={(error as any)?.response?.data?.error?.message || "Could not connect to the server."}
        action={<button onClick={() => window.location.reload()} className="btn-forge">Retry</button>}
      />
    );
  }

  const gapCls = density === "compact" ? "space-y-5" : "space-y-6 md:space-y-8";
  const categories = dashboard.today.categories || [];

  return (
    <PageTransition>
      <div className={cn("pb-12", gapCls)}>

        {/* Hero */}
        <DashboardHero />

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 -mt-2">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all min-h-[36px]"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </Link>
        </div>

        {/* Stats Bar */}
        <StatsBar stats={dashboard.today.stats} widgets={dashboard.widgets} />

        {/* Today's Tasks by Category */}
        <section id="routines-section" className="scroll-mt-20 space-y-3">
          <div
            className="flex items-center justify-between pb-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              <h2 className="text-sm font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
                Today&apos;s Tasks
              </h2>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--surface-raised)",
                  color: "var(--fg-faint)",
                  border: "1px solid var(--border)",
                }}
              >
                {categories.length} CATEGORIES
              </span>
            </div>
            <Link
              href="/tasks"
              className="text-xs font-medium transition-colors flex items-center gap-1 group"
              style={{ color: "var(--accent)" }}
            >
              <span>Manage</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          {categories.length === 0 ? (
            <div
              className="p-10 rounded-2xl text-center space-y-3"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                }}
              >
                <Sparkles className="w-5 h-5" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                No tasks scheduled for today.
              </h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                Every remarkable transformation begins with a single completed task.
              </p>
              <div className="pt-2">
                <Link
                  href="/tasks"
                  className="px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Task</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className={cn(
              "grid gap-3",
              dashboardLayout === "compact" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            )}>
              {categories.map((cat) => (
                <CategorySection key={cat.category} category={cat} />
              ))}

              {dashboard.today.stats.is_perfect_day && dashboard.today.stats.total_tasks > 0 && (
                <div
                  className="p-5 text-center rounded-2xl flex items-center justify-center gap-3"
                  style={{
                    border: "1px solid var(--accent-border)",
                    background: "var(--accent-subtle)",
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "var(--success)" }} />
                  <div className="text-left">
                    <p className="font-semibold text-sm" style={{ color: "var(--fg)" }}>
                      Perfect Day Achieved!
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                      You&apos;ve completed 100% of your scheduled tasks today.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Widgets Grid */}
        <section id="widgets-grid-section" className="scroll-mt-20">
          <DynamicWidgetsGrid dashboard={dashboard} isFreeMode={isFreeMode} />
        </section>
      </div>
    </PageTransition>
  );
}
