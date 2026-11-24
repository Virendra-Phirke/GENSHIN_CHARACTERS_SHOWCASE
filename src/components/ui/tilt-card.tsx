"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  holographic?: boolean;
  attractRadius?: number; // px proximity gravity distance
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  holographic = false,
  attractRadius = 0,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glint, setGlint] = useState({ x: 50, y: 50, opacity: 0 });
  const [hovering, setHovering] = useState(false);
  const [foilPos, setFoilPos] = useState({ x: 50, y: 50 });
  const attractFrameRef = useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    setTilt({ x: rotateX, y: rotateY });
    setGlint({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.18 });
    setFoilPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlint((prev) => ({ ...prev, opacity: 0 }));
    setHovering(false);
  };

  // #8: Proximity gravity tilt — passive global mousemove listener
  const handleGlobalMove = useCallback(
    (e: MouseEvent) => {
      if (!cardRef.current || hovering || attractRadius <= 0) return;
      cancelAnimationFrame(attractFrameRef.current);
      attractFrameRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < attractRadius && dist > 0) {
          const strength = (1 - dist / attractRadius) * 0.4; // max 40% of maxTilt
          const rotateX = (-dy / attractRadius) * maxTilt * strength;
          const rotateY = (dx / attractRadius) * maxTilt * strength;
          setTilt({ x: rotateX, y: rotateY });
        } else {
          setTilt({ x: 0, y: 0 });
        }
      });
    },
    [hovering, attractRadius, maxTilt]
  );

  useEffect(() => {
    if (attractRadius <= 0) return;
    window.addEventListener("mousemove", handleGlobalMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      cancelAnimationFrame(attractFrameRef.current);
    };
  }, [handleGlobalMove, attractRadius]);

  // Hue rotation driven by tilt for holographic foil
  const hueRotate = tilt.y * 18;
  const foilAngle = 115 + tilt.y * 4 + tilt.x * 2;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card-wrapper relative transition-transform duration-200 ease-out ${className}`}
      style={{
        perspective: "1000px",
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      {...props}
    >
      {children}

      {/* Dynamic Cursor Light Glint Sheen */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: glint.opacity,
          background: `radial-gradient(circle at ${glint.x}% ${glint.y}%, rgba(255, 255, 255, 0.45), transparent 60%)`,
        }}
      />

      {/* #9: Akasha Holographic Foil Shader — multi-layer, hue-reactive */}
      {holographic && (
        <>
          {/* Layer 1: Moving angular foil */}
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] overflow-hidden"
            style={{
              opacity: hovering ? 0.42 : 0,
              transition: "opacity 300ms ease",
              background: `linear-gradient(${foilAngle}deg,
                transparent 10%,
                rgba(255, 0, 128, 0.25) 25%,
                rgba(0, 230, 255, 0.28) 42%,
                rgba(140, 255, 100, 0.22) 58%,
                rgba(255, 200, 0, 0.25) 74%,
                transparent 90%)`,
              mixBlendMode: "color-dodge",
              filter: `hue-rotate(${hueRotate}deg) saturate(2)`,
            }}
          />
          {/* Layer 2: Radial oil-slick from cursor position */}
          <div
            className="pointer-events-none absolute inset-0 z-21 rounded-[inherit] overflow-hidden"
            style={{
              opacity: hovering ? 0.3 : 0,
              transition: "opacity 300ms ease",
              background: `radial-gradient(ellipse at ${foilPos.x}% ${foilPos.y}%,
                rgba(255,255,255,0.18) 0%,
                rgba(100,200,255,0.15) 20%,
                rgba(255,100,200,0.12) 40%,
                transparent 65%)`,
              mixBlendMode: "screen",
            }}
          />
          {/* Layer 3: Conic shimmer sweep */}
          <div
            className="pointer-events-none absolute inset-0 z-22 rounded-[inherit] overflow-hidden"
            style={{
              opacity: hovering ? 0.18 : 0,
              transition: "opacity 400ms ease",
              background: `conic-gradient(from ${foilAngle}deg at ${foilPos.x}% ${foilPos.y}%,
                transparent 0deg,
                rgba(255,255,255,0.3) 30deg,
                transparent 60deg,
                rgba(100,200,255,0.2) 120deg,
                transparent 150deg,
                rgba(255,100,200,0.2) 210deg,
                transparent 240deg,
                rgba(255,220,100,0.2) 300deg,
                transparent 330deg)`,
              mixBlendMode: "screen",
            }}
          />
        </>
      )}
    </div>
  );
}
