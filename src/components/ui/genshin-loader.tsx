"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const LOADING_MESSAGES = [
  "Connecting to Enka.Network showcase...",
  "Calibrating character combat properties...",
  "Analyzing artifact sets and substat rolls...",
  "Aligning weapon refinement attributes...",
  "Revealing talent tiers and constellations...",
  "Finalizing showcase dossier...",
];

export default function GenshinLoader({ uid = "892583803" }: { uid?: string }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="genshin-loader-container" role="status" aria-live="polite">
      {/* Celestial Ambient Glow */}
      <div className="genshin-loader-halo" aria-hidden="true" />

      {/* Rotating Astrolabe Rings */}
      <div className="astrolabe-spinner">
        {/* Outer Constellation Ring (Clockwise) */}
        <div className="astrolabe-ring ring-outer">
          <span className="ring-node node-1" />
          <span className="ring-node node-2" />
          <span className="ring-node node-3" />
          <span className="ring-node node-4" />
        </div>

        {/* Middle Diamond Orbit (Counter-Clockwise) */}
        <div className="astrolabe-ring ring-middle">
          <span className="middle-diamond" />
          <span className="middle-diamond bottom" />
        </div>

        {/* Inner Golden Wheel (Clockwise) */}
        <div className="astrolabe-ring ring-inner" />

        {/* Central Luminous Starlight Core */}
        <div className="astrolabe-core">
          <div className="core-star">
            <span className="star-axis vertical" />
            <span className="star-axis horizontal" />
            <span className="star-axis diagonal-1" />
            <span className="star-axis diagonal-2" />
          </div>
          <Sparkles className="core-icon" size={16} />
        </div>
      </div>

      {/* Typography and Progress */}
      <div className="loader-copy">
        <div className="loader-brand">
          <span className="brand-dot" />
          <span className="brand-title">A S T R A</span>
          <span className="brand-dot" />
        </div>

        <p className="loader-status-text">{LOADING_MESSAGES[msgIndex]}</p>

        <div className="loader-progress-bar">
          <div className="progress-indicator" />
        </div>

        <span className="loader-uid-tag">AUTHENTICATED PROFILE · UID {uid}</span>
      </div>
    </div>
  );
}
