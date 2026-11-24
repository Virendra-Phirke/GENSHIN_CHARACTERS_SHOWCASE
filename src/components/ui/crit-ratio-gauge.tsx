"use client";

import { Sparkles } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

interface CritRatioGaugeProps {
  critRate: number; // e.g. 50.1 (percentage)
  critDmg: number;  // e.g. 229.9 (percentage)
  critValue?: number; // e.g. 330.1
}

export default function CritRatioGauge({
  critRate,
  critDmg,
  critValue,
}: CritRatioGaugeProps) {
  // Optimal ratio in Genshin is 1:2 (CRIT Rate : CRIT DMG)
  const ratio = critRate > 0 ? (critDmg / critRate).toFixed(2) : "0.00";
  const cv = critValue ?? Number(((critRate * 2) + critDmg).toFixed(1));

  // Normalized visual gauge calculation
  const clampedCR = Math.min(Math.max(critRate, 5), 100);
  const clampedCD = Math.min(Math.max(critDmg, 50), 300);
  const crPercent = clampedCR; // 0 to 100
  const cdPercent = (clampedCD / 300) * 100;

  return (
    <div className="crit-gauge-card p-4 rounded border border-white/10 bg-gradient-to-br from-[#161d2a]/90 to-[#0e131d]/95">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} className="text-[#c8a96e]" />
        <span className="text-[9px] font-bold tracking-[0.16em] text-[#c8a96e] uppercase">
          Combat Crit Efficiency
        </span>
      </div>

      {/* Main Numbers Row */}
      <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-white/5 text-center">
        <div>
          <span className="block text-[9px] text-[#8c97a7] uppercase tracking-wider">CRIT Rate</span>
          <strong className="text-sm font-semibold text-[#f0e4cc]">
            <NumberTicker value={critRate} decimalPlaces={1} suffix="%" />
          </strong>
        </div>
        <div>
          <span className="block text-[9px] text-[#8c97a7] uppercase tracking-wider">CRIT DMG</span>
          <strong className="text-sm font-semibold text-[#f0e4cc]">
            <NumberTicker value={critDmg} decimalPlaces={1} suffix="%" />
          </strong>
        </div>
        <div>
          <span className="block text-[9px] text-[#8c97a7] uppercase tracking-wider">Ratio (1 : X)</span>
          <strong className="text-sm font-semibold text-[#e5be78]">
            1 : <NumberTicker value={parseFloat(ratio)} decimalPlaces={2} />
          </strong>
        </div>
      </div>

      {/* Visual Dual Bars */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[9px] text-[#8e99a8] mb-1">
            <span>Rate Saturation</span>
            <span>{critRate.toFixed(1)}% / 100%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d4b374] to-[#f4e2b8] transition-all duration-700 ease-out"
              style={{ width: `${crPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[9px] text-[#8e99a8] mb-1">
            <span>Damage Multiplier</span>
            <span>{critDmg.toFixed(1)}% / 300%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7bbfe8] to-[#9ed8e9] transition-all duration-700 ease-out"
              style={{ width: `${cdPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[9px] text-[#788496]">
        <span>Standard Golden Benchmark: 1 : 2.0</span>
        <span className="font-mono text-[#c8a96e] font-semibold">
          <NumberTicker value={cv} decimalPlaces={1} /> Total CV
        </span>
      </div>
    </div>
  );
}
