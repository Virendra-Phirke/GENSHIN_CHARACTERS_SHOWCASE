"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Crown,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import type { PlayerApiError, PlayerShowcase, ShowcaseCharacter } from "@/lib/types";
import CelestialBackground from "@/components/ui/celestial-background";
import CursorTrail from "@/components/ui/cursor-trail";

type Props = { uid: string; characterId: number };

const ELEMENT_DATA: Record<
  string,
  { accent: string; wash: string; glow: string; name: string }
> = {
  Cryo: { accent: "#9ed8e9", wash: "rgba(158,216,233,.12)", glow: "rgba(158,216,233,.35)", name: "Cryo" },
  Hydro: { accent: "#78bce9", wash: "rgba(120,188,233,.12)", glow: "rgba(120,188,233,.35)", name: "Hydro" },
  Pyro: { accent: "#ef866d", wash: "rgba(239,134,109,.12)", glow: "rgba(239,134,109,.35)", name: "Pyro" },
  Electro: { accent: "#b99be9", wash: "rgba(185,155,233,.12)", glow: "rgba(185,155,233,.35)", name: "Electro" },
  Anemo: { accent: "#82d0b4", wash: "rgba(130,208,180,.12)", glow: "rgba(130,208,180,.35)", name: "Anemo" },
  Geo: { accent: "#e5bc75", wash: "rgba(229,188,117,.12)", glow: "rgba(229,188,117,.35)", name: "Geo" },
  Dendro: { accent: "#a8c878", wash: "rgba(168,200,120,.12)", glow: "rgba(168,200,120,.35)", name: "Dendro" },
};

function EquipmentArtwork({
  src,
  fallbackSrc,
  alt,
  rarity = 5,
  kind,
}: {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  rarity?: number;
  kind: "weapon" | "artifact";
}) {
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

function TalentOrConstIcon({
  src,
  fallbackSrc,
  alt,
}: {
  src?: string;
  fallbackSrc?: string;
  alt: string;
}) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const currentSrc = sourceIndex === 0 ? (src || fallbackSrc) : sourceIndex === 1 ? fallbackSrc : undefined;

  if (!currentSrc) {
    return <span className="talent-icon-fallback">✧</span>;
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      unoptimized
      sizes="56px"
      quality={85}
      className="talent-icon-img"
      onError={() => setSourceIndex((current) => (current === 0 && src && fallbackSrc ? 1 : 2))}
    />
  );
}

export default function CharacterBuildPage({ uid, characterId }: Props) {
  const [profile, setProfile] = useState<PlayerShowcase | null>(null);
  const [character, setCharacter] = useState<ShowcaseCharacter | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [failedArtworkSrc, setFailedArtworkSrc] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBuild() {
      try {
        const response = await fetch(`/api/player/${uid}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          const failure = data as PlayerApiError;
          throw new Error(failure.error || "We couldn't load this character build.");
        }

        const showcase = data as PlayerShowcase;
        const selected = showcase.characters.find((entry) => entry.id === characterId);
        if (!selected) throw new Error("This character is not part of the player's current public showcase.");

        setProfile(showcase);
        setCharacter(selected);
        setError("");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setProfile(null);
        setCharacter(null);
        setError(err instanceof Error ? err.message : "Couldn't connect to the showcase service.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadBuild();
    return () => controller.abort();
  }, [uid, characterId, attempt]);

  function retry() {
    setLoading(true);
    setError("");
    setAttempt((value) => value + 1);
  }

  const primaryArtwork = character?.image;
  const fallbackArtwork = character?.imageFallback;
  const artworkSrc = failedArtworkSrc === primaryArtwork
    ? fallbackArtwork
    : failedArtworkSrc === fallbackArtwork
      ? undefined
      : primaryArtwork || fallbackArtwork;

  // Artifact Set calculation
  const setCounts = character?.artifacts.reduce<Record<string, number>>((acc, art) => {
    if (art.setName) acc[art.setName] = (acc[art.setName] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  const activeSetBonuses = Object.entries(setCounts).map(([setName, count]) => {
    const pieces = count >= 4 ? 4 : count >= 2 ? 2 : count;
    return { setName, count, pieces };
  });

  // Total Artifact CV
  const totalArtifactCV = character?.artifacts
    .reduce((sum, art) => sum + (art.critValue ?? 0), 0)
    .toFixed(1);

  const elementTheme = ELEMENT_DATA[character?.element || ""] ?? {
    accent: "#c8a96e",
    wash: "rgba(200,169,110,.12)",
    glow: "rgba(200,169,110,.35)",
    name: "Genshin",
  };

  return (
    <main
      className={`profile-page character-build-page element-theme-${(character?.element || "unknown").toLowerCase()}`}
      style={{
        ["--element-accent" as string]: elementTheme.accent,
        ["--element-wash" as string]: elementTheme.wash,
        ["--element-glow" as string]: elementTheme.glow,
      }}
    >
      {/* Dynamic Elemental Ambient Particle Canvas */}
      <CelestialBackground elementAccent={elementTheme.accent} element={character?.element} />
      <CursorTrail elementAccent={elementTheme.accent} />

      <header className="profile-topbar">
        <Link href="/" className="brand" aria-label="Astra home">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">ASTRA<span className="brand-period">.</span></span>
        </Link>
        <Link href={`/player/${uid}`} className="back-link">
          <ArrowLeft size={14} /> Back to roster
        </Link>
      </header>

      {loading ? (
        <section className="profile-empty" aria-live="polite">
          <span className="eyebrow"><span className="status-dot" /> RETRIEVING CHARACTER DOSSIER</span>
          <h1>Opening character build.</h1>
          <p>Compiling equipment, combat stats, talents, and constellations.</p>
          <div className="loading-rule"><span /></div>
        </section>
      ) : error ? (
        <section className="profile-empty" role="alert">
          <span className="eyebrow">BUILD UNAVAILABLE</span>
          <h1>We couldn&apos;t open this character.</h1>
          <p>{error}</p>
          <div className="profile-actions">
            <button type="button" className="primary-button" onClick={retry}>
              Try again <RefreshCw size={15} />
            </button>
            <Link href={`/player/${uid}`} className="back-link">
              Back to roster <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      ) : character && profile ? (
        <>
          {/* Character Hero Section: Borderless, High-Impact Artwork + Dossier */}
          <section className="character-build-hero">
            {/* Left: Pure Borderless Character Artwork with Ambient Elemental Glow */}
            <div className="character-hero-art-stage">
              <div className="character-hero-ambient-glow" aria-hidden="true" />
              <div className="character-hero-art-frame">
                {artworkSrc ? (
                  <Image
                    src={artworkSrc}
                    alt={character.name}
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 900px) 100vw, 55vw"
                    quality={90}
                    className="character-hero-splash-image"
                    onError={() => setFailedArtworkSrc(artworkSrc)}
                  />
                ) : (
                  <span className="character-tile-placeholder" aria-hidden="true">✦</span>
                )}
              </div>
            </div>

            {/* Right: Character Info, Identity, Constellation & CV Highlights */}
            <div className="character-build-intro">
              <div className="eyebrow">
                <span className="eyebrow-line" />
                CHARACTER DOSSIER · LIVE IN-GAME BUILD
              </div>

              <div className="character-title-row">
                <h1 className="character-title">{character.name}<span className="brand-period">.</span></h1>
                <div className="character-rarity" aria-label={`${character.rarity ?? 5} star character`}>
                  {"★".repeat(character.rarity ?? 5)}
                </div>
              </div>

              {/* Identity Chips */}
              <div className="character-identity-chips">
                <span
                  className="element-chip !py-1 !px-2 flex items-center justify-center transition-all hover:scale-105"
                  title={`${character.element || "Adventurer"} Element`}
                  style={{
                    borderColor: elementTheme.accent,
                    backgroundColor: elementTheme.wash,
                    boxShadow: `0 0 12px ${elementTheme.accent}35`,
                  }}
                >
                  {character.element ? (
                    <Image
                      src={`/images/elements/${character.element.toLowerCase()}.png`}
                      alt={character.element}
                      width={22}
                      height={22}
                      unoptimized
                      className="w-5 h-5 object-contain drop-shadow"
                    />
                  ) : (
                    <span style={{ color: elementTheme.accent }}>✦</span>
                  )}
                </span>
                <span className="level-chip">
                  LEVEL {character.level ?? "—"} / 90
                </span>
                <span className="friendship-chip">
                  {character.friendship != null ? `FRIENDSHIP ${character.friendship}` : "PUBLIC SHOWCASE"}
                </span>
              </div>

              {/* Constellation Indicator */}
              <div className="constellation-track" aria-label={`Constellation ${character.constellation ?? 0} of 6`}>
                <div className="constellation-track-info">
                  <span className="constellation-label">CONSTELLATION</span>
                  <strong>C{character.constellation ?? 0}</strong>
                </div>
                <div className="constellation-dots">
                  {Array.from({ length: 6 }, (_, index) => {
                    const isUnlocked = index < (character.constellation ?? 0);
                    return (
                      <span
                        key={index}
                        className={`constellation-dot ${isUnlocked ? "is-unlocked" : ""}`}
                        title={`Constellation ${index + 1}: ${isUnlocked ? "Unlocked" : "Locked"}`}
                      >
                        <i />
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Character Summary Bento Chips */}
              <div className="character-build-quickstats">
                <div className="quickstat-card">
                  <span>EQUIPPED WEAPON</span>
                  <strong>{character.weapon?.name || "Not available"}</strong>
                  <small>
                    {character.weapon?.level ? `Lv. ${character.weapon.level} · Refinement R${character.weapon.refinement ?? 1}` : "No details"}
                  </small>
                </div>
                <div className="quickstat-card">
                  <span>COMBAT CRIT VALUE</span>
                  <strong className="cv-highlight">
                    {character.critValue != null ? `${character.critValue} CV` : "—"}
                  </strong>
                  <small>
                    {(character.stats.find((s) => s.label === "CRIT Rate")?.value ?? "—")} CR / {(character.stats.find((s) => s.label === "CRIT DMG")?.value ?? "—")} CD
                  </small>
                </div>
                <div className="quickstat-card">
                  <span>ARTIFACT LOADOUT</span>
                  <strong>{character.artifacts.length} / 5 Equipped</strong>
                  <small>
                    {activeSetBonuses.length ? activeSetBonuses.map((b) => `${b.count}pc ${b.setName}`).join(", ") : "Artifact set details"}
                  </small>
                </div>
              </div>
            </div>
          </section>

          {/* Character Detailed Bento Overview */}
          <section className="character-build-content">
            <div className="build-section-heading">
              <div>
                <span className="eyebrow">EQUIPMENT & ATTRIBUTES</span>
                <h2>Complete Build Analysis</h2>
              </div>
            </div>

            <div className="build-details-grid">
              {/* 1. Combat Attributes Panel */}
              <section className="build-panel combat-panel">
                <div className="panel-header">
                  <span className="build-panel-label">
                    <Zap size={13} /> COMBAT ATTRIBUTES
                  </span>
                  <span className="panel-badge">LIVE ATTRIBUTES</span>
                </div>

                <div className="build-stat-grid">
                  {character.stats.length ? (
                    character.stats.map((stat) => (
                      <div className="build-stat" key={stat.label}>
                        <div className="stat-label-wrap">
                          <span className="stat-name">{stat.label}</span>
                          {stat.detail && <small className="build-stat-detail">{stat.detail}</small>}
                        </div>
                        <strong className="stat-value">{stat.value}</strong>
                      </div>
                    ))
                  ) : (
                    <p className="build-empty">Combat attributes are not available in this showcase.</p>
                  )}
                </div>
              </section>

              {/* 2. Equipped Weapon Panel */}
              <section className="build-panel weapon-panel">
                <div className="panel-header">
                  <span className="build-panel-label">
                    <Swords size={13} /> EQUIPPED WEAPON
                  </span>
                  {character.weapon?.refinement && (
                    <span className="refinement-pill">R{character.weapon.refinement}</span>
                  )}
                </div>

                {character.weapon ? (
                  <div className="weapon-showcase">
                    <EquipmentArtwork
                      src={character.weapon.icon}
                      fallbackSrc={character.weapon.iconFallback}
                      alt={character.weapon.name || "Equipped weapon"}
                      rarity={character.weapon.rarity}
                      kind="weapon"
                    />
                    <div className="weapon-showcase-info">
                      <span className="equipment-kicker">
                        {"★".repeat(character.weapon.rarity ?? 4)} WEAPON
                      </span>
                      <h3>{character.weapon.name || "Weapon"}</h3>
                      <p className="weapon-level-text">
                        Level {character.weapon.level ?? 90} / 90 <span>·</span> Refinement R{character.weapon.refinement ?? 1}
                      </p>
                      <div className="weapon-stats">
                        {character.weapon.baseAttack && (
                          <div className="weapon-stat-pill">
                            <span>Base ATK</span>
                            <strong>{character.weapon.baseAttack}</strong>
                          </div>
                        )}
                        {character.weapon.substat && (
                          <div className="weapon-stat-pill">
                            <span>{character.weapon.substat.label}</span>
                            <strong>{character.weapon.substat.value}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="build-empty">No weapon data found.</p>
                )}
              </section>

              {/* 3. Artifacts Panel (All 5 Slots) */}
              <section className="build-panel artifacts-panel">
                <div className="panel-header">
                  <div className="panel-header-left">
                    <span className="build-panel-label">
                      <Sparkles size={13} /> ARTIFACTS · {character.artifacts.length}/5
                    </span>
                    {totalArtifactCV && (
                      <span className="artifact-total-cv-pill">
                        Total Substat CV: {totalArtifactCV}
                      </span>
                    )}
                  </div>
                  <div className="set-bonus-tags">
                    {activeSetBonuses.map((bonus) => (
                      <span className="set-bonus-chip" key={bonus.setName}>
                        {bonus.count}-Piece {bonus.setName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="artifact-build-list">
                  {character.artifacts.map((artifact, index) => (
                    <article className="artifact-build-item" key={`${artifact.slot}-${index}`}>
                      <div className="artifact-visual-row">
                        <EquipmentArtwork
                          src={artifact.icon}
                          fallbackSrc={artifact.iconFallback}
                          alt={artifact.name || `${artifact.slot} artifact`}
                          rarity={artifact.rarity}
                          kind="artifact"
                        />
                        <div className="artifact-build-top">
                          <div className="artifact-slot-badge">{artifact.slot}</div>
                          <h3>{artifact.name || `${artifact.setName || "Artifact"} · ${artifact.slot}`}</h3>
                          <p className="artifact-set-name">{artifact.setName || "Artifact Set"}</p>
                        </div>
                        <div className="artifact-level-badge">
                          +{artifact.level ?? 0}
                        </div>
                      </div>

                      {/* Main Stat */}
                      {artifact.mainStat && (
                        <div className="artifact-main-stat">
                          <span className="main-stat-label">{artifact.mainStat.label}</span>
                          <strong className="main-stat-value">{artifact.mainStat.value}</strong>
                        </div>
                      )}

                      {/* Substats Header with individual piece CV */}
                      <div className="artifact-roll-heading">
                        <span>SUBSTAT ROLLS ({artifact.substats.length})</span>
                        {artifact.critValue != null && (
                          <span className="piece-cv-badge">{artifact.critValue} CV</span>
                        )}
                      </div>

                      {/* 4 Substats */}
                      <div className="artifact-substats">
                        {artifact.substats.map((stat, statIndex) => (
                          <div
                            className={`artifact-substat-row ${stat.label.includes("CRIT") ? "is-crit-stat" : ""}`}
                            key={`${stat.label}-${statIndex}`}
                          >
                            <span className="substat-label">{stat.label}</span>
                            <strong className="substat-value">+{stat.value}</strong>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                  {!character.artifacts.length && (
                    <p className="build-empty">No equipped artifacts found.</p>
                  )}
                </div>
              </section>

              {/* 4. Talents Panel */}
              <section className="build-panel talent-panel">
                <div className="panel-header">
                  <span className="build-panel-label">
                    <Crown size={13} /> TALENT LEVELS
                  </span>
                  <span className="panel-badge">COMBAT TALENTS</span>
                </div>

                <div className="talent-cards-grid">
                  {character.talents.length ? (
                    character.talents.map((talent, idx) => (
                      <div className={`talent-card ${talent.isCrowned ? "is-crowned" : ""}`} key={`${talent.name}-${idx}`}>
                        <div className="talent-icon-box">
                          <TalentOrConstIcon
                            src={talent.icon}
                            fallbackSrc={talent.iconFallback}
                            alt={talent.name}
                          />
                        </div>
                        <div className="talent-details">
                          <span className="talent-type-label">TALENT 0{idx + 1}</span>
                          <h4 className="talent-name">{talent.name}</h4>
                          <div className="talent-level-wrap">
                            <span className="talent-level-number">Lv. {talent.level}</span>
                            {talent.isCrowned && (
                              <span className="crowned-badge">
                                <Crown size={11} /> CROWNED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="build-empty">Talent data is not available.</p>
                  )}
                </div>
              </section>

              {/* 5. Constellations Panel */}
              <section className="build-panel constellation-panel">
                <div className="panel-header">
                  <span className="build-panel-label">
                    <Sparkles size={13} /> CONSTELLATIONS
                  </span>
                  <span className="panel-badge">
                    {character.constellation ?? 0} / 6 ACTIVATED
                  </span>
                </div>

                <div className="constellations-grid">
                  {character.constellations.map((c) => (
                    <div
                      key={c.index}
                      className={`constellation-card ${c.unlocked ? "is-unlocked" : "is-locked"}`}
                    >
                      <div className="constellation-icon-wrap">
                        <TalentOrConstIcon
                          src={c.icon}
                          fallbackSrc={c.iconFallback}
                          alt={`Constellation ${c.index}`}
                        />
                        {!c.unlocked && (
                          <div className="const-locked-overlay">
                            <Lock size={12} />
                          </div>
                        )}
                      </div>
                      <div className="constellation-card-info">
                        <span className="const-num">C{c.index}</span>
                        <span className="const-status">
                          {c.unlocked ? "ACTIVATED" : "LOCKED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </>
      ) : null}

      <footer className="profile-footer">
        <span><ShieldCheck size={14} /> Public showcase data only</span>
        <span>ASTRA ARCHIVE · UNOFFICIAL FAN SHOWCASE</span>
      </footer>
    </main>
  );
}
