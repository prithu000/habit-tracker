"use client";

import { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { format, subDays, startOfYear, endOfYear, eachDayOfInterval, getDay, isSameDay } from "date-fns";

interface HeatmapData {
  [date: string]: {
    completion_rate: number;
    tasks_completed: number;
    tasks_scheduled: number;
  };
}

interface YearHeatmapProps {
  data: any;
  year?: number;
}

export const YearHeatmap = memo(function YearHeatmap({ data, year = new Date().getFullYear() }: YearHeatmapProps) {
  const lookupData = useMemo(() => {
    if (Array.isArray(data)) {
      const map: Record<string, any> = {};
      data.forEach((item) => {
        if (item && item.date) {
          map[item.date] = item;
        }
      });
      return map;
    }
    return data || {};
  }, [data]);

  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 0, 1));
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Group by weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = Array(getDay(startDate)).fill(null); // Fill initial offset

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null as any);
    }
    weeks.push(currentWeek);
  }

  const getHeatColor = (rate: number) => {
    if (rate === 0) return "bg-white/5";
    if (rate < 25) return "bg-forge-500/20";
    if (rate < 50) return "bg-forge-500/40";
    if (rate < 75) return "bg-forge-500/60";
    if (rate < 100) return "bg-forge-500/80";
    return "bg-forge-500 shadow-[0_0_8px_rgba(98,84,248,0.5)]";
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="w-full overflow-x-auto pb-4 no-scrollbar">
      <div className="min-w-[800px]">
        {/* Months header */}
        <div className="flex text-xs text-muted-foreground mb-2 ml-8">
          {months.map((m, i) => (
            <div key={m} style={{ width: `${(100 / 12)}%` }}>{m}</div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Days of week labels */}
          <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pr-2 pt-5">
            <div className="h-3">Mon</div>
            <div className="h-3 mt-3">Wed</div>
            <div className="h-3 mt-3">Fri</div>
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1">
                {week.map((day, dIndex) => {
                  if (!day) return <div key={`empty-${dIndex}`} className="w-3 h-3" />;
                  
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayData = lookupData[dateStr] || { completion_rate: 0, tasks_completed: 0, tasks_scheduled: 0 };
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div 
                      key={dateStr}
                      className="relative group"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: (wIndex * 7 + dIndex) * 0.001 }}
                        className={`w-3 h-3 rounded-sm transition-all duration-200 hover:ring-2 hover:ring-forge-400 hover:ring-offset-1 hover:ring-offset-background ${getHeatColor(dayData.completion_rate)} ${isToday ? 'border border-white/50' : ''}`}
                      />
                      
                      {/* Simple custom tooltip to avoid radix dependency issues here */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-0 group-hover:scale-100 transition-transform bg-card border border-border text-foreground text-xs p-2 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none origin-bottom">
                        <div className="font-semibold mb-1">{format(day, "MMM d, yyyy")}</div>
                        {dayData.tasks_scheduled > 0 ? (
                          <div className="text-muted-foreground">
                            {dayData.tasks_completed} of {dayData.tasks_scheduled} tasks ({dayData.completion_rate}%)
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No tasks scheduled</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-6 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-white/5" />
            <div className="w-3 h-3 rounded-sm bg-forge-500/20" />
            <div className="w-3 h-3 rounded-sm bg-forge-500/40" />
            <div className="w-3 h-3 rounded-sm bg-forge-500/60" />
            <div className="w-3 h-3 rounded-sm bg-forge-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
});
