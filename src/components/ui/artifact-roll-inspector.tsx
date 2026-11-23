"use client";

import React, { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import type { ShowcaseArtifact } from "@/lib/types";

interface ArtifactRollInspectorProps {
  artifact: ShowcaseArtifact;
}

export default function ArtifactRollInspector({ artifact }: ArtifactRollInspectorProps) {
  const [showDetail, setShowDetail] = useState(false);
  const cv = artifact.critValue ?? 0;

  // Determine Roll Quality Tier
  let tierLabel = "Solid Piece";
  let tierColor = "#78bce9";
  let tierBorder = "border-[#78bce9]/40";
  let tierBg = "bg-[#78bce9]/10";

  if (cv >= 42) {
    tierLabel = "God Roll (Unicorn)";
    tierColor = "#ff7be5";
    tierBorder = "border-[#ff7be5]/60 shadow-[0_0_12px_rgba(255,123,229,0.35)]";
    tierBg = "bg-[#ff7be5]/15";
  } else if (cv >= 35) {
    tierLabel = "Outstanding (S-Tier)";
    tierColor = "#f5d070";
    tierBorder = "border-[#f5d070]/60 shadow-[0_0_10px_rgba(245,208,112,0.3)]";
    tierBg = "bg-[#f5d070]/15";
  } else if (cv >= 28) {
    tierLabel = "Great Roll (A-Tier)";
    tierColor = "#b99be9";
    tierBorder = "border-[#b99be9]/50 shadow-[0_0_8px_rgba(185,155,233,0.25)]";
    tierBg = "bg-[#b99be9]/12";
  }

  // Estimate number of rolls for substats
  const getRollPips = (label: string, rawValue?: number): { pips: number; quality: string } => {
    if (!rawValue) return { pips: 1, quality: "Average" };
    if (label === "CRIT Rate") {
      const p = Math.min(Math.max(Math.round(rawValue / 3.3), 1), 6);
      const avgRoll = rawValue / p;
      const q = avgRoll >= 3.7 ? "Max Roll" : avgRoll >= 3.3 ? "High Roll" : "Mid Roll";
      return { pips: p, quality: q };
    }
    if (label === "CRIT DMG") {
      const p = Math.min(Math.max(Math.round(rawValue / 6.6), 1), 6);
      const avgRoll = rawValue / p;
      const q = avgRoll >= 7.4 ? "Max Roll" : avgRoll >= 6.6 ? "High Roll" : "Mid Roll";
      return { pips: p, quality: q };
    }
    if (label === "ATK%") {
      const p = Math.min(Math.max(Math.round(rawValue / 4.96), 1), 6);
      const avgRoll = rawValue / p;
      const q = avgRoll >= 5.5 ? "Max Roll" : "High Roll";
      return { pips: p, quality: q };
    }
    return { pips: 1, quality: "Average" };
  };

  // Calculate overall roll efficiency (0-100%)
  const totalRolls = artifact.substats.reduce((acc, sub) => acc + getRollPips(sub.label, sub.rawValue).pips, 0);
  const efficiency = Math.min(Math.round((totalRolls / 9) * 100), 100);

  return (
    <div className="artifact-inspector-wrapper mt-3 pt-2.5 border-t border-white/5 text-[9px] relative select-none">
      <div className="flex items-center justify-between">
        {/* Tier Badge */}
        <span
          className={`px-1.5 py-0.5 rounded border text-[8px] font-bold tracking-wider uppercase ${tierBorder} ${tierBg}`}
          style={{ color: tierColor }}
        >
          {tierLabel}
        </span>

        {/* Feature 11: Substat Roll Upgrade Pips Reveal */}
        <button
          type="button"
          onClick={() => setShowDetail((prev) => !prev)}
          className="flex items-center gap-1.5 text-[#8894a4] hover:text-[#f1f3f7] transition-colors group cursor-pointer"
          title="Click to reveal substat upgrade rolls"
        >
          <span className="text-[8px] font-mono">Pips:</span>
          <div className="flex items-center gap-0.5">
            {artifact.substats.slice(0, 4).map((sub, i) => {
              const { pips } = getRollPips(sub.label, sub.rawValue);
              const isCrit = sub.label.includes("CRIT");
              return (
                <span
                  key={i}
                  className="inline-flex items-center"
                  title={`${sub.label}: ~${pips} rolls`}
                >
                  {Array.from({ length: pips }, (_, p) => (
                    <span
                      key={p}
                      className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 transition-transform duration-200 group-hover:scale-125 ${
                        isCrit ? "bg-[#e5c07b] shadow-[0_0_4px_rgba(229,192,123,0.5)]" : "bg-white/30"
                      }`}
                    />
                  ))}
                </span>
              );
            })}
          </div>
          <ChevronDown
            className={`w-3 h-3 text-[#788496] transition-transform duration-200 ${
              showDetail ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expandable Substat Roll Inspector Breakdown Drawer */}
      {showDetail && (
        <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5 animate-in fade-in zoom-in-95 duration-150 bg-black/30 p-2 rounded-lg">
          <div className="flex items-center justify-between text-[8px] font-mono text-[#8b97a8] pb-1 border-b border-white/5">
            <span>UPGRADE ROLL BREAKDOWN</span>
            <span className="text-[#c8a96e] font-bold">{efficiency}% Efficiency</span>
          </div>

          {artifact.substats.map((sub, idx) => {
            const { pips, quality } = getRollPips(sub.label, sub.rawValue);
            const isCrit = sub.label.includes("CRIT");

            return (
              <div
                key={idx}
                className="flex items-center justify-between text-[9px] py-0.5"
              >
                <div className="flex items-center gap-1">
                  <span className={isCrit ? "text-[#f4e0be] font-medium" : "text-[#97a3b3]"}>
                    {sub.label}
                  </span>
                  <span className="text-[8px] text-[#788496]">({quality})</span>
                </div>

                <div className="flex items-center gap-1 font-mono">
                  <span className="text-white font-semibold">+{sub.value}</span>
                  <div className="flex items-center text-[#c8a96e]">
                    {Array.from({ length: pips }, (_, starIdx) => (
                      <Star key={starIdx} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
