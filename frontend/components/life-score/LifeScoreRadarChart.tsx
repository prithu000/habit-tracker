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
        <PolarGrid stroke="#292930" />
        <PolarAngleAxis
          dataKey="subject"
          stroke="#71717A"
          tick={{ fill: "#A1A1AA", fontSize: 10, cursor: "pointer" }}
          onClick={(data) => {
            const found = radarAxes.find((a: any) => a.subject === data.value);
            if (found) setSelectedAxis(found);
          }}
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#292930" tick={false} />
        <Radar
          name={radarTimeframe.toUpperCase()}
          dataKey={radarTimeframe}
          stroke="#8B5CF6"
          strokeWidth={1.5}
          fill="#8B5CF6"
          fillOpacity={0.25}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
});
