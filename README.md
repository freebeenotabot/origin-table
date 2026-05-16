# Origin Table

> *"Know the story. Tell it well."*

A mobile-first staff intelligence app built for **Hospitality 2030: A Rosewood Sand Hill Hackathon**.  
Addresses **Problem Statement 1 (Hyper-Personalized Arrival Orchestration)** and **Problem Statement 2 (The Invisible Concierge)** — by turning every service staff member into a confident, deeply-informed storyteller at the table.

---

## The Problem

Rosewood's competitive edge is its hyper-local, bespoke experience. That experience lives or dies at the table, in the moment a server speaks. But:

| Pain point | Scale |
|---|---|
| Hospitality staff turnover | ~70% annually — institutional knowledge walks out constantly |
| Training manuals | Dense, static, forgotten within a week |
| Rotating seasonal menus | Staff can name a dish; they can't tell its story |
| Pronunciation gaps | A server stumbling over *"Kanom Jeen Nam Ngeow"* or *"Traspatio"* breaks the luxury spell mid-service |

**The result:** Rosewood's investment in bespoke sourcing, cultural programming, and chef talent is invisible at the table — because the staff member doesn't know how to surface it.

---

## The Solution

**Origin Table** gives every staff member the story, the pronunciation, and the confidence — in under 5 minutes before service.

- Stories are **layered** (headline → narrative → deep-dive bullet points) so staff absorb at the depth they need
- **ElevenLabs TTS** pronounces every difficult ingredient, dish, and supplier name in the correct native accent
- A **gamified quiz** locks knowledge before each shift and shows a "Ready for service" badge when passed
- **AI-powered guest briefings** (Claude API) match the right stories to each arriving guest's profile — so the server leads with the story that matters to *that* guest

---

## Judging Criteria — How This Project Scores

| Criterion | Weight | What to look at |
|---|---|---|
| **Live demo** | 45% | [Running the demo](#running-the-demo) below |
| **Creativity & originality** | 35% | [Feature highlights](#feature-highlights) + sponsor integrations |
| **Impact potential** | 20% | [Business impact](#business-impact) section |

---

## Feature Highlights

### 1. Layered Story Cards
Three collapsible layers per dish/ingredient/supplier:
- **Layer 1 — The Headline:** 1–2 sentences. Fast to absorb before a busy service.
- **Layer 2 — The Story:** Origin, supplier name, cultural context, chef intention.
- **Layer 3 — The Detail:** Drop-in facts, certifications, statistics, names to mention.

Staff can skim or go deep. Mobile-first, dark-mode UI tuned for pre-service dim rooms.

### 2. ElevenLabs Pronunciation (Sponsor Integration)
Every story card surfaces up to 3 key terms staff may mispronounce. A speaker icon triggers a live ElevenLabs TTS call:
- Model: `eleven_multilingual_v2` — handles Thai, Spanish, Italian, French correctly
- Voice: Rachel (warm, professional)
- Responses are cached in-session — no repeated API calls during demo
- Examples: *Kanom Jeen Nam Ngeow* (Thai), *Pattama Chocklapphon* (Thai), *Traspatio* (Spanish), *Massimo Falsini* (Italian)

### 3. Quiz / Flash Card Mode
Per-property 5-question quiz drawn from the story card content:
- Multiple choice, true/false, and fill-in-the-blank formats
- Score feedback: *"Keep studying" / "Almost ready" / "Ready for service ✓"*
- Designed for spaced repetition extension as properties add cards

### 4. Creator Studio (Content Operations)
A built-in content creation flow for F&B managers to add new story cards without touching JSON:
- Form-driven input for all fields (title, subtitle, layers, pronounce targets, tags)
- Preview renders the card exactly as staff will see it
- Saves to the story library immediately — no deploy needed for seasonal content updates

### 5. AI Guest Briefing (Tier 2 — Claude API)
Given a guest's preference profile (e.g. *environmentalist, women's-rights advocate*), Claude generates:
- 3 story cards to lead with
- 2 topics to avoid
- 3 ready-to-use talking-point sentences

Model: `claude-haiku-4-5-20251001` (fast, streaming, cost-efficient for per-shift volume).

---

## Business Impact

| Metric | Before | With Origin Table |
|---|---|---|
| Pre-service staff briefing prep | ~45 min/shift | Under 5 min |
| New hire onboarding to table-ready | 1–2 weeks | 1 session |
| Seasonal menu story update | Reprint manuals, re-run training | Update JSON → live immediately |
| Rosewood properties that could use this | — | 30+ globally, one codebase |

The Traspatio Women's Collective card is the sharpest illustration: Rosewood directly funds rural women's livelihoods through every chicken order at Pirules. **That story is worth telling.** Origin Table makes sure every server can tell it — with the right words, the right facts, and the right confidence.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| TTS / Pronunciation | ElevenLabs API (`eleven_multilingual_v2`) |
| AI Briefings | Anthropic Claude API (`claude-haiku-4-5-20251001`) |
| Data | JSON files — zero database setup, easy seasonal edits |
| Deploy | Vercel |

---

## Running the Demo

### Prerequisites
```bash
node >= 18
```

### Setup
```bash
git clone <repo-url>
cd origin-table
npm install
```

Create `.env.local` in the project root:
```
ELEVENLABS_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here   # Tier 2 only
```

### Run
```bash
npm run dev
# Open http://localhost:3000
```

### Recommended demo flow (3 minutes)

1. **Home** — select Rosewood Bangkok. Show the story grid with filter chips.
2. **Lakorn → Massaman card** — open all three layers. Point to cultural depth (royal court dish, crispy durian, Chef Bua's 30-year lineage).
3. **Pronunciation** — tap the speaker next to *Kanom Jeen Nam Ngeow*. Let it play. Tap *Pattama Chocklapphon*.
4. **Quiz mode** — run the Bangkok 5-question quiz. Show the "Ready for service ✓" badge.
5. **Switch to Pirules** — open the Traspatio Women's Collective card. Read the Layer 1 headline aloud.  
   *"When you order the chicken, you are funding these women's livelihoods."*
6. **Guest briefing (Tier 2)** — open the guest dashboard. Select Emma Chen (environmentalist, women's rights). Generate briefing. Show Claude's 3 lead stories + talking points streaming in.

---

## Repository Structure

```
src/
├── app/
│   ├── page.tsx                  # Home: property selector + story grid
│   ├── stories/[id]/page.tsx     # Full story card view
│   ├── quiz/[propertyId]/        # Quiz mode
│   ├── guests/                   # Tier 2: guest dashboard + briefings
│   └── api/
│       ├── pronounce/route.ts    # ElevenLabs TTS endpoint
│       └── brief/route.ts        # Claude briefing endpoint
├── components/
│   ├── StoryCard.tsx             # Core atomic component
│   ├── LayeredContent.tsx        # 3-layer expand/collapse
│   ├── PronounceButton.tsx       # Speaker icon + audio playback
│   ├── QuizMode.tsx              # Flash card quiz
│   └── CreatorStudio.tsx         # Content creation flow
├── data/
│   ├── stories.json              # 9 story cards across 3 properties
│   └── properties.json           # 3 property definitions
└── lib/
    ├── elevenlabs.ts             # ElevenLabs client wrapper
    ├── types.ts                  # All shared TypeScript types
    └── claude.ts                 # Claude client wrapper (Tier 2)
```

---

## Properties & Content Covered

| Property | Location | Story Cards | Key Angle |
|---|---|---|---|
| Caruso's | Rosewood Miramar Beach, CA | California King Crab · Resident Beehive & Chef's Garden · Michelin Green Star | Strongest credentials story |
| Lakorn | Rosewood Bangkok | Massaman Nuea Tu Rian Tod · Farm Partners · Chef Bua | Maximum cultural depth |
| Pirules | Rosewood San Miguel de Allende | Traspatio Women's Collective · Fire & Ash Cooking · 99% Local Sourcing | Strongest values story |

---

*Built at Hospitality 2030: A Rosewood Sand Hill Hackathon · Stack: Next.js 14 · ElevenLabs · Anthropic Claude*
