"use client";

import React, { useState, useEffect } from "react";

interface SectionConstellationNavProps {
  elementColor?: string;
  elementGlow?: string;
}

interface NavNode {
  id: string;
  label: string;
  starCode: string;
}

const SECTIONS: NavNode[] = [
  { id: "section-roster", label: "Celestial Roster", starCode: "α" },
  { id: "section-dossier", label: "Character Dossier", starCode: "β" },
  { id: "section-combat", label: "Combat Attributes", starCode: "γ" },
  { id: "section-weapon", label: "Equipped Weapon", starCode: "δ" },
  { id: "section-artifacts", label: "Artifact Loadout", starCode: "ε" },
  { id: "section-talents", label: "Talents & Stars", starCode: "ζ" },
];

export default function SectionConstellationNav({
  elementColor = "#c8a96e",
  elementGlow = "rgba(200,169,110,0.4)",
}: SectionConstellationNavProps) {
  const [activeSection, setActiveSection] = useState<string>("section-roster");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight * 0.35;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollY >= top) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection);

  return (
    <aside
      aria-label="Section Constellation Navigation"
      className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center select-none"
    >
      <div className="relative flex flex-col items-center gap-7 py-4">
        {/* Continuous Celestial Spine Line */}
        <div className="absolute top-4 bottom-4 w-[1px] bg-white/10 z-0" />

        {/* Dynamic Glowing Filled Starlight Line */}
        <div
          className="absolute top-4 w-[1.5px] transition-all duration-500 ease-out z-0"
          style={{
            height: `${(activeIndex / Math.max(SECTIONS.length - 1, 1)) * 100}%`,
            background: `linear-gradient(to bottom, ${elementColor}, #fff)`,
            boxShadow: `0 0 10px ${elementGlow}`,
          }}
        />

        {/* Constellation Star Nodes */}
        {SECTIONS.map((sec, idx) => {
          const isActive = sec.id === activeSection;
          const isPassed = idx <= activeIndex;
          const isHovered = hoveredNode === sec.id;

          return (
            <div
              key={sec.id}
              className="relative flex items-center group cursor-pointer z-10"
              onMouseEnter={() => setHoveredNode(sec.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => scrollTo(sec.id)}
            >
              {/* Star Node Button */}
              <button
                type="button"
                className={`relative w-6 h-6 rounded-full border transition-all duration-300 grid place-items-center ${
                  isActive
                    ? "scale-125 border-current bg-[#0e141f] shadow-lg"
                    : isPassed
                    ? "scale-100 border-white/40 bg-[#121722]"
                    : "scale-90 border-white/20 bg-[#090d14] opacity-50 hover:opacity-90 hover:scale-105"
                }`}
                style={{
                  color: isActive ? elementColor : "#96a1b2",
                  boxShadow: isActive ? `0 0 14px ${elementGlow}` : undefined,
                  borderColor: isPassed ? elementColor : undefined,
                }}
                title={sec.label}
              >
                {/* Central Star Core */}
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "animate-pulse" : ""
                  }`}
                  style={{
                    backgroundColor: isPassed ? elementColor : "rgba(255,255,255,0.4)",
                  }}
                />
              </button>

              {/* Star Code Identifier (Greek Letter) */}
              <span
                className={`absolute -left-4 text-[9px] font-mono transition-opacity ${
                  isActive ? "text-[#f3dfbd] font-bold opacity-100" : "text-[#6c7686] opacity-0 group-hover:opacity-100"
                }`}
              >
                {sec.starCode}
              </span>

              {/* Floating Tooltip Label on Hover / Active */}
              {(isHovered || isActive) && (
                <div
                  className="absolute left-9 whitespace-nowrap px-2.5 py-1 rounded-md bg-[#10141f]/95 border border-white/10 text-xs font-medium text-[#edf0f7] shadow-[0_4px_16px_rgba(0,0,0,0.7)] backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    borderColor: isActive ? `${elementColor}60` : undefined,
                  }}
                >
                  <span className="text-[10px] uppercase font-mono mr-1.5 opacity-60">
                    0{idx + 1}
                  </span>
                  <span>{sec.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
