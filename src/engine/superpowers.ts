import type { Rng } from './random';

/**
 * Tropico Cold War mechanic, mapped to Latvia's real geopolitics.
 *
 * Three external actors run timed demands:
 *  - 🇪🇺 Brussels — fiscal limits, rule-of-law, green, migration
 *  - 🇷🇺 Moscow — pressure tools (gas, disinfo, border, cyber). Cannot be "satisfied" — only managed.
 *  - 🇺🇸 Washington — defence & tech sovereignty
 *
 * Each demand surfaces as a timed card with a deadline. Ignoring has cost.
 * Satisfying often hurts another power or a domestic faction.
 *
 * Pure-function module: state is held on GameState.superpowers.
 */

export type SuperpowerId = 'eu' | 'ru' | 'us';

export interface SuperpowerDef {
  id: SuperpowerId;
  emoji: string;
  name: string;
  color: string;
  /** A line summarising the relationship at "normal" levels. */
  description: string;
}

export const SUPERPOWERS: SuperpowerDef[] = [
  {
    id: 'eu',
    emoji: '🇪🇺',
    name: 'Brussels',
    color: '#003399',
    description: 'EU Commission, Council, and the Parliament — friendly, exacting, occasionally exasperated.',
  },
  {
    id: 'ru',
    emoji: '🇷🇺',
    name: 'Moscow',
    color: '#8B0000',
    description: 'Cannot be befriended. Can be managed. Probably wants something today.',
  },
  {
    id: 'us',
    emoji: '🇺🇸',
    name: 'Washington',
    color: '#4A90E2',
    description: 'Allied. Distant. Interested when the F-35 fund line is on the table.',
  },
];

export interface Demand {
  id: string;
  power: SuperpowerId;
  title: string;
  body: string;
  /** Turn by which the demand should be resolved (or auto-fails). */
  deadlineTurn: number;
  options: DemandOption[];
}

export interface DemandOption {
  label: string;
  description: string;
  /** Indicator deltas applied immediately. */
  effects: { indicator: string; delta: number }[];
  /** Faction reactions. */
  factionReactions?: Record<string, 'love' | 'cheer' | 'meh' | 'frown' | 'rage'>;
  /** Standing delta with each power. */
  powerDeltas?: Partial<Record<SuperpowerId, number>>;
}

export interface SuperpowerState {
  standing: Record<SuperpowerId, number>; // 0-100, lower = worse
  active: Demand[];
  resolved: { demandId: string; turn: number; chosen: number }[];
}

export function createInitialSuperpowers(): SuperpowerState {
  return {
    standing: { eu: 58, ru: 12, us: 60 },
    active: [],
    resolved: [],
  };
}

// ─── Demand templates ────────────────────────────────────────────
type DemandTemplate = Omit<Demand, 'id' | 'deadlineTurn'>;

const EU_TEMPLATES: DemandTemplate[] = [
  {
    power: 'eu',
    title: '🇪🇺 Brussels: Bring Deficit Under 3%',
    body: 'The Commission notes your structural deficit has crept above the threshold. They would like a "clear glide path." They would prefer a fast one.',
    options: [
      {
        label: 'Comply: austerity package',
        description: 'Cut social spending, freeze hiring. Brussels nods. Citizens do not.',
        effects: [
          { indicator: 'publicDebt', delta: -4 },
          { indicator: 'healthcareQuality', delta: -3 },
          { indicator: 'socialStrain', delta: 4 },
        ],
        factionReactions: { reformBloc: 'cheer', socialDems: 'rage' },
        powerDeltas: { eu: 8 },
      },
      {
        label: 'Negotiate an extension',
        description: 'A reasoned letter. A delegation. A 6-month grace period.',
        effects: [{ indicator: 'euStanding', delta: -2 }],
        factionReactions: { reformBloc: 'meh' },
        powerDeltas: { eu: 2 },
      },
      {
        label: 'Ignore — Brussels is bluffing',
        description: 'It is not bluffing.',
        effects: [{ indicator: 'foreignInvestment', delta: -6 }, { indicator: 'euStanding', delta: -6 }],
        factionReactions: { reformBloc: 'rage', entrepreneurs: 'frown' },
        powerDeltas: { eu: -12 },
      },
    ],
  },
  {
    power: 'eu',
    title: '🇪🇺 Brussels: Judicial Reform Directive',
    body: 'The Commission has questions about KNAB independence and the appointment of judges. They expect answers.',
    options: [
      {
        label: 'Pass the reform package',
        description: 'KNAB gains real autonomy. Some prosecutors blink.',
        effects: [{ indicator: 'corruptionLevel', delta: -6 }, { indicator: 'mediaTrust', delta: 4 }],
        factionReactions: { reformBloc: 'love', entrepreneurs: 'frown' },
        powerDeltas: { eu: 8 },
      },
      {
        label: 'Symbolic gestures only',
        description: 'A new committee. A new chair. Same prosecutors.',
        effects: [{ indicator: 'corruptionLevel', delta: -1 }],
        factionReactions: { reformBloc: 'frown' },
        powerDeltas: { eu: -2 },
      },
    ],
  },
];

const RU_TEMPLATES: DemandTemplate[] = [
  {
    power: 'ru',
    title: '🇷🇺 Moscow: Gas Pricing Pressure',
    body: 'A bilateral note arrives — couched in trade-policy language. The undertone is sharper. Latvia\'s transit volumes have been re-priced. Twice.',
    options: [
      {
        label: 'Hold the line — diversify supplies',
        description: 'Long-term Norwegian LNG contracts. Brussels approves. Wallet protests.',
        effects: [
          { indicator: 'energyIndependence', delta: 6 },
          { indicator: 'publicDebt', delta: 2 },
          { indicator: 'russiaRelations', delta: -3 },
        ],
        factionReactions: { natoBloc: 'love', green: 'cheer', entrepreneurs: 'meh' },
        powerDeltas: { ru: -5, eu: 4 },
      },
      {
        label: 'Limited transit deal',
        description: 'Quiet workaround. The Russian invoice cools. So do the headlines.',
        effects: [
          { indicator: 'russiaRelations', delta: 3 },
          { indicator: 'natoRelations', delta: -3 },
          { indicator: 'energyIndependence', delta: -3 },
        ],
        factionReactions: { natoBloc: 'rage', identity: 'frown' },
        powerDeltas: { ru: 6, us: -4, eu: -4 },
      },
    ],
  },
  {
    power: 'ru',
    title: '🇷🇺 Moscow: Disinformation Campaign',
    body: 'A coordinated wave of social-media posts is targeting Latvian Russian-language audiences. The themes: language laws, alleged discrimination, NATO "occupation". The volume is significant.',
    options: [
      {
        label: 'Strategic communications response',
        description: 'A new MFA unit. Russian-language counter-narrative. KNAB monitors.',
        effects: [
          { indicator: 'mediaTrust', delta: 4 },
          { indicator: 'russianMinorityIntegration', delta: 2 },
          { indicator: 'cyberDefense', delta: 4 },
        ],
        factionReactions: { reformBloc: 'cheer', minority: 'cheer' },
        powerDeltas: { ru: -3, eu: 3 },
      },
      {
        label: 'Restrict access to suspect outlets',
        description: 'Block the worst offenders. Press freedom rankings notice.',
        effects: [
          { indicator: 'mediaTrust', delta: -4 },
          { indicator: 'cyberDefense', delta: 4 },
          { indicator: 'russianMinorityIntegration', delta: -4 },
        ],
        factionReactions: { identity: 'cheer', reformBloc: 'frown', minority: 'rage' },
        powerDeltas: { ru: -5, eu: -2 },
      },
    ],
  },
];

const US_TEMPLATES: DemandTemplate[] = [
  {
    power: 'us',
    title: '🇺🇸 Washington: HIMARS Procurement',
    body: 'A US delegation arrives. They have brochures. The brochures are persuasive. Co-financing options are mentioned.',
    options: [
      {
        label: 'Sign the deal — joint procurement',
        description: 'A long invoice. A long delivery list. A long handshake.',
        effects: [
          { indicator: 'militaryReadiness', delta: 8 },
          { indicator: 'publicDebt', delta: 3 },
        ],
        factionReactions: { natoBloc: 'love' },
        powerDeltas: { us: 10, ru: -4 },
      },
      {
        label: 'Wait for the European alternative',
        description: 'Buy German next year. Buy French the year after.',
        effects: [{ indicator: 'militaryReadiness', delta: 3 }],
        factionReactions: { natoBloc: 'meh', reformBloc: 'cheer' },
        powerDeltas: { us: -4, eu: 4 },
      },
    ],
  },
];

// Reserved for the per-power lookup once we add an arbitrary-roller path.
const _UNUSED_SUPERPOWERS_NS: Record<SuperpowerId, DemandTemplate[]> = {
  eu: EU_TEMPLATES,
  ru: RU_TEMPLATES,
  us: US_TEMPLATES,
};

/**
 * Roll for new demands each turn.
 * - EU: ~once every 8 turns
 * - RU: ~once every 6 turns (more often when relations are very low)
 * - US: ~once every 12 turns
 */
export function rollSuperpowerDemands(
  state: SuperpowerState,
  currentTurn: number,
  rng: Rng,
  russiaRelations: number,
): SuperpowerState {
  const out: SuperpowerState = { ...state, active: [...state.active] };
  const activePowers = new Set(out.active.map(d => d.power));

  if (!activePowers.has('eu') && rng.next() < 1 / 8) {
    const t = rng.pick(EU_TEMPLATES);
    out.active.push({ ...t, id: `dem_eu_${currentTurn}`, deadlineTurn: currentTurn + 4 });
  }
  if (!activePowers.has('ru')) {
    const russiaPressure = russiaRelations < 20 ? 1 / 4 : 1 / 7;
    if (rng.next() < russiaPressure) {
      const t = rng.pick(RU_TEMPLATES);
      out.active.push({ ...t, id: `dem_ru_${currentTurn}`, deadlineTurn: currentTurn + 3 });
    }
  }
  if (!activePowers.has('us') && rng.next() < 1 / 12) {
    const t = rng.pick(US_TEMPLATES);
    out.active.push({ ...t, id: `dem_us_${currentTurn}`, deadlineTurn: currentTurn + 5 });
  }
  return out;
}

/** Mark expired demands and apply the cost of inaction. */
export function expireDemands(state: SuperpowerState, currentTurn: number): { state: SuperpowerState; penalties: Array<{ power: SuperpowerId; reason: string; standingDelta: number }> } {
  const penalties: Array<{ power: SuperpowerId; reason: string; standingDelta: number }> = [];
  const remaining: Demand[] = [];
  const standing = { ...state.standing };
  for (const d of state.active) {
    if (d.deadlineTurn <= currentTurn) {
      const drop = d.power === 'ru' ? 4 : 8;
      standing[d.power] = Math.max(0, standing[d.power] - drop);
      penalties.push({ power: d.power, reason: `Ignored: ${d.title}`, standingDelta: -drop });
    } else {
      remaining.push(d);
    }
  }
  return { state: { ...state, active: remaining, standing }, penalties };
}

/** Resolve a chosen option for a demand. */
export function resolveDemand(
  state: SuperpowerState,
  demandId: string,
  optionIdx: number,
  currentTurn: number,
): { state: SuperpowerState; option: DemandOption | null } {
  const d = state.active.find(x => x.id === demandId);
  if (!d) return { state, option: null };
  const opt = d.options[optionIdx];
  if (!opt) return { state, option: null };
  const standing = { ...state.standing };
  if (opt.powerDeltas) {
    for (const [pid, delta] of Object.entries(opt.powerDeltas) as [SuperpowerId, number][]) {
      standing[pid] = Math.max(0, Math.min(100, standing[pid] + delta));
    }
  }
  return {
    state: {
      ...state,
      active: state.active.filter(x => x.id !== demandId),
      standing,
      resolved: [...state.resolved, { demandId, turn: currentTurn, chosen: optionIdx }],
    },
    option: opt,
  };
}

export function getSuperpower(id: SuperpowerId): SuperpowerDef | undefined {
  return SUPERPOWERS.find(s => s.id === id);
}

/** Returns ['Friendly', 'Cordial', 'Strained', 'Hostile'] */
export function relationLabel(value: number): string {
  if (value > 75) return 'Friendly';
  if (value > 55) return 'Cordial';
  if (value > 30) return 'Strained';
  if (value > 15) return 'Hostile';
  return 'Open Crisis';
}
