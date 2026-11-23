"use client";

import { useEffect, useRef } from "react";

export default function CelestialBackground({
  elementAccent,
  element = "Cryo",
}: {
  elementAccent?: string;
  element?: string;
}) {
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

    // Starlight particles
    const particleCount = Math.min(Math.floor(window.innerWidth / 18), 75);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedY: Math.random() * -0.38 - 0.08,
      speedX: (Math.random() - 0.5) * 0.18,
      opacity: Math.random() * 0.65 + 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2,
      isElementParticle: Math.random() > 0.65,
    }));

    let tick = 0;
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around
        if (p.y < -12) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -12) p.x = width + 10;
        if (p.x > width + 12) p.x = -10;

        const currentOpacity =
          p.opacity * (0.6 + 0.4 * Math.sin(tick * p.pulseSpeed + p.pulseOffset));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.isElementParticle && elementAccent) {
          ctx.fillStyle = elementAccent;
          ctx.shadowBlur = 10;
          ctx.shadowColor = elementAccent;
        } else {
          ctx.fillStyle = `rgba(220, 230, 250, ${currentOpacity.toFixed(3)})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = elementAccent || "rgba(200, 169, 110, 0.4)";
        }
        ctx.fill();

        // For Cryo: draw delicate starlight cross on larger particles
        if (element === "Cryo" && p.size > 1.8 && p.isElementParticle) {
          ctx.strokeStyle = "rgba(180, 225, 245, 0.4)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x - 3, p.y);
          ctx.lineTo(p.x + 3, p.y);
          ctx.moveTo(p.x, p.y - 3);
          ctx.lineTo(p.x, p.y + 3);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
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
