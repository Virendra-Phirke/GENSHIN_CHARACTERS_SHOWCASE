"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { Download, Copy, Check, X, Camera, Sparkles } from "lucide-react";
import type { ShowcaseCharacter, PlayerShowcase } from "@/lib/types";

interface ShareBuildCardModalProps {
  character: ShowcaseCharacter;
  profile: PlayerShowcase;
  elementAccent: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareBuildCardModal({
  character,
  profile,
  elementAccent,
  isOpen,
  onClose,
}: ShareBuildCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const crStat = character.stats.find((s) => s.label === "CRIT Rate")?.value ?? "—";
  const cdStat = character.stats.find((s) => s.label === "CRIT DMG")?.value ?? "—";
  const hpStat = character.stats.find((s) => s.label === "HP")?.value ?? "—";
  const atkStat = character.stats.find((s) => s.label === "ATK")?.value ?? "—";
  const erStat = character.stats.find((s) => s.label === "Energy Recharge")?.value ?? "—";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Create high-res canvas (1200 x 675, 16:9 cinematic build card)
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Background dark gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGrad.addColorStop(0, "#080c14");
      bgGrad.addColorStop(0.5, "#0d1320");
      bgGrad.addColorStop(1, "#070a10");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // 2. Ambient elemental glow
      const glowGrad = ctx.createRadialGradient(250, 330, 10, 250, 330, 400);
      glowGrad.addColorStop(0, `${elementAccent}33`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // 3. Header border line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 90);
      ctx.lineTo(1140, 90);
      ctx.stroke();

      // 4. Header Text
      ctx.fillStyle = "#c8a96e";
      ctx.font = "bold 16px monospace";
      ctx.fillText("ASTRA ARCHIVE · BUILD DOSSIER", 60, 60);

      ctx.fillStyle = "#8a96a7";
      ctx.font = "14px sans-serif";
      ctx.fillText(`TRAVELER: ${profile.nickname || "Traveler"}  |  UID: ${profile.uid}  |  AR ${profile.adventureRank || 60}`, 650, 60);

      // 5. Character Name & Identity
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 52px sans-serif";
      ctx.fillText(character.name, 480, 175);

      ctx.fillStyle = elementAccent;
      ctx.font = "bold 20px monospace";
      ctx.fillText(
        `Lv. ${character.level || 90}  ·  C${character.constellation ?? 0}  ·  ${character.element || "Element"}`,
        480,
        215
      );

      // 6. Character Weapon
      ctx.fillStyle = "#e5bc75";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`⚔ ${character.weapon?.name || "Equipped Weapon"}`, 480, 275);

      ctx.fillStyle = "#9ba7b7";
      ctx.font = "16px monospace";
      ctx.fillText(
        `Level ${character.weapon?.level || 90}  ·  Refinement R${character.weapon?.refinement || 1}  ·  Base ATK ${character.weapon?.baseAttack || "—"}`,
        480,
        305
      );

      // 7. Combat Stats Grid (Box layout)
      const statsList = [
        { label: "MAX HP", val: hpStat },
        { label: "ATK", val: atkStat },
        { label: "CRIT RATE", val: crStat },
        { label: "CRIT DMG", val: cdStat },
        { label: "ENERGY RECHARGE", val: erStat },
        { label: "TOTAL CV", val: `${character.critValue || "—"} CV` },
      ];

      statsList.forEach((stat, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = 480 + col * 330;
        const by = 350 + row * 80;

        // Card background
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.beginPath();
        ctx.roundRect(bx, by, 310, 64, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#8a96a7";
        ctx.font = "12px monospace";
        ctx.fillText(stat.label, bx + 16, by + 26);

        ctx.fillStyle = i === 2 || i === 3 ? "#f4e0be" : "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(stat.val, bx + 16, by + 52);
      });

      // 8. Watermark Footer
      ctx.fillStyle = "#5c6676";
      ctx.font = "12px monospace";
      ctx.fillText("AUTHENTICATED PUBLIC SHOWCASE · GENERATED WITH ASTRA", 60, 635);
      ctx.fillText("HOYOVERSE FAN SHOWCASE", 950, 635);

      // Trigger download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${character.name.toLowerCase().replace(/\s+/g, "_")}_build_UID${profile.uid}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, "image/png");
    } catch {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `⭐ ${character.name} Build (UID: ${profile.uid})\n⚔ ${character.weapon?.name || "Weapon"} (R${character.weapon?.refinement || 1})\n✦ CRIT: ${crStat} / ${cdStat} (${character.critValue || 0} CV)\n✦ HP: ${hpStat} · ATK: ${atkStat}\nShowcase via Astra Archive`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Camera Shutter Flash Effect */}
      {flash && (
        <div className="pointer-events-none fixed inset-0 z-[1200] bg-white/70 animate-out fade-out duration-300" />
      )}

      <div
        className="relative w-full max-w-3xl rounded-2xl bg-[#0d121c] border border-white/15 p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#c8a96e]/20 border border-[#c8a96e]/40 grid place-items-center text-[#c8a96e]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Share Build Card</h3>
              <p className="text-[11px] text-[#8692a3]">Instant aesthetic export snapshot</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8692a3] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Card Preview */}
        <div
          ref={cardRef}
          className="relative w-full rounded-xl p-6 bg-gradient-to-br from-[#121927] to-[#0a0e16] border border-white/10 overflow-hidden shadow-inner"
        >
          {/* Ambient Glow */}
          <div
            className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: elementAccent }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Left Character Portrait */}
            <div className="relative w-36 h-48 sm:w-44 sm:h-56 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10">
              {character.image || character.imageFallback ? (
                <Image
                  src={character.image || character.imageFallback || ""}
                  alt={character.name}
                  fill
                  unoptimized
                  sizes="180px"
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-2xl">✦</div>
              )}
            </div>

            {/* Right Character Details */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#c8a96e] uppercase font-bold">
                  UID {profile.uid} · {profile.nickname || "Traveler"}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    color: elementAccent,
                    borderColor: `${elementAccent}60`,
                    backgroundColor: `${elementAccent}15`,
                  }}
                >
                  {character.element} · C{character.constellation ?? 0}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {character.name}
              </h2>

              <p className="text-xs text-[#c8a96e] font-medium mt-1">
                ⚔ {character.weapon?.name || "Weapon"} (R{character.weapon?.refinement ?? 1} · Lv. {character.weapon?.level ?? 90})
              </p>

              {/* Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="block text-[9px] text-[#8692a3] uppercase font-mono">CRIT Ratio</span>
                  <strong className="text-xs text-[#f2e2be]">{crStat} / {cdStat}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="block text-[9px] text-[#8692a3] uppercase font-mono">Combat CV</span>
                  <strong className="text-xs text-[#c8a96e]">{character.critValue || "—"} CV</strong>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="block text-[9px] text-[#8692a3] uppercase font-mono">Attack</span>
                  <strong className="text-xs text-white">{atkStat}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="block text-[9px] text-[#8692a3] uppercase font-mono">Health</span>
                  <strong className="text-xs text-white">{hpStat}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="block text-[9px] text-[#8692a3] uppercase font-mono">Energy Rech.</span>
                  <strong className="text-xs text-white">{erStat}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="block text-[9px] text-[#8692a3] uppercase font-mono">Artifacts</span>
                  <strong className="text-xs text-white">{character.artifacts.length} / 5 Equipped</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#edf0f7] transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied Build Info!" : "Copy Summary Text"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6ca65] hover:brightness-110 text-[#0e1219] text-xs font-bold shadow-[0_0_16px_rgba(212,175,55,0.35)] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? "Generating PNG..." : "Download PNG Card"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
