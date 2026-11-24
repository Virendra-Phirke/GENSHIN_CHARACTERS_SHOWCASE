"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Copy,
  Check,
  X,
  Camera,
  Smartphone,
  Monitor,
} from "lucide-react";
import type { ShowcaseCharacter, PlayerShowcase, ShowcaseArtifact } from "@/lib/types";

interface ShareBuildCardModalProps {
  character: ShowcaseCharacter;
  profile: PlayerShowcase;
  elementAccent: string;
  isOpen: boolean;
  onClose: () => void;
}

type ThemeType = "archon" | "abyss" | "explorer" | "akasha";
type LayoutType = "landscape" | "portrait";
type QualityType = 2 | 3;

interface ThemeConfig {
  name: string;
  subtitle: string;
  bgGradient: string;
  cardBg: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
  subtextColor: string;
  badgeBg: string;
  glowColor: string;
}

const THEMES: Record<ThemeType, ThemeConfig> = {
  archon: {
    name: "Celestial Archon",
    subtitle: "Sacred obsidian & radiant gold foil",
    bgGradient: "linear-gradient(135deg, #0e121d 0%, #080a12 50%, #040509 100%)",
    cardBg: "rgba(18, 24, 38, 0.75)",
    borderColor: "rgba(200, 169, 110, 0.35)",
    accentColor: "#c8a96e",
    textColor: "#ffffff",
    subtextColor: "#9ea8b6",
    badgeBg: "rgba(200, 169, 110, 0.12)",
    glowColor: "rgba(200, 169, 110, 0.25)",
  },
  abyss: {
    name: "Abyssal Void",
    subtitle: "Deep cosmic nebula & neon starlight",
    bgGradient: "linear-gradient(135deg, #070d1a 0%, #030611 60%, #010309 100%)",
    cardBg: "rgba(8, 14, 28, 0.8)",
    borderColor: "rgba(56, 189, 248, 0.35)",
    accentColor: "#38bdf8",
    textColor: "#ffffff",
    subtextColor: "#8192a6",
    badgeBg: "rgba(56, 189, 248, 0.12)",
    glowColor: "rgba(56, 189, 248, 0.3)",
  },
  explorer: {
    name: "Teyvat Explorer",
    subtitle: "Classical cartography & warm brass",
    bgGradient: "linear-gradient(135deg, #1b1612 0%, #120e0b 60%, #0a0806 100%)",
    cardBg: "rgba(32, 26, 21, 0.8)",
    borderColor: "rgba(217, 163, 94, 0.35)",
    accentColor: "#d9a35e",
    textColor: "#fbf2e3",
    subtextColor: "#b09e8c",
    badgeBg: "rgba(217, 163, 94, 0.15)",
    glowColor: "rgba(217, 163, 94, 0.22)",
  },
  akasha: {
    name: "Akasha Cyber",
    subtitle: "High-tech terminal & leaderboard matrix",
    bgGradient: "linear-gradient(135deg, #071714 0%, #040e0c 60%, #020605 100%)",
    cardBg: "rgba(8, 25, 22, 0.82)",
    borderColor: "rgba(45, 212, 191, 0.35)",
    accentColor: "#2dd4bf",
    textColor: "#ffffff",
    subtextColor: "#789c96",
    badgeBg: "rgba(45, 212, 191, 0.12)",
    glowColor: "rgba(45, 212, 191, 0.28)",
  },
};

function getRarityStars(rarity = 5) {
  return "★".repeat(Math.min(Math.max(rarity, 1), 5));
}

// Convert external image URL to same-origin proxy to prevent canvas tainting
function toProxyUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("data:")) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

// Single artifact tile component for the card
function CardArtifactItem({
  artifact,
  theme,
  showPips,
}: {
  artifact: ShowcaseArtifact;
  theme: ThemeConfig;
  showPips: boolean;
}) {
  const mainVal = artifact.mainStat?.value ?? "—";
  const cv = artifact.critValue ?? 0;
  const iconSrc = toProxyUrl(artifact.icon || artifact.iconFallback || "");

  return (
    <div
      className="relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl"
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.borderColor}`,
      }}
    >
      {/* Icon & Level */}
      <div
        className="relative shrink-0 w-11 h-11 rounded-lg flex items-center justify-center overflow-hidden"
        style={{ background: "rgba(0,0,0,0.5)" }}
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={artifact.name ?? artifact.slot}
            fill
            unoptimized
            sizes="44px"
            className="object-contain p-0.5"
          />
        ) : (
          <span className="text-sm opacity-50">✦</span>
        )}
        <div
          className="absolute bottom-0 inset-x-0 text-center text-[8px] font-bold font-mono py-0.2 leading-normal"
          style={{ background: "rgba(0,0,0,0.85)", color: theme.accentColor }}
        >
          +{artifact.level ?? 0}
        </div>
      </div>

      {/* Main Stat & Substats (NO truncate, generous line-height) */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 leading-normal">
          <span className="text-[10px] font-extrabold uppercase tracking-wide leading-normal" style={{ color: theme.accentColor }}>
            {artifact.slot}
          </span>
          {cv > 0 && showPips && (
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded leading-normal"
              style={{
                color: theme.accentColor,
                backgroundColor: theme.badgeBg,
                border: `1px solid ${theme.borderColor}`,
              }}
            >
              {cv} CV
            </span>
          )}
        </div>

        <div className="text-[11px] font-bold text-white leading-normal my-0.5">
          <span className="text-slate-300 font-medium">{artifact.mainStat?.label ?? "Main Stat"}: </span>
          <span className="font-mono font-extrabold" style={{ color: theme.accentColor }}>{mainVal}</span>
        </div>

        {/* 4 Substats */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] leading-normal font-mono">
          {artifact.substats.slice(0, 4).map((sub, i) => {
            const isCrit = sub.label.includes("CRIT");
            return (
              <div key={i} className="flex items-center justify-between gap-1 leading-normal">
                <span style={{ color: isCrit ? theme.accentColor : theme.subtextColor }}>
                  {sub.label.replace("CRIT ", "").replace("Energy Recharge", "ER").replace("Elemental Mastery", "EM")}
                </span>
                <span className="font-semibold" style={{ color: isCrit ? "#ffffff" : theme.textColor }}>
                  +{sub.value}
                </span>
              </div>
            );
          })}
        </div>
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
  const [themeKey, setThemeKey] = useState<ThemeType>("archon");
  const [layout, setLayout] = useState<LayoutType>("landscape");
  const [quality, setQuality] = useState<QualityType>(3);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showPips, setShowPips] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const currentTheme = THEMES[themeKey];
  const splashSrc = toProxyUrl(character.image || character.imageFallback || "");
  const weaponIcon = toProxyUrl(character.weapon?.icon || character.weapon?.iconFallback);

  const getStat = (label: string) => character.stats.find((s) => s.label === label)?.value ?? "—";

  const statsList = [
    { label: "Max HP", val: getStat("HP"), icon: "❤" },
    { label: "ATK", val: getStat("ATK"), icon: "⚔" },
    { label: "DEF", val: getStat("DEF"), icon: "🛡" },
    { label: "Elemental Mastery", val: getStat("Elemental Mastery"), icon: "✦" },
    { label: "CRIT Rate", val: getStat("CRIT Rate"), icon: "☆", isCrit: true },
    { label: "CRIT DMG", val: getStat("CRIT DMG"), icon: "★", isCrit: true },
    { label: "Energy Recharge", val: getStat("Energy Recharge"), icon: "⟳" },
  ];

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(
        `✦ ${character.name} Build Showcase (UID: ${profile.uid})\n` +
        `⚔ Weapon: ${character.weapon?.name ?? "Weapon"} R${character.weapon?.refinement ?? 1} (Lv. ${character.weapon?.level ?? 90})\n` +
        `★ CRIT Ratio: ${getStat("CRIT Rate")} / ${getStat("CRIT DMG")} (${character.critValue ?? 0} CV)\n` +
        `❤ HP: ${getStat("HP")} · ⚔ ATK: ${getStat("ATK")} · ⟳ ER: ${getStat("Energy Recharge")}\n` +
        `🏺 Artifacts: ${character.artifacts[0]?.setName ?? "4pc Set"}\n` +
        `Generated via Astra Archive Studio`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    // Suppress unsupported oklch console errors emitted by html2canvas
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("oklch")) {
        return;
      }
      origError.apply(console, args);
    };

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: quality,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
        scrollX: 0,
        scrollY: 0,
        windowWidth: cardRef.current.offsetWidth,
        windowHeight: cardRef.current.offsetHeight,
        onclone: (clonedDoc: Document) => {
          // Sanitize any remaining oklch references in cloned stylesheets
          try {
            const styleEls = clonedDoc.querySelectorAll("style");
            styleEls.forEach((s) => {
              if (s.textContent && s.textContent.includes("oklch")) {
                s.textContent = s.textContent.replace(/oklch\([^)]+\)/g, "#ffffff");
              }
            });
          } catch {
            // ignore
          }

          const exportCard = clonedDoc.querySelector("[data-card-export-root]") as HTMLElement | null;
          if (exportCard) {
            exportCard.style.transform = "none";
            exportCard.style.position = "static";
            exportCard.style.margin = "0";
          }
        },
      } as Parameters<typeof html2canvas>[1]);

      const filename = `${character.name.toLowerCase().replace(/\s+/g, "_")}_${themeKey}_${layout}_UID${profile.uid}.png`;

      const triggerDownload = (dataUrl: string) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloading(false);
      };

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            triggerDownload(url);
            setTimeout(() => URL.revokeObjectURL(url), 3000);
          } else {
            triggerDownload(canvas.toDataURL("image/png"));
          }
        }, "image/png");
      } else {
        triggerDownload(canvas.toDataURL("image/png"));
      }
    } catch (err) {
      console.error("Poster download error:", err);
      // Fallback
      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          useCORS: false,
          allowTaint: true,
          backgroundColor: "#07090e",
          scrollX: 0,
          scrollY: 0,
        } as Parameters<typeof html2canvas>[1]);
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `build_poster_UID${profile.uid}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (fallbackErr) {
        console.error("Fallback download error:", fallbackErr);
      }
      setDownloading(false);
    } finally {
      console.error = origError;
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-2xl p-4 sm:p-6 select-none animate-in fade-in duration-300 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1240px] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-white/10 bg-[#0b0e17] animate-in zoom-in-95 duration-250 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================================
            STUDIO CONTROL TOOLBAR (Top Panel)
           ===================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-[#0f1422] shrink-0">
          {/* Title & Studio Kicker */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg grid place-items-center shadow-md"
              style={{ background: currentTheme.badgeBg, border: `1px solid ${currentTheme.borderColor}` }}
            >
              <Camera className="w-4 h-4" style={{ color: currentTheme.accentColor }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#c8a96e]">
                  4K SHOWCASE STUDIO
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  PRO
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                {character.name} Build Poster
              </h2>
            </div>
          </div>

          {/* Theme Selector Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 gap-1">
            {(Object.keys(THEMES) as ThemeType[]).map((key) => {
              const th = THEMES[key];
              const isActive = themeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setThemeKey(key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "text-white shadow-md font-semibold"
                      : "text-[#8a96a7] hover:text-white"
                  }`}
                  style={{
                    backgroundColor: isActive ? th.accentColor + "25" : "transparent",
                    border: isActive ? `1px solid ${th.accentColor}` : "1px solid transparent",
                  }}
                  title={th.subtitle}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: th.accentColor }}
                  />
                  <span>{th.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Layout & Format Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setLayout("landscape")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                  layout === "landscape" ? "bg-white/15 text-white font-medium" : "text-[#8692a3] hover:text-white"
                }`}
                title="Desktop Landscape 16:9 Banner"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">16:9</span>
              </button>
              <button
                type="button"
                onClick={() => setLayout("portrait")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                  layout === "portrait" ? "bg-white/15 text-white font-medium" : "text-[#8692a3] hover:text-white"
                }`}
                title="Mobile Story 9:16 Card"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Story</span>
              </button>
            </div>

            {/* Quality scale selector (2x vs 4K 3x) */}
            <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setQuality(2)}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  quality === 2 ? "bg-white/15 text-white font-bold" : "text-[#8692a3] hover:text-white"
                }`}
                title="Full HD (2x scale)"
              >
                2K
              </button>
              <button
                type="button"
                onClick={() => setQuality(3)}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  quality === 3 ? "bg-[#c8a96e]/25 text-[#f2e2be] font-bold border border-[#c8a96e]/40" : "text-[#8692a3] hover:text-white"
                }`}
                title="Ultra-HD 4K (3x scale)"
              >
                4K UHD
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8692a3] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer ml-1"
              title="Close Studio (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            STUDIO CANVAS PREVIEW STAGE
           ===================================================================== */}
        <div className="relative p-4 sm:p-6 flex items-center justify-center overflow-auto max-h-[72vh] bg-[#07090e]">
          {/* The Actual Exported DOM Node */}
          <div
            ref={cardRef}
            data-card-export-root="true"
            className={`relative rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 shrink-0 ${
              layout === "landscape"
                ? "w-[1060px] h-[610px] flex flex-col justify-between"
                : "w-[540px] h-[920px] flex flex-col justify-between"
            }`}
            style={{
              background: currentTheme.bgGradient,
              border: `1.5px solid ${currentTheme.borderColor}`,
              boxShadow: `0 24px 60px rgba(0,0,0,0.85), 0 0 30px ${currentTheme.glowColor}`,
            }}
          >
            {/* Ambient Radial Starlight Glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40 blur-[100px]"
              style={{
                background: `radial-gradient(circle at 25% 40%, ${currentTheme.accentColor}, transparent 65%)`,
              }}
            />

            {/* Sacred Celestial Watermark Mandala in Background */}
            <div
              className="pointer-events-none absolute -right-24 -bottom-24 w-96 h-96 rounded-full border border-dashed opacity-10"
              style={{ borderColor: currentTheme.accentColor }}
            />

            {/* -------------------------------------------------------------
                LANDSCAPE LAYOUT (Classic 16:9 Desktop Enka / Akasha Style)
               ------------------------------------------------------------- */}
            {layout === "landscape" && (
              <div className="relative z-10 flex items-stretch h-full flex-1">
                {/* Column 1: Character Hero Splash Art */}
                <div
                  className="relative shrink-0 overflow-hidden flex flex-col justify-end"
                  style={{
                    width: "340px",
                    background: `radial-gradient(ellipse at 50% 65%, ${currentTheme.accentColor}15, transparent 70%)`,
                  }}
                >
                  {splashSrc ? (
                    <Image
                      src={splashSrc}
                      alt={character.name}
                      fill
                      unoptimized
                      sizes="340px"
                      className="object-cover object-top"
                      style={{ objectPosition: "center 12%" }}
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-4xl opacity-20">✦</div>
                  )}

                  {/* Character Identity Bottom Card Gradient */}
                  <div
                    className="relative z-10 p-4 pb-3"
                    style={{
                      background: "linear-gradient(to top, rgba(4,6,10,0.98) 0%, rgba(4,6,10,0.8) 55%, transparent 100%)",
                    }}
                  >
                    <div className="flex items-baseline gap-2 leading-normal">
                      <div className="flex items-center gap-2">
                        {character.element && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border"
                            style={{
                              background: "rgba(0,0,0,0.6)",
                              borderColor: `${currentTheme.accentColor}50`,
                              boxShadow: `0 0 8px ${currentTheme.accentColor}40`,
                            }}
                          >
                            <Image
                              src={`/images/elements/${character.element.toLowerCase()}.png`}
                              alt={character.element}
                              width={16}
                              height={16}
                              unoptimized
                              className="w-4 h-4 object-contain"
                            />
                          </div>
                        )}
                        <h1 className="text-2xl font-black text-white tracking-tight leading-normal">
                          {character.name}
                        </h1>
                      </div>
                      {showWatermark && (
                        <span className="text-xs font-mono font-medium" style={{ color: currentTheme.subtextColor }}>
                          {profile.nickname ?? "Traveler"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 leading-normal">
                      <span className="text-xs font-bold font-mono" style={{ color: currentTheme.accentColor }}>
                        Lv. {character.level ?? 90} / 90
                      </span>
                      <span className="text-xs" style={{ color: currentTheme.subtextColor }}>
                        ✦ Friendship {character.friendship ?? 10}
                      </span>
                    </div>

                    {showWatermark && (
                      <div className="text-[10px] font-mono text-[#7a8a9e] mt-1.5 tracking-wider font-semibold leading-normal">
                        UID: {profile.uid}
                      </div>
                    )}
                  </div>

                  {/* Constellation Nodes Column (C1-C6) on the left side */}
                  <div className="absolute left-3 top-4 flex flex-col gap-2 z-20">
                    {(character.constellations ?? []).slice(0, 6).map((c, i) => {
                      const cIcon = toProxyUrl(c.icon);
                      return (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border backdrop-blur-md transition-all"
                          style={{
                            background: c.unlocked ? `${currentTheme.accentColor}35` : "rgba(0,0,0,0.65)",
                            borderColor: c.unlocked ? currentTheme.accentColor : "rgba(255,255,255,0.15)",
                            color: c.unlocked ? "#ffffff" : "#6b788a",
                            boxShadow: c.unlocked ? `0 0 10px ${currentTheme.accentColor}60` : undefined,
                          }}
                        >
                          {cIcon ? (
                            <div className="relative w-4.5 h-4.5 rounded-full overflow-hidden">
                              <Image src={cIcon} alt={`C${i+1}`} fill unoptimized sizes="18px" className="object-contain" />
                            </div>
                          ) : (
                            `C${i + 1}`
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 2: Weapon & Combat Attributes */}
                <div
                  className="flex-1 p-4 flex flex-col justify-between"
                  style={{
                    borderLeft: `1px solid ${currentTheme.borderColor}`,
                    borderRight: `1px solid ${currentTheme.borderColor}`,
                    background: "rgba(0,0,0,0.18)",
                  }}
                >
                  {/* Equipped Weapon Block */}
                  {character.weapon && (
                    <div
                      className="p-3 rounded-xl flex items-center gap-3"
                      style={{
                        background: currentTheme.cardBg,
                        border: `1px solid ${currentTheme.borderColor}`,
                      }}
                    >
                      <div
                        className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.5)" }}
                      >
                        {weaponIcon ? (
                          <Image src={weaponIcon} alt={character.weapon.name ?? "Weapon"} fill unoptimized sizes="48px" className="object-contain p-1" />
                        ) : (
                          <span className="text-xl">⚔</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 leading-normal">
                          <span className="text-sm font-extrabold text-white leading-normal">
                            {character.weapon.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono leading-normal" style={{ background: currentTheme.badgeBg, color: currentTheme.accentColor }}>
                            R{character.weapon.refinement ?? 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-[#f4c43a] leading-normal mt-0.5">
                          {getRarityStars(character.weapon.rarity ?? 5)}
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1 font-mono leading-normal">
                          <span style={{ color: currentTheme.subtextColor }}>
                            Base ATK <strong className="text-white font-sans">{character.weapon.baseAttack}</strong>
                          </span>
                          {character.weapon.substat && (
                            <span style={{ color: currentTheme.accentColor }}>
                              +{character.weapon.substat.value} {character.weapon.substat.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7 Core Combat Stats List */}
                  <div className="space-y-1 my-auto">
                    {statsList.map((stat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs leading-normal"
                        style={{ background: "rgba(255,255,255,0.025)" }}
                      >
                        <span className="flex items-center gap-2" style={{ color: currentTheme.subtextColor }}>
                          <span className="w-3 text-center opacity-70 text-[10px]">{stat.icon}</span>
                          <span className="text-xs font-medium leading-normal">{stat.label}</span>
                        </span>
                        <strong
                          className="font-mono text-xs font-bold leading-normal"
                          style={{ color: stat.isCrit ? "#f8e3c2" : currentTheme.textColor }}
                        >
                          {stat.val}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Total CV & Set Bonus Pill */}
                  <div
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-mono leading-normal"
                    style={{
                      background: currentTheme.badgeBg,
                      border: `1px solid ${currentTheme.borderColor}`,
                      color: currentTheme.accentColor,
                    }}
                  >
                    <span className="font-bold">★ BUILD CRIT VALUE:</span>
                    <strong className="text-white text-base font-extrabold">{character.critValue ?? "0.0"} CV</strong>
                  </div>
                </div>

                {/* Column 3: 5 Equipped Artifacts Stack */}
                <div className="w-[370px] shrink-0 p-3.5 flex flex-col justify-between">
                  <div className="text-[11px] font-mono font-bold tracking-wider uppercase px-1 flex items-center justify-between pb-1 leading-normal" style={{ color: currentTheme.accentColor }}>
                    <span>EQUIPPED ARTIFACT SETS</span>
                    <span className="text-[10px] text-[#8a9bb2]">5/5 PIECES</span>
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    {character.artifacts.slice(0, 5).map((art, idx) => (
                      <CardArtifactItem
                        key={idx}
                        artifact={art}
                        theme={currentTheme}
                        showPips={showPips}
                      />
                    ))}
                  </div>

                  {/* Set bonus tag at bottom */}
                  {character.artifacts[0]?.setName && (
                    <div
                      className="text-center text-xs font-mono font-bold py-1.5 px-3 rounded-xl mt-1.5 leading-normal"
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        color: currentTheme.accentColor,
                        border: `1px solid ${currentTheme.borderColor}`,
                      }}
                    >
                      ✦ 4-Piece {character.artifacts[0].setName}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                PORTRAIT LAYOUT (Story 9:16 Mobile Format)
               ------------------------------------------------------------- */}
            {layout === "portrait" && (
              <div className="relative z-10 flex flex-col h-full flex-1 p-5 justify-between">
                {/* Top Section: Hero Splash + Identity Header */}
                <div
                  className="relative w-full h-[320px] rounded-xl overflow-hidden flex flex-col justify-end p-4 border border-white/10"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${currentTheme.accentColor}25, transparent 75%)`,
                  }}
                >
                  {splashSrc && (
                    <Image
                      src={splashSrc}
                      alt={character.name}
                      fill
                      unoptimized
                      sizes="500px"
                      className="object-cover object-top"
                    />
                  )}

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider"
                      style={{ background: currentTheme.badgeBg, color: currentTheme.accentColor, border: `1px solid ${currentTheme.borderColor}` }}
                    >
                      {character.element} Archon Tier
                    </span>
                  </div>

                  {/* Bottom Identity Overlay */}
                  <div
                    className="relative z-10 p-3 rounded-xl backdrop-blur-md border border-white/10"
                    style={{ background: "rgba(5,7,12,0.85)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {character.element && (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
                            style={{
                              background: "rgba(0,0,0,0.6)",
                              borderColor: `${currentTheme.accentColor}50`,
                              boxShadow: `0 0 10px ${currentTheme.accentColor}40`,
                            }}
                          >
                            <Image
                              src={`/images/elements/${character.element.toLowerCase()}.png`}
                              alt={character.element}
                              width={20}
                              height={20}
                              unoptimized
                              className="w-5 h-5 object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h1 className="text-xl font-bold text-white leading-tight">{character.name}</h1>
                          <span className="text-[10px]" style={{ color: currentTheme.accentColor }}>
                            Lv. {character.level ?? 90} / 90 · Friendship {character.friendship ?? 10}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#f5d070]">{character.critValue ?? 0} CV</span>
                        {showWatermark && (
                          <div className="text-[8px] font-mono text-[#64748b]">UID {profile.uid}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Weapon & Combat Attributes Bar */}
                <div className="grid grid-cols-2 gap-2 my-2.5">
                  {/* Weapon Pill */}
                  {character.weapon && (
                    <div
                      className="p-2.5 rounded-xl flex items-center gap-2"
                      style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.borderColor}` }}
                    >
                      <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden bg-black/40">
                        {weaponIcon && <Image src={weaponIcon} alt="Weapon" fill unoptimized sizes="40px" className="object-contain p-0.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-white leading-normal">{character.weapon.name}</div>
                        <div className="text-[9px] font-mono leading-normal" style={{ color: currentTheme.accentColor }}>
                          R{character.weapon.refinement ?? 1} · Lv. {character.weapon.level ?? 90}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Set Bonus Pill */}
                  <div
                    className="p-2.5 rounded-xl flex flex-col justify-center text-center"
                    style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.borderColor}` }}
                  >
                    <span className="text-[9px] font-mono leading-normal" style={{ color: currentTheme.subtextColor }}>ACTIVE SET</span>
                    <strong className="text-[11px] font-bold text-white leading-normal" style={{ color: currentTheme.accentColor }}>
                      {character.artifacts[0]?.setName ?? "4-Piece Set"}
                    </strong>
                  </div>
                </div>

                {/* 7 Core Stats in 2 Columns */}
                <div
                  className="p-3 rounded-xl grid grid-cols-2 gap-x-4 gap-y-1 text-xs"
                  style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.borderColor}` }}
                >
                  {statsList.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5">
                      <span className="text-[10px]" style={{ color: currentTheme.subtextColor }}>{stat.label}</span>
                      <strong className="font-mono text-[11px]" style={{ color: stat.isCrit ? "#f8e3c2" : currentTheme.textColor }}>
                        {stat.val}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Bottom: 5 Artifacts in a tight column */}
                <div className="space-y-1.5 mt-2.5">
                  {character.artifacts.slice(0, 5).map((art, idx) => (
                    <CardArtifactItem
                      key={idx}
                      artifact={art}
                      theme={currentTheme}
                      showPips={showPips}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Universal Studio Footer Bar */}
            <div
              className="relative z-10 px-4 py-2 flex items-center justify-between text-[9px] font-mono shrink-0"
              style={{
                borderTop: `1px solid ${currentTheme.borderColor}`,
                background: "rgba(0,0,0,0.6)",
                color: currentTheme.subtextColor,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[#c8a96e]">✦ ASTRA ARCHIVE</span>
                <span>·</span>
                <span>GENSHIN IMPACT CHARACTER SHOWCASE</span>
              </div>
              <div className="flex items-center gap-3">
                {showWatermark && <span>TRAVELER: {profile.nickname ?? "Traveler"}</span>}
                <span className="font-bold text-white">{themeKey.toUpperCase()} EDITION</span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            STUDIO ACTION BAR & SETTINGS (Bottom Panel)
           ===================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-white/[0.08] bg-[#0f1422] shrink-0">
          {/* Studio Feature Toggles */}
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#8a96a7] hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#c8a96e] cursor-pointer"
              />
              <span>Player UID & Watermark</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-[#8a96a7] hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={showPips}
                onChange={(e) => setShowPips(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#c8a96e] cursor-pointer"
              />
              <span>Akasha CV & Roll Pips</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#edf0f7] transition-all bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Build!" : "Copy Summary"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-[#0d1017] transition-all disabled:opacity-50 cursor-pointer shadow-lg hover:brightness-110 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.accentColor}, #ffffff)`,
                boxShadow: `0 0 20px ${currentTheme.accentColor}55`,
              }}
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? "Rendering 4K Canvas..." : `Download ${quality === 3 ? "4K UHD" : "2K HD"} Poster`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
