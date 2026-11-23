"use client";

import React, { useRef, useState } from "react";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  holographic?: boolean;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  holographic = false,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glint, setGlint] = useState({ x: 50, y: 50, opacity: 0 });

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
    setGlint({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.16,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlint((prev) => ({ ...prev, opacity: 0 }));
  };

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

      {/* Feature 9: Holographic Foil Card Hover Shimmer on Artifacts */}
      {holographic && (
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300 overflow-hidden"
          style={{
            opacity: glint.opacity ? 0.35 : 0,
            background: `linear-gradient(${115 + tilt.y * 3}deg, transparent 15%, rgba(255, 0, 128, 0.22) 30%, rgba(0, 230, 255, 0.25) 50%, rgba(255, 230, 0, 0.22) 70%, transparent 85%)`,
            mixBlendMode: "color-dodge",
          }}
        />
      )}
    </div>
  );
}
