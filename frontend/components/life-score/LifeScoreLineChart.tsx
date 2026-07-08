"use client";

import React, { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LifeScoreLineChartProps {
  history: any[];
}

export const LifeScoreLineChart = memo(function LifeScoreLineChart({ history }: LifeScoreLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={history}>
        <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} />
        <YAxis domain={[50, 100]} stroke="#52525b" fontSize={11} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fff" }}
        />
        <Line type="monotone" dataKey="score" stroke="#c084fc" strokeWidth={3} dot={{ r: 4, fill: "#c084fc" }} />
      </LineChart>
    </ResponsiveContainer>
  );
});
