"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface EquipmentArtworkProps {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  rarity?: number;
  kind: "weapon" | "artifact";
}

export default function EquipmentArtwork({
  src,
  fallbackSrc,
  alt,
  rarity = 5,
  kind,
}: EquipmentArtworkProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageSrc = sourceIndex === 0 ? (src || fallbackSrc) : sourceIndex === 1 ? fallbackSrc : undefined;

  return (
    <div className={`equipment-artwork equipment-artwork-${kind} rarity-${Math.min(Math.max(rarity, 1), 5)}`}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          unoptimized
          sizes={kind === "weapon" ? "200px" : "120px"}
          quality={85}
          className="equipment-artwork-image"
          onError={() => setSourceIndex((current) => (current === 0 && src && fallbackSrc ? 1 : 2))}
        />
      ) : (
        <span className="equipment-artwork-fallback" aria-hidden="true">
          {kind === "weapon" ? "⚔" : "✧"}
        </span>
      )}
      <span className="equipment-artwork-rarity" aria-label={`${rarity}-star rarity`}>
        {"★".repeat(Math.min(Math.max(rarity, 1), 5))}
      </span>
    </div>
  );
}
