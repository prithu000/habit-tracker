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
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#292930" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#71717A" }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#71717A" }}
          tickFormatter={(val) => `${val}%`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#18181D", borderColor: "#292930", borderRadius: "10px", fontSize: "12px" }}
          itemStyle={{ color: "#F5F5F7" }}
          formatter={(value: number) => [`${value}%`, "Completion Rate"]}
          labelStyle={{ color: "#A1A1AA", marginBottom: "4px" }}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="#8B5CF6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRate)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
