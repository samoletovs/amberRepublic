# Amber Republic — Claude Code Instructions

## Project Overview

A political simulation game set in modern Latvia (2025-2035). Built with React + TypeScript + Vite + Tailwind CSS.

## Architecture

- `src/engine/` — Pure TypeScript game engine (state, effects, events, turns, politics)
- `src/data/` — Event definitions by category (economy, security, society, diplomacy, etc.)
- `src/ui/` — React components (TitleScreen, GameScreen, GameOverScreen, EventCard, etc.)
- `src/engine/politics.ts` — Parliament, coalition, elections, international ratings

## Key Rules

- Game engine is pure functions with zero side effects
- All game state is immutable (spread/structuredClone)
- Events are data-driven — engine doesn't know about Latvia, only indicators and effects
- Indicator values are clamped to valid ranges
- Seeded RNG for reproducibility

## For Bug Fixes

- Check TypeScript types first
- Run `npm run build` to verify

## For Balance Issues

- Effect deltas are in event files (`src/data/*.ts`)
- Effects have: `indicator`, `delta`, `delay` (turns), `duration` (turns)
- Second-order cascading effects are in `src/engine/effects.ts`

## For New Features

- Follow existing patterns in the closest similar file
- Add new events to `src/data/extra-events.ts`
- New UI components go in `src/ui/`
- Export new events from `src/data/index.ts`

## Testing

- `npm run build` — must pass with zero errors
- E2E tests: `python scripts/test_e2e.py` (Playwright)

## Style

- Warm parchment theme (cream #F5F0E8 background)
- Fonts: Lora (headings), Source Sans 3 (body), IBM Plex Mono (data)
- Primary: Latvian crimson #9E3039
- Accent: amber #B8860B
