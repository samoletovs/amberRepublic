# Amber Republic — Copilot Coding Agent Instructions

## Project

Political simulation game set in modern Latvia (2025-2035). React + TypeScript + Vite + Tailwind CSS.

## Build & verify

```bash
npm install
npm run build    # MUST pass with zero errors
npm run lint     # MUST pass
```

## Structure

```
src/
├── engine/    # Pure TypeScript game engine (state, effects, events, turns, politics)
├── data/      # Event definitions by category (economy, security, society, diplomacy)
├── ui/        # React components (TitleScreen, GameScreen, EventCard, RealityDashboard, etc.)
```
api/
├── src/functions/  # Azure SWA API functions (latvia-stats, reality-dashboard, AI event generation)

## Key rules

- Game engine is pure functions — zero side effects
- All state is immutable (spread/structuredClone)
- Events are data-driven — engine doesn't know about Latvia, only indicators + effects
- Seeded RNG for reproducibility
- Effect deltas are in event files (`src/data/*.ts`)
- New events go in `src/data/extra-events.ts`
- New UI components go in `src/ui/`
- Export new events from `src/data/index.ts`

## Style

- Warm parchment theme (cream #F5F0E8 background)
- Fonts: Lora (headings), Source Sans 3 (body), IBM Plex Mono (data)
- Primary: Latvian crimson #9E3039
- Accent: amber #B8860B

## When implementing

1. Check TypeScript types first
2. Follow existing patterns in the closest similar file
3. Run `npm run build` before committing
4. Create PR targeting `main`
