"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type { ConstellationInfo } from "@/lib/types";

interface ConstellationStarMapProps {
  constellations: ConstellationInfo[];
  elementColor?: string;
  elementGlow?: string;
}

// 6 Star nodes coordinates in 1000x260 SVG space forming a majestic celestial asterism curve
const STAR_NODES = [
  { x: 90, y: 170 },  // C1
  { x: 250, y: 90 },  // C2
  { x: 420, y: 150 }, // C3
  { x: 580, y: 70 },  // C4
  { x: 740, y: 135 }, // C5
  { x: 910, y: 80 },  // C6
];

// Catmull-Rom to Cubic Bezier curve generator for smooth animated UI graph flow
function generateSmoothCurve(pts: Array<{ x: number; y: number }>) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function ConstellationStarMap({
  constellations,
  elementColor = "#c8a96e",
  elementGlow = "rgba(200,169,110,0.4)",
}: ConstellationStarMapProps) {
  // Default selected node is the highest unlocked constellation, or C1
  const defaultSelectedIdx = useMemo(() => {
    let highest = 0;
    constellations.forEach((c, idx) => {
      if (c.unlocked) highest = idx;
    });
    return highest;
  }, [constellations]);

  const [activeIdx, setActiveIdx] = useState<number>(defaultSelectedIdx);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [animProgress, setAnimProgress] = useState(0);

  const displayIdx = hoveredIdx !== null ? hoveredIdx : activeIdx;
  const inspectedNode = constellations[displayIdx] ?? constellations[0];

  // Animate graph draw on mount / character change
  const keyRef = useRef(elementColor + constellations.map((c) => c.unlocked).join(""));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const newKey = elementColor + constellations.map((c) => c.unlocked).join("");
    if (newKey !== keyRef.current) {
      keyRef.current = newKey;
      setActiveIdx(defaultSelectedIdx);
    }

    setAnimProgress(0);
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimProgress(ease);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [elementColor, constellations, defaultSelectedIdx]);

  // Generate full curve and area fill
  const fullCurve = useMemo(() => generateSmoothCurve(STAR_NODES), []);
  const areaPath = useMemo(() => {
    return `${fullCurve} L 910 240 L 90 240 Z`;
  }, [fullCurve]);

  // Points that belong to unlocked constellations
  const unlockedPts = useMemo(() => {
    const pts: Array<{ x: number; y: number }> = [];
    constellations.forEach((c, idx) => {
      if (c.unlocked && STAR_NODES[idx]) {
        pts.push(STAR_NODES[idx]);
      }
    });
    return pts;
  }, [constellations]);

  const unlockedCurve = useMemo(() => {
    return unlockedPts.length >= 2 ? generateSmoothCurve(unlockedPts) : "";
  }, [unlockedPts]);

  return (
    <div className="constellation-animated-graph relative w-full rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1422]/95 via-[#0b0e16]/98 to-[#07090f] overflow-hidden select-none p-3 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      {/* Background Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${elementGlow}, transparent 70%)`,
        }}
      />

      {/* SVG Animated UI Graph */}
      <div className="relative w-full h-[220px] sm:h-[250px]">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 1000 260"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="constellationNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="constellationAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={elementColor} stopOpacity="0.25" />
              <stop offset="60%" stopColor={elementColor} stopOpacity="0.06" />
              <stop offset="100%" stopColor={elementColor} stopOpacity="0" />
            </linearGradient>

            <linearGradient id="unlockedStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={elementColor} />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={elementColor} />
            </linearGradient>
          </defs>

          {/* Gridlines & Metric Scales */}
          <g className="opacity-15">
            <line x1="60" y1="60" x2="940" y2="60" stroke="#fff" strokeDasharray="3 4" strokeWidth="1" />
            <line x1="60" y1="120" x2="940" y2="120" stroke="#fff" strokeDasharray="3 4" strokeWidth="1" />
            <line x1="60" y1="180" x2="940" y2="180" stroke="#fff" strokeDasharray="3 4" strokeWidth="1" />
            <line x1="60" y1="240" x2="940" y2="240" stroke="#fff" strokeWidth="1" />
            {STAR_NODES.map((pt, i) => (
              <line
                key={`vert-${i}`}
                x1={pt.x}
                y1="40"
                x2={pt.x}
                y2="240"
                stroke="#fff"
                strokeDasharray="2 4"
                strokeWidth="0.8"
              />
            ))}
          </g>

          {/* Area Fill Underneath Graph */}
          <path
            d={areaPath}
            fill="url(#constellationAreaGrad)"
            opacity={animProgress * 0.8}
            className="transition-opacity duration-500"
          />

          {/* Full Ghost Constellation Track (faint dashed guide line) */}
          <path
            d={fullCurve}
            fill="none"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.8"
            strokeDasharray="4 4"
          />

          {/* Unlocked Animated Glowing Spline Track */}
          {unlockedCurve && (
            <path
              d={unlockedCurve}
              fill="none"
              stroke="url(#unlockedStrokeGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              filter="url(#constellationNeonGlow)"
              style={{
                strokeDasharray: 1200,
                strokeDashoffset: 1200 * (1 - animProgress),
                transition: "stroke-dashoffset 0.1s linear",
              }}
            />
          )}

          {/* Traveling Starlight Pulse along Unlocked Track */}
          {unlockedCurve && animProgress >= 0.8 && (
            <g>
              <circle r="4" fill="#ffffff" filter="url(#constellationNeonGlow)">
                <animateMotion
                  path={unlockedCurve}
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="7" fill="none" stroke={elementColor} strokeWidth="1.5">
                <animateMotion
                  path={unlockedCurve}
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )}

          {/* Interactive Constellation Star Nodes */}
          {constellations.map((c, idx) => {
            const pt = STAR_NODES[idx];
            if (!pt) return null;
            const isSelected = displayIdx === idx;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={`node-${c.index}`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Active Selection / Unlocked Corona Rings */}
                {c.unlocked && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="26"
                    fill="none"
                    stroke={elementColor}
                    strokeWidth="1"
                    opacity="0.3"
                  >
                    <animate
                      attributeName="r"
                      values="22;30;22"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.4;0.1;0.4"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Inspected Target Halo */}
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.8"
                  />
                )}

                {/* Node Disc Background */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 19 : isHovered ? 18 : 16}
                  fill={c.unlocked ? "#121929" : "#0c0f17"}
                  stroke={c.unlocked ? elementColor : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter={c.unlocked ? "url(#constellationNeonGlow)" : undefined}
                />

                {/* Node Icon */}
                {c.icon ? (
                  <image
                    href={c.icon}
                    x={pt.x - 11}
                    y={pt.y - 11}
                    width="22"
                    height="22"
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                      filter: c.unlocked ? "none" : "grayscale(100%) opacity(0.35)",
                    }}
                  />
                ) : (
                  <text
                    x={pt.x}
                    y={pt.y + 4}
                    textAnchor="middle"
                    fill={c.unlocked ? elementColor : "#788496"}
                    fontSize="12"
                  >
                    ✦
                  </text>
                )}

                {/* Lock Glyph for Locked Nodes */}
                {!c.unlocked && (
                  <g transform={`translate(${pt.x - 5}, ${pt.y - 5})`}>
                    <rect x="1" y="4" width="8" height="6" rx="1" fill="#000" opacity="0.75" />
                    <path
                      d="M2.5 4.5V3a2.5 2.5 0 0 1 5 0v1.5"
                      fill="none"
                      stroke="#8e99a8"
                      strokeWidth="1.2"
                    />
                  </g>
                )}

                {/* Milestone C1-C6 Label */}
                <text
                  x={pt.x}
                  y={pt.y + 34}
                  textAnchor="middle"
                  fill={c.unlocked ? "#f2e2be" : "#6c7686"}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  C{c.index}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Docked Non-Overlapping Constellation Inspector (Clean & Integrated) */}
      <div
        className="mt-2 p-3 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 transition-all duration-300"
        style={{
          background: "rgba(14, 18, 28, 0.8)",
          backdropFilter: "blur(16px)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)`,
        }}
      >
        <div className="flex items-center gap-3">
          {/* Constellation Level Badge */}
          <div
            className="w-10 h-10 rounded-xl border flex flex-col items-center justify-center font-mono font-bold"
            style={{
              borderColor: inspectedNode.unlocked ? elementColor : "rgba(255,255,255,0.15)",
              background: inspectedNode.unlocked ? `${elementColor}1a` : "rgba(255,255,255,0.03)",
              color: inspectedNode.unlocked ? elementColor : "#8894a4",
              boxShadow: inspectedNode.unlocked ? `0 0 12px ${elementGlow}` : "none",
            }}
          >
            <span className="text-[8px] uppercase tracking-wider text-[#8894a4]">STAR</span>
            <span className="text-sm">0{inspectedNode.index}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                {inspectedNode.name || `Stella Fortuna ${inspectedNode.index}`}
              </h4>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                style={{
                  color: inspectedNode.unlocked ? elementColor : "#8894a4",
                  borderColor: inspectedNode.unlocked ? `${elementColor}44` : "rgba(255,255,255,0.1)",
                  backgroundColor: inspectedNode.unlocked ? `${elementColor}15` : "transparent",
                }}
              >
                {inspectedNode.unlocked ? "ACTIVE IN SHOWCASE" : "STELLA FORTUNA REQUIRED"}
              </span>
            </div>
            <p className="text-[11px] text-[#9aa7b9] mt-0.5">
              {inspectedNode.unlocked
                ? `Node C${inspectedNode.index} active: Enhanced combat talent power & attributes enabled.`
                : `Requires character duplicate Stella Fortuna memory to activate Tier ${inspectedNode.index}.`}
            </p>
          </div>
        </div>

        {/* Rapid Star Selector Pills */}
        <div className="flex items-center gap-1.5">
          {constellations.map((c, i) => {
            const isCurrent = displayIdx === i;
            return (
              <button
                key={`btn-${i}`}
                type="button"
                onClick={() => setActiveIdx(i)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all"
                style={{
                  background: isCurrent
                    ? elementColor
                    : c.unlocked
                    ? `${elementColor}22`
                    : "rgba(255,255,255,0.04)",
                  color: isCurrent ? "#000" : c.unlocked ? elementColor : "#788496",
                  border: `1px solid ${
                    isCurrent
                      ? elementColor
                      : c.unlocked
                      ? `${elementColor}44`
                      : "rgba(255,255,255,0.08)"
                  }`,
                }}
              >
                C{c.index}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
