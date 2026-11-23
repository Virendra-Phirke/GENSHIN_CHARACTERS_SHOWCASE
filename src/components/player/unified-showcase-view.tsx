"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import {
  Camera,
  Crown,
  Flame,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import type { PlayerApiError, PlayerShowcase, ShowcaseCharacter } from "@/lib/types";
import { SHOWCASE_UID } from "@/lib/constants";
import CelestialBackground from "@/components/ui/celestial-background";
import GenshinLoader from "@/components/ui/genshin-loader";
import RotatingCharacterCarousel from "@/components/ui/rotating-character-carousel";
import TiltCard from "@/components/ui/tilt-card";
import CritRatioGauge from "@/components/ui/crit-ratio-gauge";
import StatRadarChart from "@/components/ui/stat-radar-chart";
import ConstellationStarMap from "@/components/ui/constellation-star-map";
import ArtifactRollInspector from "@/components/ui/artifact-roll-inspector";
import ParallaxHeroArt from "@/components/ui/parallax-hero-art";
import SectionConstellationNav from "@/components/ui/section-constellation-nav";
import ShareBuildCardModal from "@/components/ui/share-build-card-modal";

// ---------------------------------------------------------------------------
// FEATURE 5: Fluid Inertia Smooth Scroll with Dynamic Velocity Tilt
// ---------------------------------------------------------------------------
function useScrollVelocity() {
  const [velocityTilt, setVelocityTilt] = useState(0);

  useEffect(() => {
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let animId: number;

    const handleScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const dt = Math.max(now - lastTime, 8);
      const dy = currentY - lastY;
      const v = (dy / dt) * 16; // velocity px/frame

      // Tilt angle clamped between -2.2deg and +2.2deg
      const targetTilt = Math.min(Math.max(v * -0.15, -2.2), 2.2);
      setVelocityTilt(targetTilt);

      lastY = currentY;
      lastTime = now;

      // Spring back to 0
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        setVelocityTilt((prev) => prev * 0.82);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return velocityTilt;
}

// ---------------------------------------------------------------------------
// FEATURE 6: Scroll-Driven Stat Counter Animation (CountUp on In-View)
// ---------------------------------------------------------------------------
function CountUpStat({
  value,
  duration = 900,
}: {
  value: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const numericMatch = value.match(/([\d,.]+)/);

  useEffect(() => {
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    const cleanStr = numericMatch[1].replace(/,/g, "");
    const target = parseFloat(cleanStr);
    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }

    const hasDecimal = cleanStr.includes(".");
    const decimals = hasDecimal ? cleanStr.split(".")[1].length : 0;
    const hasComma = value.includes(",");
    const prefix = value.slice(0, numericMatch.index);
    const suffix = value.slice((numericMatch.index ?? 0) + numericMatch[0].length);

    let start = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quartic
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = start + (target - start) * ease;

      const formatted = hasComma
        ? Math.round(current).toLocaleString()
        : current.toFixed(decimals);

      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

interface UnifiedShowcaseViewProps {
  initialCharacterId?: number;
}

const ELEMENT_DATA: Record<
  string,
  { accent: string; wash: string; glow: string; name: string }
> = {
  Cryo: { accent: "#9ed8e9", wash: "rgba(158,216,233,.12)", glow: "rgba(158,216,233,.38)", name: "Cryo" },
  Hydro: { accent: "#78bce9", wash: "rgba(120,188,233,.12)", glow: "rgba(120,188,233,.38)", name: "Hydro" },
  Pyro: { accent: "#ef866d", wash: "rgba(239,134,109,.12)", glow: "rgba(239,134,109,.38)", name: "Pyro" },
  Electro: { accent: "#b99be9", wash: "rgba(185,155,233,.12)", glow: "rgba(185,155,233,.38)", name: "Electro" },
  Anemo: { accent: "#82d0b4", wash: "rgba(130,208,180,.12)", glow: "rgba(130,208,180,.38)", name: "Anemo" },
  Geo: { accent: "#e5bc75", wash: "rgba(229,188,117,.12)", glow: "rgba(229,188,117,.38)", name: "Geo" },
  Dendro: { accent: "#a8c878", wash: "rgba(168,200,120,.12)", glow: "rgba(168,200,120,.38)", name: "Dendro" },
};

const CHARACTER_LORE_QUOTES: Record<number, string> = {
  10000114: "In the dark depths of the abyss, time is merely a ripple in the stillness.",
  10000052: "The world remains constant over the millennia, as does the eternal lightning.",
  10000089: "The stage is set, and the spotlight shines upon the grand theater of destiny.",
  10000087: "We shall be the impartial judges of tides and the arbiters of ancient memory.",
  10000106: "A flame that never dies burns brightest in the heart of courage and passion.",
  10000125: "Hark, the choir of the slumbering stars softly hums across the cosmos.",
  10000073: "Even the smallest seed holds the wisdom to become an ancient sanctuary tree.",
  10000091: "Behind every mystery lies an answer waiting for those who dare to seek it.",
  10000122: "Through sacred dunes and starlit sands, the golden legacy endures.",
  10000133: "Clockwork precision outlives the fleeting whims and passions of mortals.",
  10000150: "Grace in every step, absolute precision and resolve in every strike.",
  10000143: "The first thaw of spring begins with a single whisper of warmth.",
};

function EquipmentArtwork({
  src,
  fallbackSrc,
  alt,
  rarity = 5,
  kind,
}: {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  rarity?: number;
  kind: "weapon" | "artifact";
}) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageSrc = sourceIndex === 0 ? (src || fallbackSrc) : sourceIndex === 1 ? fallbackSrc : undefined;

  return (
    <div className={`equipment-artwork equipment-artwork-${kind} rarity-${Math.min(Math.max(rarity, 1), 5)}`}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          unoptimized
          sizes={kind === "weapon" ? "200px" : "120px"}
          quality={85}
          className="equipment-artwork-image"
          onError={() => setSourceIndex((current) => (current === 0 && src && fallbackSrc ? 1 : 2))}
        />
      ) : (
        <span className="equipment-artwork-fallback" aria-hidden="true">
          {kind === "weapon" ? "⚔" : "✧"}
        </span>
      )}
      <span className="equipment-artwork-rarity" aria-label={`${rarity}-star rarity`}>
        {"★".repeat(Math.min(Math.max(rarity, 1), 5))}
      </span>
    </div>
  );
}

function TalentOrConstIcon({
  src,
  fallbackSrc,
  alt,
}: {
  src?: string;
  fallbackSrc?: string;
  alt: string;
}) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const currentSrc = sourceIndex === 0 ? (src || fallbackSrc) : sourceIndex === 1 ? fallbackSrc : undefined;

  if (!currentSrc) {
    return <span className="talent-icon-fallback">✧</span>;
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      unoptimized
      sizes="56px"
      quality={85}
      className="talent-icon-img"
      onError={() => setSourceIndex((current) => (current === 0 && src && fallbackSrc ? 1 : 2))}
    />
  );
}

export default function UnifiedShowcaseView({
  initialCharacterId = 10000114,
}: UnifiedShowcaseViewProps) {
  const [profile, setProfile] = useState<PlayerShowcase | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<ShowcaseCharacter | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [failedSplash, setFailedSplash] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Creative UI State
  const velocityTilt = useScrollVelocity(); // Feature 5
  const [shareModalOpen, setShareModalOpen] = useState(false); // Feature 20
  const [isResonanceActive, setIsResonanceActive] = useState(false); // Feature 15
  const [hoveredSetBonus, setHoveredSetBonus] = useState<string | null>(null); // Feature 10

  useEffect(() => {
    const controller = new AbortController();

    async function loadShowcase() {
      try {
        const response = await fetch(`/api/player/${SHOWCASE_UID}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          const failure = data as PlayerApiError;
          throw new Error(failure.error || "Unable to reach the Enka.Network showcase.");
        }

        const showcase = data as PlayerShowcase;
        setProfile(showcase);

        // Find initial character or fallback to Skirk
        const defaultChar =
          showcase.characters.find((c) => c.id === initialCharacterId) ||
          showcase.characters.find((c) => c.id === 10000114) ||
          showcase.characters[0];

        setActiveCharacter(defaultChar ?? null);
        setError("");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setProfile(null);
        setActiveCharacter(null);
        setError(err instanceof Error ? err.message : "Showcase connection failed.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadShowcase();
    return () => controller.abort();
  }, [initialCharacterId, attempt]);

  const elementTheme = useMemo(() => {
    return (
      ELEMENT_DATA[activeCharacter?.element || ""] ?? {
        accent: "#c8a96e",
        wash: "rgba(200,169,110,.12)",
        glow: "rgba(200,169,110,.35)",
        name: "Genshin",
      }
    );
  }, [activeCharacter?.element]);

  // Artifact sets calculation
  const setCounts = useMemo(() => {
    return (
      activeCharacter?.artifacts.reduce<Record<string, number>>((acc, art) => {
        if (art.setName) acc[art.setName] = (acc[art.setName] ?? 0) + 1;
        return acc;
      }, {}) ?? {}
    );
  }, [activeCharacter?.artifacts]);

  const activeSetBonuses = useMemo(() => {
    return Object.entries(setCounts).map(([setName, count]) => ({
      setName,
      count,
    }));
  }, [setCounts]);

  const totalArtifactCV = useMemo(() => {
    if (!activeCharacter) return "0.0";
    return activeCharacter.artifacts
      .reduce((sum, art) => sum + (art.critValue ?? 0), 0)
      .toFixed(1);
  }, [activeCharacter]);

  const critRateNumber = useMemo(() => {
    const stat = activeCharacter?.stats.find((s) => s.label === "CRIT Rate");
    if (!stat) return 5;
    return stat.rawValue ? stat.rawValue * 100 : parseFloat(stat.value);
  }, [activeCharacter?.stats]);

  const critDmgNumber = useMemo(() => {
    const stat = activeCharacter?.stats.find((s) => s.label === "CRIT DMG");
    if (!stat) return 50;
    return stat.rawValue ? stat.rawValue * 100 : parseFloat(stat.value);
  }, [activeCharacter?.stats]);

  // Feature 15: Elemental Infusion & Team Resonance Mode calculations
  const displayStats = useMemo(() => {
    if (!activeCharacter) return [];
    if (!isResonanceActive) return activeCharacter.stats;

    const element = activeCharacter.element;
    return activeCharacter.stats.map((s) => {
      if (element === "Pyro" && s.label === "ATK") {
        const current = s.rawValue ?? parseFloat(s.value.replace(/,/g, "")) ?? 2000;
        const boosted = Math.round(current * 1.25);
        return {
          ...s,
          value: boosted.toLocaleString(),
          detail: "+25% Pyro Resonance Active",
        };
      }
      if (element === "Cryo" && s.label === "CRIT Rate") {
        const current = (s.rawValue ? s.rawValue * 100 : parseFloat(s.value)) ?? 50;
        const boosted = (current + 15).toFixed(1);
        return {
          ...s,
          value: `${boosted}%`,
          detail: "+15% Cryo Resonance Active",
        };
      }
      if (element === "Hydro" && s.label === "HP") {
        const current = s.rawValue ?? parseFloat(s.value.replace(/,/g, "")) ?? 20000;
        const boosted = Math.round(current * 1.25);
        return {
          ...s,
          value: boosted.toLocaleString(),
          detail: "+25% Hydro Resonance Active",
        };
      }
      if (element === "Electro" && s.label === "Energy Recharge") {
        const current = (s.rawValue ? s.rawValue * 100 : parseFloat(s.value)) ?? 120;
        const boosted = (current + 20).toFixed(1);
        return {
          ...s,
          value: `${boosted}%`,
          detail: "+20% Electro Resonance Active",
        };
      }
      if (element === "Geo" && s.label === "DEF") {
        const current = s.rawValue ?? parseFloat(s.value.replace(/,/g, "")) ?? 900;
        const boosted = Math.round(current * 1.25);
        return {
          ...s,
          value: boosted.toLocaleString(),
          detail: "+25% Geo Resonance Active",
        };
      }
      if (element === "Dendro" && s.label === "Elemental Mastery") {
        const current = s.rawValue ?? parseFloat(s.value.replace(/,/g, "")) ?? 80;
        const boosted = Math.round(current + 80);
        return {
          ...s,
          value: boosted.toLocaleString(),
          detail: "+80 EM Dendro Resonance",
        };
      }
      return s;
    });
  }, [activeCharacter, isResonanceActive]);

  const splashSrc =
    failedSplash === activeCharacter?.image
      ? activeCharacter?.imageFallback
      : activeCharacter?.image || activeCharacter?.imageFallback;

  const currentLoreQuote =
    activeCharacter && CHARACTER_LORE_QUOTES[activeCharacter.id]
      ? CHARACTER_LORE_QUOTES[activeCharacter.id]
      : "A journey written across the stars of Teyvat.";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0f16] flex items-center justify-center p-4">
        <GenshinLoader uid={SHOWCASE_UID} />
      </main>
    );
  }

  if (error || !profile || !activeCharacter) {
    return (
      <main className="min-h-screen bg-[#0b0f16] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-lg border border-white/10 bg-[#121824]/90 backdrop-blur-md">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#e3a5a0] uppercase">
            SHOWCASE UNAVAILABLE
          </span>
          <h2 className="text-2xl font-semibold mt-3 mb-2 text-[#f3f5f9]">Could not open archive</h2>
          <p className="text-xs text-[#929baa] mb-6 leading-relaxed">
            {error || "No public character builds were detected for this profile."}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              setAttempt((c) => c + 1);
            }}
            className="primary-button inline-flex items-center gap-2"
          >
            Reconnect to Enka <RefreshCw size={14} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <div
      className="unified-showcase-root min-h-screen relative bg-[#0a0e16] text-[#e6e8ed] overflow-x-hidden selection:bg-[#c8a96e]/30 selection:text-white"
      style={{
        ["--element-accent" as string]: elementTheme.accent,
        ["--element-wash" as string]: elementTheme.wash,
        ["--element-glow" as string]: elementTheme.glow,
      }}
    >
      {/* Dynamic Celestial Stardust Canvas */}
      <CelestialBackground elementAccent={elementTheme.accent} element={activeCharacter.element} />

      {/* Feature 8: Section Scroll Progress Constellation Line */}
      <SectionConstellationNav elementColor={elementTheme.accent} elementGlow={elementTheme.glow} />

      {/* Top Ambient Elemental Aurora */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[480px] opacity-25 blur-[120px] transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${elementTheme.accent}, transparent 75%)`,
        }}
      />

      {/* Showcase Top Bar */}
      <header className="profile-topbar relative z-20 max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
        <Link href="/" className="brand flex items-center gap-3" aria-label="Astra Home">
          <div className="brand-mark w-6 h-6 border border-[#c8a96e] rotate-45 grid place-items-center">
            <span className="w-2 h-2 bg-[#c8a96e]" />
          </div>
          <span className="brand-name tracking-[0.25em] text-sm font-bold">
            ASTRA<span className="text-[#c8a96e]">.</span>
          </span>
        </Link>

        {/* Traveler Summary Chips & Share Action */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          <span className="hidden md:inline text-[#8894a4] tracking-wider text-[10px]">
            TRAVELER: <strong className="text-[#f1f3f7]">{profile.nickname || "Traveler"}</strong>
          </span>
          <span className="hidden md:inline w-1 h-1 rounded-full bg-white/20" />
          <span className="hidden sm:inline text-[#8894a4] tracking-wider text-[10px]">
            UID: <strong className="text-[#d8dde6] font-mono">{profile.uid}</strong>
          </span>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
          <span className="px-2.5 py-0.5 rounded-full border border-[#c8a96e]/30 bg-[#c8a96e]/10 text-[#f2e2be] text-[10px] font-bold">
            AR {profile.adventureRank ?? 60} · WL {profile.worldLevel ?? 9}
          </span>

          {/* Feature 20: One-Click Share Build Card Snapshot Button */}
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-[#f1f3f7] hover:border-[#c8a96e] transition-all duration-200 shadow-sm"
            title="Export aesthetic build card snapshot"
          >
            <Camera className="w-3.5 h-3.5 text-[#c8a96e]" />
            <span className="hidden sm:inline text-[11px]">Share Card</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 pt-4 pb-24">
        {/* =========================================================================
            SECTION 1: 3D ROTATING CHARACTER CAROUSEL (Centerpiece Animation)
           ========================================================================= */}
        <section id="section-roster" aria-label="Showcase Roster Selection">
          <RotatingCharacterCarousel
            characters={profile.characters}
            activeCharacterId={activeCharacter.id}
            onSelectCharacter={(char) => {
              setActiveCharacter(char);
              setFailedSplash(null);
            }}
          />
        </section>

        {/* =========================================================================
            SECTION 2: FEATURED CHARACTER DOSSIER (Pure Borderless Splash Art + Bento)
           ========================================================================= */}
        <div key={activeCharacter.id} id="section-dossier" className="dossier-animate-entry mt-6">
          {/* Hero Banner: Borderless Centered Splash Art + Metadata */}
          <section className="character-build-hero">
            {/* Feature 1, 2, 3: Mouse-Driven 3D Parallax, Disintegration Burst, Fullscreen Spotlight */}
            <ParallaxHeroArt
              character={activeCharacter}
              splashSrc={splashSrc || ""}
              elementAccent={elementTheme.accent}
              elementGlow={elementTheme.glow}
              loreQuote={currentLoreQuote}
              onImageError={() => setFailedSplash(splashSrc)}
            />

            {/* Right: Identity, Constellations, Lore, and Quick Summary Bento */}
            <div className="character-build-intro">
              <div className="eyebrow flex items-center gap-2 text-[9px] font-bold tracking-[0.22em] text-[#c8a96e]">
                <span className="eyebrow-line w-6 h-[1px] bg-[#c8a96e]" />
                CHARACTER DOSSIER · LIVE IN-GAME BUILD
              </div>

              <div className="character-title-row">
                <h1 className="character-title">
                  {activeCharacter.name}
                  <span className="brand-period text-[#c8a96e]">.</span>
                </h1>
                <div className="character-rarity" aria-label={`${activeCharacter.rarity ?? 5} stars`}>
                  {"★".repeat(activeCharacter.rarity ?? 5)}
                </div>
              </div>

              {/* Character Lore Quote */}
              <p className="character-lore-quote text-xs text-[#9aa7b9] italic my-3 pl-3 border-l border-[#c8a96e]/60 font-serif leading-relaxed">
                &ldquo;{currentLoreQuote}&rdquo;
              </p>

              {/* Identity Chips */}
              <div className="character-identity-chips">
                <span
                  className="element-chip"
                  style={{
                    borderColor: elementTheme.accent,
                    backgroundColor: elementTheme.wash,
                    color: elementTheme.accent,
                  }}
                >
                  <i style={{ backgroundColor: elementTheme.accent }} />
                  {activeCharacter.element || "Adventurer"}
                </span>
                <span className="level-chip">
                  LEVEL {activeCharacter.level ?? 90} / 90
                </span>
                <span className="friendship-chip">
                  {activeCharacter.friendship != null
                    ? `FRIENDSHIP ${activeCharacter.friendship}`
                    : "PUBLIC SHOWCASE"}
                </span>
              </div>

              {/* Constellation Progress Track */}
              <div className="constellation-track">
                <div className="constellation-track-info">
                  <span className="constellation-label">CONSTELLATION</span>
                  <strong style={{ color: elementTheme.accent }}>
                    C{activeCharacter.constellation ?? 0}
                  </strong>
                </div>
                <div className="constellation-dots">
                  {Array.from({ length: 6 }, (_, index) => {
                    const isUnlocked = index < (activeCharacter.constellation ?? 0);
                    return (
                      <span
                        key={index}
                        className={`constellation-dot ${isUnlocked ? "is-unlocked" : ""}`}
                        style={
                          isUnlocked
                            ? {
                                borderColor: elementTheme.accent,
                                backgroundColor: elementTheme.wash,
                              }
                            : {}
                        }
                        title={`Constellation ${index + 1}: ${isUnlocked ? "Unlocked" : "Locked"}`}
                      >
                        <i style={isUnlocked ? { backgroundColor: elementTheme.accent } : {}} />
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Summary Bento Cards */}
              <div className="character-build-quickstats">
                <div className="quickstat-card">
                  <span>EQUIPPED WEAPON</span>
                  <strong>{activeCharacter.weapon?.name || "Not equipped"}</strong>
                  <small>
                    {activeCharacter.weapon?.level
                      ? `Lv. ${activeCharacter.weapon.level} · Refinement R${activeCharacter.weapon.refinement ?? 1}`
                      : "Weapon details"}
                  </small>
                </div>

                <div className="quickstat-card">
                  <span>COMBAT CRIT VALUE</span>
                  <strong className="cv-highlight">
                    {activeCharacter.critValue != null ? `${activeCharacter.critValue} CV` : "—"}
                  </strong>
                  <small>
                    {(activeCharacter.stats.find((s) => s.label === "CRIT Rate")?.value ?? "—")} CR / {(activeCharacter.stats.find((s) => s.label === "CRIT DMG")?.value ?? "—")} CD
                  </small>
                </div>

                <div className="quickstat-card">
                  <span>ARTIFACT LOADOUT</span>
                  <strong>{activeCharacter.artifacts.length} / 5 Equipped</strong>
                  <small className="truncate">
                    {activeSetBonuses.length
                      ? activeSetBonuses.map((b) => `${b.count}pc ${b.setName}`).join(", ")
                      : "Artifact set details"}
                  </small>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 3: BENTO DETAILS GRID (Combat Stats, Radar, Weapon, Artifacts, Talents)
             ========================================================================= */}
          <section className="character-build-content mt-12">
            <div className="build-section-heading">
              <div>
                <span className="eyebrow flex items-center gap-2 text-[9px] font-bold tracking-[0.2em] text-[#c8a96e]">
                  <span className="eyebrow-line w-5 h-[1px] bg-[#c8a96e]" />
                  TECHNICAL DOSSIER
                </span>
                <h2>Build & Combat Breakdown</h2>
              </div>
            </div>

            <div className="build-details-grid">
              {/* 1. Combat Attributes & Stat Radar Panel */}
              <section className="build-panel combat-panel">
                <div className="panel-header">
                  <span className="build-panel-label">
                    <Zap size={13} /> COMBAT ATTRIBUTES
                  </span>
                  <span className="panel-badge">LIVE VALUES</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Left Column: Attribute Numbers */}
                  <div className="build-stat-grid !grid-cols-1">
                    {activeCharacter.stats.length ? (
                      activeCharacter.stats.map((stat) => (
                        <div className="build-stat" key={stat.label}>
                          <div className="stat-label-wrap">
                            <span className="stat-name">{stat.label}</span>
                            {stat.detail && (
                              <small className="build-stat-detail">{stat.detail}</small>
                            )}
                          </div>
                          <strong className="stat-value">{stat.value}</strong>
                        </div>
                      ))
                    ) : (
                      <p className="build-empty">Combat attributes are not available.</p>
                    )}
                  </div>

                  {/* Right Column: Hexagon Stat Radar Chart */}
                  <div className="flex justify-center">
                    <StatRadarChart
                      stats={activeCharacter.stats}
                      elementColor={elementTheme.accent}
                      size={250}
                    />
                  </div>
                </div>

                {/* CRIT Efficiency Dual Bar Gauge */}
                <div className="mt-5">
                  <CritRatioGauge
                    critRate={critRateNumber}
                    critDmg={critDmgNumber}
                    critValue={activeCharacter.critValue}
                  />
                </div>
              </section>

              {/* 2. Equipped Weapon Panel with 3D Tilt Card */}
              <section className="build-panel weapon-panel">
                <div className="panel-header">
                  <span className="build-panel-label">
                    <Swords size={13} /> EQUIPPED WEAPON
                  </span>
                  {activeCharacter.weapon?.refinement && (
                    <span className="refinement-pill">R{activeCharacter.weapon.refinement}</span>
                  )}
                </div>

                {activeCharacter.weapon ? (
                  <TiltCard maxTilt={6}>
                    <div className="weapon-showcase">
                      <EquipmentArtwork
                        src={activeCharacter.weapon.icon}
                        fallbackSrc={activeCharacter.weapon.iconFallback}
                        alt={activeCharacter.weapon.name || "Weapon"}
                        rarity={activeCharacter.weapon.rarity}
                        kind="weapon"
                      />
                      <div className="weapon-showcase-info">
                        <span className="equipment-kicker">
                          {"★".repeat(activeCharacter.weapon.rarity ?? 4)} WEAPON
                        </span>
                        <h3>{activeCharacter.weapon.name || "Weapon"}</h3>
                        <p className="weapon-level-text">
                          Level {activeCharacter.weapon.level ?? 90} / 90 <span>·</span> Refinement R{activeCharacter.weapon.refinement ?? 1}
                        </p>
                        <div className="weapon-stats">
                          {activeCharacter.weapon.baseAttack && (
                            <div className="weapon-stat-pill">
                              <span>Base ATK</span>
                              <strong>{activeCharacter.weapon.baseAttack}</strong>
                            </div>
                          )}
                          {activeCharacter.weapon.substat && (
                            <div className="weapon-stat-pill">
                              <span>{activeCharacter.weapon.substat.label}</span>
                              <strong>{activeCharacter.weapon.substat.value}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                ) : (
                  <p className="build-empty">No weapon equipped.</p>
                )}
              </section>

              {/* 3. Artifacts Panel (All 5 Slots with Tilt Cards + Roll Inspector) */}
              <section className="build-panel artifacts-panel">
                <div className="panel-header">
                  <div className="panel-header-left">
                    <span className="build-panel-label">
                      <Sparkles size={13} /> ARTIFACTS · {activeCharacter.artifacts.length}/5
                    </span>
                    {totalArtifactCV && (
                      <span className="artifact-total-cv-pill">
                        Total Substat CV: {totalArtifactCV}
                      </span>
                    )}
                  </div>
                  <div className="set-bonus-tags">
                    {activeSetBonuses.map((bonus) => (
                      <span className="set-bonus-chip" key={bonus.setName}>
                        {bonus.count}-Piece {bonus.setName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="artifact-build-list">
                  {activeCharacter.artifacts.map((artifact, index) => (
                    <TiltCard maxTilt={5} key={`${artifact.slot}-${index}`}>
                      <article className="artifact-build-item h-full flex flex-col justify-between">
                        <div>
                          <div className="artifact-visual-row">
                            <EquipmentArtwork
                              src={artifact.icon}
                              fallbackSrc={artifact.iconFallback}
                              alt={artifact.name || `${artifact.slot} artifact`}
                              rarity={artifact.rarity}
                              kind="artifact"
                            />
                            <div className="artifact-build-top">
                              <div className="artifact-slot-badge">{artifact.slot}</div>
                              <h3>{artifact.name || `${artifact.setName || "Artifact"} · ${artifact.slot}`}</h3>
                              <p className="artifact-set-name">{artifact.setName || "Artifact Set"}</p>
                            </div>
                            <div className="artifact-level-badge">
                              +{artifact.level ?? 0}
                            </div>
                          </div>

                          {/* Main Stat */}
                          {artifact.mainStat && (
                            <div className="artifact-main-stat">
                              <span className="main-stat-label">{artifact.mainStat.label}</span>
                              <strong className="main-stat-value">{artifact.mainStat.value}</strong>
                            </div>
                          )}

                          {/* Substats Header with individual piece CV */}
                          <div className="artifact-roll-heading">
                            <span>SUBSTATS ({artifact.substats.length})</span>
                            {artifact.critValue != null && (
                              <span className="piece-cv-badge">{artifact.critValue} CV</span>
                            )}
                          </div>

                          {/* 4 Substats */}
                          <div className="artifact-substats">
                            {artifact.substats.map((stat, statIndex) => (
                              <div
                                className={`artifact-substat-row ${
                                  stat.label.includes("CRIT") ? "is-crit-stat" : ""
                                }`}
                                key={`${stat.label}-${statIndex}`}
                              >
                                <span className="substat-label">{stat.label}</span>
                                <strong className="substat-value">+{stat.value}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Artifact Roll Inspector Tier Badge & Pips */}
                        <ArtifactRollInspector artifact={artifact} />
                      </article>
                    </TiltCard>
                  ))}
                  {!activeCharacter.artifacts.length && (
                    <p className="build-empty">No equipped artifacts found.</p>
                  )}
                </div>
              </section>

              {/* 4. Talents Panel */}
              <section className="build-panel talent-panel">
                <div className="panel-header">
                  <span className="build-panel-label">
                    <Crown size={13} /> TALENT LEVELS
                  </span>
                  <span className="panel-badge">COMBAT TALENTS</span>
                </div>

                <div className="talent-cards-grid">
                  {activeCharacter.talents.length ? (
                    activeCharacter.talents.map((talent, idx) => (
                      <div
                        className={`talent-card ${talent.isCrowned ? "is-crowned" : ""}`}
                        key={`${talent.name}-${idx}`}
                      >
                        <div className="talent-icon-box">
                          <TalentOrConstIcon
                            src={talent.icon}
                            fallbackSrc={talent.iconFallback}
                            alt={talent.name}
                          />
                        </div>
                        <div className="talent-details">
                          <span className="talent-type-label">TALENT 0{idx + 1}</span>
                          <h4 className="talent-name">{talent.name}</h4>
                          <div className="talent-level-wrap">
                            <span className="talent-level-number">Lv. {talent.level}</span>
                            {talent.isCrowned && (
                              <span className="crowned-badge">
                                <Crown size={11} /> CROWNED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="build-empty">Talent data is not available.</p>
                  )}
                </div>
              </section>

              {/* 5. Constellations Panel with Interactive Star Map */}
              <section className="build-panel constellation-panel">
                <div className="panel-header">
                  <span className="build-panel-label">
                    <Sparkles size={13} /> CONSTELLATIONS
                  </span>
                  <span className="panel-badge">
                    {activeCharacter.constellation ?? 0} / 6 ACTIVATED
                  </span>
                </div>

                {/* Celestial Star Map Sky Atlas */}
                <ConstellationStarMap
                  constellations={activeCharacter.constellations}
                  elementColor={elementTheme.accent}
                  elementGlow={elementTheme.glow}
                />
              </section>
            </div>
          </section>
        </div>
      </main>

      {/* Showcase Footer */}
      <footer className="profile-footer max-w-[1440px] mx-auto px-4 sm:px-8 py-6 border-t border-white/10 flex flex-wrap items-center justify-between text-[9px] text-[#788496] tracking-wider">
        <span className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#c8a96e]" /> Authenticated Public Showcase Data Only
        </span>
        <span>ASTRA ARCHIVE · UNOFFICIAL FAN SHOWCASE · NOT AFFILIATED WITH HOYOVERSE</span>
      </footer>
    </div>
  );
}
