"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, RefreshCw, ShieldCheck, Sparkles, Swords } from "lucide-react";
import type { PlayerApiError, PlayerShowcase, ShowcaseCharacter } from "@/lib/types";
import { NumberTicker } from "@/components/ui/number-ticker";

type Props = { uid: string };

const ELEMENT_COLORS: Record<string, { accent: string; bg: string; glow: string }> = {
  Cryo: { accent: "#9ed8e9", bg: "rgba(158,216,233,.12)", glow: "rgba(158,216,233,.28)" },
  Hydro: { accent: "#78bce9", bg: "rgba(120,188,233,.12)", glow: "rgba(120,188,233,.28)" },
  Pyro: { accent: "#ef866d", bg: "rgba(239,134,109,.12)", glow: "rgba(239,134,109,.28)" },
  Electro: { accent: "#b99be9", bg: "rgba(185,155,233,.12)", glow: "rgba(185,155,233,.28)" },
  Anemo: { accent: "#82d0b4", bg: "rgba(130,208,180,.12)", glow: "rgba(130,208,180,.28)" },
  Geo: { accent: "#e5bc75", bg: "rgba(229,188,117,.12)", glow: "rgba(229,188,117,.28)" },
  Dendro: { accent: "#a8c878", bg: "rgba(168,200,120,.12)", glow: "rgba(168,200,120,.28)" },
};

function CharacterCardArt({
  character,
  priority,
}: {
  character: ShowcaseCharacter;
  priority: boolean;
}) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const primary = character.image;
  const fallback = character.imageFallback;
  const currentSrc = sourceIndex === 0 ? primary : sourceIndex === 1 ? fallback : undefined;

  if (!currentSrc) {
    return <span className="character-card-fallback" aria-hidden="true">✦</span>;
  }

  return (
    <Image
      src={currentSrc}
      alt={`${character.name} character artwork`}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      priority={priority}
      quality={85}
      className="character-card-img"
      onError={() => {
        setSourceIndex((prev) => (prev === 0 && fallback ? 1 : 2));
      }}
    />
  );
}

export default function PlayerShowcase({ uid }: Props) {
  const [profile, setProfile] = useState<PlayerShowcase | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfile() {
      try {
        const response = await fetch(`/api/player/${uid}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) {
          const failure = data as PlayerApiError;
          throw new Error(failure.error || "We couldn't load this showcase.");
        }
        setProfile(data as PlayerShowcase);
        setError("");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Couldn't connect to the showcase service.");
        setProfile(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchProfile();
    return () => controller.abort();
  }, [uid, attempt]);

  function retry() {
    setLoading(true);
    setError("");
    setAttempt((current) => current + 1);
  }

  return (
    <main className="profile-page">
      <header className="profile-topbar">
        <Link href="/" className="brand" aria-label="Astra home">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">ASTRA<span className="brand-period">.</span></span>
        </Link>
        <Link href="/" className="back-link">
          <ArrowLeft size={14} /> Back to overview
        </Link>
      </header>

      {loading ? (
        <section className="profile-empty" aria-live="polite">
          <span className="eyebrow"><span className="status-dot" /> CONNECTING TO ENKA.NETWORK</span>
          <h1>Opening your archive.</h1>
          <p>Retrieving characters and build records from the public showcase.</p>
          <div className="loading-rule"><span /></div>
        </section>
      ) : error ? (
        <section className="profile-empty" role="alert">
          <span className="eyebrow">SHOWCASE UNAVAILABLE</span>
          <h1>We couldn&apos;t reach this archive.</h1>
          <p>{error}</p>
          <div className="profile-actions">
            <button type="button" className="primary-button" onClick={retry}>
              Try again <RefreshCw size={15} />
            </button>
            <Link href="/" className="back-link">
              Return home <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      ) : profile ? (
        <>
          <section className="profile-heading">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              AUTHENTICATED ARCHIVE · UID {profile.uid}
            </div>
            <div className="profile-title-row">
              <h1>{profile.nickname || "Traveler"}<span className="brand-period">.</span></h1>
              <span className="profile-badge-pill">
                <Sparkles size={13} /> PUBLIC SHOWCASE
              </span>
            </div>
            <p className="profile-signature">{profile.signature || "A journey written across Teyvat."}</p>
            <div className="profile-meta">
              <span>UID <strong>{profile.uid}</strong></span>
              {profile.adventureRank != null && (
                <span>ADVENTURE RANK <strong>AR {profile.adventureRank}</strong></span>
              )}
              {profile.worldLevel != null && (
                <span>WORLD LEVEL <strong>WL {profile.worldLevel}</strong></span>
              )}
              <span>COLLECTION <strong>{profile.characters.length} CHARACTERS</strong></span>
            </div>
          </section>

          <section className="profile-characters">
            <div className="collection-heading">
              <div>
                <span className="eyebrow">CHARACTER ROSTER</span>
                <h2>Featured builds <span>({profile.characters.length})</span></h2>
              </div>
              <span className="collection-note">Live Enka.Network public showcase data</span>
            </div>

            <div className="character-grid">
              {profile.characters.map((character, index) => {
                const elementStyle = ELEMENT_COLORS[character.element || ""] ?? {
                  accent: "#c8a96e",
                  bg: "rgba(200,169,110,.12)",
                  glow: "rgba(200,169,110,.28)",
                };

                return (
                  <Link
                    href={`/player/${uid}/character/${character.id}`}
                    className="character-card-link"
                    key={character.id}
                    aria-label={`Inspect ${character.name}'s build`}
                  >
                    <article className="character-card">
                      {/* Character Artwork Container with Fill / Cover */}
                      <div className="character-card-media">
                        <CharacterCardArt character={character} priority={index < 4} />
                        <div className="character-card-gradient" />

                        {/* Top Badges */}
                        <div className="character-card-top-badges">
                          <span
                            className="character-element-badge"
                            style={{
                              color: elementStyle.accent,
                              backgroundColor: elementStyle.bg,
                              borderColor: elementStyle.glow,
                            }}
                          >
                            <i style={{ backgroundColor: elementStyle.accent }} />
                            {character.element || "Genshin"}
                          </span>
                          <span className={`character-constellation-pill ${character.constellation ? "is-unlocked" : ""}`}>
                            C<NumberTicker value={character.constellation ?? 0} />
                          </span>
                        </div>

                        {/* Level overlay badge */}
                        {character.level != null && (
                          <span className="character-card-level-chip">
                            Lv. <NumberTicker value={character.level} />
                          </span>
                        )}
                      </div>

                      {/* Character Card Details */}
                      <div className="character-card-body">
                        <div className="character-card-header">
                          <h3 className="character-card-name">{character.name}</h3>
                          <div
                            className="character-card-rarity"
                            aria-label={`${character.rarity ?? 5}-star`}
                          >
                            {"★".repeat(character.rarity ?? 5)}
                          </div>
                        </div>

                        {/* Weapon & Build Sub-info */}
                        <div className="character-card-equipment">
                          <div className="character-weapon-pill">
                            <Swords size={12} />
                            <span>
                              {character.weapon?.name || "Weapon"}
                              {character.weapon?.refinement != null && (
                                <> · R<NumberTicker value={character.weapon.refinement} /></>
                              )}
                            </span>
                          </div>
                          {character.critValue != null && (
                            <span className="character-cv-pill" title="Crit Value = (CRIT Rate × 2) + CRIT DMG">
                              <NumberTicker value={character.critValue} decimalPlaces={1} /> CV
                            </span>
                          )}
                        </div>

                        {/* Card Footer CTA */}
                        <div className="character-card-cta">
                          <span>Inspect build</span>
                          <ArrowUpRight size={13} />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            <p className="mapping-notice">
              Click any character to open their detailed combat dossier, equipped artifacts, weapon stats, talents, and constellations.
            </p>
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
