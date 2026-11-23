"use client";

import React, { useMemo } from "react";
import type { BuildStat } from "@/lib/types";

interface StatRadarChartProps {
  stats: BuildStat[];
  elementColor?: string;
  size?: number;
}

const RINGS = [0.25, 0.5, 0.75, 1];

export default function StatRadarChart({
  stats,
  elementColor = "#c8a96e",
  size = 280,
}: StatRadarChartProps) {
  const center = size / 2;
  const radius = size * 0.38;

  // Find combat stats
  const hpRaw = stats.find((s) => s.label === "HP")?.rawValue ?? 18000;
  const atkRaw = stats.find((s) => s.label === "ATK")?.rawValue ?? 2000;
  const defRaw = stats.find((s) => s.label === "DEF")?.rawValue ?? 900;
  const crRaw = (stats.find((s) => s.label === "CRIT Rate")?.rawValue ?? 0.5) * 100;
  const cdRaw = (stats.find((s) => s.label === "CRIT DMG")?.rawValue ?? 1.5) * 100;
  const erRaw = (stats.find((s) => s.label === "Energy Recharge")?.rawValue ?? 1.2) * 100;

  // Normalized ratios (0 to 1) based on Genshin endgame benchmarks
  const metrics = useMemo(() => {
    return [
      { label: "HP", value: Math.round(hpRaw).toLocaleString(), ratio: Math.min(Math.max(hpRaw / 35000, 0.15), 1) },
      { label: "ATK", value: Math.round(atkRaw).toLocaleString(), ratio: Math.min(Math.max(atkRaw / 3000, 0.15), 1) },
      { label: "DEF", value: Math.round(defRaw).toLocaleString(), ratio: Math.min(Math.max(defRaw / 1500, 0.15), 1) },
      { label: "CRIT Rate", value: `${crRaw.toFixed(1)}%`, ratio: Math.min(Math.max(crRaw / 100, 0.15), 1) },
      { label: "CRIT DMG", value: `${cdRaw.toFixed(1)}%`, ratio: Math.min(Math.max(cdRaw / 280, 0.15), 1) },
      { label: "ER", value: `${erRaw.toFixed(1)}%`, ratio: Math.min(Math.max(erRaw / 220, 0.15), 1) },
    ];
  }, [hpRaw, atkRaw, defRaw, crRaw, cdRaw, erRaw]);

  // Generate hexagon points for concentric rings (25%, 50%, 75%, 100%)
  const ringPolygons = useMemo(() => {
    return RINGS.map((scale) => {
      return Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const x = center + radius * scale * Math.cos(angle);
        const y = center + radius * scale * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
    });
  }, [center, radius]);

  // Generate data polygon points
  const { dataPoints, dataCoordinates } = useMemo(() => {
    const coords = metrics.map((m, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = center + radius * m.ratio * Math.cos(angle);
      const y = center + radius * m.ratio * Math.sin(angle);
      return { x, y, label: m.label, value: m.value };
    });
    const pointsStr = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
    return { dataPoints: pointsStr, dataCoordinates: coords };
  }, [metrics, center, radius]);

  // Axis labels coordinates
  const labelCoordinates = useMemo(() => {
    return metrics.map((m, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = center + (radius + 22) * Math.cos(angle);
      const y = center + (radius + 22) * Math.sin(angle);
      return { x, y, label: m.label, value: m.value };
    });
  }, [metrics, center, radius]);

  return (
    <div className="stat-radar-wrapper relative flex flex-col items-center justify-center p-3 select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        aria-label="Combat Attributes Radar"
      >
        <defs>
          <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={elementColor} stopOpacity="0.38" />
            <stop offset="100%" stopColor={elementColor} stopOpacity="0.08" />
          </radialGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Hexagons */}
        {ringPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={idx === 3 ? "1.5" : "1"}
            strokeDasharray={idx < 3 ? "2 2" : undefined}
          />
        ))}

        {/* Axis Spokes from center to outer points */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Animated Data Polygon */}
        <polygon
          points={dataPoints}
          fill="url(#radarFillGrad)"
          stroke={elementColor}
          strokeWidth="2"
          filter="url(#radarGlow)"
          className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />

        {/* Data Vertices */}
        {dataCoordinates.map((coord, idx) => (
          <g key={idx}>
            <circle
              cx={coord.x}
              cy={coord.y}
              r="4.5"
              fill={elementColor}
              stroke="#0e141f"
              strokeWidth="2"
              className="transition-all duration-700 ease-out"
            />
            <circle
              cx={coord.x}
              cy={coord.y}
              r="7"
              fill="none"
              stroke={elementColor}
              strokeWidth="1"
              opacity="0.6"
              className="animate-ping"
              style={{ animationDuration: "3s", animationDelay: `${idx * 0.4}s` }}
            />
          </g>
        ))}

        {/* Axis Labels */}
        {labelCoordinates.map((coord, idx) => (
          <text
            key={idx}
            x={coord.x}
            y={coord.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[9px] font-semibold tracking-wider fill-[#9eaab9]"
            style={{ fontSize: "9px" }}
          >
            {coord.label}
          </text>
        ))}
      </svg>

      <span className="mt-2 text-[8px] font-bold tracking-[0.16em] text-[#c8a96e] uppercase">
        Combat Balance Polygon
      </span>
    </div>
  );
}
