# Genshin Impact Character Showcase

## Product Specification, UI/UX Standards & Implementation Plan

**Document status:** Baseline implementation specification\
**Version:** 1.0\
**Date:** 23 November 2026

------------------------------------------------------------------------

## 1. Project Overview

Build a responsive, premium-quality Genshin Impact character showcase
website. A player enters their **public in-game UID** and the website
retrieves the character showcase information exposed by their in-game
profile. The site presents those characters, their builds, equipment,
stats, talents and constellations using high-quality 2D character
artwork.

The experience should feel like a professionally art-directed game
companion product: cinematic and immersive, but still clear, fast,
accessible and practical.

### Product goals

-   Display characters exposed through the player's public in-game
    showcase.
-   Present character builds accurately and clearly.
-   Use 2D character splash artwork rather than 3D models.
-   Provide smooth character switching and responsive layouts.
-   Deliver optimized WebP images where supported by the image pipeline.
-   Handle unavailable data and artwork gracefully.
-   Avoid collecting game credentials or requiring account
    authentication.

### Non-goals for version 1

-   No game login, password, cookie, token or HoYoverse account access.
-   No private inventory access beyond what the public showcase API
    exposes.
-   No 3D character models, real-time 3D rendering or model-to-splash
    transformation.
-   No user account system, database-backed saved profiles or social
    features.
-   No editing or modifying in-game data.

------------------------------------------------------------------------

## 2. Confirmed Product Decisions

  -----------------------------------------------------------------------
  Area                                Decision
  ----------------------------------- -----------------------------------
  Player data source                  Enka.Network

  Artwork and character metadata      Genshin.dev API

  Artwork presentation                2D character splash artwork

  Image delivery                      WebP through Next.js image
                                      optimization where supported

  Framework                           Next.js App Router, React and
                                      TypeScript

  Styling                             Tailwind CSS and shadcn/ui

  Component animation                 Animate UI and Motion

  Decorative effects                  Selected Magic UI components

  Hosting target                      Vercel-compatible deployment

  Database in v1                      Not required

  Authentication in v1                Not required

  Visual direction                    Premium dark fantasy, cinematic,
                                      restrained

  Responsive support                  Mobile, tablet and desktop
  -----------------------------------------------------------------------

**Important data limitation:** Enka can only return information
available through the player's public in-game character showcase. It
does not provide unrestricted access to the player's entire account or
private inventory.

------------------------------------------------------------------------

## 3. Design Principles and Art Direction

### 3.1 Visual direction

Use a premium dark-fantasy visual language inspired by the atmosphere
and presentation of Genshin Impact, without copying an unrelated website
template.

The character artwork is the visual centerpiece. Typography, layout,
spacing and restrained motion should support the artwork rather than
compete with it.

### 3.2 Design principles

1.  **Artwork first:** Large, carefully cropped character artwork should
    establish the identity of each character page.
2.  **Clear hierarchy:** Character name, element, level, constellation
    and build information must be easy to scan.
3.  **Restraint:** Use glow, blur, gradients, particles and shadows
    sparingly.
4.  **Consistency:** Use a deliberate spacing scale, typography scale,
    radius scale and motion system.
5.  **Legibility:** Build statistics and artifact details must remain
    readable over dark surfaces.
6.  **Responsive by design:** Mobile must be designed as a first-class
    layout, not a compressed desktop page.
7.  **Performance:** Avoid effects that cause layout shifts, excessive
    repainting or unnecessary JavaScript work.

### 3.3 Initial color tokens

These are starting tokens. Validate contrast and refine them during
implementation.

  Token                 Value                      Purpose
  --------------------- -------------------------- ----------------------------------------
  Midnight background   `#10141D`                  Main page background
  Slate surface         `#202735`                  Cards and panels
  Muted gold            `#C8A96E`                  Premium highlights and selected states
  Soft primary text     `#D9DEE8`                  Main readable text
  Secondary text        `#A6ACB8`                  Supporting information
  Subtle divider        `rgba(217,222,232,0.10)`   Minimal separators

Character-specific elemental colors may influence small accents, active
indicators and background atmosphere. They must not override readability
or turn the entire interface into a saturated element-colored screen.

### 3.4 Typography

Use a restrained type system:

-   Display typeface: a distinctive but readable display face for
    character names and major headings.
-   Interface typeface: a highly legible sans-serif for labels, controls
    and body content.
-   Numeric treatment: tabular numerals for stats, percentages and
    values.
-   Use a clear scale for page titles, section headings, card titles,
    labels and metadata.
-   Avoid oversized headings that push useful content below the fold.

### 3.5 Avoid these patterns

The following are explicit design anti-requirements:

-   Random purple/blue gradient backgrounds.
-   Glowing borders around every card.
-   Excessive glassmorphism or blur.
-   Unnecessary floating shapes and particle effects.
-   Animating every section independently.
-   Generic dashboard cards that make character artwork secondary.
-   Inconsistent radii, spacing and typography.
-   Excessive rounded corners.
-   Fake loading animations or artificial delays.
-   Motion that makes navigation or reading slower.
-   Decorative effects that reduce contrast or accessibility.

------------------------------------------------------------------------

## 4. Information Architecture and Pages

### 4.1 Landing page

Purpose: introduce the experience and let the visitor enter a UID.

Suggested sections:

1.  Compact site navigation and branding.
2.  Cinematic hero with a featured character artwork.
3.  Clear title and short explanation.
4.  UID search field and primary action.
5.  Featured character strip or selected character previews.
6.  Short explanation of public showcase data and privacy.
7.  Footer with API and asset credits.

UID search requirements:

-   Validate UID format before making an upstream request.
-   Provide clear idle, focus, loading, success and error states.
-   Do not reveal whether an account exists through overly detailed
    validation messages.
-   Prevent repeated submissions while a request is pending.
-   Support keyboard submission and accessible labels.

### 4.2 Player profile page

Route: `/player/[uid]`

Display only fields actually returned by the upstream response, such as:

-   Player nickname.
-   UID.
-   Adventure Rank.
-   World Level, if available.
-   Showcase character count.
-   Character collection.

Do not render empty labels or fabricate unavailable profile values.

### 4.3 Character showcase page

Route: `/character/[id]` or a nested player character route if player
context is needed.

Primary content:

-   Large character splash artwork.
-   Character name and element.
-   Rarity.
-   Character level.
-   Friendship level, if exposed.
-   Constellation level.
-   Previous/next character controls.
-   Elemental background treatment.
-   Optional character-specific decorative details.

The artwork should remain visually dominant while the character metadata
remains readable.

### 4.4 Build details

Organize build information into clear sections or tabs:

-   Overview and combat stats.
-   Weapon.
-   Five artifact slots.
-   Artifact main stats and substats.
-   Talents.
-   Constellations.

Show values exactly as parsed from the source. Do not infer missing
values or silently substitute defaults.

### 4.5 Character collection

Features:

-   Responsive character portrait grid.
-   Search by character name.
-   Filter by element.
-   Sort by level or rarity where the required data exists.
-   Clear active/selected state.
-   Smooth character switching.
-   Empty state when no showcase characters are available.

### 4.6 About and credits

Include:

-   Enka.Network attribution.
-   Genshin.dev attribution.
-   Artwork and asset credits where required.
-   A note that this is an unofficial fan project.
-   Data freshness information where it can be determined.
-   A concise privacy statement explaining that only a public UID is
    used and no game credentials are requested.

------------------------------------------------------------------------

## 5. Data and API Architecture

### 5.1 Enka.Network

Player showcase endpoint:

`GET https://enka.network/api/uid/{uid}/`

Use Enka server-side only. The browser should call an application-owned
route, not Enka directly.

Responsibilities:

-   Validate UID input.
-   Request the showcase data.
-   Respect the response's `ttl` field.
-   Normalize the upstream response into app-owned TypeScript types.
-   Return a predictable application response shape.
-   Handle upstream failures and empty showcases.

Enka may impose dynamic rate limits. Use a descriptive custom
User-Agent, cache responses according to the returned TTL, and avoid
repeated requests while cached data is still valid.

Do not assume that a successful HTTP response always contains a usable
character showcase.

### 5.2 Genshin.dev

Base URL:

`https://genshin.jmp.blue`

Useful API routes to verify against the live API documentation:

-   `GET /characters`
-   `GET /characters/{slug}`
-   `GET /characters/{slug}/list`
-   `GET /characters/{slug}/{imageType}`

Use the character catalog and the per-character image list to discover
valid image variants. Do not assume every character has the same image
variants.

Genshin.dev is community-maintained and is not an official HoYoverse
API.

### 5.3 Character ID to slug mapping

Enka character identifiers and Genshin.dev slugs must not be treated as
interchangeable.

Create a mapping manifest:

`src/data/character-assets.json`

The mapping should connect a validated Enka character ID to:

-   Genshin.dev slug.
-   Preferred artwork variant.
-   Ordered fallback variants.
-   Optional local metadata overrides, only where justified.

Validate mapping entries against the Genshin.dev character catalog.
Unknown IDs should produce a controlled fallback state and a diagnostic
log, not a broken image or a guessed slug.

### 5.4 Artwork variant resolution

Recommended preference order:

1.  Splash or gacha splash artwork, only if the API actually exposes a
    suitable variant.
2.  Card artwork.
3.  Portrait artwork.
4.  Large icon.
5.  Standard icon.
6.  Neutral local placeholder.

The exact variant names must be discovered from the character's `/list`
response. The resolver must not assume that every character has a
`splash` or `gacha-splash` file.

### 5.5 Image delivery and WebP

Use Next.js Image optimization for remote Genshin.dev images.

Configure:

-   `images.formats: ["image/webp"]`
-   A narrowly scoped remote image pattern for `genshin.jmp.blue`.
-   Explicit image dimensions or aspect ratios.
-   Responsive `sizes` values.
-   Lazy loading for below-the-fold artwork.
-   High priority only for the primary hero artwork.

WebP is the desired delivery format, not an assumption about the
upstream file format. Next.js may transform supported source images into
WebP for compatible clients.

Do not accept arbitrary user-provided image URLs in the image proxy or
resolver.

### 5.6 Image loading pipeline

1.  Receive a normalized character ID.
2.  Resolve the ID to a validated character slug.
3.  Read the character's available image variants.
4.  Select the preferred supported artwork.
5.  Generate the approved Genshin.dev image URL from trusted mapping
    data.
6.  Render using Next.js Image.
7.  If the image fails, attempt the next valid fallback.
8.  If all variants fail, show a neutral placeholder.
9.  Record a non-sensitive diagnostic event for mapping or image
    failures.

Keep a stable aspect ratio during loading to prevent layout shifts.

### 5.7 Caching strategy

  -----------------------------------------------------------------------
  Data                                Suggested policy
  ----------------------------------- -----------------------------------
  Character catalog and ID mapping    Revalidate approximately every 24
                                      hours or weekly

  Image variant metadata              Revalidate approximately every 7
                                      days

  Enka player response                Respect the upstream `ttl`

  Missing image variant               Short negative cache, e.g. 5
                                      minutes

  Optimized images                    Use Next.js image cache and CDN
                                      caching

  Immutable asset URLs                Long-lived cache only when
                                      URL/version is genuinely immutable
  -----------------------------------------------------------------------

These are initial policies, not permission to override upstream cache
headers or Enka's TTL. Confirm actual API behavior during
implementation.

Use server-side caching to reduce duplicate calls. Avoid creating a
cache stampede when several requests for the same UID arrive
simultaneously.

------------------------------------------------------------------------

## 6. Application Architecture

### 6.1 Recommended stack

-   Next.js App Router.
-   React.
-   TypeScript.
-   Tailwind CSS.
-   shadcn/ui.
-   Animate UI.
-   Motion.
-   Selected Magic UI components.
-   Next.js Image.
-   Vercel deployment.

Use a package manager consistently throughout the project. If the
repository already uses pnpm, retain pnpm.

### 6.2 Proposed folder structure

``` text
genshin-showcase/
├── public/
│   ├── fonts/
│   ├── images/
│   │   ├── placeholders/
│   │   └── backgrounds/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── player/
│   │   │   └── [uid]/
│   │   │       └── page.tsx
│   │   ├── character/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── player/
│   │       │   └── [uid]/
│   │       │       └── route.ts
│   │       └── character-art/
│   │           └── [slug]/
│   │               └── route.ts
│   ├── components/
│   │   ├── landing/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── UIDSearch.tsx
│   │   │   └── FeaturedCharacters.tsx
│   │   ├── character/
│   │   │   ├── CharacterSplash.tsx
│   │   │   ├── CharacterHeader.tsx
│   │   │   ├── CharacterStats.tsx
│   │   │   ├── CharacterGallery.tsx
│   │   │   └── CharacterTabs.tsx
│   │   ├── build/
│   │   │   ├── WeaponCard.tsx
│   │   │   ├── ArtifactCard.tsx
│   │   │   ├── ArtifactStats.tsx
│   │   │   ├── TalentCard.tsx
│   │   │   └── ConstellationGrid.tsx
│   │   ├── player/
│   │   │   └── PlayerProfile.tsx
│   │   ├── animations/
│   │   │   ├── PageReveal.tsx
│   │   │   ├── ParallaxArtwork.tsx
│   │   │   └── CharacterTransition.tsx
│   │   └── ui/
│   │       ├── animated/
│   │       └── magicui/
│   ├── lib/
│   │   ├── enka.ts
│   │   ├── genshin-api.ts
│   │   ├── character-mapper.ts
│   │   ├── image-resolver.ts
│   │   ├── cache.ts
│   │   └── validators.ts
│   ├── data/
│   │   └── character-assets.json
│   └── types/
│       ├── enka.ts
│       ├── character.ts
│       └── player.ts
├── next.config.ts
└── package.json
```

Adjust this structure to the existing repository rather than forcing a
rewrite. Keep API parsing, image resolution, UI and domain types
separate.

### 6.3 API route responsibilities

`GET /api/player/[uid]`

-   Validate and normalize UID.
-   Apply request timeout.
-   Apply per-IP or equivalent abuse protection appropriate to the
    deployment.
-   Read valid cached response before requesting Enka.
-   Fetch Enka data when needed.
-   Respect TTL and rate-limit responses.
-   Normalize the response.
-   Return typed success or error results.
-   Never expose internal stack traces or upstream secrets.

`GET /api/character-art/[slug]` (optional)

-   Only resolve known slugs from the approved manifest.
-   Never become an open proxy for arbitrary URLs.
-   Prefer returning trusted metadata or using the Next.js image
    pipeline directly.
-   Add this route only if it provides a clear security or caching
    benefit.

------------------------------------------------------------------------

## 7. UI Component Library Strategy

Use the libraries as complementary layers rather than installing every
available component.

### 7.1 shadcn/ui --- foundation

Use for:

-   Buttons.
-   Inputs.
-   Selects.
-   Cards and basic surfaces.
-   Navigation primitives.
-   Accessible dialogs and popovers where needed.
-   Consistent design tokens.

### 7.2 Animate UI --- interaction layer

Use for:

-   Animated tabs for build sections.
-   Dialog and drawer transitions.
-   Menus and navigation interactions.
-   Tooltips for stat explanations.
-   Select and filter interactions.
-   Toast feedback.
-   Small icon and button interactions.

Use current package/documentation guidance. The current Animate UI
approach uses `@animate-ui/react` and Motion; do not copy outdated
installation instructions from older versions without checking
compatibility.

### 7.3 Magic UI --- selected visual effects

  -----------------------------------------------------------------------
  Component               Intended use            Constraint
  ----------------------- ----------------------- -----------------------
  Particles               Very subtle elemental   Low density; disable or
                          atmosphere              reduce on mobile

  Animated Gradient Text  Selected character      Use sparingly
                          heading accent          

  Shimmer Button          UID search CTA          No constant distracting
                                                  shimmer

  Dot Pattern             Subtle background       Low contrast
                          texture                 

  Number Ticker           Stat changes during     Preserve readable
                          character switching     values

  Animated List           Staggered               Avoid excessive delay
                          equipment/artifact      
                          reveal                  

  Marquee                 Optional featured       Must be pausable and
                          character strip         usable with reduced
                                                  motion

  Animated Beam           Only if a meaningful    Do not add as
                          relationship or flow is decoration
                          shown                   
  -----------------------------------------------------------------------

### 7.4 Motion and scroll

-   Use Motion/Animate UI for component-level transitions.
-   Use GSAP with ScrollTrigger only if a larger cinematic scroll
    sequence genuinely improves the experience.
-   Lenis is optional. Add it only if it works correctly with native
    scrolling, accessibility and ScrollTrigger.
-   Do not combine multiple animation systems for the same interaction.
-   Prefer transform and opacity animation.
-   Avoid animating layout-heavy properties.
-   Pause ambient effects when offscreen or when the page is hidden.
-   Respect `prefers-reduced-motion`.

------------------------------------------------------------------------

## 8. Motion and Interaction Specification

### 8.1 Timing guide

  Interaction                             Target duration
  -------------------------- ----------------------------
  Micro-interactions                          150--220 ms
  Component transitions                       250--400 ms
  Artwork crossfade                           450--700 ms
  Optional cinematic intro     Approximately 1--2 seconds

Durations are guidelines. The interaction must feel immediate and must
not block user input.

### 8.2 Required interactions

  -----------------------------------------------------------------------
  Element                             Behavior
  ----------------------------------- -----------------------------------
  Hero artwork                        Slow, subtle reveal; optional
                                      low-amplitude movement

  Character switch                    Crossfade artwork and transition
                                      character information together

  Character card                      Gentle lift, restrained image zoom
                                      and clear selected state

  Navigation                          Smooth active indicator

  Build tabs                          Animated content transition without
                                      losing keyboard access

  Artifact card                       Subtle reveal; stats remain easy to
                                      scan

  Stats                               Smooth number transition only when
                                      values change

  UID search                          Clear focus, loading, success and
                                      error states

  Dialog/drawer                       Smooth open/close transition

  Tooltips                            Short, readable and keyboard
                                      accessible

  Intro controls                      Visible Skip Intro and Replay
                                      Cinematic controls if an intro
                                      exists
  -----------------------------------------------------------------------

### 8.3 Character switching sequence

1.  User selects a character.
2.  Update the selected character state.
3.  Begin a short outgoing artwork fade.
4.  Load or retrieve the next artwork from cache.
5.  Crossfade to the new artwork.
6.  Update name, element, level and build data in a coordinated
    transition.
7.  Update the element accent.
8.  Keep the page interactive throughout.

Do not wait for a long animation before updating data. Use a stable
placeholder if the next image is not ready.

### 8.4 Motion accessibility

-   Honor `prefers-reduced-motion`.
-   Provide a non-animated path for essential interactions.
-   Never rely on animation alone to communicate selection, errors or
    status.
-   Do not use flashing or rapid high-contrast effects.
-   Disable mouse parallax on touch devices.
-   Keep all controls usable with keyboard and screen readers.

------------------------------------------------------------------------

## 9. Responsive Design Specification

### 9.1 Breakpoints

Use responsive CSS rather than fixed device assumptions. Suggested
ranges:

-   Mobile: 320--767 px.
-   Tablet: 768--1023 px.
-   Desktop: 1024 px and above.

Use CSS Grid, Flexbox, `clamp()`, responsive image `sizes` and container
queries where they provide value.

### 9.2 Desktop

-   Full navigation.
-   Wide cinematic artwork area.
-   Artwork can occupy approximately 50--60% of the hero composition.
-   Build information in structured columns.
-   Five artifact cards in one row where space permits.
-   Generous whitespace and clear content boundaries.
-   Hover effects only as enhancement, never as the only interaction.

### 9.3 Tablet

-   Compact navigation.
-   Balanced artwork and metadata.
-   Two-column stat layout where suitable.
-   Artifact cards may wrap.
-   Reduce ambient effects and parallax.
-   Preserve readable text and comfortable touch targets.

### 9.4 Mobile

-   Compact header.
-   Full-width artwork with intentional crop.
-   Vertical character information.
-   Two-column stat layout where practical.
-   Horizontally scrollable artifact row or a deliberate stacked layout.
-   Compact tabs or accessible horizontal section navigation.
-   Touch-friendly controls.
-   No mouse-only parallax.
-   Reduce particle count and animation complexity.
-   Avoid horizontal page overflow at 320 px.

### 9.5 Responsive gallery

-   Desktop: approximately 5--7 columns depending on available width.
-   Tablet: approximately 3--5 columns.
-   Mobile: approximately 2--3 columns.

Use intrinsic sizing and test long character names and missing images.

### 9.6 Dialogs and drawers

-   Centered dialog on desktop.
-   Bottom drawer or full-screen sheet on mobile when appropriate.
-   Ensure focus management, escape-to-close behavior and accessible
    labels.

------------------------------------------------------------------------

## 10. Data Normalization and Type Safety

Do not let UI components depend directly on the raw Enka response.

Create app-owned models for:

-   Player profile.
-   Character showcase entry.
-   Character metadata.
-   Weapon.
-   Artifact.
-   Artifact main stat.
-   Artifact substat.
-   Talent.
-   Constellation.
-   Combat stat summary.
-   Artwork metadata.

The parser should map actual response fields to these types. Validate
the real Enka response structure before finalizing field mappings.

Important raw response areas to inspect include `playerInfo`,
`avatarInfoList`, `equipList`, `fightPropMap` and skill/talent-related
maps. Their precise interpretation must be confirmed from actual
fixtures and current API behavior.

Use:

-   Runtime validation at the API boundary.
-   Strict TypeScript types inside the application.
-   Explicit optional fields for unavailable data.
-   Unit tests for parsing and mapping.
-   Sanitized fixtures for regression tests.

Never invent stats, infer missing artifacts or silently map unknown
identifiers to unrelated characters.

------------------------------------------------------------------------

## 11. Error Handling and Reliability

Design clear states for:

-   Invalid UID format.
-   Player/profile unavailable.
-   Empty public showcase.
-   Upstream 404.
-   Upstream 429/rate limited.
-   Upstream timeout.
-   Upstream service unavailable.
-   Malformed or unexpected response.
-   Character ID without a mapping.
-   Missing artwork variant.
-   All artwork variants unavailable.

Error messages should tell the user what they can do next without
exposing internal implementation details.

Retry policy:

-   Use bounded retries only for transient failures.
-   Do not aggressively retry 429 responses.
-   Apply request timeouts.
-   Avoid retry loops in the browser.
-   Use short negative caching for missing artwork variants.

Provide a neutral image placeholder and preserve the image container
dimensions if loading fails.

------------------------------------------------------------------------

## 12. Security, Privacy and Responsible Use

-   Never request or store HoYoverse passwords.
-   Never request game cookies, authentication tokens or session data.
-   Use only the public UID and data exposed by the public showcase.
-   Keep Enka requests on the server.
-   Validate UIDs and route parameters.
-   Restrict remote image hosts.
-   Do not build an arbitrary URL proxy.
-   Apply rate limiting or abuse protection to the app's UID endpoint.
-   Use bounded timeouts and retries.
-   Do not expose raw upstream errors or server internals.
-   Avoid logging full player payloads unless necessary for controlled
    debugging; sanitize logs.
-   Do not add analytics that collect unnecessary personal information.

### Fan-project and asset rights

Genshin.dev is community-maintained and is not an official HoYoverse
service. Public API availability does not itself grant permission to
redistribute artwork. Before public release:

-   Review HoYoverse's current fan content and intellectual-property
    policies.
-   Review Genshin.dev's current terms, attribution guidance and asset
    provenance.
-   Provide appropriate credits and an unofficial-project disclaimer.
-   Avoid implying endorsement or official affiliation.
-   Be prepared to replace or remove assets if required by applicable
    policy or rights holders.

------------------------------------------------------------------------

## 13. Performance and Quality Targets

Treat these as project targets to measure, not guaranteed outcomes.

### 13.1 Performance

-   Prioritize the hero artwork; lazy-load secondary artwork.
-   Use responsive image sizes.
-   Avoid loading every character image on initial page load.
-   Use skeletons only where they improve perceived loading.
-   Keep ambient effects lightweight.
-   Pause offscreen animations.
-   Avoid unnecessary client components.
-   Keep API parsing and upstream requests on the server.
-   Prevent layout shifts by reserving image dimensions.
-   Use caching at the application, image optimization and CDN layers
    where appropriate.

### 13.2 Accessibility

-   Semantic headings and landmarks.
-   Keyboard-accessible navigation and controls.
-   Visible focus states.
-   Accessible form labels and error messages.
-   Sufficient color contrast.
-   Reduced-motion support.
-   Alt text that describes meaningful artwork without repeating
    surrounding text.
-   Touch targets sized for comfortable mobile use.

### 13.3 Quality checks

Test:

-   Current Chrome, Firefox and Safari where available.
-   320 px mobile viewport and larger mobile sizes.
-   Tablet and desktop layouts.
-   Slow network and failed image requests.
-   Empty and malformed API responses.
-   Rate limiting and upstream outage behavior.
-   Keyboard-only navigation.
-   Reduced-motion settings.
-   Long character names and missing metadata.

Aim for strong Lighthouse scores, but do not compromise accessibility,
image quality or reliability to chase a single score.

------------------------------------------------------------------------

## 14. Implementation Plan

Implement in phases. Each phase should have a reviewable result and
acceptance criteria before proceeding.

### Phase 0 --- Repository and API reconnaissance

Tasks:

1.  Inspect the existing repository and package manager.
2.  Confirm Next.js, React and TypeScript versions.
3.  Review current project conventions and deployment configuration.
4.  Verify Enka endpoint behavior and current response shape.
5.  Verify Genshin.dev catalog, character metadata and image variant
    lists.
6.  Check current API usage guidance, caching semantics and attribution
    requirements.
7.  Collect sanitized API fixtures for representative characters.

Deliverables:

-   Repository assessment.
-   Verified API response fixtures.
-   Initial data mapping notes.
-   Confirmed dependency compatibility.

Acceptance criteria:

-   No assumptions about undocumented response fields.
-   Valid image variants are verified against the API.
-   Existing repository functionality is preserved.

### Phase 1 --- Foundation and design system

Tasks:

1.  Establish or refine the Next.js App Router structure.
2.  Configure TypeScript and Tailwind.
3.  Initialize shadcn/ui if not already present.
4.  Install compatible Animate UI and Motion versions.
5.  Add only the required Magic UI components.
6.  Define color, typography, spacing, radius and motion tokens.
7.  Build responsive site shell and navigation.
8.  Establish accessibility and reduced-motion conventions.

Deliverables:

-   Working application shell.
-   Design token system.
-   Responsive navigation.
-   Reusable button, input, card, tab and dialog patterns.

Acceptance criteria:

-   No broken existing routes.
-   Consistent visual system.
-   Mobile layout works at 320 px.
-   Keyboard focus and reduced-motion behavior are established.

### Phase 2 --- Enka integration

Tasks:

1.  Implement UID validation.
2.  Create the server-side Enka client.
3.  Add timeout and bounded retry handling.
4.  Respect Enka TTL and rate-limit behavior.
5.  Normalize raw responses into app-owned models.
6.  Add typed error handling.
7.  Add fixture-based parser tests.
8.  Implement the player API route.

Deliverables:

-   Working UID lookup.
-   Normalized player and character data.
-   Reliable loading and error states.

Acceptance criteria:

-   Valid public showcases parse correctly.
-   Empty showcases are handled.
-   Rate limiting and upstream failures are handled.
-   No game credentials are requested or stored.

### Phase 3 --- Character mapping and artwork pipeline

Tasks:

1.  Retrieve the Genshin.dev character catalog.
2.  Build and validate Enka ID-to-slug mappings.
3.  Retrieve each mapped character's available image variants.
4.  Implement the artwork resolver.
5.  Implement the fallback chain.
6.  Configure Next.js remote image patterns and WebP output.
7.  Add caching for metadata and missing variants.
8.  Add image loading placeholders and stable aspect ratios.

Deliverables:

-   Validated character asset manifest.
-   Reusable artwork component.
-   WebP image delivery where supported.
-   Reliable artwork fallbacks.

Acceptance criteria:

-   Correct artwork is selected for mapped characters.
-   Unknown IDs do not display incorrect artwork.
-   Failed images fall back cleanly.
-   Initial page load does not fetch the entire character image catalog.

### Phase 4 --- Landing and player profile

Tasks:

1.  Build cinematic landing hero.
2.  Add UID search and validation states.
3.  Add featured character strip.
4.  Build player profile header.
5.  Build responsive character collection grid.
6.  Add search, element filters and supported sorting.
7.  Connect profile routes to normalized API data.

Deliverables:

-   Functional landing page.
-   Player profile page.
-   Responsive character collection.

Acceptance criteria:

-   UID search works end to end.
-   Player information is only shown when available.
-   Character cards use correct images.
-   Filters and sorting operate on real data.

### Phase 5 --- Character showcase and build details

Tasks:

1.  Build the character splash composition.
2.  Add character metadata and elemental accents.
3.  Build combat stats.
4.  Build weapon card.
5.  Build all five artifact slots.
6.  Build artifact main-stat and substat presentation.
7.  Build talent and constellation sections.
8.  Add tabs and responsive detail layouts.

Deliverables:

-   Complete character detail experience.
-   Build information components.
-   Responsive desktop, tablet and mobile layouts.

Acceptance criteria:

-   All displayed values map to source data.
-   Missing data is handled honestly.
-   Five artifact slots are represented correctly.
-   Details remain readable at narrow widths.

### Phase 6 --- Motion and interaction polish

Tasks:

1.  Add coordinated character artwork crossfades.
2.  Add restrained card hover/touch feedback.
3.  Add tab, dialog, drawer and tooltip transitions.
4.  Add number transitions for changing stats.
5.  Add optional cinematic intro with Skip and Replay controls.
6.  Add subtle elemental atmosphere.
7.  Add reduced-motion behavior.
8.  Profile animation performance on mobile.

Deliverables:

-   Consistent motion system.
-   Smooth character switching.
-   Polished interactive states.

Acceptance criteria:

-   Motion does not block input.
-   No excessive animation or visual clutter.
-   Mobile remains responsive.
-   Reduced-motion mode is usable and complete.

### Phase 7 --- QA, optimization and deployment

Tasks:

1.  Test all pages and routes.
2.  Test representative player showcase fixtures.
3.  Test missing artwork and API outages.
4.  Test desktop, tablet and mobile layouts.
5.  Test keyboard navigation and screen readers where possible.
6.  Run Lighthouse and inspect Core Web Vitals.
7.  Verify caching and rate-limit behavior.
8.  Review API attribution and asset policies.
9.  Configure Vercel deployment.
10. Verify production environment behavior.

Deliverables:

-   Production-ready deployment.
-   QA checklist and known limitations.
-   Final credits and privacy text.

Acceptance criteria:

-   No critical layout or runtime errors.
-   No broken core UID-to-character-to-artwork flow.
-   No credentials or sensitive tokens exposed.
-   Acceptable performance on mobile.
-   Attribution and fan-project disclaimer are present.

------------------------------------------------------------------------

## 15. Definition of Done

The project is ready for its first public release when all applicable
checks pass:

### Data and functionality

-   [ ] UID lookup works without account authentication.
-   [ ] Only public showcase data is requested.
-   [ ] Player profile data is parsed correctly.
-   [ ] Showcase characters are identified correctly.
-   [ ] Enka IDs map to the correct Genshin.dev slugs.
-   [ ] Character metadata is accurate where available.
-   [ ] Weapon information is accurate.
-   [ ] Five artifact slots are supported.
-   [ ] Combat stats and talents are mapped correctly.
-   [ ] Constellations are shown correctly where available.
-   [ ] Character switching does not require a full page reload.

### Artwork and performance

-   [ ] Preferred artwork variants are verified.
-   [ ] WebP delivery is enabled where supported.
-   [ ] Image fallbacks work.
-   [ ] Image dimensions prevent layout shifts.
-   [ ] Secondary artwork is lazy-loaded.
-   [ ] Cache behavior is verified.
-   [ ] Enka TTL and rate limits are respected.

### UI and accessibility

-   [ ] Visual design is professional and consistent.
-   [ ] No generic AI-slop visual patterns are present.
-   [ ] Desktop, tablet and mobile layouts are tested.
-   [ ] No horizontal overflow at 320 px.
-   [ ] Character artwork remains the visual focus.
-   [ ] Build data remains readable.
-   [ ] Interactions are keyboard accessible.
-   [ ] Reduced-motion support works.
-   [ ] Touch interactions do not depend on hover.

### Security and release

-   [ ] No game password, cookie or token is requested.
-   [ ] Upstream requests are server-side.
-   [ ] UID and route parameters are validated.
-   [ ] Arbitrary image proxying is prevented.
-   [ ] Error responses do not expose internals.
-   [ ] Fan-project disclaimer and credits are present.
-   [ ] Current API and asset usage policies have been reviewed.

------------------------------------------------------------------------

## 16. Development Rules

Use these rules throughout implementation:

1.  Inspect before changing. Do not replace working project structure
    without a reason.
2.  Build in phases and verify each phase before moving on.
3.  Keep API clients, parsing, mappings, UI and animation logic
    separated.
4.  Use real API fixtures; do not fabricate sample data and treat it as
    production truth.
5.  Do not install every component from Animate UI or Magic UI. Install
    only what the design uses.
6.  Prefer small, reusable components over giant page components.
7.  Keep server-only code out of client bundles.
8.  Avoid unnecessary dependencies and duplicate animation systems.
9.  Test mobile behavior throughout development, not only at the end.
10. Preserve accessibility and reduced-motion behavior during visual
    polish.
11. Document API assumptions and any unsupported data fields.
12. Do not mark a feature complete until its acceptance criteria have
    been tested.

------------------------------------------------------------------------

## 17. Useful Documentation

Verify current installation instructions and API behavior before
implementation.

-   Next.js documentation: https://nextjs.org/docs
-   Next.js Image:
    https://nextjs.org/docs/app/api-reference/components/image
-   Enka.Network: https://enka.network/
-   Enka documentation: https://enka.network/docs/
-   Genshin.dev API: https://genshin.jmp.blue/
-   Animate UI: https://animate-ui.com/docs
-   Animate UI installation: https://animate-ui.com/docs/installation
-   Magic UI components: https://magicui.design/docs/components
-   Magic UI particles: https://magicui.design/docs/components/particles
-   Magic UI shimmer button:
    https://magicui.design/docs/components/shimmer-button
-   Magic UI number ticker:
    https://magicui.design/docs/components/number-ticker
-   Magic UI animated list:
    https://magicui.design/docs/components/animated-list
-   Magic UI dot pattern:
    https://magicui.design/docs/components/dot-pattern
-   shadcn/ui: https://ui.shadcn.com/docs

------------------------------------------------------------------------

## 18. Final Product Standard

The finished website should feel like a carefully designed Genshin
Impact companion experience, not a generic dashboard template.

-   Character artwork creates the atmosphere.
-   Typography, spacing and hierarchy create professionalism.
-   Build data creates utility.
-   Motion makes the experience feel alive without distracting from the
    content.
-   Performance and accessibility make it practical to use.

**Final guiding principle:** cinematic where it matters, restrained
everywhere else, accurate in its data, and responsive at every screen
size.
