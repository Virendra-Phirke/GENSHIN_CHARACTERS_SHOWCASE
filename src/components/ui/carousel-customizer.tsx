"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, RotateCcw, X, Check } from "lucide-react";

export interface CarouselCustomConfig {
  preset: "panorama" | "cylinder" | "orbit" | "wheel";
  intro: "spin" | "rise" | "assemble" | "none";
  aspect: "portrait" | "square" | "landscape";
  cardWidth: number;
  gap: number;
  curve: number;
  tilt: number;
  perspective: number;
  autoplay: "drift" | "step" | "none";
  speed: number;
  interval: number;
  direction: "right" | "left";
  momentum: number;
  parallax: number;
  stretch: number;
  snap: boolean;
  pauseOnHover: boolean;
  focusOnClick: boolean;
  draggable: boolean;
  fadeColor: string;
  depthFade: number;
  innerShade: number;
  cornerRadius: number;
  captions: boolean;
}

export const DEFAULT_CAROUSEL_CONFIG: CarouselCustomConfig = {
  preset: "orbit",
  intro: "spin",
  aspect: "portrait",
  cardWidth: 460,
  gap: 156,
  curve: 1,
  tilt: 0,
  perspective: 1550,
  autoplay: "drift",
  speed: 7,
  interval: 3,
  direction: "left",
  momentum: 0.55,
  parallax: 0.3,
  stretch: 0,
  snap: true,
  pauseOnHover: true,
  focusOnClick: true,
  draggable: true,
  fadeColor: "#000000",
  depthFade: 0.21,
  innerShade: 0.82,
  cornerRadius: 0,
  captions: false,
};

interface CarouselCustomizerProps {
  config: CarouselCustomConfig;
  onChange: (newConfig: CarouselCustomConfig) => void;
  onReset: () => void;
  onClose?: () => void;
}

export default function CarouselCustomizer({
  config,
  onChange,
  onReset,
  onClose,
}: CarouselCustomizerProps) {
  const updateField = <K extends keyof CarouselCustomConfig>(
    field: K,
    value: CarouselCustomConfig[K]
  ) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#0b0e17]/80 backdrop-blur-2xl border border-white/[0.09] p-5 sm:p-6 shadow-[0_24px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] mb-6 overflow-hidden transition-all duration-300">
      {/* Specular glass reflection bar at top edge */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

      {/* Subtle ambient glass glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-[#c8a96e]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <h4 className="text-[15px] font-semibold tracking-tight text-[#f0f2f7]">
            Customize
          </h4>
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[#c8a96e]">
            Orbit Mode
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-[#9ba2b3] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.16] backdrop-blur-md transition-all px-2.5 py-1.5 rounded-lg shadow-sm"
            title="Reset to default configuration"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7a8194] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.16] backdrop-blur-md transition-all"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Grid Layout matching the React Bits screenshot */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* ================= COLUMN 1 ================= */}
        <div className="flex flex-col gap-2.5">
          {/* Preset */}
          <CustomDropdownRow
            label="Preset"
            value={config.preset}
            options={[
              { label: "Panorama", value: "panorama" },
              { label: "Cylinder", value: "cylinder" },
              { label: "Orbit", value: "orbit" },
              { label: "Wheel", value: "wheel" },
            ]}
            onChange={(val) =>
              updateField("preset", val as CarouselCustomConfig["preset"])
            }
          />

          {/* Card Width */}
          <ScrubberRow
            label="Card Width"
            min={140}
            max={460}
            step={2}
            value={config.cardWidth}
            suffix="px"
            onChange={(val) => updateField("cardWidth", Math.round(val))}
          />

          {/* Tilt */}
          <ScrubberRow
            label="Tilt"
            min={-35}
            max={35}
            step={1}
            value={config.tilt}
            suffix="°"
            onChange={(val) => updateField("tilt", Math.round(val))}
          />

          {/* Speed */}
          <ScrubberRow
            label="Speed"
            min={1}
            max={30}
            step={1}
            value={config.speed}
            suffix="°/s"
            onChange={(val) => updateField("speed", Math.round(val))}
          />

          {/* Momentum */}
          <ScrubberRow
            label="Momentum"
            min={0}
            max={1}
            step={0.05}
            value={config.momentum}
            formatValue={(v) => v.toFixed(2).replace(/\.00$/, ".0").replace(/(\.\d)0$/, "$1")}
            onChange={(val) => updateField("momentum", parseFloat(val.toFixed(2)))}
          />

          {/* Snap */}
          <ToggleRow
            label="Snap"
            checked={config.snap}
            onChange={(val) => updateField("snap", val)}
          />

          {/* Draggable */}
          <ToggleRow
            label="Draggable"
            checked={config.draggable}
            onChange={(val) => updateField("draggable", val)}
          />

          {/* Inner Shade */}
          <ScrubberRow
            label="Inner Shade"
            min={0}
            max={1}
            step={0.02}
            value={config.innerShade}
            formatValue={(v) => v.toFixed(2)}
            onChange={(val) => updateField("innerShade", parseFloat(val.toFixed(2)))}
          />
        </div>

        {/* ================= COLUMN 2 ================= */}
        <div className="flex flex-col gap-2.5">
          {/* Intro */}
          <CustomDropdownRow
            label="Intro"
            value={config.intro}
            options={[
              { label: "Spin", value: "spin" },
              { label: "Rise", value: "rise" },
              { label: "Assemble", value: "assemble" },
              { label: "None", value: "none" },
            ]}
            onChange={(val) =>
              updateField("intro", val as CarouselCustomConfig["intro"])
            }
          />

          {/* Gap */}
          <ScrubberRow
            label="Gap"
            min={0}
            max={180}
            step={2}
            value={config.gap}
            suffix="px"
            onChange={(val) => updateField("gap", Math.round(val))}
          />

          {/* Perspective */}
          <ScrubberRow
            label="Perspective"
            min={600}
            max={3000}
            step={50}
            value={config.perspective}
            suffix="px"
            onChange={(val) => updateField("perspective", Math.round(val))}
          />

          {/* Interval */}
          <ScrubberRow
            label="Interval"
            min={1}
            max={10}
            step={0.5}
            value={config.interval}
            suffix="s"
            onChange={(val) => updateField("interval", val)}
          />

          {/* Parallax */}
          <ScrubberRow
            label="Parallax"
            min={0}
            max={1}
            step={0.02}
            value={config.parallax}
            formatValue={(v) => v.toFixed(2)}
            onChange={(val) => updateField("parallax", parseFloat(val.toFixed(2)))}
          />

          {/* Pause On Hover */}
          <ToggleRow
            label="Pause On Hover"
            checked={config.pauseOnHover}
            onChange={(val) => updateField("pauseOnHover", val)}
          />

          {/* Fade Color */}
          <ColorRow
            label="Fade Color"
            value={config.fadeColor}
            onChange={(val) => updateField("fadeColor", val)}
          />

          {/* Corner Radius */}
          <ScrubberRow
            label="Corner Radius"
            min={0}
            max={24}
            step={1}
            value={config.cornerRadius}
            suffix="px"
            onChange={(val) => updateField("cornerRadius", Math.round(val))}
          />
        </div>

        {/* ================= COLUMN 3 ================= */}
        <div className="flex flex-col gap-2.5">
          {/* Aspect */}
          <CustomDropdownRow
            label="Aspect"
            value={config.aspect}
            options={[
              { label: "Portrait", value: "portrait" },
              { label: "Square", value: "square" },
              { label: "Landscape", value: "landscape" },
            ]}
            onChange={(val) =>
              updateField("aspect", val as CarouselCustomConfig["aspect"])
            }
          />

          {/* Curve */}
          <ScrubberRow
            label="Curve"
            min={0}
            max={1}
            step={0.05}
            value={config.curve}
            formatValue={(v) => (v === 1 ? "1" : v === 0 ? "0" : v.toFixed(2))}
            onChange={(val) => updateField("curve", parseFloat(val.toFixed(2)))}
          />

          {/* Autoplay */}
          <CustomDropdownRow
            label="Autoplay"
            value={config.autoplay}
            options={[
              { label: "Drift", value: "drift" },
              { label: "Step", value: "step" },
              { label: "None", value: "none" },
            ]}
            onChange={(val) =>
              updateField("autoplay", val as CarouselCustomConfig["autoplay"])
            }
          />

          {/* Direction */}
          <CustomDropdownRow
            label="Direction"
            value={config.direction}
            options={[
              { label: "Right", value: "right" },
              { label: "Left", value: "left" },
            ]}
            onChange={(val) =>
              updateField("direction", val as CarouselCustomConfig["direction"])
            }
          />

          {/* Stretch */}
          <ScrubberRow
            label="Stretch"
            min={0}
            max={1}
            step={0.02}
            value={config.stretch}
            formatValue={(v) => v.toFixed(2)}
            onChange={(val) => updateField("stretch", parseFloat(val.toFixed(2)))}
          />

          {/* Focus On Click */}
          <ToggleRow
            label="Focus On Click"
            checked={config.focusOnClick}
            onChange={(val) => updateField("focusOnClick", val)}
          />

          {/* Depth Fade */}
          <ScrubberRow
            label="Depth Fade"
            min={0}
            max={1}
            step={0.01}
            value={config.depthFade}
            formatValue={(v) => v.toFixed(2)}
            onChange={(val) => updateField("depthFade", parseFloat(val.toFixed(2)))}
          />

          {/* Captions */}
          <ToggleRow
            label="Captions"
            checked={config.captions}
            onChange={(val) => updateField("captions", val)}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------- Helper Control Components ----------------

interface CustomDropdownRowProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

function CustomDropdownRow({ label, value, options, onChange }: CustomDropdownRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activeOption = options.find((o) => o.value === value) || options[0];

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-between h-[46px] px-4 rounded-xl transition-all duration-200 select-none ${isOpen
          ? "z-50 bg-[#161824] border border-white/20 shadow-lg"
          : "z-0 bg-white/[0.035] hover:bg-white/[0.06] backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        }`}
    >
      <span className="text-[13px] font-medium text-[#9399ab] pointer-events-none">
        {label}
      </span>

      {/* Trigger Button with NO focus ring or outline */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ outline: "none", boxShadow: "none" }}
        className="flex items-center gap-1.5 py-1 px-2.5 -mr-2 rounded-lg text-[13px] font-medium text-[#e4e7ee] hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-0 outline-none"
      >
        <span>{activeOption?.label || value}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#7a8194] transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Floating Dark Glass Custom Dropdown Menu with High Z-Index & Solid Dark Background */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-[999] min-w-[140px] rounded-xl bg-[#12141f] border border-white/20 p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.95)] animate-in fade-in-50 zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${isSelected
                    ? "bg-[#c8a96e]/20 text-[#f2e2be] font-semibold"
                    : "text-[#9ca3af] hover:text-white hover:bg-white/5"
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#c8a96e]" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ScrubberRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  suffix?: string;
  formatValue?: (val: number) => string;
  onChange: (val: number) => void;
}

function ScrubberRow({
  label,
  min,
  max,
  step,
  value,
  suffix = "",
  formatValue,
  onChange,
}: ScrubberRowProps) {
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="relative flex items-center justify-between h-[46px] px-4 rounded-xl bg-white/[0.035] hover:bg-white/[0.06] backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 overflow-hidden group select-none">
      {/* Label */}
      <span className="text-[13px] font-medium text-[#9399ab] shrink-0 pointer-events-none">
        {label}
      </span>

      {/* Scrubber Area in the middle/right */}
      <div className="relative flex items-center justify-end flex-1 ml-4 h-full">
        {/* Subtle background ruler ticks */}
        <div className="absolute inset-y-0 right-[72px] left-2 flex items-center justify-between pointer-events-none opacity-25">
          <span className="w-[1px] h-2 bg-white/40" />
          <span className="w-[1px] h-1.5 bg-white/30" />
          <span className="w-[1px] h-2 bg-white/40" />
          <span className="w-[1px] h-1.5 bg-white/30" />
          <span className="w-[1px] h-2 bg-white/40" />
        </div>

        {/* Indicator cursor bar */}
        <div className="absolute right-[72px] left-2 h-full flex items-center pointer-events-none">
          <div
            className="w-[2px] h-4 bg-[#7a8194] group-hover:bg-[#c8a96e] rounded-full transition-all duration-75 shadow-[0_0_6px_rgba(200,169,110,0.4)]"
            style={{
              marginLeft: `calc(${percent}% - 1px)`,
            }}
          />
        </div>

        {/* Transparent Range Input spanning the scrubber area */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-y-0 right-[68px] left-0 w-[calc(100%-68px)] h-full opacity-0 cursor-ew-resize z-10"
        />

        {/* Formatted Value on the Right */}
        <div className="text-[13px] font-medium text-[#edf0f7] min-w-[56px] text-right font-mono pointer-events-none z-0">
          <span>{formatValue ? formatValue(value) : `${value}${suffix}`}</span>
        </div>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between h-[46px] px-4 rounded-xl bg-white/[0.035] hover:bg-white/[0.06] backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] cursor-pointer transition-all duration-200 select-none"
    >
      <span className="text-[13px] font-medium text-[#9399ab]">{label}</span>
      <div
        className={`w-11 h-6 rounded-full relative transition-all duration-200 ease-in-out ${checked
            ? "bg-gradient-to-r from-[#d4af37] to-[#e6ca65] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
            : "bg-white/[0.08] border border-white/[0.08]"
          }`}
      >
        <span
          className={`w-4 h-4 rounded-full absolute top-1 transition-all duration-200 ease-in-out ${checked
              ? "left-6 bg-[#0c0e15] shadow-sm"
              : "left-1 bg-[#616679]"
            }`}
        />
      </div>
    </div>
  );
}

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function ColorRow({ label, value, onChange }: ColorRowProps) {
  return (
    <div className="flex items-center justify-between h-[46px] px-4 rounded-xl bg-white/[0.035] hover:bg-white/[0.06] backdrop-blur-md border border-white/[0.07] hover:border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 select-none">
      <span className="text-[13px] font-medium text-[#9399ab]">{label}</span>
      <div className="flex items-center gap-2.5">
        <label className="relative cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <div
            className="w-5 h-5 rounded-[5px] border border-white/20 shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: value }}
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="w-[66px] bg-transparent text-[#edf0f7] text-[13px] font-mono font-medium outline-none text-right uppercase"
        />
      </div>
    </div>
  );
}
