"use client";

import { useEffect, useRef } from "react";

interface CelestialBackgroundProps {
  elementAccent?: string;
  element?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
  rotation: number;
  vRot: number;
  color: string;
  secondaryColor?: string;
  isSpecial: boolean;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobbleOffset: number;
  life: number;
  maxLife: number;
}

export default function CelestialBackground({
  elementAccent = "#ef866d",
  element = "Pyro",
}: CelestialBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
    };
    window.addEventListener("resize", handleResize);

    // Mouse tracking for fluid physical disturbance
    const mouse = { x: -9999, y: -9999, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX * dpr;
      mouse.y = e.clientY * dpr;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const normElement = (element || "pyro").toLowerCase().trim();

    // Palettes per element
    const PALETTES: Record<string, { primary: string[]; glow: string }> = {
      pyro: {
        primary: ["#ffedd5", "#fde047", "#fb923c", "#f97316", "#ef4444", "#dc2626"],
        glow: "rgba(249, 115, 22, 0.45)",
      },
      hydro: {
        primary: ["#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0284c7"],
        glow: "rgba(56, 189, 248, 0.4)",
      },
      electro: {
        primary: ["#faf5ff", "#f3e8ff", "#e9d5ff", "#c084fc", "#a855f7", "#7e22ce"],
        glow: "rgba(168, 85, 247, 0.5)",
      },
      anemo: {
        primary: ["#f0fdf4", "#ecfdf5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981"],
        glow: "rgba(52, 211, 153, 0.4)",
      },
      cryo: {
        primary: ["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#bfdbfe", "#93c5fd"],
        glow: "rgba(147, 197, 253, 0.45)",
      },
      dendro: {
        primary: ["#f7fee7", "#ecfccb", "#d9f99d", "#bef264", "#a3e635", "#65a30d"],
        glow: "rgba(163, 230, 53, 0.4)",
      },
      geo: {
        primary: ["#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#f59e0b", "#d97706"],
        glow: "rgba(245, 158, 11, 0.45)",
      },
    };

    const palette = PALETTES[normElement] || PALETTES.pyro;

    // Create element-specific particle
    const spawnParticle = (initialY?: number): Particle => {
      const isSpecial = Math.random() < 0.42;
      const baseSize = isSpecial
        ? Math.random() * 3.5 + 2.5
        : Math.random() * 1.8 + 0.8;

      let vx = 0;
      let vy = 0;
      let wobbleSpeed = Math.random() * 0.03 + 0.01;
      let wobbleAmp = Math.random() * 1.5 + 0.5;

      switch (normElement) {
        case "pyro":
          // Ascending embers with flicker
          vy = -(Math.random() * 0.85 + 0.35) * dpr;
          vx = (Math.random() - 0.5) * 0.4 * dpr;
          wobbleSpeed = Math.random() * 0.05 + 0.02;
          wobbleAmp = Math.random() * 1.8 + 0.5;
          break;
        case "hydro":
          // Floating buoyant bubbles with wave sway
          vy = -(Math.random() * 0.5 + 0.2) * dpr;
          vx = (Math.random() - 0.5) * 0.25 * dpr;
          wobbleSpeed = Math.random() * 0.025 + 0.01;
          wobbleAmp = Math.random() * 2.2 + 0.8;
          break;
        case "electro":
          // Fast erratic lightning particles
          vy = (Math.random() - 0.5) * 0.9 * dpr;
          vx = (Math.random() - 0.5) * 0.9 * dpr;
          wobbleSpeed = Math.random() * 0.08 + 0.04;
          wobbleAmp = Math.random() * 3.0 + 1.0;
          break;
        case "anemo":
          // Drifting wind currents from left to right
          vx = (Math.random() * 0.9 + 0.4) * dpr;
          vy = (Math.random() - 0.5) * 0.35 * dpr;
          wobbleSpeed = Math.random() * 0.03 + 0.01;
          wobbleAmp = Math.random() * 2.0 + 0.8;
          break;
        case "cryo":
          // Falling frost crystals
          vy = (Math.random() * 0.55 + 0.2) * dpr;
          vx = (Math.random() - 0.5) * 0.3 * dpr;
          wobbleSpeed = Math.random() * 0.02 + 0.008;
          wobbleAmp = Math.random() * 1.6 + 0.6;
          break;
        case "dendro":
          // Swirling leaf and spore orbital motion
          vy = -(Math.random() * 0.4 + 0.15) * dpr;
          vx = (Math.random() - 0.5) * 0.5 * dpr;
          wobbleSpeed = Math.random() * 0.02 + 0.01;
          wobbleAmp = Math.random() * 2.5 + 1.0;
          break;
        case "geo":
          // Heavy levitating amber prisms
          vy = -(Math.random() * 0.35 + 0.1) * dpr;
          vx = (Math.random() - 0.5) * 0.2 * dpr;
          wobbleSpeed = Math.random() * 0.015 + 0.005;
          wobbleAmp = Math.random() * 1.0 + 0.3;
          break;
        default:
          vy = -(Math.random() * 0.4 + 0.1) * dpr;
          vx = (Math.random() - 0.5) * 0.2 * dpr;
          break;
      }

      const color = palette.primary[Math.floor(Math.random() * palette.primary.length)];
      const maxLife = Math.floor(Math.random() * 300 + 180);

      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : Math.random() * height,
        vx,
        vy,
        size: baseSize * dpr,
        baseSize: baseSize * dpr,
        alpha: Math.random() * 0.5 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.25,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.03,
        color,
        isSpecial,
        wobbleSpeed,
        wobbleAmp,
        wobbleOffset: Math.random() * Math.PI * 2,
        life: Math.floor(Math.random() * maxLife),
        maxLife,
      };
    };

    // Scaled particle density based on viewport size
    const particleCount = Math.min(Math.floor((window.innerWidth * dpr) / 36), 65);
    const particles: Particle[] = Array.from({ length: particleCount }, () => spawnParticle());

    let tick = 0;

    // =========================================================================
    // ELEMENTAL SHAPE DRAWING HELPERS
    // =========================================================================

    // 1. Pyro Ember Spark (tapered diamond flame)
    const drawPyroSpark = (p: Particle, currentAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 12 * dpr;
      ctx.globalAlpha = currentAlpha;

      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.6);
      ctx.quadraticCurveTo(s * 0.7, 0, 0, s * 0.8);
      ctx.quadraticCurveTo(-s * 0.7, 0, 0, -s * 1.6);
      ctx.fill();

      // Bright inner core
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 4 * dpr;
      ctx.beginPath();
      ctx.arc(0, -s * 0.2, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // 2. Hydro Bubble (translucent bubble with specular highlight)
    const drawHydroBubble = (p: Particle, currentAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = currentAlpha;

      const r = p.size * 1.5;

      // Outer delicate iridescent ring
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1 * dpr;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 8 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Soft water tint
      ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
      ctx.fill();

      // Specular highlight crescent at top-left
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.shadowBlur = 2 * dpr;
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.35, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 3. Electro Spark & Plasma Fragment
    const drawElectroSpark = (p: Particle, currentAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = currentAlpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 14 * dpr;

      const s = p.size * 1.3;
      // 4-pointed sharp electric star
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(ang) * s * 1.8, Math.sin(ang) * s * 1.8);
        const innerAng = ang + Math.PI / 4;
        ctx.lineTo(Math.cos(innerAng) * (s * 0.35), Math.sin(innerAng) * (s * 0.35));
      }
      ctx.closePath();
      ctx.fill();

      // Hot white center
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 4 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 4. Anemo Wind Streak & Dandelion Seed
    const drawAnemoBreeze = (p: Particle, currentAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = currentAlpha;
      ctx.strokeStyle = p.color;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 8 * dpr;
      ctx.lineWidth = 1 * dpr;

      const len = p.size * 2.2;
      // Curved wind slipstream filament
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.quadraticCurveTo(0, -len * 0.35, len, 0);
      ctx.stroke();

      // Gentle dandelion fluff core
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 5. Cryo Snowflake (6-pointed hexagonal crystal)
    const drawCryoSnowflake = (p: Particle, currentAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = currentAlpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 0.8 * dpr;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 10 * dpr;

      const r = p.size * 1.6;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const cos = Math.cos(ang);
        const sin = Math.sin(ang);
        // Main stem
        ctx.moveTo(0, 0);
        ctx.lineTo(cos * r, sin * r);

        // Branching crossbars
        const midR = r * 0.55;
        const branchLen = r * 0.28;
        const perpX = -sin * branchLen;
        const perpY = cos * branchLen;
        ctx.moveTo(cos * midR - perpX, sin * midR - perpY);
        ctx.lineTo(cos * midR + perpX, sin * midR + perpY);
      }
      ctx.stroke();

      // Diamond core
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 3 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 6. Dendro Tumbling Leaf (organic 3D tumbling leaf)
    const drawDendroLeaf = (p: Particle, currentAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      // Horizontal perspective tumble
      const scaleX = Math.cos(p.rotation * 1.8);
      ctx.scale(scaleX, 1);

      ctx.globalAlpha = currentAlpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 9 * dpr;

      const s = p.size * 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.5);
      ctx.quadraticCurveTo(s * 0.8, 0, 0, s * 1.5);
      ctx.quadraticCurveTo(-s * 0.8, 0, 0, -s * 1.5);
      ctx.fill();

      // Subtle central leaf vein
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 0.6 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.2);
      ctx.lineTo(0, s * 1.2);
      ctx.stroke();

      ctx.restore();
    };

    // 7. Geo Amber Prism (faceted levitating diamond)
    const drawGeoPrism = (p: Particle, currentAlpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = currentAlpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 10 * dpr;

      const s = p.size * 1.3;
      // Diamond polygon
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.5);
      ctx.lineTo(s * 1.0, 0);
      ctx.lineTo(0, s * 1.5);
      ctx.lineTo(-s * 1.0, 0);
      ctx.closePath();
      ctx.fill();

      // Inner facet reflection
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 0.7 * dpr;
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, 0);
      ctx.lineTo(0, -s * 0.8);
      ctx.lineTo(s * 0.5, 0);
      ctx.stroke();

      ctx.restore();
    };

    // =========================================================================
    // MAIN RENDER LOOP
    // =========================================================================
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // Connect Electro lightning arcs between close particles
      if (normElement === "electro" && tick % 2 === 0) {
        ctx.save();
        ctx.lineWidth = 0.8 * dpr;
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 10 * dpr;
        for (let i = 0; i < particles.length; i++) {
          if (!particles[i].isSpecial) continue;
          for (let j = i + 1; j < particles.length; j++) {
            if (!particles[j].isSpecial) continue;
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < 75 * dpr) {
              const alpha = (1 - dist / (75 * dpr)) * 0.6;
              ctx.strokeStyle = `rgba(192, 132, 252, ${alpha})`;
              // Jagged lightning segment
              const midX = (particles[i].x + particles[j].x) / 2 + (Math.random() - 0.5) * 12 * dpr;
              const midY = (particles[i].y + particles[j].y) / 2 + (Math.random() - 0.5) * 12 * dpr;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(midX, midY);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life += 1;

        // Life cycle respawn
        if (p.life > p.maxLife) {
          particles[i] = spawnParticle(
            normElement === "cryo" ? -15 : height + 15
          );
          continue;
        }

        // Apply physical motion
        p.rotation += p.vRot;

        // Sinusoidal wobble
        const wobble = Math.sin(tick * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp * dpr;
        if (normElement === "anemo") {
          p.x += p.vx;
          p.y += p.vy + wobble;
        } else {
          p.x += p.vx + wobble;
          p.y += p.vy;
        }

        // Interactive mouse disturbance
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 120 * dpr;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 3.5 * dpr;
            if (normElement === "electro") {
              // Electro sparks arc toward cursor
              p.x -= (dx / dist) * force * 0.8;
              p.y -= (dy / dist) * force * 0.8;
            } else {
              // Other elements gently repel/swirl
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }
        }

        // Wrap boundaries
        if (p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        } else if (p.y > height + 30) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -30) p.x = width + 20;
        else if (p.x > width + 30) p.x = -20;

        // Pulsing opacity with life fade in/out
        const lifeFraction = p.life / p.maxLife;
        const lifeAlpha =
          lifeFraction < 0.15
            ? lifeFraction / 0.15
            : lifeFraction > 0.8
            ? (1 - lifeFraction) / 0.2
            : 1;

        const pulse = 0.7 + 0.3 * Math.sin(tick * p.pulseSpeed + p.pulseOffset);
        const currentAlpha = Math.min(Math.max(p.baseAlpha * pulse * lifeAlpha, 0), 1);

        // Draw Element Specific Shapes
        if (p.isSpecial) {
          switch (normElement) {
            case "pyro":
              drawPyroSpark(p, currentAlpha);
              break;
            case "hydro":
              drawHydroBubble(p, currentAlpha);
              break;
            case "electro":
              drawElectroSpark(p, currentAlpha);
              break;
            case "anemo":
              drawAnemoBreeze(p, currentAlpha);
              break;
            case "cryo":
              drawCryoSnowflake(p, currentAlpha);
              break;
            case "dendro":
              drawDendroLeaf(p, currentAlpha);
              break;
            case "geo":
              drawGeoPrism(p, currentAlpha);
              break;
            default:
              drawPyroSpark(p, currentAlpha);
              break;
          }
        } else {
          // Ambient soft glowing stardust mote
          ctx.save();
          ctx.globalAlpha = currentAlpha * 0.85;
          ctx.fillStyle = p.color;
          ctx.shadowColor = palette.glow;
          ctx.shadowBlur = 6 * dpr;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    // Pause when tab is hidden to save GPU/CPU
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animId);
    };
  }, [elementAccent, element]);

  return (
    <canvas
      ref={canvasRef}
      className="celestial-canvas pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
