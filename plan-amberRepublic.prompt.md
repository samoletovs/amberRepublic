# Amber Republic — Copilot Workspace Instructions

## Project

**Amber Republic** — a text-based political and economic simulation game set in Latvia. The player takes the role of a national leader making decisions that shape the country's economy, demographics, security, society, and international standing. Decisions have immediate, delayed, and compounding effects modeled through a weighted cause-and-effect engine.

- **Runtime**: Node.js + TypeScript
- **UI**: Terminal/CLI first, web UI later (React + TypeScript + Vite)
- **Testing**: Vitest
- **Package manager**: npm

## Game design

### Core loop

Each turn represents one quarter (3 months). Per turn:
1. **State report** — show current indicators, trends (↑↓→), and notable changes
2. **Events** — 1-3 events fire based on preconditions and randomness
3. **Decisions** — player picks from 2-4 options per event, plus 1-2 policy decisions
4. **Resolution** — apply immediate effects, schedule delayed effects, advance turn counter
5. **Feedback** — narrative summary of what happened and foreshadowing

### State variables (~25 indicators, all 0-100 scale unless noted)

**Economy**: gdp (billions EUR), gdpGrowth (%), unemployment (%), inflation (%), publicDebt (% of GDP), taxRate (%), foreignInvestment, tradeBalance, portActivity, energyIndependence

**Demographics**: population (actual number, starting ~1.85M), emigrationRate, birthRate, urbanization, workforceSkillLevel, russianMinorityIntegration

**Society**: publicHappiness, healthcareQuality, educationQuality, corruptionLevel, mediaTrust, nationalIdentity, socialCohesion

**Security & Foreign policy**: natoRelations, euStanding, russiaRelations, militaryReadiness, borderSecurity, cyberDefense

**Innovation**: rdSpending (% GDP), techSectorGrowth, universityRanking, digitalInfrastructure

### Impact model

- Effects are arrays of `{ indicator, delta, delay (turns), decay (turns), condition? }`
- Delayed effects queue into a `scheduledEffects` array processed each turn
- Second-order effects: some indicator changes trigger cascading changes (e.g., high emigration → workforce shortage → GDP decline)
- Effects can be conditional: "only if indicator X > threshold"
- Random variance: ±10-20% on all deltas to prevent deterministic play

### Events

Events are data-driven (JSON/TS objects), not hardcoded logic:
```ts
interface GameEvent {
  id: string;
  title: string;
  description: string;
  preconditions: Condition[]; // e.g., { indicator: "russiaRelations", op: "<", value: 30 }
  choices: Choice[];
  category: "economy" | "security" | "society" | "diplomacy" | "science" | "crisis";
  weight: number; // probability weight
  oneTime: boolean; // can only fire once per game
}

interface Choice {
  label: string;
  description: string;
  effects: Effect[];
}

interface Effect {
  indicator: string;
  delta: number;
  delay: number;    // turns before effect applies
  duration: number; // turns the effect persists (0 = permanent)
  condition?: Condition;
}
```

### Latvia-specific content domains

**Geopolitics**: NATO spending (real baseline ~2.4% GDP), Russia relations, EU integration depth, Baltic cooperation (with Estonia & Lithuania), sanctions policy, border with Belarus/Russia

**Economy**: Port of Riga transit trade, flat vs. progressive tax debate (shifted 2018), EU structural funds, euro adoption (2014), forestry/timber industry, Latvian airline airBaltic, fintech sector growth, Rail Baltica project

**Demographics**: Population decline from 2.6M (1990) to ~1.85M — brain drain to UK/Ireland/Germany/Nordics; Russian-speaking minority (~25%); aging population; rural depopulation outside Riga

**Society**: Language policy (Latvian-only education reform), media landscape (Russian-language media influence), Song and Dance Festival tradition, historical memory (Soviet occupation, Forest Brothers), corruption perception

**Science & Education**: University of Latvia, Riga Technical University, LETT biotech, IT sector, R&D spending (~0.7% GDP), competition with Tartu/Vilnius

### Difficulty and scenarios

- **Standard**: Start at current real-world baseline (2025 data)
- **Crisis mode**: Start during an economic/security crisis
- **Historical**: Start in 1991 (independence restoration) and play forward
- **Custom**: Let player set starting conditions

## Architecture

```
src/
  engine/          # Core game engine (state, effects, turns)
    state.ts       # GameState type and initial state factory
    effects.ts     # Effect processing, scheduling, second-order cascading
    events.ts      # Event selection, precondition checking
    turn.ts        # Turn orchestration (the core loop)
  data/
    events/        # Event definitions by category (economy.ts, security.ts, etc.)
    scenarios/     # Starting state presets
    indicators.ts  # Indicator metadata (name, description, min, max, format)
  ui/
    cli.ts         # Terminal interface (inquirer/prompts)
    renderer.ts    # State display formatting, ASCII charts
  utils/
    random.ts      # Seeded RNG for reproducibility
    math.ts        # Clamping, interpolation, weighted random
  types.ts         # All shared interfaces
tests/
  engine/          # Unit tests for state, effects, events, turns
  data/            # Validation tests (all events have valid indicators, effects balanced)
  integration/     # Full turn sequence tests
```

## Conventions

- TypeScript strict mode
- Pure functions for game logic — engine has zero side effects, UI is the only effectful layer
- All game state is a single immutable object passed through functions (use spread/structuredClone)
- Event data is separate from engine logic — engine doesn't know about Latvia, only about indicators and effects
- Seeded random number generator for reproducible games (save/load by storing seed + decision history)
- Indicator values clamped to valid ranges after every state update
- All text in English, but Latvian terms acceptable for flavor (with English explanation)
- Sentence case for all UI text

## Build and test

```bash
npm install        # Install dependencies
npm run dev        # Run CLI game
npm run build      # Production build
npm test           # Run unit tests (vitest)
npm run lint       # Lint source files
```

## Design principles

1. **Realism over fun** — effects should be plausible, not gamified. Cutting taxes shouldn't instantly boost GDP.
2. **No right answers** — every choice has trade-offs. The game teaches that governance is about managing trade-offs.
3. **Delayed consequences** — most big decisions take 2-8 turns to fully manifest. This is the core insight the game teaches.
4. **Data-driven** — adding new events/scenarios requires zero engine changes, just new data files.
5. **Testable** — given the same seed and decisions, the game produces identical outcomes every time.
