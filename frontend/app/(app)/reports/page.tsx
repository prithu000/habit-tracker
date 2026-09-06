"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { usePaywallStore } from "@/lib/stores/paywallStore";
import dynamic from "next/dynamic";
import { useSmartReports, useLifeScore } from "@/lib/queries/useOS";
import { useDashboard } from "@/lib/queries/useDashboard";
import { useDisciplineScore, useWeeklyAnalytics, useMonthlyAnalytics } from "@/lib/queries/useAnalytics";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  Download,
  ShieldCheck,
  Calendar,
  Sun,
  TrendingUp,
  Loader2,
  Settings,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";
import { format, parseISO } from "date-fns";
import { ReportSettingsModal } from "@/components/reports/ReportSettingsModal";
import { useQueryClient } from "@tanstack/react-query";

const ExecutivePaperReport = dynamic(
  () => import("@/components/reports/ExecutivePaperReport").then((mod) => mod.ExecutivePaperReport),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[680px] space-y-6 p-6 sm:p-8 rounded-[24px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="space-y-3 text-center flex flex-col items-center">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-8 w-56 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 py-4 border-y" style={{ borderColor: "var(--border)" }}>
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    ),
  }
);

const PrintableA4Report = dynamic(
  () => import("@/components/reports/PrintableA4Report").then((mod) => mod.PrintableA4Report),
  { ssr: false }
);

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { isFreeMode } = useSubscription();
  const router = useRouter();
  const { openPaywall } = usePaywallStore();

  useEffect(() => {
    if (isFreeMode) {
      openPaywall();
    }
  }, [isFreeMode, openPaywall]);

  return <ReportsPageContent />;
}

function ReportsPageContent() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [isExporting, setIsExporting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const queryClient = useQueryClient();

  const dailyQuery = useSmartReports("daily", activeTab === "daily");
  const weeklyQuery = useSmartReports("weekly", activeTab === "weekly");
  const monthlyQuery = useSmartReports("monthly", activeTab === "monthly");

  const { data: dashboard } = useDashboard();
  const { data: lifeScore } = useLifeScore();
  const { data: disciplineScore } = useDisciplineScore();
  const { data: weeklyAnalytics } = useWeeklyAnalytics(activeTab === "weekly");
  const { data: monthlyAnalytics } = useMonthlyAnalytics(activeTab === "monthly");

  const isLoading =
    (activeTab === "daily" && dailyQuery.isLoading) ||
    (activeTab === "weekly" && weeklyQuery.isLoading) ||
    (activeTab === "monthly" && monthlyQuery.isLoading);

  const activeData =
    activeTab === "daily"
      ? dailyQuery.data
      : activeTab === "weekly"
      ? weeklyQuery.data
      : monthlyQuery.data;

  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-a4-paper");
    if (!element) {
      toast.error("Report not ready. Please try again.");
      return;
    }

    try {
      setIsExporting(true);
      
      // Professional download flow with progress messages
      const toastId = toast.loading("Preparing Report...");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.loading("Collecting Analytics...", { id: toastId });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.loading("Generating Insights...", { id: toastId });

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        useCORS: true,
        backgroundColor: "#fcfbf9",
        logging: false,
      } as any);

      toast.loading("Rendering PDF...", { id: toastId });
      await new Promise(resolve => setTimeout(resolve, 400));

      const imgData = canvas.toDataURL("image/png");
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > pageHeight) {
        // Automatically scale proportionally to guarantee single A4 page fit without cropping
        const scaleRatio = pageHeight / imgHeight;
        const scaledWidth = imgWidth * scaleRatio;
        const xOffset = (imgWidth - scaledWidth) / 2;
        pdf.addImage(imgData, "PNG", xOffset, 0, scaledWidth, pageHeight);
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      toast.loading("Almost Ready...", { id: toastId });
      await new Promise(resolve => setTimeout(resolve, 300));

      // Calculate filename: Daily_Report.pdf, Weekly_Report.pdf, or Monthly_Report.pdf
      const tfCapitalized = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      const filename = `${tfCapitalized}_Report.pdf`;

      pdf.save(filename);
      toast.success(`✅ Report downloaded successfully!`, { id: toastId, duration: 4000 });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Download failed. Please try again.", { id: "pdf-export" });
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { id: "daily" as const, label: "Daily Report", icon: Sun },
    { id: "weekly" as const, label: "Weekly Report", icon: TrendingUp },
    { id: "monthly" as const, label: "Monthly Report", icon: Calendar },
  ];

  return (
    <PageTransition className="space-y-6 md:space-y-8 lg:space-y-10 max-w-6xl mx-auto pb-16 md:pb-24 p-4 sm:p-6">
      {/* ── TOP HEADING & BADGE ── */}
      <div className="flex flex-col md:flex-row justify-between gap-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight" style={{ color: "var(--fg)" }}>
              Performance Reports
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed max-w-xl" style={{ color: "var(--fg-muted)" }}>
              Understand your consistency through daily, weekly and monthly analytics. Generate printable reports and customize which habits appear in your Habit Breakdown.
            </p>
          </div>

          {/* Info Card */}
          <div className="p-3.5 rounded-xl max-w-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-xs font-medium mb-1.5 uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--fg)" }}>
              <Settings className="w-3.5 h-3.5 text-[#8B5CF6]" />
              Report Settings allows you to:
            </h3>
            <ul className="space-y-1">
              <li className="flex items-start gap-2 text-xs" style={{ color: "var(--fg-muted)" }}>
                <div className="w-1 h-1 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                Choose up to 4 custom habits
              </li>
              <li className="flex items-start gap-2 text-xs" style={{ color: "var(--fg-muted)" }}>
                <div className="w-1 h-1 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                Reorder habit priority
              </li>
              <li className="flex items-start gap-2 text-xs" style={{ color: "var(--fg-muted)" }}>
                <div className="w-1 h-1 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                Personalize your PDF reports
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT ACTION CLUSTER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto shrink-0">
          {/* Report Settings Button */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors text-xs font-medium"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}
          >
            <Settings className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Report Settings</span>
          </button>

          {/* 100% REAL DATA BADGE */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--accent)" }}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-medium tracking-wider" style={{ color: "var(--fg)" }}>
                100% REAL DATA
              </div>
              <div className="text-[10px]" style={{ color: "var(--fg-faint)" }}>
                No fake numbers. Only you.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEGMENT CONTROL (Only one report visible at a time) ── */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all",
                  isActive
                    ? "shadow-sm"
                    : "hover:opacity-80"
                )}
                style={
                  isActive
                    ? { background: "var(--accent)", color: "var(--accent-fg)" }
                    : { color: "var(--fg-muted)" }
                }
              >
                <IconComp className="w-3.5 h-3.5" style={{ color: isActive ? "var(--accent-fg)" : "var(--fg-muted)" }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ACTIVE REPORT DISPLAY (Executive Card) ── */}
      <div className="min-h-[450px] flex items-center justify-center pt-1">
        {isLoading ? (
          <div className="w-full max-w-[680px] space-y-6 p-6 sm:p-8 rounded-[24px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="space-y-3 text-center flex flex-col items-center">
              <Skeleton className="h-3.5 w-28 rounded-full" />
              <Skeleton className="h-8 w-56 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 border-y" style={{ borderColor: "var(--border)" }}>
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            <ExecutivePaperReport
              data={activeData}
              dashboard={dashboard}
              lifeScore={lifeScore}
              disciplineScore={disciplineScore}
              weeklyAnalytics={weeklyAnalytics}
              monthlyAnalytics={monthlyAnalytics}
              timeframe={activeTab}
              id="preview-paper-report"
            />

            {/* Hidden strictly A4 dimension report for PDF capture */}
            <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none z-[-1] overflow-visible">
              <PrintableA4Report
                data={activeData}
                dashboard={dashboard}
                lifeScore={lifeScore}
                disciplineScore={disciplineScore}
                weeklyAnalytics={weeklyAnalytics}
                monthlyAnalytics={monthlyAnalytics}
                timeframe={activeTab}
                id="printable-a4-paper"
              />
            </div>
          </>
        )}
      </div>

      {/* ── LARGE BOTTOM DOWNLOAD BUTTON ── */}
      <div className="flex flex-col items-center justify-center pt-6">
        <button
          onClick={handleDownloadPDF}
          disabled={isLoading || isExporting}
          className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-base sm:text-lg tracking-wider uppercase transition-all duration-300 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none active:translate-y-0"
        >
          {isExporting ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <Download className="w-6 h-6 text-white transition-transform group-hover:-translate-y-0.5" />
          )}
          <div className="text-left leading-tight">
            <div>⬇ Download Report</div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-purple-200/80 uppercase">
              PDF • A4 • Printable
            </div>
          </div>
        </button>
      </div>

      <ReportSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          // Invalidate and immediately refetch report queries so the UI
          // reflects the new breakdown selection without delay.
          queryClient.invalidateQueries({ queryKey: ["smartReports"] });
          queryClient.refetchQueries({ queryKey: ["smartReports"] });
          queryClient.invalidateQueries({ queryKey: ["reports"] });
          queryClient.invalidateQueries({ queryKey: ["analytics"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["reportSettings"] });
        }}
      />
    </PageTransition>
  );
}
