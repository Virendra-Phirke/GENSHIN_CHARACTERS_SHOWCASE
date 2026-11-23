"use client";

// Web Audio API Synthesizer for luxury celestial soundscapes
// Synthesizes soft, crystalline chimes and starlight bell tones with zero network dependencies

let audioCtx: AudioContext | null = null;
let isMuted = true; // Default to muted for seamless browsing, user can toggle on

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleAudioMute(muted?: boolean): boolean {
  if (typeof muted === "boolean") {
    isMuted = muted;
  } else {
    isMuted = !isMuted;
  }
  if (!isMuted) {
    getAudioContext();
    playCelestialChime(523.25); // C5 welcome chime
  }
  return isMuted;
}

export function getIsAudioMuted(): boolean {
  return isMuted;
}

// Play a crystal chime on card select or tab switch
export function playCelestialChime(frequency = 659.25) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Harmonics for a magical, glass-like bell resonance
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch {
    // Gracefully ignore audio autoplay restrictions
  }
}

// Play a low resonant gong for element shift
export function playResonanceNote(frequency = 220) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.85);
  } catch {
    // Ignore audio context errors
  }
}
