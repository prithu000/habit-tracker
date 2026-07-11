import { Skeleton } from "@/components/shared/Skeleton";
import { FileText } from "lucide-react";

export default function ReportsLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-forge-400 shrink-0" />
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">
              Generating Executive Report...
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Analyzing your performance data
          </p>
        </div>
      </div>

      {/* Report Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-[600px] w-full rounded-3xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    </div>
  );
}
