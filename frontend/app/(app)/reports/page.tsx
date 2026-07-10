"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useSmartReports, useLifeScore } from "@/lib/queries/useOS";
import { useDashboard } from "@/lib/queries/useDashboard";
import { useDisciplineScore, useWeeklyAnalytics, useMonthlyAnalytics } from "@/lib/queries/useAnalytics";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  Download,
  ShieldCheck,
  Calendar,
  Sun,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";
import { format, parseISO } from "date-fns";

const ExecutivePaperReport = dynamic(
  () => import("@/components/reports/ExecutivePaperReport").then((mod) => mod.ExecutivePaperReport),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-3xl space-y-8 bg-white/[0.02] border border-white/[0.05] p-12 rounded-[32px]">
        <div className="space-y-4 text-center flex flex-col items-center">
          <Skeleton className="h-4 w-32 rounded-full bg-zinc-800" />
          <Skeleton className="h-10 w-64 rounded-xl bg-zinc-800" />
        </div>
        <div className="grid grid-cols-2 gap-8 py-6 border-y border-zinc-800">
          <Skeleton className="h-24 w-full rounded-2xl bg-zinc-800" />
          <Skeleton className="h-24 w-full rounded-2xl bg-zinc-800" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg bg-zinc-800" />
          <Skeleton className="h-32 w-full rounded-2xl bg-zinc-800" />
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
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [isExporting, setIsExporting] = useState(false);

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
      toast.error("Report element not found");
      return;
    }

    try {
      setIsExporting(true);
      toast.loading("Synthesizing A4 printable PDF...", { id: "pdf-export" });

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

      // Calculate filename: Daily_Report.pdf, Weekly_Report.pdf, or Monthly_Report.pdf
      const tfCapitalized = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      const filename = `${tfCapitalized}_Report.pdf`;

      pdf.save(filename);
      toast.success(`Downloaded ${filename}!`, { id: "pdf-export", duration: 4000 });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF. Please try again.", { id: "pdf-export" });
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
    <PageTransition className="space-y-6 md:space-y-8 lg:space-y-12 max-w-6xl mx-auto pb-16 md:pb-28 p-4 sm:p-8">
      {/* ── TOP HEADING & BADGE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            PERFORMANCE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">
              REPORTS
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl font-medium">
            Real data. Real progress. No estimates.
            <br />
            Track your journey and download your executive performance reports.
          </p>
        </div>

        {/* 100% REAL DATA BADGE */}
        <div className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-zinc-900/80 border border-purple-500/30 shadow-lg backdrop-blur-md self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-mono font-black text-purple-400 tracking-wider">
              100% REAL DATA
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">
              No fake numbers. Only you.
            </div>
          </div>
        </div>
      </div>

      {/* ── SEGMENT CONTROL (Only one report visible at a time) ── */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-lg">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300",
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <IconComp className={cn("w-4 h-4", isActive ? "text-white" : "text-zinc-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ACTIVE REPORT DISPLAY (Large A4 White Paper Card) ── */}
      <div className="min-h-[600px] flex items-center justify-center pt-2">
        {isLoading ? (
          <div className="w-full max-w-3xl space-y-8 bg-white/[0.02] border border-white/[0.05] p-12 rounded-[32px]">
            <div className="space-y-4 text-center flex flex-col items-center">
              <Skeleton className="h-4 w-32 rounded-full bg-zinc-800" />
              <Skeleton className="h-10 w-64 rounded-xl bg-zinc-800" />
            </div>
            <div className="grid grid-cols-2 gap-8 py-6 border-y border-zinc-800">
              <Skeleton className="h-24 w-full rounded-2xl bg-zinc-800" />
              <Skeleton className="h-24 w-full rounded-2xl bg-zinc-800" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48 rounded-lg bg-zinc-800" />
              <Skeleton className="h-32 w-full rounded-2xl bg-zinc-800" />
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
    </PageTransition>
  );
}
