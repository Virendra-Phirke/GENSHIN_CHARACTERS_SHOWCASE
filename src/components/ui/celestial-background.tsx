"use client";

import { useEffect, useRef } from "react";

export default function CelestialBackground({ elementAccent }: { elementAccent?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate celestial stardust particles
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 65);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      speedY: Math.random() * -0.35 - 0.08,
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.65 + 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    let tick = 0;
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity =
          p.opacity * (0.6 + 0.4 * Math.sin(tick * p.pulseSpeed + p.pulseOffset));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(215, 225, 245, ${currentOpacity.toFixed(3)})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = elementAccent || "rgba(200, 169, 110, 0.4)";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [elementAccent]);

  return (
    <canvas
      ref={canvasRef}
      className="celestial-canvas pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
