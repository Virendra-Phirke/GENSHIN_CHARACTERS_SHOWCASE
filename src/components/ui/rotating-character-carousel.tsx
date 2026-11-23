"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
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
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = characters.findIndex((c) => c.id === activeCharacterId);
    return idx >= 0 ? idx : 0;
  });

  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Sync index when activeCharacterId prop changes externally
  useEffect(() => {
    const idx = characters.findIndex((c) => c.id === activeCharacterId);
    if (idx >= 0) {
      setCurrentIndex(idx);
    }
  }, [activeCharacterId, characters]);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNext = useCallback(() => {
    if (!characters.length) return;
    setCurrentIndex((prev) => (prev + 1) % characters.length);
  }, [characters.length]);

  const handlePrev = useCallback(() => {
    if (!characters.length) return;
    setCurrentIndex((prev) => (prev - 1 + characters.length) % characters.length);
  }, [characters.length]);

  const selectCharacterByIndex = useCallback(
    (index: number) => {
      if (!characters.length) return;
      const normalizedIndex = (index + characters.length) % characters.length;
      setCurrentIndex(normalizedIndex);
      const target = characters[normalizedIndex];
      if (target) {
        onSelectCharacter(target);
      }
    },
    [characters, onSelectCharacter]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Smooth continuous right-to-left auto-rotation
  useEffect(() => {
    if (!isAutoPlaying || characters.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 2800);
    return () => clearInterval(interval);
  }, [isAutoPlaying, characters.length, handleNext]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
    touchStartXRef.current = null;
  };

  const activeChar = characters[currentIndex] ?? characters[0];
  const activeElement = ELEMENT_COLORS[activeChar?.element || ""] ?? {
    accent: "#c8a96e",
    bg: "rgba(200,169,110,.12)",
    glow: "rgba(200,169,110,.35)",
  };

  const maxVisibleOffset = Math.min(3, Math.floor((characters.length - 1) / 2));

  return (
    <div
      className="rotating-carousel-container relative w-full overflow-hidden py-8 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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

        {/* Auto-Play and Chevrons */}
        <div className="carousel-controls flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`carousel-ctrl-btn p-2 rounded-full border transition-colors ${
              isAutoPlaying
                ? "border-[#c8a96e] bg-[#c8a96e]/15 text-[#f3dfbd]"
                : "border-white/10 bg-white/5 text-[#9ba6b6] hover:border-white/20 hover:text-white"
            }`}
            title={isAutoPlaying ? "Pause auto-rotation" : "Enable right-to-left rotation"}
            aria-label={isAutoPlaying ? "Pause auto-rotation" : "Enable right-to-left rotation"}
          >
            {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button
            type="button"
            onClick={() => {
              const prev = (currentIndex - 1 + characters.length) % characters.length;
              selectCharacterByIndex(prev);
            }}
            className="carousel-ctrl-btn p-2 rounded-full border border-white/10 bg-white/5 text-[#d1d8e2] hover:border-[#c8a96e] hover:text-[#f3dfbd] transition-colors"
            title="Previous character (Left Arrow)"
            aria-label="Previous character"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="carousel-counter text-xs font-mono text-[#8a96a7] px-1">
            {String(currentIndex + 1).padStart(2, "0")} / {String(characters.length).padStart(2, "0")}
          </span>

          <button
            type="button"
            onClick={() => {
              const next = (currentIndex + 1) % characters.length;
              selectCharacterByIndex(next);
            }}
            className="carousel-ctrl-btn p-2 rounded-full border border-white/10 bg-white/5 text-[#d1d8e2] hover:border-[#c8a96e] hover:text-[#f3dfbd] transition-colors"
            title="Next character (Right Arrow)"
            aria-label="Next character"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 3D Rotating Cards Stage */}
      <div className="carousel-3d-stage relative h-[380px] sm:h-[440px] w-full flex items-center justify-center">
        {/* Ambient Element Backdrop */}
        <div
          className="carousel-ambient-stage absolute inset-x-0 top-1/2 -translate-y-1/2 h-[320px] w-full max-w-4xl mx-auto rounded-full blur-[85px] pointer-events-none transition-all duration-700 opacity-45"
          style={{ background: activeElement.glow }}
        />

        {characters.map((char, index) => {
          const total = characters.length;
          let offset = index - currentIndex;
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          // Only render visible cards within max radius to avoid wrap flips
          const isVisible = Math.abs(offset) <= maxVisibleOffset;
          if (!isVisible) return null;

          const isCurrent = offset === 0;
          const charElement = ELEMENT_COLORS[char.element || ""] ?? {
            accent: "#c8a96e",
            bg: "rgba(200,169,110,.12)",
            glow: "rgba(200,169,110,.35)",
          };

          // 3D Transform calculations for smooth right-to-left rotation
          const rotateY = offset * 28;
          const translateX = offset * (isMobile ? 120 : 190);
          const translateZ = -Math.abs(offset) * 130;
          const scale = Math.max(0.66, 1 - Math.abs(offset) * 0.12);
          const opacity = isCurrent
            ? 1
            : Math.max(0.25, 1 - Math.abs(offset) * 0.28);
          const zIndex = 25 - Math.abs(offset);

          return (
            <div
              key={char.id}
              className={`carousel-card-item absolute cursor-pointer rounded-lg overflow-hidden select-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                isCurrent ? "is-active-card ring-2 ring-[#c8a96e]/70" : "hover:brightness-110"
              }`}
              style={{
                width: isMobile ? "210px" : "270px",
                height: isMobile ? "320px" : "390px",
                zIndex,
                transform: `perspective(1100px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                boxShadow: isCurrent
                  ? `0 24px 50px rgba(0,0,0,0.65), 0 0 35px ${charElement.glow}`
                  : "0 14px 30px rgba(0,0,0,0.5)",
              }}
              onClick={() => selectCharacterByIndex(index)}
            >
              {/* Character Card Background Image */}
              <div className="relative w-full h-full bg-[#111722] overflow-hidden">
                {char.image ? (
                  <Image
                    src={char.image}
                    alt={char.name}
                    fill
                    unoptimized
                    sizes="270px"
                    quality={85}
                    priority={isCurrent || Math.abs(offset) <= 1}
                    className="object-cover object-top transition-transform duration-500 ease-out hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-4xl text-[#c8a96e]/30">✦</div>
                )}

                {/* Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e141f] via-[#0e141f]/35 to-transparent pointer-events-none" />

                {/* Card Bottom - Only Character Name */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-10 bg-gradient-to-t from-[#0b0f16] via-[#0b0f16]/90 to-transparent">
                  <h4 className="text-base sm:text-lg font-semibold text-[#f1f3f7] tracking-tight truncate text-center">
                    {char.name}
                  </h4>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Jump Character Thumbnails Bar */}
      <div className="carousel-thumbnails-bar mt-6 flex items-center justify-center gap-2 px-4 overflow-x-auto scrollbar-none">
        {characters.map((c, i) => {
          const isActive = i === currentIndex;
          const cElem = ELEMENT_COLORS[c.element || ""] ?? { accent: "#c8a96e" };
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCharacterByIndex(i)}
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
