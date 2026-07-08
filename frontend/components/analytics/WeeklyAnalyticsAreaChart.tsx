"use client";

import React, { memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface WeeklyAnalyticsAreaChartProps {
  chartData: any[];
}

export const WeeklyAnalyticsAreaChart = memo(function WeeklyAnalyticsAreaChart({ chartData }: WeeklyAnalyticsAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--forge-500, #6254f8)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--forge-500, #6254f8)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(val) => `${val}%`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px" }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value: number) => [`${value}%`, "Completion Rate"]}
          labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="var(--forge-500, #6254f8)"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorRate)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
