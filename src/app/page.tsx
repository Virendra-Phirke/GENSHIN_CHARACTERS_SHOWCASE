import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Layers3, ShieldCheck, Swords } from "lucide-react";
import { SHOWCASE_UID } from "@/lib/constants";

const ARTWORK = [
  "https://genshin.jmp.blue/characters/raiden-shogun/gacha-splash",
  "https://genshin.jmp.blue/characters/raiden-shogun/portrait",
  "https://genshin.jmp.blue/characters/raiden-shogun/icon",
];

const highlights = [
  { icon: Swords, number: "01", title: "Every detail matters", copy: "Weapons, artifacts, talents and combat stats — brought together in one considered view." },
  { icon: Layers3, number: "02", title: "One personal archive", copy: "A focused collection of the characters currently displayed on this account." },
  { icon: ShieldCheck, number: "03", title: "Public data only", copy: "Astra reads the public in-game showcase. No passwords, cookies or game credentials." },
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
          <a href="#about">About</a>
        </nav>
        <Link className="topbar-link" href={`/player/${SHOWCASE_UID}`}>Open archive <ArrowUpRight size={15} /></Link>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow reveal-up"><span className="eyebrow-line" />A PERSONAL CHARACTER ARCHIVE</div>
          <h1 className="reveal-up delay-1" id="hero-title">Your journey.<br /><span>Beautifully</span> told.</h1>
          <p className="hero-description reveal-up delay-2">A considered space for the characters in this showcase. Explore their builds, equipment and details in a cinematic experience made for Travelers.</p>
          <div className="uid-form reveal-up delay-3">
            <Link className="primary-button" href={`/player/${SHOWCASE_UID}`}>Explore character showcase <ArrowRight size={17} /></Link>
            <p className="form-message">Astra is dedicated to one public Genshin Impact showcase.</p>
          </div>
          <div className="hero-footnote reveal-up delay-4"><span className="status-dot" />BUILT AROUND ONE PUBLIC CHARACTER SHOWCASE</div>
        </div>

        <div className="hero-art" aria-label="Featured character artwork">
          <div className="art-halo" />
          <div className="art-image-wrap is-loaded">
            <Image src={ARTWORK[0]} alt="Raiden Shogun character artwork" fill preload quality={85}
              sizes="(max-width: 760px) 100vw, 58vw" className="hero-character-image" />
          </div>
          <div className="art-vignette" />
          <div className="art-index"><span>01</span><i /> FEATURED CHARACTER</div>
          <div className="art-caption"><span className="art-element">ELECTRO</span><span className="art-name">The Plane of Euthymia</span></div>
          <div className="art-side-note">INAZUMA · THE IMMUTABLE GOD</div>
        </div>

        <a href="#experience" className="scroll-cue"><span>SCROLL TO DISCOVER</span><ArrowDown size={14} /></a>
        <div className="hero-coordinate">35°41′ N&nbsp; 139°41′ E</div>
      </section>

      <section className="intro-strip" id="experience">
        <div className="intro-label">A CLOSER LOOK</div>
        <p>More than a build page. <span>A portrait of the journey behind each character.</span></p>
        <div className="intro-rule" />
      </section>

      <section className="feature-section" id="how-it-works">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" />THE EXPERIENCE</div><h2>Made for the details<br /><em>worth remembering.</em></h2></div>
          <p className="section-aside">The public showcase is the source of truth. Every available detail is arranged to feel effortless to explore.</p>
        </div>
        <div className="feature-grid">
          {highlights.map((item) => {
            const Icon = item.icon;
            return <article className="feature-card" key={item.number}>
              <div className="feature-card-top"><span>{item.number}</span><Icon size={19} strokeWidth={1.4} /></div>
              <h3>{item.title}</h3><p>{item.copy}</p><div className="feature-card-line" />
            </article>;
          })}
        </div>
      </section>

      <section className="privacy-band" id="about">
        <div className="privacy-icon"><ShieldCheck size={22} strokeWidth={1.5} /></div>
        <div><div className="eyebrow">YOUR ACCOUNT STAYS YOURS</div><h2>Public showcase. <span>Nothing more.</span></h2>
          <p>Astra reads only the characters and build information exposed by the configured public showcase through Enka.Network. No game login, password or account connection is requested.</p></div>
        <a href="https://enka.network/" target="_blank" rel="noreferrer" className="text-link">About Enka.Network <ArrowUpRight size={15} /></a>
      </section>

      <footer className="footer">
        <Link href="/" className="brand"><span className="brand-mark"><span /></span><span className="brand-name">ASTRA<span className="brand-period">.</span></span></Link>
        <p>An unofficial fan-made character showcase.</p>
        <div className="footer-links"><a href="https://enka.network/" target="_blank" rel="noreferrer">Enka.Network</a></div>
        <span className="copyright">NOT AFFILIATED WITH HOYOVERSE</span>
      </footer>
    </main>
  );
}
