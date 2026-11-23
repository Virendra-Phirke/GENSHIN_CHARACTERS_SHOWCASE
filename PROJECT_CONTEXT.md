# Astra — Genshin Character Showcase

## Complete Project Context & Implementation Handoff

**Last updated:** 23 November 2026  
**Project:** Astra  
**Purpose:** Personal Genshin Impact character showcase  
**Fixed player UID:** `892583803`  
**Main character being refined:** Skirk  
**Character ID:** `10000114`

---

# 1. Project Overview

Astra is a premium, responsive Genshin Impact character showcase website.

It retrieves publicly available character showcase information from Enka.Network and presents the player's characters, builds, equipment, artifacts, combat attributes, talents and constellations.

This is a personal showcase website, not a general-purpose UID lookup platform.

### Strict requirements

- Only one player account is supported: UID `892583803`.
- Do not provide a UID input field.
- Do not show a New UID option.
- Automatically load this player's showcase.
- Do not allow arbitrary player UID lookups.
- Do not request HoYoverse passwords, cookies, tokens or account credentials.
- Only display information exposed through the player's public in-game showcase.
- The in-game character details showcase must be enabled.
- Do not invent missing character or equipment information.

# 2. Technology Stack

The implementation uses:

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS v4
- CSS-based animations and transitions
- Enka.Network public API
- Hakush.in static CDN for character and equipment artwork
- Next.js image support, with direct CDN rendering preferred for artwork

The project uses Webpack scripts because the connected Windows environment previously encountered an invalid native Turbopack/SWC binding.

Commands:

```
npm run dev
npm run typecheck
npm run lint
npm run build
```

# 3. Project Architecture

Important files:

```
src/
├── app/
│   ├── page.tsx
│   ├── globals.css
│   ├── build-details.css
│   ├── api/
│   │   └── player/
│   │       └── [uid]/
│   │           └── route.ts
│   └── player/
│       └── [uid]/
│           ├── page.tsx
│           └── character/
│               └── [characterId]/
│                   └── page.tsx
│
├── components/
│   └── player/
│       ├── player-showcase.tsx
│       └── character-build-page.tsx
│
├── lib/
│   ├── character-assets.ts
│   └── types.ts
│
└── data/
    └── character-assets.json

next.config.ts
README.md
CONTEXT.md
```

### File responsibilities

**`src/app/page.tsx`**

- Astra landing page.
- Automatically loads the fixed player's showcase.
- Must not contain a UID input.

**`src/app/api/player/[uid]/route.ts`**

- Fetches public Enka.Network data.
- Validates the UID against `892583803`.
- Normalizes character, weapon, artifact, talent and combat attribute information.
- Implements a process-local TTL cache.

**`src/app/player/[uid]/page.tsx`**

- Displays the player's character showcase.

**`src/components/player/player-showcase.tsx`**

- Renders character cards.
- Character card clicks open their dedicated build pages.

**`src/components/player/character-build-page.tsx`**

- Displays the detailed character build.
- Includes splash artwork, combat attributes, weapon, artifacts, talents and constellations.

**`src/lib/character-assets.ts`**

- Resolves character metadata and artwork.
- Maintains character image URL and fallback information.

**`src/lib/types.ts`**

- Contains normalized player, character, weapon and artifact types.

**`src/app/build-details.css`**

- Character detail page layout.
- Artwork positioning and sizing.
- Element-specific accents.
- Responsive design and animations.

**`src/app/globals.css`**

- Global Astra design system.

# 4. Fixed UID Architecture

The website must only support:

```
892583803
```

Required behavior:

1. Landing page automatically loads the fixed UID.
2. Remove UID search input.
3. Remove New UID navigation.
4. API rejects all other UIDs.
5. Character detail pages are restricted to the same UID.
6. Character cards navigate to their corresponding detail routes.

Character detail route:

```
/player/892583803/character/10000114
```

The website should not expose an arbitrary UID lookup mechanism through either the UI or API.

# 5. Enka.Network Data Architecture

Enka.Network is the primary source of actual player build data.

The website must use the real public showcase response instead of hardcoded character builds.

### Important implementation principle

Keep the raw Enka response separate from the normalized UI model.

Recommended pipeline:

```
Enka public API
       |
       v
Raw response validation
       |
       v
Character identification
       |
       v
Equipment and artifact parsing
       |
       v
Combat property calculation
       |
       v
Normalized character model
       |
       v
Astra UI
```

Never calculate displayed values from incomplete or incorrectly interpreted properties.

# 6. Skirk Build — Important Data Corrections

The main character being tested is Skirk.

```
Character ID: 10000114
Player UID: 892583803
```

### Verified live values (from Enka live API):

- HP: 18,642 (Base 12,417 + 6,225 Bonus)
- ATK: 2,450 (Base 924 + 1,526 Bonus)
- DEF: 984 (Base 806 + 178 Bonus)
- CRIT Rate: 50.1%
- CRIT DMG: 229.9%
- Energy Recharge: 112.3%
- Elemental Mastery: 21
- Weapon: Calamity of Eshu, Level 90, Refinement R5
- Artifact Sets: 4-pc Marechaussee Hunter + 1-pc Deepwood Memories, all 5-star at +20
