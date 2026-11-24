"use client";

import { useEffect, useRef } from "react";

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface CursorTrailProps {
  elementAccent?: string;
}

function hexToHsl(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  if (max === r) return ((60 * ((g - b) / (max - min))) + 360) % 360;
  if (max === g) return 60 * ((b - r) / (max - min)) + 120;
  return 60 * ((r - g) / (max - min)) + 240;
}

export default function CursorTrail({ elementAccent = "#c8a96e" }: CursorTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const rafRef = useRef<number>(0);
  const lastPos = useRef({ x: -999, y: -999 });

  useEffect(() => {
    // Skip on mobile
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const hue = hexToHsl(elementAccent.startsWith("#") ? elementAccent : "#c8a96e");

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) return; // skip tiny micro-moves
      lastPos.current = { x: e.clientX, y: e.clientY };

      const count = Math.min(Math.floor(dist / 6) + 3, 7);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.2 + 0.3;
        motesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed * 0.4,
          vy: Math.sin(angle) * speed * 0.4 - 0.6, // slight upward drift
          life: 1,
          maxLife: 0.55 + Math.random() * 0.45,
          size: Math.random() * 3.5 + 1.2,
          hue: hue + (Math.random() - 0.5) * 30,
        });
      }
      // Cap pool size
      if (motesRef.current.length > 200) {
        motesRef.current.splice(0, motesRef.current.length - 200);
      }
    };

    window.addEventListener("mousemove", onMove);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dt = 1 / 60;
      motesRef.current = motesRef.current.filter((m) => {
        m.life -= dt / m.maxLife;
        m.x += m.vx;
        m.y += m.vy;
        m.vy -= 0.012; // gentle upward acceleration
        m.vx *= 0.97;
        if (m.life <= 0) return false;

        const alpha = Math.pow(m.life, 1.5);
        const r = m.size * m.life;

        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 2.5);
        grad.addColorStop(0, `hsla(${m.hue}, 90%, 75%, ${alpha})`);
        grad.addColorStop(0.5, `hsla(${m.hue}, 80%, 60%, ${alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${m.hue}, 70%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(m.x, m.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        return true;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [elementAccent]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  );
}
