import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Crown, Layers3, ShieldCheck, Swords } from "lucide-react";
import { SHOWCASE_UID } from "@/lib/constants";

const FEATURED_HERO_ARTWORK = "https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_SkirkNew.webp";

const highlights = [
  {
    icon: Swords,
    number: "01",
    title: "Exact combat metrics",
    copy: "True final HP, ATK, DEF with base-bonus breakdowns, Crit Value calculation, weapons, and refinement rank.",
  },
  {
    icon: Layers3,
    number: "02",
    title: "Dedicated artifact dossier",
    copy: "All 5 artifact slots with exact Enka substats, roll counts, set bonuses, and individual piece CV ratings.",
  },
  {
    icon: Crown,
    number: "03",
    title: "Talents & Constellations",
    copy: "Official skill and constellation icons with live upgrade tiers, crowned talent indicators, and C0–C6 tracking.",
  },
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <Link href="/" className="brand" aria-label="Astra home">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">ASTRA<span className="brand-period">.</span></span>
        </Link>
        <nav className="topnav" aria-label="Main navigation">
          <a href="#experience">Experience</a>
          <a href="#how-it-works">The archive</a>
          <a href="#about">Privacy & Data</a>
        </nav>
        <Link className="topbar-link" href={`/player/${SHOWCASE_UID}`}>
          Open archive <ArrowUpRight size={15} />
        </Link>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow reveal-up">
            <span className="eyebrow-line" />
            PERSONAL SHOWCASE ARCHIVE · UID {SHOWCASE_UID}
          </div>
          <h1 className="reveal-up delay-1" id="hero-title">
            Your builds.<br />
            <span>Cinematically</span> told.
          </h1>
          <p className="hero-description reveal-up delay-2">
            A considered, artwork-first space for the characters in this showcase. Explore their combat attributes, artifact rolls, weapons, talents, and constellations in a cinematic interface designed for Travelers.
          </p>
          <div className="uid-form reveal-up delay-3">
            <Link className="primary-button" href={`/player/${SHOWCASE_UID}`}>
              Explore character showcase <ArrowRight size={17} />
            </Link>
            <p className="form-message">
              Configured exclusively for the authenticated showcase of UID {SHOWCASE_UID}.
            </p>
          </div>
          <div className="hero-footnote reveal-up delay-4">
            <span className="status-dot" />
            <span>LIVE IN-GAME ENKA.NETWORK DATA FEED</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Featured character artwork">
          <div className="art-halo" />
          <div className="art-image-wrap is-loaded">
            <Image
              src={FEATURED_HERO_ARTWORK}
              alt="Skirk character artwork"
              fill
              priority
              unoptimized
              sizes="(max-width: 760px) 100vw, 55vw"
              className="hero-character-image"
            />
          </div>
          <div className="art-vignette" />
          <div className="art-index">
            <span>01</span>
            <i /> FEATURED DOSSIER
          </div>
          <div className="art-caption">
            <span className="art-element">CRYO</span>
            <span className="art-name">Skirk · The Unfathomable Void</span>
          </div>
          <div className="art-side-note">KHAENRI&apos;AH · DISCIPLINE OF THE SWORD</div>
        </div>

        <a href="#experience" className="scroll-cue">
          <span>SCROLL TO DISCOVER</span>
          <ArrowDown size={14} />
        </a>
        <div className="hero-coordinate">UID {SHOWCASE_UID} · ASIA SERVER</div>
      </section>

      <section className="intro-strip" id="experience">
        <div className="intro-label">A CLOSER LOOK</div>
        <p>
          Beyond simple numbers. <span>A luxury digital portrait of the craftsmanship behind each build.</span>
        </p>
        <div className="intro-rule" />
      </section>

      <section className="feature-section" id="how-it-works">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              THE DOSSIER EXPERIENCE
            </div>
            <h2>
              Made for the details<br />
              <em>worth remembering.</em>
            </h2>
          </div>
          <p className="section-aside">
            The public in-game showcase is the sole source of truth. Every combat attribute, artifact roll, and talent tier is arranged to feel effortless to inspect.
          </p>
        </div>

        <div className="feature-grid">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article className="feature-card" key={item.number}>
                <div className="feature-card-top">
                  <span>{item.number}</span>
                  <Icon size={19} strokeWidth={1.4} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <div className="feature-card-line" />
              </article>
            );
          })}
        </div>
      </section>

      <section className="privacy-band" id="about">
        <div className="privacy-icon">
          <ShieldCheck size={22} strokeWidth={1.5} />
        </div>
        <div>
          <div className="eyebrow">AUTHENTICATED PUBLIC SHOWCASE</div>
          <h2>
            Your account stays yours. <span>Nothing more.</span>
          </h2>
          <p>
            Astra connects solely to the public character showcase published by Enka.Network for UID {SHOWCASE_UID}. No game login, password, cookies, or account tokens are ever requested or stored.
          </p>
        </div>
        <Link href={`/player/${SHOWCASE_UID}`} className="text-link">
          Open player showcase <ArrowUpRight size={15} />
        </Link>
      </section>

      <footer className="footer">
        <Link href="/" className="brand">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">ASTRA<span className="brand-period">.</span></span>
        </Link>
        <p>An unofficial personal Genshin Impact character showcase.</p>
        <div className="footer-links">
          <a href="https://enka.network/" target="_blank" rel="noreferrer">
            Enka.Network
          </a>
        </div>
        <span className="copyright">NOT AFFILIATED WITH HOYOVERSE</span>
      </footer>
    </main>
  );
}
