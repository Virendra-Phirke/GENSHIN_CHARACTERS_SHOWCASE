"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, RefreshCw, ShieldCheck } from "lucide-react";
import type { PlayerApiError, PlayerShowcase, ShowcaseCharacter } from "@/lib/types";

type Props = { uid: string; characterId: number };

function EquipmentArtwork({ src, fallbackSrc, alt, rarity = 5, kind }: { src?: string; fallbackSrc?: string; alt: string; rarity?: number; kind: "weapon" | "artifact" }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageSrc = sourceIndex === 0 ? (src || fallbackSrc) : sourceIndex === 1 ? fallbackSrc : undefined;
  return (
    <div className={`equipment-artwork equipment-artwork-${kind} rarity-${Math.min(Math.max(rarity, 1), 5)}`}>
      {imageSrc ? (
        <Image src={imageSrc} alt={alt} fill unoptimized sizes={kind === "weapon" ? "180px" : "112px"} quality={85} className="equipment-artwork-image" onError={() => setSourceIndex((current) => current === 0 && src && fallbackSrc ? 1 : 2)} />
      ) : (
        <span className="equipment-artwork-fallback" aria-hidden="true">{kind === "weapon" ? "⚔" : "✧"}</span>
      )}
      <span className="equipment-artwork-rarity" aria-label={`${rarity}-star rarity`}>{ "★".repeat(Math.min(Math.max(rarity, 1), 5)) }</span>
    </div>
  );
}

export default function CharacterBuildPage({ uid, characterId }: Props) {
  const [profile, setProfile] = useState<PlayerShowcase | null>(null);
  const [character, setCharacter] = useState<ShowcaseCharacter | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [failedArtworkSrc, setFailedArtworkSrc] = useState<string | null>(null);
  const [artworkDimensions, setArtworkDimensions] = useState<{ src: string; aspectRatio: number } | null>(null);

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


  const artifactSetSummary = character
    ? Object.entries(character.artifacts.reduce<Record<string, number>>((counts, artifact) => {
        if (artifact.setName) counts[artifact.setName] = (counts[artifact.setName] ?? 0) + 1;
        return counts;
      }, {})).map(([name, count]) => `${count}-pc ${name}`).join("  ·  ")
    : "";

  return (
    <main className="profile-page character-build-page">
      <header className="profile-topbar">
        <Link href="/" className="brand"><span className="brand-mark"><span /></span><span className="brand-name">ASTRA<span className="brand-period">.</span></span></Link>
        <Link href={`/player/${uid}`} className="back-link"><ArrowLeft size={15} /> Player archive</Link>
      </header>

      {loading ? (
        <section className="profile-empty" aria-live="polite">
          <span className="eyebrow"><span className="status-dot" /> RETRIEVING CHARACTER BUILD</span>
          <h1>Preparing the dossier.</h1>
          <p>Loading the public showcase details for this character.</p>
          <div className="loading-rule"><span /></div>
        </section>
      ) : error ? (
        <section className="profile-empty" role="alert">
          <span className="eyebrow">BUILD UNAVAILABLE</span>
          <h1>We couldn&apos;t open this character.</h1>
          <p>{error}</p>
          <div className="profile-actions">
            <button type="button" className="primary-button" onClick={retry}>Try again <RefreshCw size={15} /></button>
            <Link href={`/player/${uid}`} className="back-link">Back to archive <ArrowUpRight size={15} /></Link>
          </div>
        </section>
      ) : character && profile ? (
        <>
          <section className={`character-build-hero element-${(character.element || "unknown").toLowerCase()}`}>
            <div className="character-build-art" style={artworkDimensions && artworkDimensions.src === artworkSrc ? { aspectRatio: String(artworkDimensions.aspectRatio) } : undefined}>
              {artworkSrc ? (
                <Image
                  src={artworkSrc}
                  alt={`${character.name} splash artwork`}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 760px) 100vw, 42vw"
                  quality={85}
                  className="character-build-image"
                  onLoad={(event) => {
                    const { naturalWidth, naturalHeight } = event.currentTarget;
                    if (naturalWidth > 0 && naturalHeight > 0) setArtworkDimensions({ src: artworkSrc, aspectRatio: naturalWidth / naturalHeight });
                  }}
                  onError={() => setFailedArtworkSrc(artworkSrc)}
                />
              ) : <span className="character-tile-placeholder" aria-hidden="true">✦</span>}

            </div>
            <div className="character-build-intro">
              <span className="eyebrow"><span className="eyebrow-line" /> CHARACTER DOSSIER · PUBLIC BUILD</span>
              <div className="character-title-row">
                <h1>{character.name}<span className="brand-period">.</span></h1>
                <span className="character-rarity" aria-label={`${character.rarity ?? 5} star character`}>{ "★".repeat(character.rarity ?? 5) }</span>
              </div>
              <div className="character-identity-chips">
                <span className="element-chip"><i />{character.element || "Adventurer"}</span>
                <span>LEVEL {character.level ?? "—"}</span>
                <span>{character.friendship != null ? `FRIENDSHIP ${character.friendship}` : "PUBLIC PROFILE"}</span>
              </div>
              <div className="constellation-track" aria-label={`Constellation ${character.constellation ?? 0} of 6`}>
                <span className="constellation-label">CONSTELLATION</span>
                <div>{Array.from({ length: 6 }, (_, index) => <i key={index} className={index < (character.constellation ?? 0) ? "is-unlocked" : ""} />)}</div>
                <strong>C{character.constellation ?? 0}</strong>
              </div>
              <div className="character-build-quickstats">
                <div><span>WEAPON</span><strong>{character.weapon?.name || "Not available"}</strong><small>{character.weapon?.level ? `Lv. ${character.weapon.level} · R${character.weapon.refinement ?? "—"}` : "No weapon details"}</small></div>
                <div><span>ARTIFACTS</span><strong>{character.artifacts.length}<small className="quickstat-total"> / 5</small></strong><small>Equipped pieces</small></div>
                <div><span>TRAVELER</span><strong>{profile.nickname || "Traveler"}</strong><small>AR {profile.adventureRank ?? "—"} · WL {profile.worldLevel ?? "—"}</small></div>
              </div>
            </div>
          </section>

          <section className="character-build-content">
            <div className="build-section-heading"><div><span className="eyebrow">CHARACTER ANALYSIS</span><h2>Build overview</h2></div><span className="collection-note">Live public showcase data</span></div>
            <div className="build-details-grid">
              <section className="build-panel">
                <span className="build-panel-label">COMBAT ATTRIBUTES</span>
                <div className="build-stat-grid">
                  {character.stats.length ? character.stats.map((stat) => (
                    <div className="build-stat" key={stat.label}><span>{stat.label}{stat.detail && <small className="build-stat-detail">{stat.detail}</small>}</span><strong>{stat.value}</strong></div>
                  )) : <p className="build-empty">Combat attributes are not available in this showcase.</p>}
                </div>
              </section>

              <section className="build-panel weapon-panel">
                <span className="build-panel-label">EQUIPPED WEAPON</span>
                {character.weapon ? (
                  <div className="weapon-showcase">
                    <EquipmentArtwork src={character.weapon.icon} fallbackSrc={character.weapon.iconFallback} alt={character.weapon.name || "Equipped weapon"} rarity={character.weapon.rarity} kind="weapon" />
                    <div className="weapon-showcase-info">
                      <span className="equipment-kicker">CURRENTLY EQUIPPED</span>
                      <h3>{character.weapon.name || "Weapon"}</h3>
                      <p>Lv. {character.weapon.level ?? "—"} <span>·</span> Refinement {character.weapon.refinement ?? "—"}</p>
                      <div className="weapon-stats">
                        {character.weapon.baseAttack && <span>Base ATK <strong>{character.weapon.baseAttack}</strong></span>}
                        {character.weapon.substat && <span>{character.weapon.substat.label} <strong>{character.weapon.substat.value}</strong></span>}
                      </div>
                    </div>
                  </div>
                ) : <p className="build-empty">No weapon data found.</p>}
              </section>

              <section className="build-panel artifacts-panel">
                <span className="build-panel-label">ARTIFACTS · {character.artifacts.length}/5</span>
                {artifactSetSummary && <p className="artifact-set-summary">{artifactSetSummary}</p>}
                <div className="artifact-build-list">
                  {character.artifacts.map((artifact, index) => (
                    <article className="artifact-build-item" key={`${artifact.slot}-${index}`}>
                      <div className="artifact-visual-row">
                        <EquipmentArtwork src={artifact.icon} fallbackSrc={artifact.iconFallback} alt={artifact.name || `${artifact.slot} artifact`} rarity={artifact.rarity} kind="artifact" />
                        <div className="artifact-build-top">
                          <div><span>{artifact.slot}</span><h3>{artifact.name || `${artifact.setName || "Artifact"} · ${artifact.slot}`}</h3><p className="artifact-set-name">{artifact.setName ? `SET · ${artifact.setName}` : "SET NAME UNAVAILABLE"}</p></div>
                          <strong>+{artifact.level ?? 0}</strong>
                        </div>
                      </div>
                      {artifact.mainStat && <div className="artifact-main-stat"><span>{artifact.mainStat.label}</span><strong>{artifact.mainStat.value}</strong></div>}
                      <div className="artifact-roll-heading"><span>SUBSTAT ROLLS</span><span>{artifact.substats.length} / 4 ATTRIBUTES</span></div>
                      <div className="artifact-substats">
                        {artifact.substats.map((stat, statIndex) => <span key={`${stat.label}-${statIndex}`}><span>{stat.label}</span><strong>{stat.value}</strong></span>)}
                      </div>
                      <p className="artifact-roll-note">Displayed values are the exact aggregated substat totals published by Enka.</p>
                    </article>
                  ))}
                  {!character.artifacts.length && <p className="build-empty">No artifact data found.</p>}
                </div>
              </section>

              <section className="build-panel talent-panel">
                <span className="build-panel-label">TALENT LEVELS</span>
                {character.talents.length ? character.talents.map((talent) => (
                  <div className="build-stat" key={talent.name}><span>{talent.name}</span><strong>{talent.level}</strong></div>
                )) : <p className="build-empty">Talent data is not available.</p>}
              </section>
            </div>
            <p className="mapping-notice">This dossier contains only information exposed by {profile.nickname || "the player"}&apos;s public in-game showcase. Hidden inventory and private account data are not accessed.</p>
          </section>
        </>
      ) : null}

      <footer className="profile-footer"><span><ShieldCheck size={14} /> Public showcase data only</span><span>UNOFFICIAL FAN PROJECT</span></footer>
    </main>
  );
}
