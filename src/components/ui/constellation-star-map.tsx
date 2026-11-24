"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Lock } from "lucide-react";
import type { ConstellationInfo } from "@/lib/types";

interface ConstellationStarMapProps {
  constellations: ConstellationInfo[];
  elementColor?: string;
  elementGlow?: string;
}

// 6 Star node normalized positions (0-100% within SVG viewport) in an aesthetic Genshin star cluster shape
const STAR_COORDS = [
  { x: 14, y: 68 }, // C1
  { x: 28, y: 38 }, // C2
  { x: 48, y: 60 }, // C3
  { x: 64, y: 36 }, // C4
  { x: 78, y: 64 }, // C5
  { x: 92, y: 40 }, // C6
];

export default function ConstellationStarMap({
  constellations,
  elementColor = "#c8a96e",
  elementGlow = "rgba(200,169,110,0.4)",
}: ConstellationStarMapProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="constellation-star-map-container relative w-full h-[240px] sm:h-[280px] p-4 rounded border border-white/10 bg-gradient-to-br from-[#131926]/90 to-[#0b0e16]/95 select-none overflow-visible">
      {/* Background Celestial Grid & Nebula Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${elementGlow}, transparent 70%)`,
        }}
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Constellation Connection Lines */}
        {STAR_COORDS.map((coord, idx) => {
          if (idx === 0) return null;
          const prevCoord = STAR_COORDS[idx - 1];
          const isLineActive = constellations[idx]?.unlocked;

          return (
            <g key={idx}>
              <line
                x1={prevCoord.x}
                y1={prevCoord.y}
                x2={coord.x}
                y2={coord.y}
                stroke={isLineActive ? elementColor : "rgba(255, 255, 255, 0.15)"}
                strokeWidth={isLineActive ? "0.8" : "0.5"}
                strokeDasharray={isLineActive ? undefined : "2 2"}
                filter={isLineActive ? "url(#starGlow)" : undefined}
                className="transition-colors duration-500"
              />
              {/* Animated starlight pulse traveling along unlocked lines */}
              {isLineActive && (
                <circle r="0.8" fill="#fff" opacity="0.8">
                  <animateMotion
                    path={`M ${prevCoord.x} ${prevCoord.y} L ${coord.x} ${coord.y}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Interactive Constellation Star Nodes */}
      {constellations.map((c, idx) => {
        const coord = STAR_COORDS[idx] ?? { x: (idx + 1) * 15, y: 50 };
        const isHovered = hoveredIndex === idx;

        return (
          <div
            key={c.index}
            className="constellation-star-node absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform duration-300 hover:scale-125"
            style={{
              left: `${coord.x}%`,
              top: `${coord.y}%`,
            }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Outer Pulsing Glow */}
            {c.unlocked && (
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-35 pointer-events-none"
                style={{
                  backgroundColor: elementColor,
                  animationDuration: "2.5s",
                  animationDelay: `${idx * 0.3}s`,
                }}
              />
            )}

            {/* Circular Glass Star Frame */}
            <div
              className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-full border grid place-items-center backdrop-blur-md transition-all duration-300 ${
                c.unlocked
                  ? "border-current bg-[#121927] shadow-lg"
                  : "border-white/15 bg-[#0b0e16]/80 opacity-60"
              }`}
              style={{
                color: c.unlocked ? elementColor : "#788496",
                boxShadow: c.unlocked ? `0 0 16px ${elementGlow}` : undefined,
              }}
            >
              {c.icon ? (
                <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden">
                  <Image
                    src={c.icon}
                    alt={`Constellation ${c.index}`}
                    fill
                    unoptimized
                    sizes="28px"
                    className="object-contain p-0.5"
                  />
                </div>
              ) : (
                <span className="text-xs">✦</span>
              )}

              {/* Locked Overlay Icon */}
              {!c.unlocked && (
                <div className="absolute inset-0 bg-black/60 rounded-full grid place-items-center text-[#8e99a8]">
                  <Lock size={11} />
                </div>
              )}
            </div>

            {/* Badge Indicator */}
            <span
              className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold px-1 rounded ${
                c.unlocked ? "text-[#f3dfbd]" : "text-[#737e8e]"
              }`}
            >
              C{c.index}
            </span>

            {/* Hover Tooltip Card - Positioned to always be visible */}
            {isHovered && (
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-40 p-2.5 rounded bg-[#101520]/95 border border-[#c8a96e]/40 shadow-[0_12px_30px_rgba(0,0,0,0.85)] backdrop-blur-md pointer-events-none z-50 text-center animate-in fade-in zoom-in-95 duration-150 ${
                  coord.y <= 45 ? "top-14" : "bottom-14"
                }`}
              >
                <span className="block text-[8px] font-bold tracking-widest text-[#c8a96e] uppercase">
                  CONSTELLATION 0{c.index}
                </span>
                <strong className="block text-xs text-[#edf0f5] mt-0.5">
                  {c.unlocked ? "Activated Node" : "Locked Node"}
                </strong>
                <span
                  className="inline-block mt-1 text-[8px] font-semibold px-1.5 py-0.5 rounded border"
                  style={{
                    color: c.unlocked ? elementColor : "#8894a4",
                    borderColor: c.unlocked ? elementColor : "rgba(255,255,255,0.15)",
                  }}
                >
                  {c.unlocked ? "ACTIVE IN SHOWCASE" : "REQUIRES STELLA FORTUNA"}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
