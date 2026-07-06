"use client";

import React, { useState } from "react";
import { useSmartReports } from "@/lib/queries/useOS";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  FileText,
  Download,
  BarChart2,
  FileSpreadsheet,
  Printer,
  Image as ImageIcon,
  Layout,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";
import { ExecutiveSummaryCard } from "@/components/reports/ExecutiveSummaryCard";
import { ExecutiveChartsGrid } from "@/components/reports/ExecutiveChartsGrid";

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [layoutMode, setLayoutMode] = useState<"portrait" | "landscape" | "poster">("portrait");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useSmartReports(timeframe);

  const handleExport = async (format: "pdf" | "png" | "jpeg" | "csv") => {
    if (format === "csv") {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/analytics/reports/?timeframe=${timeframe}&format=csv`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `youvsyou_${timeframe}_report.csv`;
      a.click();
      toast.success(`📥 CSV Telemetry report downloaded!`);
      return;
    }

    const element = document.getElementById("executive-report-container");
    if (!element) {
      toast.error("Report container not found.");
      return;
    }

    setIsExporting(true);
    toast.loading(`⚡ Generating high-res ${format.toUpperCase()} export...`, { id: "export-toast" });

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(element, {
        scale: layoutMode === "poster" ? 3 : 2,
        useCORS: true,
        logging: false,
        backgroundColor: theme === "dark" ? "#0a0a0c" : "#ffffff",
      } as any);

      if (format === "png" || format === "jpeg") {
        const imgData = canvas.toDataURL(`image/${format === "jpeg" ? "jpeg" : "png"}`, 0.95);
        const a = document.createElement("a");
        a.href = imgData;
        a.download = `youvsyou_${timeframe}_executive_report.${format === "jpeg" ? "jpg" : "png"}`;
        a.click();
        toast.success(`📥 High-Res ${format.toUpperCase()} report downloaded!`, { id: "export-toast" });
      } else if (format === "pdf") {
        const imgData = canvas.toDataURL("image/png");
        const orientation = layoutMode === "landscape" ? "l" : "p";
        const formatSize = layoutMode === "poster" ? "a3" : "a4";
        const pdf = new jsPDF(orientation, "mm", formatSize);
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`youvsyou_${timeframe}_executive_report.pdf`);
        toast.success(`📥 High-Res Executive PDF downloaded!`, { id: "export-toast" });
      }
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("❌ Failed to generate report export.", { id: "export-toast" });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-3xl" />
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 max-w-2xl mx-auto my-12">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">Failed to load Executive Telemetry</h3>
        <p className="text-zinc-400 text-sm mt-2">
          Could not aggregate performance telemetry from the YOU VS YOU engine. Please verify backend connection.
        </p>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Top Executive Control Bar */}
      <div
        className={cn(
          "flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl shadow-2xl print:hidden transition-colors",
          isDark
            ? "bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-zinc-900/60 border-purple-500/30 text-white"
            : "bg-white border-zinc-200 text-zinc-900 shadow-xl"
        )}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <BarChart2 className="w-3.5 h-3.5 animate-pulse" />
            Fortune 500 Executive Telemetry
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            EXECUTIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">REPORTS</span>
          </h1>
          <p className={cn("text-xs sm:text-sm max-w-2xl", isDark ? "text-zinc-400" : "text-zinc-600")}>
            Consulting-grade execution synthesis across 27 neurological and behavioral performance dimensions.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
          {/* Timeframe Switcher */}
          <div className={cn("flex items-center gap-1 p-1 rounded-2xl border", isDark ? "bg-zinc-950/80 border-zinc-800" : "bg-zinc-100 border-zinc-300")}>
            {(["daily", "weekly", "monthly", "yearly"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize",
                  timeframe === tf
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                    : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Layout Mode Switcher */}
          <div className={cn("flex items-center gap-1 p-1 rounded-2xl border", isDark ? "bg-zinc-950/80 border-zinc-800" : "bg-zinc-100 border-zinc-300")}>
            <button
              onClick={() => setLayoutMode("portrait")}
              className={cn("px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1", layoutMode === "portrait" ? "bg-zinc-800 text-white" : "text-zinc-400")}
              title="Portrait A4"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Portrait</span>
            </button>
            <button
              onClick={() => setLayoutMode("landscape")}
              className={cn("px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1", layoutMode === "landscape" ? "bg-zinc-800 text-white" : "text-zinc-400")}
              title="Landscape A4"
            >
              <Layout className="w-3.5 h-3.5 rotate-90" />
              <span>Landscape</span>
            </button>
            <button
              onClick={() => setLayoutMode("poster")}
              className={cn("px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1", layoutMode === "poster" ? "bg-purple-600 text-white" : "text-zinc-400")}
              title="Poster A3 Mode"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Poster (A3)</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "p-2.5 rounded-2xl border flex items-center justify-center transition-all",
              isDark ? "bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-800" : "bg-zinc-100 border-zinc-300 text-zinc-900 hover:bg-zinc-200"
            )}
            title="Toggle Dark/Light Report Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleExport("csv")}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all border border-zinc-700 flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="Download CSV Data"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => handleExport("png")}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all border border-zinc-700 flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="Download High-Res PNG"
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>PNG</span>
            </button>

            <button
              onClick={() => handleExport("jpeg")}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all border border-zinc-700 flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="Download High-Res JPG"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>JPG</span>
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black transition-all shadow-lg shadow-purple-500/20 flex items-center gap-1.5 text-xs uppercase tracking-wider disabled:opacity-50"
              title="Download High-Res PDF Report"
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span>{isExporting ? "Exporting..." : "PDF Report"}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700"
              title="Browser Print / Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── REPORT PRINT/EXPORT CONTAINER ── */}
      <div
        id="executive-report-container"
        className={cn(
          "transition-all duration-300 rounded-3xl",
          layoutMode === "landscape" ? "max-w-[1400px] mx-auto" : layoutMode === "poster" ? "max-w-[1600px] mx-auto p-4 sm:p-8 border-4 border-purple-500/40 shadow-2xl bg-zinc-950/90 rounded-[40px]" : "max-w-none",
          theme === "light" ? "bg-zinc-50 p-6 sm:p-8 border border-zinc-200 text-zinc-900" : ""
        )}
      >
        {/* Executive Summary Card */}
        {data.executive_summary && (
          <ExecutiveSummaryCard summary={data.executive_summary} theme={theme} />
        )}

        {/* Executive 27-Chart Grid */}
        {data.charts && (
          <ExecutiveChartsGrid charts={data.charts} theme={theme} />
        )}

        {/* Footer Audit Stamp */}
        <div className={cn("mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-4", isDark ? "border-zinc-800 text-zinc-500" : "border-zinc-300 text-zinc-600")}>
          <div className="flex items-center gap-2 font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>YOU VS YOU // PERSONAL OPERATING SYSTEM • GENERATED BY TELEMETRY ENGINE 2.0</span>
          </div>
          <div className="font-mono">
            Report Cycle: {data.start_date?.split("T")[0]} to {data.end_date?.split("T")[0]} • Timeframe: {data.timeframe}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
