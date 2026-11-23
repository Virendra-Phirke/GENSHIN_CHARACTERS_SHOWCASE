# Astra — Genshin Character Showcase

A responsive, cinematic character showcase built with Next.js, TypeScript and a restrained dark-fantasy design system.

## Local development

Requirements:
- Node.js 20.9 or newer
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

The scripts currently use Next.js Webpack mode because the connected Windows build environment cannot load its native Turbopack SWC binary.

## Current implementation

- Responsive Astra landing page and UID search form.
- UID validation for 8–10 digit public UIDs.
- Server-side Enka.Network API route.
- Basic player profile and showcase normalization.
- TTL-aware in-process cache for Enka responses.
- Dark-fantasy design tokens and reduced-motion CSS support.
- Next.js remote image configuration with WebP output enabled.
- Initial player archive route and character cards.

## Important current limitations

1. Enka data parsing is intentionally conservative. Character names, elements, full stat labels, weapon names, artifact names and main/substat labels are not guessed.
2. `src/data/character-assets.json` is an empty verified-mapping manifest. Populate it only after confirming each Enka avatar ID against a trusted character dataset and validating the corresponding Genshin.dev slug.
3. Genshin.dev returned HTTP 521 during initial integration checks on 23 November 2026. The landing page has a fallback image sequence and a neutral fallback presentation; live artwork must be re-tested when the upstream service is available.
4. The current Enka cache is process-local. For multi-instance production deployments, use a shared cache or a platform cache with TTL semantics.
5. The character build detail page, verified asset mapper, artifact stat translations, talents/constellations detail and full character switching experience are still pending.

## Architecture

- `src/app`: App Router pages and API routes.
- `src/components`: reusable interface components.
- `src/lib`: types and data/API utilities.
- `src/data/character-assets.json`: verified Enka ID to Genshin.dev asset manifest.
- `genshin-showcase-implementation-plan.md`: complete product specification and phased delivery plan.

## Data sources

- Enka.Network: public showcase data — https://enka.network/
- Genshin.dev: community-maintained character metadata and artwork — https://genshin.jmp.blue/

This is an unofficial fan-made project and is not affiliated with or endorsed by HoYoverse. Review current API terms, asset provenance and fan-content policies before public deployment.
