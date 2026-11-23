"use client";

/*
 * From Uiverse.io by musashi-13 - https://uiverse.io/musashi-13/strange-eel-100
 * MIT License, Copyright (c) musashi-13 (Karan Hathwar)
 */

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Pause, Play } from "lucide-react";
import type { ShowcaseCharacter } from "@/lib/types";

interface RotatingCharacterCarouselProps {
  characters: ShowcaseCharacter[];
  activeCharacterId: number;
  onSelectCharacter: (character: ShowcaseCharacter) => void;
}

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
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const total = characters.length;
  const radius = isMobile ? 220 : 320;
  const durationSeconds = 24;

  return (
    <div className="rotating-carousel-container relative w-full overflow-hidden py-8 select-none">
      {/* Carousel Top Controls & Active Indicator */}
      <div className="carousel-header mb-6 flex flex-wrap items-center justify-between gap-4 px-4 sm:px-8">
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

        {/* Play/Pause Toggle */}
        <div className="carousel-controls flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className={`carousel-ctrl-btn p-2 rounded-full border transition-colors ${
              !isPaused
                ? "border-[#c8a96e] bg-[#c8a96e]/15 text-[#f3dfbd]"
                : "border-white/10 bg-white/5 text-[#9ba6b6] hover:border-white/20 hover:text-white"
            }`}
            title={!isPaused ? "Pause 3D rotation" : "Resume 3D rotation"}
            aria-label={!isPaused ? "Pause 3D rotation" : "Resume 3D rotation"}
          >
            {!isPaused ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>

      {/* 3D Rotating Stage - Adapted from Uiverse.io Strange Eel 100 */}
      <div className="card-3d-stage">
        {/* Ambient Element Backdrop Glow */}
        <div
          className="carousel-ambient-stage absolute inset-x-0 top-1/2 -translate-y-1/2 h-[320px] w-full max-w-4xl mx-auto rounded-full blur-[90px] pointer-events-none transition-all duration-700 opacity-40"
          style={{ background: activeElement.glow }}
        />

        <div className={`card-3d ${isPaused ? "is-paused" : ""}`}>
          {characters.map((char, index) => {
            const angle = (index * 360) / total;
            const delay = -((index * durationSeconds) / total);
            const isCurrent = char.id === activeCharacterId;

            return (
              <div
                key={char.id}
                className={`card-3d-card ${isCurrent ? "is-active-card ring-2 ring-[#c8a96e]" : ""}`}
                style={{
                  transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                  animationDelay: `${delay.toFixed(2)}s`,
                }}
                onClick={() => onSelectCharacter(char)}
                title={`Select ${char.name}`}
              >
                {/* Character Card Background Image */}
                <div className="relative w-full h-full bg-[#111722] overflow-hidden">
                  {char.image ? (
                    <Image
                      src={char.image}
                      alt={char.name}
                      fill
                      unoptimized
                      sizes="220px"
                      quality={85}
                      priority={index <= 2}
                      className="object-cover object-top transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-4xl text-[#c8a96e]/30">✦</div>
                  )}

                  {/* Vignette Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f16] via-[#0b0f16]/30 to-transparent pointer-events-none" />

                  {/* Card Bottom - Only Character Name */}
                  <div className="absolute bottom-0 inset-x-0 p-3 z-10 bg-gradient-to-t from-[#0b0f16] via-[#0b0f16]/95 to-transparent">
                    <h4 className="text-sm sm:text-base font-semibold text-[#f1f3f7] tracking-tight truncate text-center">
                      {char.name}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}
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
