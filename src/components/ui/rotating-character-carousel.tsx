"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sliders } from "lucide-react";
import CircularCarousel from "./circular-carousel";
import CarouselCustomizer, {
  CarouselCustomConfig,
  DEFAULT_CAROUSEL_CONFIG,
} from "./carousel-customizer";
import type { ShowcaseCharacter } from "@/lib/types";

interface RotatingCharacterCarouselProps {
  characters: ShowcaseCharacter[];
  activeCharacterId: number;
  onSelectCharacter: (character: ShowcaseCharacter) => void;
}

const STORAGE_KEY = "genshin_carousel_custom_config_v6";

const ELEMENT_COLORS: Record<string, { accent: string; bg: string; glow: string }> = {
  Cryo: { accent: "#9ed8e9", bg: "rgba(158,216,233,.12)", glow: "rgba(158,216,233,.38)" },
  Hydro: { accent: "#78bce9", bg: "rgba(120,188,233,.12)", glow: "rgba(120,188,233,.38)" },
  Pyro: { accent: "#ef866d", bg: "rgba(239,134,109,.12)", glow: "rgba(239,134,109,.38)" },
  Electro: { accent: "#b99be9", bg: "rgba(185,155,233,.12)", glow: "rgba(185,155,233,.38)" },
  Anemo: { accent: "#82d0b4", bg: "rgba(130,208,180,.12)", glow: "rgba(130,208,180,.38)" },
  Geo: { accent: "#e5bc75", bg: "rgba(229,188,117,.12)", glow: "rgba(229,188,117,.38)" },
  Dendro: { accent: "#a8c878", bg: "rgba(168,200,120,.12)", glow: "rgba(168,200,120,.38)" },
};

export default function RotatingCharacterCarousel({
  characters,
  activeCharacterId,
  onSelectCharacter,
}: RotatingCharacterCarouselProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [config, setConfig] = useState<CarouselCustomConfig>(DEFAULT_CAROUSEL_CONFIG);

  // Initialize from localStorage if saved
  useEffect(() => {
    try {
      localStorage.removeItem("genshin_carousel_custom_config_v1");
      localStorage.removeItem("genshin_carousel_custom_config_v2");
      localStorage.removeItem("genshin_carousel_custom_config_v3");
      localStorage.removeItem("genshin_carousel_custom_config_v4");
      localStorage.removeItem("genshin_carousel_custom_config_v5");
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.autoplay === "none") parsed.autoplay = "drift";
        if (!parsed.speed || parsed.speed < 2) parsed.speed = 7;
        requestAnimationFrame(() => {
          setConfig((prev) => ({ ...prev, ...parsed }));
        });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage when changed
  const handleConfigChange = (newConfig: CarouselCustomConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // Ignore storage errors
    }
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CAROUSEL_CONFIG);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeChar =
    characters.find((c) => c.id === activeCharacterId) || characters[0];
  const activeElement = ELEMENT_COLORS[activeChar?.element || ""] ?? {
    accent: "#c8a96e",
    bg: "rgba(200,169,110,.12)",
    glow: "rgba(200,169,110,.35)",
  };

  // Prepare items for CircularCarousel from react-bits
  const items = useMemo(() => {
    return characters.map((char) => ({
      src: char.image || char.imageFallback || "",
      fallback: char.imageFallback || char.image || "",
      alt: char.name,
      title: char.name,
      subtitle: char.element || "Character",
      character: char,
      id: char.id,
    }));
  }, [characters]);

  // Responsive adjusted card width and gap
  const effectiveCardWidth = isMobile
    ? Math.min(config.cardWidth, 240)
    : config.cardWidth;
  const effectiveGap = isMobile ? Math.min(config.gap, 45) : config.gap;

  return (
    <div className="rotating-carousel-container relative w-full overflow-hidden py-6 select-none">
      {/* Carousel Top Controls & Active Indicator */}
      <div className="carousel-header mb-4 flex flex-wrap items-center justify-between gap-4 px-4 sm:px-8">
        <div className="carousel-title-wrap flex items-center gap-3">
          <div className="pulse-indicator" style={{ backgroundColor: activeElement.accent }} />
          <div>
            <div className="flex items-center gap-2">
              <span className="carousel-eyebrow text-[9px] font-bold tracking-[0.2em] text-[#c8a96e]">
                CELESTIAL ROSTER
              </span>
              <span className="text-[9px] font-mono text-[#788496]">({characters.length} CHARACTERS)</span>
            </div>
            <h3 className="carousel-heading text-lg font-medium tracking-tight text-[#edf0f5]">
              Interactive 3D Showcase Deck
            </h3>
          </div>
        </div>

        {/* Right Side Customize Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCustomizer((prev) => !prev)}
            className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-300 shadow-sm ${
              showCustomizer
                ? "bg-[#c8a96e]/20 border-[#c8a96e] text-[#f2e2be] shadow-[0_0_16px_rgba(200,169,110,0.3)] ring-1 ring-[#c8a96e]/40 backdrop-blur-xl"
                : "bg-white/[0.04] backdrop-blur-xl border-white/[0.08] text-[#b0b7c6] hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
            }`}
            title="Modify 3D Circular Carousel settings"
          >
            <Sliders className="w-3.5 h-3.5 text-[#c8a96e] transition-transform duration-300 group-hover:rotate-90" />
            <span>Customize</span>
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                showCustomizer ? "bg-[#c8a96e] animate-pulse" : "bg-[#717688]"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Live Customizer Panel */}
      {showCustomizer && (
        <div className="px-4 sm:px-8">
          <CarouselCustomizer
            config={config}
            onChange={handleConfigChange}
            onReset={handleResetConfig}
            onClose={() => setShowCustomizer(false)}
          />
        </div>
      )}

      {/* 3D Panorama CircularCarousel Stage */}
      <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[640px] flex items-center justify-center">
        {/* Ambient Element Backdrop Glow */}
        <div
          className="carousel-ambient-stage absolute inset-x-0 top-1/2 -translate-y-1/2 h-[340px] w-full max-w-4xl mx-auto rounded-full blur-[100px] pointer-events-none transition-all duration-700 opacity-40"
          style={{ background: activeElement.glow }}
        />

        <div className="w-full h-full relative z-10">
          <CircularCarousel
            items={items}
            preset={config.preset}
            intro={config.intro}
            cardWidth={effectiveCardWidth}
            aspectRatio={config.aspect}
            gap={effectiveGap}
            curve={config.curve}
            tilt={config.tilt}
            perspective={config.perspective}
            autoplay={config.autoplay}
            speed={config.speed}
            interval={config.interval}
            direction={config.direction}
            bounceInterval={config.bounceInterval ?? 8}
            draggable={config.draggable}
            momentum={config.momentum}
            snap={config.snap}
            pauseOnHover={config.pauseOnHover}
            focusOnClick={config.focusOnClick}
            parallax={config.parallax}
            stretch={config.stretch}
            depthFade={config.depthFade}
            fadeColor={config.fadeColor}
            innerShade={config.innerShade}
            cornerRadius={config.cornerRadius}
            captions={config.captions}
            onItemClick={(item) => {
              const char = item?.character as ShowcaseCharacter | undefined;
              if (char) {
                onSelectCharacter(char);
              }
            }}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Quick Jump Character Thumbnails Bar */}
      <div className="carousel-thumbnails-bar mt-6 flex items-center justify-center gap-2 px-4 overflow-x-auto scrollbar-none">
        {characters.map((c) => {
          const isActive = c.id === activeCharacterId;
          const cElem = ELEMENT_COLORS[c.element || ""] ?? { accent: "#c8a96e" };
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCharacter(c)}
              className={`thumb-nav-btn relative flex items-center gap-2 px-3 py-1.5 rounded border transition-all duration-200 text-xs ${
                isActive
                  ? "bg-[#c8a96e]/20 border-[#c8a96e] text-[#f2e2be] shadow-[0_0_12px_rgba(200,169,110,0.25)] font-semibold"
                  : "bg-white/5 border-white/10 text-[#8c97a7] hover:border-white/25 hover:text-white"
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cElem.accent }}
              />
              <span className="truncate max-w-[85px] sm:max-w-none">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
