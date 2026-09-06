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
        <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickLine={false} />
        <YAxis domain={[50, 100]} stroke="#71717A" fontSize={11} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "#18181D", borderColor: "#292930", borderRadius: "10px", color: "#F5F5F7", fontSize: "12px" }}
        />
        <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: "#8B5CF6" }} />
      </LineChart>
    </ResponsiveContainer>
  );
});
