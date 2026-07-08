"use client";

import React, { memo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface LifeScoreRadarChartProps {
  radarAxes: any[];
  radarTimeframe: string;
  setSelectedAxis: (axis: any) => void;
}

export const LifeScoreRadarChart = memo(function LifeScoreRadarChart({
  radarAxes,
  radarTimeframe,
  setSelectedAxis,
}: LifeScoreRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarAxes}>
        <PolarGrid stroke="#27272a" />
        <PolarAngleAxis
          dataKey="subject"
          stroke="#a1a1aa"
          tick={{ fill: "#a1a1aa", fontSize: 10, cursor: "pointer" }}
          onClick={(data) => {
            const found = radarAxes.find((a: any) => a.subject === data.value);
            if (found) setSelectedAxis(found);
          }}
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" tick={false} />
        <Radar
          name={radarTimeframe.toUpperCase()}
          dataKey={radarTimeframe}
          stroke="#c084fc"
          fill="#8b5cf6"
          fillOpacity={0.45}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
});
