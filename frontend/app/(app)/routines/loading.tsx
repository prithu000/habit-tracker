import { Skeleton } from "@/components/shared/Skeleton";
import { ListTodo } from "lucide-react";

export default function RoutinesLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-forge-400 shrink-0" />
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">
              Loading Routines...
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Preparing your execution protocol
          </p>
        </div>
      </div>

      {/* Routines Grid Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
