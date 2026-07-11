import { Skeleton } from "@/components/shared/Skeleton";
import { Timer } from "lucide-react";

export default function FocusLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-forge-400 shrink-0" />
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">
              Preparing AI Coach...
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Initializing focus environment
          </p>
        </div>
      </div>

      {/* Focus Mode Skeleton */}
      <Skeleton className="h-[600px] w-full rounded-3xl" />
    </div>
  );
}
