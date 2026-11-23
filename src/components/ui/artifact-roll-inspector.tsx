"use client";

import type { ShowcaseArtifact } from "@/lib/types";

interface ArtifactRollInspectorProps {
  artifact: ShowcaseArtifact;
}

export default function ArtifactRollInspector({ artifact }: ArtifactRollInspectorProps) {
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
  const getRollPips = (label: string, rawValue?: number): number => {
    if (!rawValue) return 1;
    if (label === "CRIT Rate") {
      // Avg roll is ~3.3%
      return Math.min(Math.max(Math.round(rawValue / 3.3), 1), 6);
    }
    if (label === "CRIT DMG") {
      // Avg roll is ~6.6%
      return Math.min(Math.max(Math.round(rawValue / 6.6), 1), 6);
    }
    if (label === "ATK%") {
      // Avg roll is ~4.96%
      return Math.min(Math.max(Math.round(rawValue / 4.96), 1), 6);
    }
    return 1;
  };

  return (
    <div className="artifact-inspector-footer mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[8px]">
      {/* Tier Badge */}
      <span
        className={`px-1.5 py-0.5 rounded border text-[8px] font-bold tracking-wider uppercase ${tierBorder} ${tierBg}`}
        style={{ color: tierColor }}
      >
        {tierLabel}
      </span>

      {/* Substats Pip Count Summary */}
      <div className="flex items-center gap-1.5 text-[#8894a4]">
        <span>Rolls:</span>
        <div className="flex items-center gap-0.5">
          {artifact.substats.slice(0, 4).map((sub, i) => {
            const pips = getRollPips(sub.label, sub.rawValue);
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
                    className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 ${
                      isCrit ? "bg-[#e5c07b]" : "bg-white/30"
                    }`}
                  />
                ))}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
