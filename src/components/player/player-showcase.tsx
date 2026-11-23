"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, RefreshCw, ShieldCheck } from "lucide-react";
import type { PlayerApiError, PlayerShowcase } from "@/lib/types";

type Props = { uid: string };

function CharacterArtwork({
  primarySrc,
  fallbackSrc,
  alt,
  priority,
}: {
  primarySrc?: string;
  fallbackSrc?: string;
  alt: string;
  priority: boolean;
}) {
  const sources = [primarySrc, fallbackSrc].filter(
    (source, index, all): source is string =>
      Boolean(source) && all.indexOf(source) === index,
  );
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const src = sources.find((source) => !failedSources.includes(source));

  if (!src) {
    return <span className="character-tile-placeholder" aria-hidden="true">✦</span>;
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 760px) 45vw, (max-width: 1050px) 22vw, 18vw"
      quality={85}
      priority={priority}
      className="character-tile-image"
      onError={() => {
        setFailedSources((current) =>
          current.includes(src) ? current : [...current, src],
        );
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
        <Link href="/" className="brand"><span className="brand-mark"><span /></span><span className="brand-name">ASTRA<span className="brand-period">.</span></span></Link>
        <Link href="/" className="back-link"><ArrowLeft size={15} /> Home</Link>
      </header>

      {loading ? (
        <section className="profile-empty" aria-live="polite">
          <span className="eyebrow"><span className="status-dot" /> CONNECTING TO ENKA.NETWORK</span>
          <h1>Opening your archive.</h1>
          <p>Retrieving the characters you have chosen to showcase.</p>
          <div className="loading-rule"><span /></div>
        </section>
      ) : error ? (
        <section className="profile-empty" role="alert">
          <span className="eyebrow">SHOWCASE UNAVAILABLE</span>
          <h1>We couldn&apos;t reach this archive.</h1>
          <p>{error}</p>
          <div className="profile-actions">
            <button type="button" className="primary-button" onClick={retry}>Try again <RefreshCw size={15} /></button>
            <Link href="/" className="back-link">Return home <ArrowUpRight size={15} /></Link>
          </div>
        </section>
      ) : profile ? (
        <>
          <section className="profile-heading">
            <div className="eyebrow"><span className="eyebrow-line" /> PLAYER ARCHIVE</div>
            <h1>{profile.nickname || "Traveler"}<span className="brand-period">.</span></h1>
            <p className="profile-signature">{profile.signature || "A journey written across Teyvat."}</p>
            <div className="profile-meta">
              <span>UID <strong>{profile.uid}</strong></span>
              {profile.adventureRank != null && <span>ADVENTURE RANK <strong>{profile.adventureRank}</strong></span>}
              {profile.worldLevel != null && <span>WORLD LEVEL <strong>{profile.worldLevel}</strong></span>}
              <span>SHOWCASE <strong>{profile.characters.length} CHARACTERS</strong></span>
            </div>
          </section>
          <section className="profile-characters">
            <div className="collection-heading">
              <div><span className="eyebrow">PUBLIC SHOWCASE</span><h2>Featured characters <span>({profile.characters.length})</span></h2></div>
              <span className="collection-note">As displayed in-game</span>
            </div>
            <div className="character-grid">
              {profile.characters.map((character, index) => (
                <Link
                  href={`/player/${uid}/character/${character.id}`}
                  className="character-card-link"
                  key={character.id}
                  aria-label={`View ${character.name} character build`}
                >
                  <article className="character-tile">
                    <div className="character-tile-art">
                      <div className="character-tile-symbol">{String(index + 1).padStart(2, "0")}</div>
                      <CharacterArtwork
                        primarySrc={character.image}
                        fallbackSrc={character.imageFallback}
                        alt={`${character.name} character artwork`}
                        priority={index < 5}
                      />
                      {character.level != null && <span className="character-level">LV. {character.level}</span>}
                    </div>
                    <div className="character-tile-info">
                      <span>{character.element || "SHOWCASE CHARACTER"}</span>
                      <h3>{character.name}</h3>
                      <p>{character.weapon?.level ? `Weapon Lv. ${character.weapon.level}` : "Build details loading"}</p>
                      <div className="character-tile-meta"><span>{character.artifacts.length} artifacts</span><span>{character.talents.length} talents</span></div>
                      <span className="build-open-button">
                        View character build
                        <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <p className="mapping-notice">Select any character card to inspect its build. All information is limited to the player&apos;s public in-game showcase.</p>
          </section>
        </>
      ) : null}

      <footer className="profile-footer"><span><ShieldCheck size={14} /> Public showcase data only</span><span>UNOFFICIAL FAN PROJECT</span></footer>
    </main>
  );
}