"use client";

import React, { useMemo, useState } from "react";
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number } | null>(null);

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
      { label: "HP", value: Math.round(hpRaw).toLocaleString(), ratio: Math.min(Math.max(hpRaw / 35000, 0.15), 1), benchmark: "Target 30k+ for HP Scalers" },
      { label: "ATK", value: Math.round(atkRaw).toLocaleString(), ratio: Math.min(Math.max(atkRaw / 3000, 0.15), 1), benchmark: "Optimal 2,000+ Base Threshold" },
      { label: "DEF", value: Math.round(defRaw).toLocaleString(), ratio: Math.min(Math.max(defRaw / 1500, 0.15), 1), benchmark: "Benchmark 900 - 1,200 Range" },
      { label: "CRIT Rate", value: `${crRaw.toFixed(1)}%`, ratio: Math.min(Math.max(crRaw / 100, 0.15), 1), benchmark: "Golden Zone 70%+ Consistency" },
      { label: "CRIT DMG", value: `${cdRaw.toFixed(1)}%`, ratio: Math.min(Math.max(cdRaw / 280, 0.15), 1), benchmark: "Apex Tier 200%+ Multiplier" },
      { label: "ER", value: `${erRaw.toFixed(1)}%`, ratio: Math.min(Math.max(erRaw / 220, 0.15), 1), benchmark: "Burst Uptime 120% - 160%+" },
    ];
  }, [hpRaw, atkRaw, defRaw, crRaw, cdRaw, erRaw]);

  // Handle mouse move inside SVG for dynamic repulsion effect
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    setMouseOffset({ x, y });
  };

  const handleSvgMouseLeave = () => {
    setMouseOffset(null);
    setHoveredIdx(null);
  };

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

  // Generate data polygon points with dynamic mouse repulsion
  const { dataPoints, dataCoordinates } = useMemo(() => {
    const coords = metrics.map((m, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      let x = center + radius * m.ratio * Math.cos(angle);
      let y = center + radius * m.ratio * Math.sin(angle);

      // Feature 13: Dynamic Interactive Hexagon Stat Radar with Mouse Repulsion
      if (mouseOffset) {
        const dx = (x - center) - mouseOffset.x;
        const dy = (y - center) - mouseOffset.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 55 && dist > 0) {
          const force = (55 - dist) * 0.12;
          x += (dx / dist) * force;
          y += (dy / dist) * force;
        }
      }

      return { x, y, label: m.label, value: m.value, benchmark: m.benchmark, ratio: m.ratio };
    });
    const pointsStr = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
    return { dataPoints: pointsStr, dataCoordinates: coords };
  }, [metrics, center, radius, mouseOffset]);

  // Axis labels coordinates
  const labelCoordinates = useMemo(() => {
    return metrics.map((m, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = center + (radius + 24) * Math.cos(angle);
      const y = center + (radius + 24) * Math.sin(angle);
      return { x, y, label: m.label, value: m.value };
    });
  }, [metrics, center, radius]);

  return (
    <div className="stat-radar-wrapper relative flex flex-col items-center justify-center p-3 select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible cursor-crosshair"
        onMouseMove={handleSvgMouseMove}
        onMouseLeave={handleSvgMouseLeave}
        aria-label="Combat Attributes Interactive Radar"
      >
        <defs>
          <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={elementColor} stopOpacity={hoveredIdx !== null ? "0.55" : "0.38"} />
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
          const isSpokeHovered = hoveredIdx === i;

          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke={isSpokeHovered ? elementColor : "rgba(255, 255, 255, 0.08)"}
              strokeWidth={isSpokeHovered ? "2" : "1"}
              className="transition-colors duration-200"
            />
          );
        })}

        {/* Animated Data Polygon */}
        <polygon
          points={dataPoints}
          fill="url(#radarFillGrad)"
          stroke={elementColor}
          strokeWidth="2.5"
          filter="url(#radarGlow)"
          className="transition-all duration-300 ease-out"
        />

        {/* Data Vertices */}
        {dataCoordinates.map((coord, idx) => {
          const isCurrentHovered = hoveredIdx === idx;
          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={coord.x}
                cy={coord.y}
                r={isCurrentHovered ? "7" : "4.5"}
                fill={elementColor}
                stroke="#0e141f"
                strokeWidth={isCurrentHovered ? "2.5" : "2"}
                className="transition-all duration-200 ease-out shadow-lg"
              />
              <circle
                cx={coord.x}
                cy={coord.y}
                r={isCurrentHovered ? "11" : "7"}
                fill="none"
                stroke={elementColor}
                strokeWidth="1"
                opacity={isCurrentHovered ? "0.9" : "0.5"}
                className={isCurrentHovered ? "animate-pulse" : "animate-ping"}
                style={{ animationDuration: isCurrentHovered ? "1.2s" : "3s", animationDelay: `${idx * 0.4}s` }}
              />
            </g>
          );
        })}

        {/* Axis Labels */}
        {labelCoordinates.map((coord, idx) => {
          const isLabelHovered = hoveredIdx === idx;
          return (
            <text
              key={idx}
              x={coord.x}
              y={coord.y}
              textAnchor="middle"
              dominantBaseline="central"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`cursor-pointer transition-colors duration-200 font-semibold tracking-wider ${
                isLabelHovered ? "fill-[#ffffff] font-bold" : "fill-[#9eaab9]"
              }`}
              style={{ fontSize: isLabelHovered ? "10px" : "9px" }}
            >
              {coord.label}
            </text>
          );
        })}
      </svg>

      {/* Feature 13: Floating Tooltip Card on Hovered Vertex */}
      {hoveredIdx !== null && dataCoordinates[hoveredIdx] && (
        <div
          className="absolute z-30 bottom-14 px-3 py-2 rounded-xl bg-[#0e131d]/95 border border-[#c8a96e]/40 shadow-[0_8px_25px_rgba(0,0,0,0.8)] backdrop-blur-md text-center pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          <span className="block text-[8px] font-mono tracking-widest text-[#c8a96e] uppercase">
            {dataCoordinates[hoveredIdx].label} ANALYSIS
          </span>
          <strong className="block text-sm font-bold text-white mt-0.5">
            {dataCoordinates[hoveredIdx].value}
          </strong>
          <span className="inline-block mt-0.5 text-[8px] text-[#93a1b5] font-mono">
            {dataCoordinates[hoveredIdx].benchmark} ({Math.round(dataCoordinates[hoveredIdx].ratio * 100)}% Max Potential)
          </span>
        </div>
      )}

      <span className="mt-2 text-[8px] font-bold tracking-[0.16em] text-[#c8a96e] uppercase">
        Interactive Combat Hexagon
      </span>
    </div>
  );
}
