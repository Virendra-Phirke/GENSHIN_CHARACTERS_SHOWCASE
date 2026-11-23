"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Maximize2, X } from "lucide-react";
import type { ShowcaseCharacter } from "@/lib/types";

interface ParallaxHeroArtProps {
  character: ShowcaseCharacter;
  splashSrc: string;
  elementAccent: string;
  elementGlow: string;
  loreQuote: string;
  onImageError?: () => void;
}

// Particle definition for Elemental Burst Disintegration
interface BurstParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

const ELEMENT_PARTICLE_COLORS: Record<string, string[]> = {
  Cryo: ["#c5ecf8", "#9ed8e9", "#e2f6fd", "#72b9d2"],
  Hydro: ["#78bce9", "#3b82f6", "#a5d8ff", "#60a5fa"],
  Pyro: ["#ef866d", "#f97316", "#fca5a5", "#ffedd5"],
  Electro: ["#b99be9", "#a855f7", "#e9d5ff", "#c084fc"],
  Anemo: ["#82d0b4", "#34d399", "#a7f3d0", "#6ee7b7"],
  Geo: ["#e5bc75", "#f59e0b", "#fde68a", "#d97706"],
  Dendro: ["#a8c878", "#84cc16", "#d9f99d", "#4ade80"],
};

export default function ParallaxHeroArt({
  character,
  splashSrc,
  elementAccent,
  elementGlow,
  loreQuote,
  onImageError,
}: ParallaxHeroArtProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const previousCharIdRef = useRef(character.id);

  // ---------------------------------------------------------------------------
  // FEATURE 2: Elemental Burst Particle Disintegration on Character Switch
  // ---------------------------------------------------------------------------
  const triggerBurst = useCallback(() => {
    const palette = ELEMENT_PARTICLE_COLORS[character.element || ""] ?? [
      elementAccent,
      "#ffffff",
      "#f2e2be",
    ];
    const newParticles: BurstParticle[] = Array.from({ length: 36 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 5.5;
      return {
        id: Math.random(),
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1,
        life: 1,
      };
    });
    setBurstParticles(newParticles);
  }, [character.element, elementAccent]);

  useEffect(() => {
    if (previousCharIdRef.current !== character.id) {
      previousCharIdRef.current = character.id;
      triggerBurst();
    }
  }, [character.id, triggerBurst]);

  // Animate burst particles
  useEffect(() => {
    if (!burstParticles.length) return;
    let animId: number;

    const tick = () => {
      setBurstParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.4,
            y: p.y + p.vy * 0.4,
            alpha: p.alpha - 0.024,
            life: p.life - 0.024,
          }))
          .filter((p) => p.life > 0 && p.alpha > 0)
      );
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [burstParticles.length]);

  // ---------------------------------------------------------------------------
  // FEATURE 1: Mouse-Driven 3D Multi-Layer Parallax Artwork
  // ---------------------------------------------------------------------------
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    // Multi-axis tilt calculation
    setTilt({
      x: x * 14, // horizontal tilt deg
      y: -y * 14, // vertical tilt deg
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Keyboard shortcut to close modal
  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalOpen]);

  return (
    <>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="character-hero-art-stage group relative w-full h-full min-h-[460px] sm:min-h-[560px] flex items-center justify-center select-none overflow-visible cursor-pointer"
        style={{ perspective: "1200px" }}
      >
        {/* Layer 1 (Deep Background): Elemental Ambient Mandala & Radiant Aurora */}
        <div
          className="character-hero-ambient-glow pointer-events-none absolute inset-0 rounded-full blur-[110px] transition-transform duration-500 ease-out opacity-45"
          style={{
            background: elementGlow,
            transform: `translate3d(${tilt.x * -0.8}px, ${tilt.y * 0.8}px, -60px) scale(1.08)`,
          }}
          aria-hidden="true"
        />

        {/* Ethereal Sacred Ring Mandala in background */}
        <div
          className="pointer-events-none absolute w-[380px] h-[380px] rounded-full border border-white/10 opacity-30 transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${tilt.x * -0.5}px, ${tilt.y * 0.5}px, -30px) rotate(${tilt.x * 2}deg)`,
            borderColor: `${elementAccent}40`,
          }}
        >
          <div className="absolute inset-4 rounded-full border border-dashed border-white/15" />
        </div>

        {/* Layer 2 (Middle Layer): High-Impact Character Splash Artwork with 3D Tilt */}
        <div
          className="character-hero-art-frame relative w-full h-[460px] sm:h-[560px] max-w-[560px] transition-transform duration-200 ease-out"
          style={{
            transform: `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateZ(25px)`,
            transformStyle: "preserve-3d",
          }}
          onClick={() => setModalOpen(true)}
        >
          {splashSrc ? (
            <Image
              src={splashSrc}
              alt={character.name}
              fill
              priority
              unoptimized
              sizes="(max-width: 900px) 100vw, 55vw"
              quality={90}
              className="character-hero-splash-image object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter transition-all duration-300 group-hover:drop-shadow-[0_25px_45px_rgba(0,0,0,0.95)]"
              onError={onImageError}
            />
          ) : (
            <span className="character-tile-placeholder" aria-hidden="true">
              ✦
            </span>
          )}

          {/* Hover Glint Sheen across character */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.22 : 0,
              background: `radial-gradient(circle at ${50 + tilt.x * 2}% ${
                50 - tilt.y * 2
              }%, rgba(255,255,255,0.7) 0%, transparent 60%)`,
              mixBlendMode: "overlay",
            }}
          />
        </div>

        {/* Layer 3 (Foreground): Floating Elemental Particles & Stardust */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            transform: `translate3d(${tilt.x * 1.6}px, ${tilt.y * -1.6}px, 50px)`,
          }}
        >
          {/* Subtle orbiting stardust sparks */}
          <span
            className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full animate-ping opacity-60"
            style={{ backgroundColor: elementAccent, animationDuration: "3.5s" }}
          />
          <span
            className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full animate-ping opacity-50"
            style={{
              backgroundColor: elementAccent,
              animationDuration: "4.2s",
              animationDelay: "1s",
            }}
          />
          <span
            className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full animate-pulse opacity-75"
            style={{ backgroundColor: "#ffffff" }}
          />
        </div>

        {/* Feature 2: Active Disintegration Burst Particles */}
        {burstParticles.map((p) => (
          <span
            key={p.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.alpha,
              boxShadow: `0 0 10px ${p.color}`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Fullscreen Spotlight Expand Trigger Pill */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setModalOpen(true);
          }}
          className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0b0e16]/80 hover:bg-[#141924] border border-white/10 hover:border-white/25 text-[#c8a96e] hover:text-[#f3e1bf] text-xs font-medium backdrop-blur-md transition-all duration-200 opacity-80 group-hover:opacity-100 shadow-lg"
          title="Open Cinematic Fullscreen Spotlight"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-mono tracking-wider">
            CINEMATIC VIEW
          </span>
        </button>
      </div>

      {/* ---------------------------------------------------------------------------
          FEATURE 3: Cinematic Viewport Fullscreen Spotlight Modal
         --------------------------------------------------------------------------- */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 sm:p-8 animate-in fade-in duration-300 select-none"
          onClick={() => setModalOpen(false)}
        >
          {/* Deep Ambient Aurora Glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30 blur-[140px]"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${elementGlow}, transparent 75%)`,
            }}
          />

          {/* Modal Header Controls */}
          <div
            className="absolute top-6 inset-x-6 sm:inset-x-12 flex items-center justify-between z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full animate-ping"
                style={{ backgroundColor: elementAccent }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#c8a96e] uppercase">
                    ASTRA SPOTLIGHT
                  </span>
                  <span className="text-[10px] text-[#8692a3]">·</span>
                  <span className="text-[10px] font-mono text-[#a2aec1]">
                    {character.element} Archon Tier
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  {character.name}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 text-white/80 hover:text-white transition-colors"
              title="Close Spotlight (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Fullscreen High-Resolution Artwork Stage */}
          <div
            className="relative w-full h-[75vh] sm:h-[82vh] max-w-5xl z-10 flex items-center justify-center pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {splashSrc && (
              <Image
                src={splashSrc}
                alt={character.name}
                fill
                priority
                unoptimized
                sizes="100vw"
                quality={95}
                className="object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-in zoom-in-95 duration-500"
              />
            )}
          </div>

          {/* Lore Quote & Close Helper at Bottom */}
          <div
            className="absolute bottom-6 inset-x-6 flex flex-col items-center justify-center text-center z-50 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="max-w-xl text-xs sm:text-sm text-[#b8c3d4] italic font-serif leading-relaxed px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/5">
              &ldquo;{loreQuote}&rdquo;
            </p>
            <span className="text-[9px] font-mono text-[#6c7686] mt-2 tracking-widest uppercase">
              CLICK ANYWHERE OR PRESS ESC TO RETURN
            </span>
          </div>
        </div>
      )}
    </>
  );
}
