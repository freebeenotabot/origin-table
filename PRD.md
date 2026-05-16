# Origin Table — Product Requirements Document

## Hackathon Context

**Event:** Hospitality 2030: A Rosewood Sand Hill Hackathon  
**Time budget:** 4 hours hacking · 1.5 hours presentation prep  
**Judging weights:** Live demo 45% · Creativity & originality 35% · Impact potential 20%  
**Sponsors leveraged:** ElevenLabs (TTS/pronunciation) · Anthropic Claude API

### Problem Statement Alignment

Addresses **Problem Statement 1 (Hyper-Personalized Arrival Orchestration)** and **Problem Statement 2 (The Invisible Concierge)** — the staff member IS the invisible concierge when they know the right story for the right guest.

---

## The Core Problem

Rosewood's edge is hyper-local, ever-changing bespoke experiences. But:

- **High staff turnover (~70% in hospitality)** means institutional knowledge walks out constantly
- **Rotating menus + seasonal ingredients** = staff can name a dish but can't tell its story
- **Pronunciation gaps** erode confidence mid-service (a server stumbling over "Kanom Jeen Nam Ngeow" or "Traspatio" breaks the spell of luxury)
- **Training manuals** are dense, static, and forgotten within a week
- **Result:** Rosewood's $40M/year investment in bespoke sourcing and cultural programming is invisible at the table

---

## Solution Overview

**Origin Table** is a mobile-first staff intelligence app. It makes the stories behind every ingredient, supplier, cultural tradition, and dish fast to absorb, easy to remember, and confident to deliver at the table.

- Stories are layered (headline → detail → deep dive) so staff can go as deep as they need
- ElevenLabs voices pronounce every difficult ingredient name in the correct accent and language
- Gamified quiz mode locks knowledge before each shift
- Content is designed to update easily as menus rotate seasonally

**Tagline:** *"Know the story. Tell it well."*

---

## Tiered Feature Scope

### TIER 1 — Core Staff Training App (4-hour MVP build)

This is what gets built and demoed. Everything else is out of scope unless Tier 1 is complete.

#### T1.1 Story Library
- Grid view of all story cards, filterable by property / ingredient type / theme tag
- Tags: `sustainability` `women-led` `local-farm` `cultural-heritage` `seasonal` `wellness` `award-winning`
- Story cards are the atomic unit — each covers one ingredient, dish, supplier, or cultural practice

#### T1.2 Layered Story Cards
Each card has three collapsible layers — staff can skim or go deep:
- **Layer 1 — The Headline** (1–2 sentences): what it is, why it matters to Rosewood
- **Layer 2 — The Story** (3–5 sentences): origin, supplier name, cultural context, chef intention
- **Layer 3 — The Detail** (bullet list): certs, stats, specific names to drop, talking points

#### T1.3 ElevenLabs Pronunciation (Core Sponsor Integration)
- Every story card surfaces up to 3 "key terms" — ingredient names, dish names, supplier names — that staff may mispronounce
- A speaker icon next to each term triggers an ElevenLabs TTS call
- Audio plays the correct pronunciation in the appropriate accent/language (Thai, Spanish, Italian, French)
- Model: `eleven_multilingual_v2` — handles all target languages correctly
- Pre-generate and cache audio on first request; store as base64 or blob URL
- Examples: "Kanom Jeen Nam Ngeow", "Traspatio", "Pirules", "Massaman", "Brunello di Montalcino", "Sinchoum"

#### T1.4 Quiz / Flash Card Mode
- Per-property 5-question quiz generated from the story card content
- Question types: match the ingredient to the supplier · true/false on a sustainability claim · fill the blank (dish name)
- Score at the end + "Ready for service" badge state
- Stretch: spaced repetition (show harder cards more often)

#### T1.5 Story Search
- Full-text search across card titles, tags, and Layer 1 text
- Fast filter chips: property · theme · dietary flag (vegan, gluten-free, sustainable seafood)

---

### TIER 2 — Guest Experience Personalization (Build only if T1 is fully done)

Connects the training library to real guest profiles arriving today.

#### T2.1 Arriving Guest Dashboard
- Staff home screen: list of today's guests with preference chips
- Preference tags pulled from guest profile: `environmentalist` `nutrition-focused` `cultural-explorer` `women's-rights` `wellness` `vip-time-poor`

#### T2.2 AI-Personalized Service Briefing
- Claude API call: given guest profile tags + current property menu → returns 3 story cards to lead with, 2 topics to avoid, 3 talking-point sentences
- "Generate briefing" button on guest profile screen
- Streaming output preferred (shows typing = feels live, good for demo)
- Model: `claude-haiku-4-5-20251001` (fast, cheap, good enough)

#### T2.3 Staff Confidence Tracker
- After briefing + quiz: staff taps "I'm ready for [Guest Name]"
- Shows manager view: X of Y staff marked ready

---

### OUT OF SCOPE — Do Not Build

- Real authentication / user accounts
- Admin CMS for story content (use JSON files)
- Push notifications
- Real CRM / PMS integration
- Multi-property live data sync
- Analytics dashboard
- Offline mode / PWA

---

## Demo Content — Three Properties

### Property 1: Caruso's — Rosewood Miramar Beach, Montecito CA

**Why use it:** Michelin Star + Michelin Green Star — strongest credentials story

Story cards to build:
1. **California King Crab** — sourced within 50 miles, Smart Catch + Ocean Wise certified. Key terms to pronounce: none tricky, but explain "Ocean Wise"
2. **Resident Beehive & Chef's Garden** — on-property apiary, honey used in sauces and cocktails. Chef Massimo Falsini grows herbs 30 feet from the kitchen
3. **Food Made Good 3-Star** — one of very few US restaurants. Evaluate on Sourcing, Society, Environment. Chef quote: *"Sustainability is the only way forward."*

Key terms for ElevenLabs: "Massimo Falsini" (Italian), "Montecito" (Spanish-origin), "Chardonnay" (French)

---

### Property 2: Lakorn — Rosewood Bangkok

**Why use it:** Maximum cultural depth — 4-region Thai cuisine, royal heritage dishes

Story cards to build:
1. **Massaman Nuea Tu Rian Tod** — royal Thai beef shank curry with CRISPY DURIAN. Chef Bua's signature. Durian sourced from Southern Thailand, durian is considered the "king of fruits". This is a royal court dish adapted for contemporary dining
2. **Traspatio → Traspatio is San Miguel, substitute: Klongpai Farm** — welfare-certified free-range chicken, Sampran Farm free-range pork. The "Partners in Provenance" program requires every Bangkok chef to define their sourcing radius
3. **Chef Bua (Pattama Chocklapphon)** — 30+ years, specialist in royal Thai cuisine. Story: learning from palace cooks, preserving regional techniques in a modern kitchen

Key terms for ElevenLabs: "Kanom Jeen Nam Ngeow" (Thai), "Massaman" (Thai/Arabic origin), "Pattama Chocklapphon" (Thai), "Khao Soi" (Thai), "Sinchoum" (Lao)

---

### Property 3: Pirules — Rosewood San Miguel de Allende, Mexico

**Why use it:** Strongest values story — women-led supply chain, ancestral fire techniques, zero-waste

Story cards to build:
1. **Traspatio Women's Collective** — all restaurant poultry sourced from this women-led cooperative. Direct income to rural women. "When you order the chicken, you are funding these women's livelihoods" — the most powerful table story in the demo
2. **Fire & Ash Cooking** — 80% of dishes cooked over open ash, wood, or charcoal. Ancestral Mexican preservation technique. No industrial ovens. Chef Odín Rocha trained in this tradition from the State of Mexico
3. **99% Local Sourcing Radius** — 60-mile rule. La Factoría dairy (casein-free genetics), Vía Orgánica regenerative ranch, Comepesca sustainable fishing org. Goal: first plastic-free restaurant in Latin America

Key terms for ElevenLabs: "Pirules" (Spanish), "Odín Rocha" (Spanish), "Traspatio" (Spanish), "Vía Orgánica" (Spanish), "Comepesca" (Spanish), "barbacoa" (Spanish)

---

## Guest Profiles (Tier 2 Demo)

| Guest | Tags | Lead Story Cards | Avoid |
|-------|------|-----------------|-------|
| Emma Chen | environmentalist · women's rights | Traspatio collective · Food Made Good · circular waste | Anything not sustainability-certified |
| Dr. James Park | nutrition-focused · longevity | Organic farm certs · omega sourcing · minimal processing | Heavy cream sauces, framing anything as "indulgent" |
| Isabelle Moreau | cultural-explorer · food-anthropologist | Royal Thai heritage · fire cooking · ancestral technique | Generic "fusion" language |
| Robert Ashford | vip · time-poor | Michelin credentials only · 3 facts max | Long stories |

---

## UI Design Principles

- **Mobile-first, portrait orientation** — staff use phones during pre-service
- **Dark mode default** — easier in dim restaurant pre-service rooms
- **Card-based, swipeable** — muscle memory from social media, no learning curve
- **Warm earth tones** — terracotta, sand, deep green — aligns with Rosewood's visual identity
- **No walls of text** — every layer has a maximum word count enforced
- **Audio-first for hard words** — ElevenLabs icon is always visible, never hidden in a submenu

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 (App Router) | API routes for ElevenLabs + Claude calls; fast demo deploy |
| Language | TypeScript | Safer refactoring under time pressure |
| Styling | Tailwind CSS + shadcn/ui | Pre-built components, premium feel fast |
| TTS | ElevenLabs API (`eleven_multilingual_v2`) | Sponsor integration; multilingual correct accents |
| AI (Tier 2) | Claude API (`claude-haiku-4-5-20251001`) | Fast, cheap, streaming |
| Data | JSON files in `/src/data/` | Zero setup, easy to edit for demo content |
| Images | Unsplash URLs or local `/public/` assets | No upload infrastructure needed |
| Deploy | Vercel | One command, instant HTTPS |

---

## Time Budget

| Block | Duration | Goal |
|-------|----------|------|
| Setup + scaffolding | 0:00–0:30 | Next.js init, Tailwind, shadcn, env vars, data files |
| Story card data + types | 0:30–1:00 | 9 story cards across 3 properties, JSON complete |
| Story library + card UI | 1:00–2:00 | Grid, filter chips, layered card expand, search |
| ElevenLabs integration | 2:00–2:45 | API route, speaker button on cards, audio playback |
| Quiz mode | 2:45–3:30 | Flash cards, score, "ready" badge |
| Polish + deploy | 3:30–4:00 | Responsive, dark mode, Vercel deploy |
| **If time:** Tier 2 start | — | Guest dashboard + Claude briefing |
| Presentation prep | 4:00–5:00 | Script, rehearse 3-min demo, polish slides |
| 1-min video recording | 5:00–5:30 | Screen record demo flow, upload to YouTube |

---

## 3-Minute Demo Script

**0:00–0:25 — Hook**
> *"A new hire at Rosewood Bangkok has 20 minutes before dinner service. She's never heard of Kanom Jeen Nam Ngeow. She's scared she'll mispronounce it. She opens Origin Table."*
> [Show app loading on phone screen]

**0:25–1:10 — Story Library + Layered Cards**
> Tap Bangkok → tap the Massaman card → Layer 1 → Layer 2 → Layer 3 → show the cultural depth
> *"Three layers. They go as deep as they need. She swipes to the durian card. Durian?"* [tap] *"The king of fruits. A royal court dish. Now she has a story."*

**1:10–1:45 — ElevenLabs Pronunciation**
> Tap speaker next to "Kanom Jeen Nam Ngeow" → audio plays correctly in Thai
> *"ElevenLabs gives her the exact pronunciation in the right accent. She plays it three times. She's ready."*
> Tap "Pirules" → plays in Spanish · tap "Traspatio" → plays in Spanish

**1:45–2:20 — Quiz Mode**
> Enter quiz → show flash card → answer → score → "Ready for service ✓"
> *"The quiz locks it in. Spaced repetition surfaces what she got wrong yesterday."*

**2:20–2:50 — Impact Numbers**
> Static slide or overlay:
> - Average staff briefing prep: 45 min/shift · Origin Table: under 5 min
> - 70% hospitality turnover: Origin Table onboards a new hire in one session
> - Rosewood has 30+ properties, 100s of rotating seasonal stories: one source of truth

**2:50–3:00 — Close**
> *"Origin Table doesn't replace the human. It makes the human the best possible storyteller at the table. That IS the Rosewood experience."*
