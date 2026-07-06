"use client";

import { useMonthlyAnalytics } from "@/lib/queries/useAnalytics";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export default function MonthlyAnalyticsPage() {
  const { data: monthly, isLoading, isError } = useMonthlyAnalytics();

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !monthly) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Failed to load monthly data"
        description="We couldn't fetch your monthly analytics."
        action={<button onClick={() => window.location.reload()} className="btn-ghost">Retry</button>}
      />
    );
  }

  const days = (monthly.calendar_grid?.weeks || []).flat().filter((d: any) => d !== null) as any[];
  const chartData = days.map((day: any) => ({
    name: day.day.toString(),
    rate: day.completion_rate,
  }));

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Monthly Performance</h3>
          <p className="text-sm text-muted-foreground">Your task completion rate over the last 30 days.</p>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                itemStyle={{ color: 'hsl(var(--forge-400))' }}
                formatter={(value: number) => [`${value}%`, 'Completion Rate']}
              />
              <Bar 
                dataKey="rate" 
                fill="var(--forge-500, #6254f8)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
