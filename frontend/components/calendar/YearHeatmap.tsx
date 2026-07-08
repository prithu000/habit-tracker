"use client";

import React, { memo } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

interface YearHeatmapProps {
  heatmapWeeks: HeatmapDay[][];
  getLevelColor: (level: number) => string;
}

export const YearHeatmap = memo(function YearHeatmap({
  heatmapWeeks,
  getLevelColor,
}: YearHeatmapProps) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl overflow-x-auto">
      <div className="flex items-center justify-between mb-6 min-w-[700px]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400" />
            Annual Consistency Matrix
          </h3>
          <p className="text-xs text-zinc-400">365-day visual density log of your completed routines and tasks.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <div key={lvl} className={cn("w-3.5 h-3.5 rounded-sm", getLevelColor(lvl))} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-1.5 min-w-[700px] pb-2">
        {heatmapWeeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1.5">
            {week.map((day, dIdx) => (
              <div
                key={dIdx}
                title={`${day.date}: ${day.count} tasks completed`}
                className={cn(
                  "w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer",
                  getLevelColor(day.level)
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
