# Origin Table — CLAUDE.md

## What This Project Is

A mobile-first staff training app for Rosewood Resorts service staff. Staff learn the layered stories behind dishes, ingredients, suppliers, and cultural traditions — and hear correct pronunciations via ElevenLabs before going to the table.

Built for a hackathon with a 4-hour dev window. Scope is ruthlessly controlled. See PRD.md for full context.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **ElevenLabs API** — TTS pronunciation, `eleven_multilingual_v2` model
- **Anthropic Claude API** — Tier 2 only (guest personalization), `claude-haiku-4-5-20251001`
- **Data:** JSON files in `src/data/` — no database
- **Deploy:** Vercel

## Folder Structure

```
origin-table/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, dark theme, fonts
│   │   ├── page.tsx                # Home: property selector / story grid
│   │   ├── stories/
│   │   │   └── [id]/page.tsx       # Individual story card full view
│   │   ├── quiz/
│   │   │   └── [propertyId]/page.tsx  # Quiz mode for a property
│   │   ├── guests/                 # TIER 2 ONLY
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── api/
│   │       ├── pronounce/route.ts  # ElevenLabs TTS endpoint
│   │       └── brief/route.ts      # TIER 2: Claude briefing endpoint
│   ├── components/
│   │   ├── StoryCard.tsx           # Core atomic component
│   │   ├── StoryGrid.tsx           # Grid with filter chips
│   │   ├── LayeredContent.tsx      # 3-layer expand/collapse
│   │   ├── PronounceButton.tsx     # Speaker icon + audio playback
│   │   ├── QuizMode.tsx            # Flash card quiz
│   │   ├── PropertyNav.tsx         # Top nav between 3 properties
│   │   └── TagChip.tsx             # Reusable tag/filter chip
│   ├── data/
│   │   ├── stories.json            # All 9 story cards
│   │   ├── properties.json         # 3 property definitions
│   │   └── guests.json             # TIER 2: 4 guest profiles
│   ├── lib/
│   │   ├── elevenlabs.ts           # ElevenLabs client wrapper
│   │   ├── claude.ts               # TIER 2: Claude client wrapper
│   │   └── types.ts                # All shared TypeScript types
│   └── styles/
│       └── globals.css
├── public/
│   └── images/                     # Property hero images
├── .env.local                      # ELEVENLABS_API_KEY, ANTHROPIC_API_KEY
├── PRD.md
└── CLAUDE.md
```

## Key Data Types

```typescript
// src/lib/types.ts

type Tag =
  | 'sustainability' | 'women-led' | 'local-farm' | 'cultural-heritage'
  | 'seasonal' | 'wellness' | 'award-winning' | 'fire-cooking' | 'zero-waste'

interface PronounceTarget {
  term: string         // Display text: "Kanom Jeen Nam Ngeow"
  phonetic?: string    // Optional phonetic hint shown in UI: "kah-nom jeen nam ngew"
  language: string     // BCP 47 code: 'th', 'es', 'it', 'fr', 'en'
}

interface StoryLayer {
  headline: string     // Max 2 sentences
  story: string        // Max 5 sentences
  details: string[]    // Bullet list: certs, stats, names to drop
}

interface StoryCard {
  id: string
  propertyId: string
  title: string        // Dish / ingredient / supplier name
  subtitle: string     // One-line hook
  imageUrl: string
  tags: Tag[]
  layers: StoryLayer
  pronounceTargets: PronounceTarget[]  // Up to 3 per card
}

interface Property {
  id: string           // 'miramar' | 'bangkok' | 'san-miguel'
  name: string
  location: string
  heroImageUrl: string
  tagline: string
  chefName: string
}

// TIER 2 ONLY
type GuestTag =
  | 'environmentalist' | 'women-rights' | 'nutrition-focused' | 'cultural-explorer'
  | 'wellness' | 'vip-time-poor' | 'aesthetics'

interface GuestProfile {
  id: string
  name: string
  room: string
  arrivalTime: string
  tags: GuestTag[]
  propertyId: string
}
```

## ElevenLabs Integration

**API route:** `POST /api/pronounce`

```typescript
// Request body
{ term: string; language: string }

// Response
{ audioBase64: string }  // base64-encoded MP3
```

- Use `eleven_multilingual_v2` model — handles Thai, Spanish, Italian, French correctly
- Voice ID: use "Rachel" (voice_id: `21m00Tcm4TlvDq8ikWAM`) for a warm, professional tone
- Cache responses in memory (Map) keyed by `${term}:${language}` — avoid repeat API calls during demo
- Audio plays via `new Audio('data:audio/mp3;base64,...').play()` on the client
- Keep request timeout to 8s — if ElevenLabs is slow, show a loading spinner but don't block the demo

## Story Content (Summary)

9 cards total across 3 properties. Full content in `src/data/stories.json`.

**Caruso's (Rosewood Miramar Beach):**
- `caruso-crab` — California King Crab, local sourcing, Smart Catch + Ocean Wise
- `caruso-garden` — On-property beehive + chef's garden, Chef Massimo Falsini
- `caruso-certifications` — Michelin Star + Green Star + Food Made Good 3-star story

**Lakorn (Rosewood Bangkok):**
- `lakorn-massaman` — Royal Thai beef shank + crispy durian, Chef Bua's signature
- `lakorn-chef-bua` — 30 years, royal court cuisine, Pattama Chocklapphon
- `lakorn-farms` — Klongpai Farm + Sampran Farm + Khunta Farm, Partners in Provenance

**Pirules (Rosewood San Miguel de Allende):**
- `pirules-traspatio` — Women-led poultry collective, direct livelihood funding
- `pirules-fire` — 80% ash/wood/charcoal cooking, ancestral preservation techniques
- `pirules-sourcing` — 99% within 60 miles, La Factoría dairy, Vía Orgánica ranch

## UI/UX Rules

- **Dark mode only** — `dark` class on `<html>`, no toggle needed for demo
- **Color palette:**
  - Background: `zinc-950` / `zinc-900`
  - Cards: `zinc-800` with `zinc-700` border
  - Accent: `amber-500` (warm, matches Rosewood's earth tones)
  - Text: `zinc-100` / `zinc-400`
- **Mobile-first breakpoints** — target 390px wide (iPhone 15), scale up for tablet/desktop
- **No modals** — navigate to a new route for story detail; modals break demo flow on mobile
- **Tap targets ≥ 44px** — standard accessibility; easier to tap on demo phone
- **PronounceButton:** amber speaker icon, pulse animation while audio loads, green checkmark after first play

## Quiz Mode Logic

- Each quiz has 5 questions generated from the 3 story cards of a property
- Question pool (pick 5):
  1. "Which farm supplies the chicken at Pirules?" (multiple choice)
  2. "True or false: Caruso's has a Michelin Green Star" (T/F)
  3. "How much of Pirules' menu is sourced within 60 miles?" (multiple choice)
  4. "What cooking method is used for 80% of dishes at Pirules?" (multiple choice)
  5. "What does Chef Bua specialize in?" (multiple choice)
- Questions are hardcoded per property — no AI needed for quiz generation
- Score shown at end: < 3 = "Keep studying", 3–4 = "Almost ready", 5 = "Ready for service ✓"

## Scope Guardrails

**Do not add:**
- Authentication / user accounts
- Any database or Prisma
- Admin CMS or content editing UI
- Analytics, logging dashboards
- More than 9 story cards (the 9 are enough for a demo)
- Animations beyond Tailwind transitions
- Server Components that fetch external URLs (images should be static or Unsplash URLs baked into JSON)

**TIER 2 is a bonus.** If it's 3:30 and Tier 1 isn't polished, do not start Tier 2.

## Environment Variables

```
ELEVENLABS_API_KEY=
ANTHROPIC_API_KEY=        # TIER 2 only
```

## Commands

```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run lint         # Check for errors before demo
npx vercel           # Deploy to Vercel (must be logged in)
```
