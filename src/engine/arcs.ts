import type { GameEvent, GameState } from './types';

/**
 * Crusader-Kings-style event chain arcs.
 *
 * An Arc is a state machine: triggered by a condition, advances through
 * 3-6 stages over 4-10 turns. Each stage is a GameEvent surfaced normally
 * via the events pool. Stages have triggers based on what the player chose
 * in the previous stage.
 *
 * Arcs live in their own pool — the engine pulls a stage event when the
 * arc is "due" and the trigger conditions are met. Arcs are stored on
 * GameState.activeArcs as { arcId, stage, turnStarted, branch }.
 */

export type ArcId =
  | 'railBaltica'
  | 'rigaHousing'
  | 'brainDrain'
  | 'latgale'
  | 'energyPivot';

export interface ArcStage {
  /** Stage number — 1-indexed. */
  number: number;
  /** Earliest turn after arc start when this stage may fire. */
  minDelay: number;
  /** Latest turn after arc start when this stage may fire (deadline). */
  maxDelay: number;
  /** Which previous-stage branch(es) lead here. */
  fromBranches?: string[];
  /** Build the GameEvent for this stage. Receives current state for context. */
  build: (s: GameState) => GameEvent;
}

export interface ArcDef {
  id: ArcId;
  title: string;
  /** Whether this arc may be triggered yet (gating condition). */
  canTrigger: (s: GameState, currentTurn: number) => boolean;
  /** Stages in order. */
  stages: ArcStage[];
}

export interface ActiveArc {
  arcId: ArcId;
  stage: number;
  turnStarted: number;
  branch?: string;
}

// Reserved for future condition-gated arc stages.
const _UNUSED_ARC_NS = 1;

// ─── Arc 1: Riga Housing Crisis ──────────────────────────────────
const RIGA_HOUSING: ArcDef = {
  id: 'rigaHousing',
  title: 'The Riga Housing Crisis',
  canTrigger: (s, t) => t >= 4 && s.indicators.foreignInvestment > 50,
  stages: [
    {
      number: 1,
      minDelay: 0,
      maxDelay: 1,
      build: () => ({
        id: 'arc_rigaHousing_1',
        title: '🏘️ Rents in Riga Are Out of Hand',
        description: 'Rents in central Riga have risen 40% in two years. Tech workers cheer the landlord class. Nurses and teachers are moving to Salaspils — or further.',
        preconditions: [],
        category: 'society',
        weight: 100,
        oneTime: true,
        highStakes: true,
        choices: [
          {
            label: 'Introduce rent control on properties built before 2000',
            description: 'A cap on annual rent increases for older stock. Tenants exhale. Landlords lawyer up.',
            effects: [
              { indicator: 'socialStrain', delta: -4, delay: 0, duration: 0 },
              { indicator: 'foreignInvestment', delta: -4, delay: 1, duration: 0 },
              { indicator: 'publicConfidence', delta: 4, delay: 1, duration: 0 },
            ],
            factionReactions: { socialDems: 'cheer', entrepreneurs: 'rage', reformBloc: 'frown' },
            humor: 'A constitutional law professor is interviewed. She uses the words "interesting" and "litigation" in the same sentence.',
          },
          {
            label: 'Subsidise new construction in Pārdaugava',
            description: 'Direct grants for developers + faster permits. Supply, eventually.',
            effects: [
              { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
              { indicator: 'gdpGrowth', delta: 0.3, delay: 2, duration: 4 },
              { indicator: 'socialStrain', delta: -2, delay: 4, duration: 0 },
            ],
            factionReactions: { entrepreneurs: 'love', socialDems: 'meh', green: 'frown' },
            hasEcho: true,
          },
          {
            label: 'Do nothing — the market will find equilibrium',
            description: 'A neoliberal cliché, delivered with conviction.',
            effects: [
              { indicator: 'socialStrain', delta: 3, delay: 1, duration: 2 },
              { indicator: 'emigrationRate', delta: 2, delay: 2, duration: 3 },
            ],
            factionReactions: { entrepreneurs: 'cheer', socialDems: 'rage' },
            humor: 'A pundit on TV3 says "supply and demand" twelve times in fourteen minutes.',
          },
        ],
      }),
    },
    {
      number: 2,
      minDelay: 2,
      maxDelay: 3,
      build: () => ({
        id: 'arc_rigaHousing_2',
        title: '🪧 Referendum: Cap or Build?',
        description: 'A citizens\' petition for a national referendum on housing policy has crossed the threshold. The Saeima must respond.',
        preconditions: [],
        category: 'petition',
        weight: 100,
        oneTime: true,
        choices: [
          {
            label: 'Hold the referendum on schedule',
            description: 'Democracy at work. The campaign will be loud.',
            effects: [
              { indicator: 'mediaTrust', delta: 4, delay: 1, duration: 0 },
              { indicator: 'socialStrain', delta: 2, delay: 0, duration: 1 },
            ],
            factionReactions: { reformBloc: 'love', socialDems: 'cheer' },
          },
          {
            label: 'Pre-empt with a parliamentary compromise',
            description: 'Pass a moderate bill before the referendum date. Steals the energy. Costs trust.',
            effects: [
              { indicator: 'mediaTrust', delta: -3, delay: 1, duration: 0 },
              { indicator: 'socialStrain', delta: -3, delay: 1, duration: 0 },
            ],
            factionReactions: { entrepreneurs: 'cheer', reformBloc: 'frown' },
          },
        ],
      }),
    },
    {
      number: 3,
      minDelay: 4,
      maxDelay: 6,
      build: () => ({
        id: 'arc_rigaHousing_3',
        title: '🏁 Housing Crisis: The Resolution',
        description: 'Two years on, the crisis has resolved — for now. The verdict from the polls, the press, and the rental listings:',
        preconditions: [],
        category: 'society',
        weight: 100,
        oneTime: true,
        choices: [
          {
            label: 'Declare victory',
            description: 'Prime ministerial press conference. Lectern. Latvian flag. Stable rents (mostly).',
            effects: [
              { indicator: 'publicConfidence', delta: 4, delay: 0, duration: 0 },
              { indicator: 'mediaTrust', delta: 2, delay: 0, duration: 0 },
            ],
            factionReactions: { socialDems: 'cheer', entrepreneurs: 'meh' },
            humor: 'A reporter asks about the next housing crisis. The PM looks pained.',
          },
          {
            label: 'Pivot to the next issue',
            description: 'Housing is sorted (for now). Let the file go quiet.',
            effects: [
              { indicator: 'publicConfidence', delta: 2, delay: 0, duration: 0 },
            ],
            factionReactions: { reformBloc: 'meh' },
          },
        ],
      }),
    },
  ],
};

// ─── Arc 2: The Brain Drain Spiral ───────────────────────────────
const BRAIN_DRAIN: ArcDef = {
  id: 'brainDrain',
  title: 'The Brain Drain Spiral',
  canTrigger: (s, t) => t >= 8 && s.indicators.emigrationRate > 55,
  stages: [
    {
      number: 1,
      minDelay: 0,
      maxDelay: 1,
      build: () => ({
        id: 'arc_brainDrain_1',
        title: '✈️ The Dublin Pull',
        description: 'The 2026 emigration figures are in. They are worse than 2025\'s. The diaspora WhatsApp groups now organise welcome dinners by city.',
        preconditions: [],
        category: 'society',
        weight: 100,
        oneTime: true,
        highStakes: true,
        choices: [
          {
            label: 'Launch a "Return to Latvia" tax incentive',
            description: 'Returnees get 5 years of reduced income tax. Estonia did this. It worked. A little.',
            effects: [
              { indicator: 'emigrationRate', delta: -3, delay: 2, duration: 4 },
              { indicator: 'publicDebt', delta: 2, delay: 1, duration: 0 },
              { indicator: 'foreignInvestment', delta: 2, delay: 2, duration: 0 },
            ],
            factionReactions: { identity: 'cheer', entrepreneurs: 'cheer', socialDems: 'meh' },
            hasEcho: true,
          },
          {
            label: 'Liberalise immigration from Ukraine and the Caucasus',
            description: 'Fill the workforce gap from elsewhere. National Identity bloc will not enjoy this.',
            effects: [
              { indicator: 'workforceSkill', delta: 4, delay: 3, duration: 0 },
              { indicator: 'population', delta: 0.01, delay: 4, duration: 0 },
              { indicator: 'nationalIdentity', delta: -4, delay: 1, duration: 0 },
            ],
            factionReactions: { entrepreneurs: 'love', identity: 'rage', socialDems: 'cheer' },
          },
          {
            label: 'Treat it as a structural feature',
            description: '"Emigration is a market signal," says no Latvian. But it sounds policy-grade in English.',
            effects: [
              { indicator: 'publicConfidence', delta: -3, delay: 1, duration: 0 },
            ],
            factionReactions: { identity: 'rage', socialDems: 'frown' },
            humor: 'The PM\'s spin doctor resigns. Or is reassigned. The press release is unclear.',
          },
        ],
      }),
    },
    {
      number: 2,
      minDelay: 3,
      maxDelay: 5,
      build: () => ({
        id: 'arc_brainDrain_2',
        title: '🛬 The Diaspora Lobby',
        description: 'Latvians in Dublin, Berlin and London have organised. They have a name (Atpakaļ Mājās), a budget, and an op-ed in DELFI weekly.',
        preconditions: [],
        category: 'society',
        weight: 100,
        oneTime: true,
        choices: [
          {
            label: 'Open formal channels — give them advisory seats',
            description: 'The diaspora gets a voice in the Saeima\'s economic committee.',
            effects: [
              { indicator: 'emigrationRate', delta: -2, delay: 2, duration: 2 },
              { indicator: 'mediaTrust', delta: 3, delay: 1, duration: 0 },
            ],
            factionReactions: { reformBloc: 'cheer', identity: 'frown' },
          },
          {
            label: 'Quietly ignore them',
            description: 'They\'ll lose interest by the next World Cup.',
            effects: [
              { indicator: 'mediaTrust', delta: -2, delay: 1, duration: 0 },
            ],
            factionReactions: { identity: 'meh' },
          },
        ],
      }),
    },
    {
      number: 3,
      minDelay: 6,
      maxDelay: 9,
      build: () => ({
        id: 'arc_brainDrain_3',
        title: '🏁 Brain Drain: A Reckoning',
        description: 'The arc concludes with a hard number: the net migration figure for the term. The historians will use this graph for years.',
        preconditions: [],
        category: 'society',
        weight: 100,
        oneTime: true,
        choices: [
          {
            label: 'Accept the verdict — and pivot',
            description: 'A grown-up press conference. A new policy package on demographics.',
            effects: [{ indicator: 'publicConfidence', delta: 3, delay: 0, duration: 0 }],
            factionReactions: { reformBloc: 'cheer' },
          },
          {
            label: 'Reframe it as transformation, not decline',
            description: 'The "smaller, smarter Latvia" speech. Some buy it.',
            effects: [
              { indicator: 'publicConfidence', delta: 1, delay: 0, duration: 0 },
              { indicator: 'socialStrain', delta: 2, delay: 1, duration: 0 },
            ],
            factionReactions: { entrepreneurs: 'cheer', socialDems: 'frown' },
          },
        ],
      }),
    },
  ],
};

// ─── Arc 3: Rail Baltica Saga (deep extension) ───────────────────
const RAIL_BALTICA_SAGA: ArcDef = {
  id: 'railBaltica',
  title: 'The Rail Baltica Saga',
  canTrigger: (s, t) => t >= 6 && (s.indicators.portActivity ?? 0) > 0,
  stages: [
    {
      number: 1,
      minDelay: 0,
      maxDelay: 1,
      build: () => ({
        id: 'arc_railBaltica_1',
        title: '🚄 Rail Baltica: The First Sleeper',
        description: 'A photo of the first laid section south of Salacgrīva makes the news. Engineers shake hands. Estonian engineers shake hands more vigorously.',
        preconditions: [],
        category: 'economy',
        weight: 100,
        oneTime: true,
        choices: [
          {
            label: 'Accelerate Latvian segment',
            description: 'Pour money. Catch up to Estonia. Brussels approves.',
            effects: [
              { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
              { indicator: 'gdpGrowth', delta: 0.4, delay: 2, duration: 6 },
              { indicator: 'euStanding', delta: 3, delay: 1, duration: 0 },
            ],
            factionReactions: { entrepreneurs: 'cheer', reformBloc: 'cheer' },
          },
          {
            label: 'Stick to the existing timeline',
            description: 'Patience. Process. Latvian style.',
            effects: [{ indicator: 'euStanding', delta: -1, delay: 1, duration: 0 }],
            factionReactions: { entrepreneurs: 'meh', reformBloc: 'meh' },
          },
        ],
      }),
    },
    {
      number: 2,
      minDelay: 3,
      maxDelay: 5,
      build: () => ({
        id: 'arc_railBaltica_2',
        title: '🏗️ Construction Scandal',
        description: 'A subcontractor — three layers below the prime — has been found inflating invoices. KNAB is interested. So are journalists.',
        preconditions: [],
        category: 'crisis',
        weight: 100,
        oneTime: true,
        highStakes: true,
        choices: [
          {
            label: 'Cooperate fully with KNAB',
            description: 'Transparency. Even if it embarrasses the Infrastructure Minister.',
            effects: [
              { indicator: 'corruptionLevel', delta: -3, delay: 2, duration: 0 },
              { indicator: 'mediaTrust', delta: 4, delay: 1, duration: 0 },
            ],
            factionReactions: { reformBloc: 'love', entrepreneurs: 'frown' },
          },
          {
            label: 'Quietly settle the contract dispute',
            description: 'Make it go away. The minister keeps his job.',
            effects: [
              { indicator: 'corruptionLevel', delta: 4, delay: 1, duration: 0 },
              { indicator: 'mediaTrust', delta: -4, delay: 1, duration: 0 },
            ],
            factionReactions: { reformBloc: 'rage', entrepreneurs: 'meh' },
            hasEcho: true,
          },
        ],
      }),
    },
    {
      number: 3,
      minDelay: 7,
      maxDelay: 10,
      build: () => ({
        id: 'arc_railBaltica_3',
        title: '🎉 The Ribbon Cutting',
        description: 'The Latvian segment opens. A train from Tallinn arrives at Riga Central. Behind schedule. Within budget — if you squint.',
        preconditions: [],
        category: 'economy',
        weight: 100,
        oneTime: true,
        choices: [
          {
            label: 'Bask in the moment',
            description: 'You ride the inaugural train. Photo with the President.',
            effects: [
              { indicator: 'publicConfidence', delta: 6, delay: 0, duration: 0 },
              { indicator: 'euStanding', delta: 4, delay: 0, duration: 0 },
              { indicator: 'portActivity', delta: 8, delay: 1, duration: 0 },
            ],
            factionReactions: { entrepreneurs: 'love', reformBloc: 'cheer' },
            humor: 'The President\'s speech mentions amber 11 times. A record.',
          },
        ],
      }),
    },
  ],
};

// ─── Arc 4: The Latgale Question ─────────────────────────────────
const LATGALE: ArcDef = {
  id: 'latgale',
  title: 'The Latgale Question',
  canTrigger: (s, t) => t >= 6 && (s.indicators.russianMinorityIntegration ?? 50) < 45,
  stages: [
    {
      number: 1,
      minDelay: 0,
      maxDelay: 1,
      build: () => ({
        id: 'arc_latgale_1',
        title: '🗣️ Daugavpils Tensions',
        description: 'Russian-language schools in Daugavpils protest a new curriculum law. The protests are peaceful. Footage is everywhere.',
        preconditions: [],
        category: 'society',
        weight: 100,
        oneTime: true,
        highStakes: true,
        choices: [
          {
            label: 'Sit down with the school principals',
            description: 'Dialogue. Compromise on transitional periods.',
            effects: [
              { indicator: 'russianMinorityIntegration', delta: 5, delay: 1, duration: 0 },
              { indicator: 'socialCohesion', delta: 3, delay: 1, duration: 0 },
              { indicator: 'nationalIdentity', delta: -2, delay: 1, duration: 0 },
            ],
            factionReactions: { minority: 'love', identity: 'frown' },
          },
          {
            label: 'Enforce the law without exceptions',
            description: 'A nation has one language for state business.',
            effects: [
              { indicator: 'nationalIdentity', delta: 4, delay: 1, duration: 0 },
              { indicator: 'russianMinorityIntegration', delta: -6, delay: 1, duration: 0 },
              { indicator: 'socialStrain', delta: 4, delay: 2, duration: 2 },
            ],
            factionReactions: { identity: 'cheer', minority: 'rage' },
          },
        ],
      }),
    },
    {
      number: 2,
      minDelay: 3,
      maxDelay: 6,
      build: () => ({
        id: 'arc_latgale_2',
        title: '🏛️ Latgale: The Long View',
        description: 'A year on, the situation has settled — or hardened. The choice now is whether to invest in the region.',
        preconditions: [],
        category: 'society',
        weight: 100,
        oneTime: true,
        choices: [
          {
            label: 'Major regional development package for Latgale',
            description: 'Infrastructure, schools, hospitals. A signal.',
            effects: [
              { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
              { indicator: 'russianMinorityIntegration', delta: 6, delay: 2, duration: 0 },
              { indicator: 'socialCohesion', delta: 4, delay: 2, duration: 0 },
            ],
            factionReactions: { minority: 'love', socialDems: 'cheer', entrepreneurs: 'meh' },
          },
          {
            label: 'Let market forces work',
            description: 'Eastern Latvia will adjust. Or empty.',
            effects: [
              { indicator: 'emigrationRate', delta: 2, delay: 2, duration: 3 },
              { indicator: 'socialCohesion', delta: -3, delay: 1, duration: 0 },
            ],
            factionReactions: { entrepreneurs: 'cheer', minority: 'frown' },
          },
        ],
      }),
    },
  ],
};

// ─── Arc 5: The Energy Pivot ─────────────────────────────────────
const ENERGY_PIVOT: ArcDef = {
  id: 'energyPivot',
  title: 'The Energy Pivot',
  canTrigger: (s, t) => t >= 4 && s.indicators.energyIndependence < 60,
  stages: [
    {
      number: 1,
      minDelay: 0,
      maxDelay: 1,
      build: () => ({
        id: 'arc_energyPivot_1',
        title: '⚡ Gas Decoupling: The Last Cubic Metre',
        description: 'The contract with Russia\'s Gazprom finally lapses. The replacement LNG terminal at Skulte is over budget. The Norwegians are friendly but expensive.',
        preconditions: [],
        category: 'economy',
        weight: 100,
        oneTime: true,
        highStakes: true,
        choices: [
          {
            label: 'Accelerate wind buildout in Kurzeme',
            description: 'Long lead time. Right answer. Voters in the meantime — patient or angry?',
            effects: [
              { indicator: 'greenTransition', delta: 6, delay: 2, duration: 0 },
              { indicator: 'energyIndependence', delta: 8, delay: 4, duration: 0 },
              { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
            ],
            factionReactions: { green: 'love', entrepreneurs: 'meh' },
            hasEcho: true,
          },
          {
            label: 'Long-term LNG supply deal',
            description: 'Norwegian gas, locked in for a decade. Expensive. Predictable.',
            effects: [
              { indicator: 'energyIndependence', delta: 5, delay: 1, duration: 0 },
              { indicator: 'greenTransition', delta: -3, delay: 1, duration: 0 },
              { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
            ],
            factionReactions: { entrepreneurs: 'cheer', green: 'rage' },
          },
        ],
      }),
    },
    {
      number: 2,
      minDelay: 4,
      maxDelay: 8,
      build: () => ({
        id: 'arc_energyPivot_2',
        title: '🌬️ The Grid Holds',
        description: 'A cold January. Demand spikes. The grid is tested. Engineers, exhausted, deliver a verdict.',
        preconditions: [],
        category: 'crisis',
        weight: 100,
        oneTime: true,
        choices: [
          {
            label: 'Praise the engineers publicly',
            description: 'A speech. A medal. A quiet bonus.',
            effects: [
              { indicator: 'publicConfidence', delta: 5, delay: 0, duration: 0 },
              { indicator: 'mediaTrust', delta: 2, delay: 0, duration: 0 },
            ],
            factionReactions: { green: 'cheer', reformBloc: 'cheer' },
            humor: 'The engineers seem genuinely surprised to be on television.',
          },
        ],
      }),
    },
  ],
};

export const ARCS: ArcDef[] = [RIGA_HOUSING, BRAIN_DRAIN, RAIL_BALTICA_SAGA, LATGALE, ENERGY_PIVOT];

/**
 * Check which arcs should trigger this turn (move from "available" to active).
 * Pure function.
 */
export function checkArcTriggers(
  active: ActiveArc[],
  completed: Set<ArcId>,
  state: GameState,
  currentTurn: number,
): ActiveArc[] {
  const out = [...active];
  const activeIds = new Set(active.map(a => a.arcId));
  for (const arc of ARCS) {
    if (activeIds.has(arc.id) || completed.has(arc.id)) continue;
    if (arc.canTrigger(state, currentTurn)) {
      out.push({ arcId: arc.id, stage: 0, turnStarted: currentTurn });
      // Only one new arc per turn to avoid flooding
      break;
    }
  }
  return out;
}

/**
 * Get the next arc stage event ready to fire this turn, or null.
 */
export function nextArcEvent(active: ActiveArc, currentTurn: number, state: GameState): { event: GameEvent | null; readyArc: ActiveArc | null } {
  const arc = ARCS.find(a => a.id === active.arcId);
  if (!arc) return { event: null, readyArc: null };
  const nextStageNumber = active.stage + 1;
  const stage = arc.stages.find(s => s.number === nextStageNumber);
  if (!stage) return { event: null, readyArc: null };
  const elapsed = currentTurn - active.turnStarted;
  if (elapsed < stage.minDelay) return { event: null, readyArc: null };
  return { event: stage.build(state), readyArc: { ...active, stage: nextStageNumber } };
}
