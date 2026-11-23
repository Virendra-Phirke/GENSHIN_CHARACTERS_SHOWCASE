"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { Download, Copy, Check, X, Camera } from "lucide-react";
import type { ShowcaseCharacter, PlayerShowcase, ShowcaseArtifact } from "@/lib/types";

interface ShareBuildCardModalProps {
  character: ShowcaseCharacter;
  profile: PlayerShowcase;
  elementAccent: string;
  isOpen: boolean;
  onClose: () => void;
}

// Element color map for themed backgrounds
const ELEMENT_BG: Record<string, string> = {
  Cryo:    "linear-gradient(135deg, #0d1e2e 0%, #0a1520 60%, #060c14 100%)",
  Hydro:   "linear-gradient(135deg, #0a1a2e 0%, #071525 60%, #050c18 100%)",
  Pyro:    "linear-gradient(135deg, #1e100a 0%, #150b06 60%, #0d0604 100%)",
  Electro: "linear-gradient(135deg, #15102a 0%, #100c20 60%, #080510 100%)",
  Anemo:   "linear-gradient(135deg, #0a1e1a 0%, #071510 60%, #040c0a 100%)",
  Geo:     "linear-gradient(135deg, #1a150a 0%, #120e06 60%, #0a0802 100%)",
  Dendro:  "linear-gradient(135deg, #0e1a08 0%, #0a1206 60%, #060a04 100%)",
};

const ELEMENT_ACCENT: Record<string, string> = {
  Cryo: "#7dd3f8", Hydro: "#5ba4f0", Pyro: "#f97316",
  Electro: "#a855f7", Anemo: "#34d399", Geo: "#f59e0b", Dendro: "#84cc16",
};

function getRarityStars(rarity = 5) {
  return "★".repeat(rarity);
}

function ArtifactCard({ artifact, elementAccent }: { artifact: ShowcaseArtifact; elementAccent: string }) {
  const mainVal = artifact.mainStat?.value ?? "—";
  const slotIcon: Record<string, string> = {
    flower: "✿", plume: "🪶", sands: "⏳", goblet: "🏺", circlet: "👑",
  };
  const icon = slotIcon[artifact.slotKey ?? ""] ?? "◆";

  return (
    <div
      className="relative flex gap-2 rounded-lg overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Artifact image / icon block */}
      <div
        className="relative shrink-0 w-[72px] h-[72px] flex flex-col items-center justify-center"
        style={{ background: "rgba(0,0,0,0.35)" }}
      >
        {artifact.icon || artifact.iconFallback ? (
          <Image
            src={artifact.icon || artifact.iconFallback || ""}
            alt={artifact.name ?? artifact.slot}
            fill
            unoptimized
            sizes="72px"
            className="object-contain p-1"
          />
        ) : (
          <span className="text-2xl opacity-50">{icon}</span>
        )}
        {/* Main stat value */}
        <div
          className="absolute bottom-0 left-0 right-0 text-center text-[11px] font-bold py-0.5"
          style={{
            background: "rgba(0,0,0,0.6)",
            color: elementAccent,
            fontSize: "10px",
          }}
        >
          {mainVal}
        </div>
        {/* Stars */}
        <div
          className="absolute top-0.5 left-0 right-0 text-center leading-none"
          style={{ color: "#f4c43a", fontSize: "7px", letterSpacing: "0px" }}
        >
          {getRarityStars(artifact.rarity ?? 5)}
        </div>
      </div>

      {/* Substats */}
      <div className="flex-1 py-1 pr-1.5 grid grid-cols-2 gap-x-1 gap-y-0 content-center">
        {artifact.substats.slice(0, 4).map((sub, i) => (
          <div key={i} className="flex items-center gap-0.5 text-[10px]">
            <span className="text-[#9ba7b8] truncate max-w-[42px]">{sub.label?.replace("CRIT ", "").replace("Energy Recharge", "ER").replace("Elemental Mastery", "EM").replace("ATK", "ATK").replace("DEF", "DEF").replace("HP", "HP")}</span>
            <span className="text-white font-semibold ml-auto">{sub.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
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
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const flashTimer = setTimeout(() => setFlash(true), 0);
      const timer = setTimeout(() => setFlash(false), 350);
      return () => { clearTimeout(flashTimer); clearTimeout(timer); };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStat = (label: string) => character.stats.find((s) => s.label === label)?.value ?? "—";

  const accent = elementAccent || ELEMENT_ACCENT[character.element ?? ""] || "#c8a96e";
  const bg = ELEMENT_BG[character.element ?? ""] ?? "linear-gradient(135deg,#0d1220,#060a14)";

  const statsList = [
    { icon: "❤", label: "HP",               val: getStat("HP") },
    { icon: "⚔", label: "ATK",              val: getStat("ATK") },
    { icon: "🛡", label: "DEF",              val: getStat("DEF") },
    { icon: "✦", label: "Elemental Mastery", val: getStat("Elemental Mastery") },
    { icon: "☆", label: "CRIT Rate",        val: getStat("CRIT Rate") },
    { icon: "☆", label: "CRIT DMG",         val: getStat("CRIT DMG") },
    { icon: "⟳", label: "Energy Recharge",  val: getStat("Energy Recharge") },
    { icon: "🌿", label: "Set Bonus",        val: character.artifacts[0]?.setName ?? "—", extra: true },
  ];

  const splashSrc = character.image || character.imageFallback || "";
  const weaponIcon = character.weapon?.icon || character.weapon?.iconFallback;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `⭐ ${character.name} Build (UID: ${profile.uid})\n⚔ ${character.weapon?.name ?? "Weapon"} R${character.weapon?.refinement ?? 1}\n✦ CRIT: ${getStat("CRIT Rate")} / ${getStat("CRIT DMG")} (${character.critValue ?? 0} CV)\n✦ HP: ${getStat("HP")} · ATK: ${getStat("ATK")}\nShowcase via Astra Archive`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Dynamic import of html2canvas-like approach using domtoimage
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      } as Parameters<typeof html2canvas>[1]);
      canvas.toBlob((blob: Blob | null) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-3 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Camera shutter flash */}
      {flash && (
        <div className="pointer-events-none fixed inset-0 z-[1200] bg-white/60 animate-out fade-out duration-300" />
      )}

      <div
        className="relative w-full max-w-[1100px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: "#0d1120", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header controls */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" style={{ color: accent }} />
            <span className="text-sm font-semibold text-white">Share Build Card</span>
            <span className="text-[10px] text-[#8692a3] ml-1">· Enka-style preview</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8692a3] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── ENKA-STYLE CARD ── */}
        <div
          ref={cardRef}
          className="relative overflow-hidden"
          style={{ background: bg, minHeight: "360px" }}
        >
          {/* Ambient elemental glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 55% 80% at 15% 50%, ${accent}22 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 flex items-stretch">
            {/* ── LEFT: Character splash art ── */}
            <div
              className="relative shrink-0 overflow-hidden"
              style={{
                width: "clamp(200px, 24%, 280px)",
                background: `radial-gradient(ellipse at 50% 70%, ${accent}18, transparent 70%)`,
              }}
            >
              {splashSrc ? (
                <Image
                  src={splashSrc}
                  alt={character.name}
                  fill
                  unoptimized
                  sizes="280px"
                  className="object-cover object-top"
                  style={{ objectPosition: "center top" }}
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-5xl opacity-20">✦</div>
              )}
              {/* Name overlay at bottom of splash */}
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-2"
                style={{
                  background: "linear-gradient(to top, rgba(5,8,16,0.95) 0%, transparent 100%)",
                }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold text-lg leading-none">{character.name}</span>
                  <span className="text-[10px] text-[#9ba7b8]">{profile.nickname ?? "Traveler"}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px]" style={{ color: accent }}>
                    Lv. {character.level ?? 90} / 90
                  </span>
                  <span className="text-[10px] text-[#9ba7b8]">
                    ✦ {character.friendship ?? 10}
                  </span>
                </div>
                {/* UID */}
                <div className="text-[9px] text-[#5a6678] mt-1 font-mono">{profile.uid}</div>
              </div>

              {/* Constellation icons on left side */}
              <div className="absolute left-1.5 top-4 flex flex-col gap-1">
                {(character.constellations ?? []).slice(0, 6).map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border"
                    style={{
                      background: c.unlocked ? `${accent}30` : "rgba(0,0,0,0.5)",
                      borderColor: c.unlocked ? accent : "rgba(255,255,255,0.1)",
                      color: c.unlocked ? accent : "#4a5568",
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* ── CENTER: Weapon + Stats ── */}
            <div
              className="flex-1 px-5 py-4 flex flex-col gap-3"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Weapon row */}
              {character.weapon && (
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                    {weaponIcon ? (
                      <Image src={weaponIcon} alt={character.weapon.name ?? "Weapon"} fill unoptimized sizes="56px" className="object-contain p-1" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-xl" style={{ color: accent }}>⚔</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white leading-tight">{character.weapon.name ?? "—"}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "#f4c43a" }}>
                      {getRarityStars(character.weapon.rarity ?? 5)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#9ba7b8]">
                      {character.weapon.baseAttack && (
                        <span>⚔ <strong className="text-white">{character.weapon.baseAttack}</strong></span>
                      )}
                      {character.weapon.substat && (
                        <span>
                          <strong style={{ color: accent }}>{character.weapon.substat.value}</strong>{" "}
                          <span className="text-[#6b7a8d]">{character.weapon.substat.label}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#6b7a8d] mt-0.5">
                      R{character.weapon.refinement ?? 1} · Lv. {character.weapon.level ?? 90} / 90
                    </div>
                  </div>
                </div>
              )}

              {/* Stats list */}
              <div className="flex flex-col gap-1.5">
                {statsList.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8a96a7] flex items-center gap-1.5">
                      <span className="w-3 text-center opacity-70 text-[10px]">{s.icon}</span>
                      {s.label}
                    </span>
                    <span
                      className="text-[13px] font-semibold tabular-nums"
                      style={{
                        color: s.label === "CRIT Rate" || s.label === "CRIT DMG"
                          ? "#f4e0be"
                          : s.extra
                          ? accent
                          : "#ffffff",
                      }}
                    >
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* CV Footer */}
              {character.critValue && (
                <div
                  className="mt-auto pt-2 text-center text-[11px] font-mono font-bold rounded-lg py-1"
                  style={{
                    background: `${accent}15`,
                    color: accent,
                    border: `1px solid ${accent}30`,
                  }}
                >
                  ☆ {character.critValue} CV
                </div>
              )}
            </div>

            {/* ── RIGHT: Artifact cards ── */}
            <div className="flex flex-col gap-1.5 py-3 pr-3 pl-2" style={{ width: "clamp(280px,38%,420px)" }}>
              {character.artifacts.length > 0
                ? character.artifacts.slice(0, 5).map((art, i) => (
                    <ArtifactCard key={i} artifact={art} elementAccent={accent} />
                  ))
                : Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[68px] rounded-lg flex items-center justify-center text-[11px] text-[#4a5568]"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      No artifact data
                    </div>
                  ))}
            </div>
          </div>

          {/* Bottom stat bar (optional quick summary strip) */}
          <div
            className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2 text-[10px] font-mono text-[#6b7a8d]"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {character.stats.slice(0, 8).map((s, i) => (
              <span key={i}>
                <span className="text-[#4a5568]">{s.label?.substring(0, 4)} </span>
                <span className="text-[#9ba7b8]">{s.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="flex flex-wrap items-center justify-end gap-3 px-5 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-[#edf0f7] transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Summary"}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-[#0e1219] transition-all disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
              boxShadow: `0 0 20px ${accent}44`,
            }}
          >
            <Download className="w-4 h-4" />
            {downloading ? "Generating..." : "Download PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}
