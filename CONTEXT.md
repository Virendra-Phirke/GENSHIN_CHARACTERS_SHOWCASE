<!-- This file provides AI context and guidelines for this project. -->
# GENSHIN CHARACTER BUILDS

## Product direction
Build Astra, a premium dark-fantasy Genshin Impact public showcase viewer. Use only public UID data from Enka.Network. Never ask for game passwords, cookies, tokens, or account access. Artwork source is Genshin.dev. 2D artwork only; no 3D.

## Current stack
- Next.js 16 App Router, React 19, TypeScript 5.9
- Tailwind CSS v4 configured through PostCSS (most styling currently in globals.css)
- shadcn-inspired semantic components and Lucide icons
- @animate-ui/react and Motion packages installed, but not imported into the UI yet because Motion 14 package/runtime resolution caused production bundling failures in this Windows environment. Current motion is CSS-based and reduced-motion aware.
- Next.js Image configured for genshin.jmp.blue and WebP negotiation.

## Latest UI refinement (2026-11-23)
- Refined desktop/tablet hero grid sizing and responsive vertical rhythm; removed the fixed-height/min-height conflict.
- Improved splash artwork fade-in and loading transition. Next Image optimization is enabled (WebP negotiation, quality 85); remote image quality allowlist is configured.
- Improved UID field native validation (8–10 digits), loading label, form busy state and accessible error announcement.
- Added restrained touch/hover behavior, mobile card interaction states, smaller-screen profile metadata layout and below-fold content rendering optimization.
- Removed the fake example.com metadata base URL.
- TypeScript, ESLint and production Webpack build all pass after this refinement.
- Animation remains CSS-based; no excessive particle/glow effects or motion-library runtime was introduced.

## Current routes and files
- `src/app/page.tsx`: Astra landing page and UID lookup form
- `src/app/api/player/[uid]/route.ts`: server-side Enka fetch, UID validation, TTL-aware in-process cache, combat stat formatting and build normalization
- `src/app/player/[uid]/page.tsx`: UID validation and client showcase shell
- `src/components/player/player-showcase.tsx`: player archive with whole-card navigation to individual character dossiers
- `src/components/player/character-build-page.tsx`: dedicated public character dossier with combat stats, weapon, artifacts and talents
- `src/app/player/[uid]/character/[characterId]/page.tsx`: validated dedicated character build route
- `src/app/globals.css`: dark visual system, responsive breakpoints, reduced-motion CSS
- `src/app/build-details.css`: responsive character dossier and build panel styling
- `src/lib/types.ts`: typed character, weapon, artifact and combat stat payloads
- `src/lib/character-assets.ts`: Enka avatar metadata and splash-art URL resolver
- `src/data/character-assets.json`: legacy empty manifest; runtime character metadata is resolved from Enka's published avatar store
- `genshin-showcase-implementation-plan.md`: complete product spec and phased plan
- `README.md`: setup and current limitations

## Visual standards
Midnight background #10141D, slate surfaces #202735, muted gold #C8A96E, soft text #D9DEE8. Character artwork should dominate. Keep glow, gradients, blur and particles restrained. Avoid generic AI dashboard styling. Mobile first-class; no horizontal overflow at 320px. Respect prefers-reduced-motion.

## Character artwork pipeline update (2026-11-23)
- Added `src/lib/character-assets.ts`, which loads Enka's published avatar metadata and English localization maps, resolves avatar IDs to names/elements, and derives Genshin.dev character splash URLs.
- The resolver is cached in-process for six hours; the upstream JSON fetches also use Next.js revalidation.
- Character API normalization now returns `image` (Genshin.dev gacha-splash) and `imageFallback` (Enka CDN gacha artwork derived from the verified Enka SideIconName).
- Character cards now render Next Image with WebP optimization, responsive sizes, first-row priority, error-triggered Enka fallback and a final decorative fallback only if both sources fail.
- Added `enka.network/ui/**` to Next image remote patterns.
- Live checks on 2026-11-23 confirmed Enka avatar metadata and all five screenshot fallback image URLs (Neuvillette, Furina, Mavuika, Raiden Shogun, Columbina) return successfully. Genshin.dev currently returns HTTP 521 and api.genshin.dev returns HTTP 502, so cards should use the Enka image fallback until Genshin.dev recovers.
- TypeScript, ESLint and production Webpack build pass after the change. The existing invalid Windows SWC native binary warning remains; Next uses its WASM fallback.

## Character build details phase (2026-11-23)
- Enka API normalization now extracts combat attributes from `fightPropMap`, weapon name/level/refinement/rarity/base ATK/substat, artifact slot/set/rarity/level/main stat/substats, talent levels, and constellation count from `talentIdList`.
- Equipment names are resolved through Enka's English localization store. Stat identifiers are formatted into readable labels and percentage values.
- Added a dedicated character dossier route at /player/[uid]/character/[characterId]. Every character card is a single navigation link to its own build page; the archive no longer expands build details inline.
- The dossier presents character artwork and summary, combat attributes, equipped weapon, artifact rows and talent levels in a responsive layout. A return link leads back to the same player archive.
- Build details remain strictly limited to fields Enka exposes in the public showcase. No private inventory or account credentials are requested.
- Validation: TypeScript passes, ESLint passes with no warnings, and the production Webpack build passes. The existing Windows SWC native binary warning remains; Next.js completes using its WASM fallback.
- The Enka API field contract was checked against Enka.Network's published API documentation: `talentIdList` represents unlocked constellation IDs; `fightPropMap` contains combat stats; `equipList` contains weapon and artifact data; `flat` carries localized equipment names and displayed stats. See https://github.com/EnkaNetwork/API-docs/blob/master/docs/gi/api.md.

## Important current limitations / next tasks
1. Genshin.dev is currently unavailable (521/502 on 2026-11-23); the Enka CDN artwork fallback is active when the primary splash URL fails.
2. Talent labels currently use neutral slot labels (Talent 1, Talent 2, etc.); resolve actual Normal Attack / Elemental Skill / Elemental Burst names through verified skill-depot metadata before claiming semantic talent names.
3. Validate parser output against real public UID fixtures containing a weapon, five artifacts, multiple substats, and different constellation levels. Some Enka flat fields can be absent; the UI handles missing values without inventing them.
4. Current cache is process-local and suitable only as a best-effort development cache. Add shared cache / platform cache and robust rate limiting before production.
5. Character collection filters, full Animate UI/Magic UI integration, and live browser visual verification are not implemented yet.

## Commands
- `npm run dev` (configured with Webpack for this Windows environment)
- `npm run typecheck`
- `npm run lint`
- `npm run build` (Webpack mode)

## Equipment artwork and dossier visual update (2026-11-23)
- Character splash art now uses the Hakush.in static WebP mirror at https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_{token}.webp, rather than the Genshin.dev API route. Enka's https://enka.network/ui/UI_Gacha_AvatarImg_{token}.png is the automatic fallback.
- The exact Hakush.in path was verified with HTTP 200 and image/webp for all five characters in the earlier showcase: Neuvillette, Furina, Mavuika, Raiden Shogun (token Shougun), and Columbina. The incorrect /gi/UI/ path was tested and rejected; do not revert to it.
- Weapon and artifact icons also prefer the same Hakush.in /assets/gi/{flat.icon}.webp mirror, with Enka PNG URLs as per-item fallbacks.
- Next Image remote allowlist includes static.nanoka.cc /assets/gi/** and enka.network /ui/**. Next image optimization negotiates WebP output.
- Character hero now has element-specific accent colors, character rarity stars, friendship/level identity chips, six-node constellation progress, and a more expressive quick-stat summary. Character rarity is sourced from Enka avatar QualityType, not the equipped weapon.
- Combat stat panels have highlighted lead stats, more editorial section headers and warmer layered surfaces. Weapon/artifact presentation retains constrained contain sizing, rarity framing, subtle hover movement and reduced-motion support.
- Image failure is handled as a two-source sequence; if both sources fail, the UI retains the data and shows an icon fallback.
- Browser screenshot QA and a real public UID equipment-image verification remain pending.
