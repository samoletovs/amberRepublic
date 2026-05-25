import type { Effect } from './types';

/**
 * El Presidente-style trait system. Pick 2 of 6 at game start.
 *
 * Traits do three things:
 *  1. Multiply or shift the magnitude of effects matching their domain.
 *  2. Shift starting indicator values (one-shot adjustments at game-start).
 *  3. Bias faction starting approval (used once the faction layer ships in P2).
 *
 * The gameplay goal: two runs with different trait combos play visibly
 * differently from quarter one.
 */
export type TraitId =
  | 'technocrat'
  | 'euroatlanticist'
  | 'populist'
  | 'crisisManager'
  | 'natoHawk'
  | 'balticPragmatist';

export interface TraitDef {
  id: TraitId;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  /** One-shot indicator deltas applied at game start. */
  startBias: Partial<Record<string, number>>;
  /** Faction starting offsets (factionId -> delta). Used in P2. */
  factionBias?: Record<string, number>;
  /** Per-effect multiplier function — applied in applyEffect. */
  modifyEffect?: (effect: Effect) => Effect;
  /** Domains this trait specialises in (cosmetic / tooltip use). */
  domains: string[];
}

const ECONOMY_INDICATORS = new Set([
  'gdp', 'gdpGrowth', 'foreignInvestment', 'taxBurden', 'publicDebt',
  'unemployment', 'inflation', 'portActivity', 'techSector',
]);
const SECURITY_INDICATORS = new Set([
  'militaryReadiness', 'natoRelations', 'borderSecurity', 'cyberDefense',
]);
const SOCIAL_INDICATORS = new Set([
  'publicHappiness', 'publicConfidence', 'socialStrain',
  'healthcareQuality', 'educationQuality', 'socialCohesion',
]);

export const TRAIT_DEFS: TraitDef[] = [
  {
    id: 'technocrat',
    emoji: '📊',
    name: 'Technocrat',
    tagline: '"Spreadsheets don\'t lie. People do."',
    description:
      'Economic and digital indicators move 20% harder under your watch. Factions remain politely indifferent — nobody loves a slide deck.',
    startBias: { foreignInvestment: 4, taxBurden: -2, mediaTrust: -2 },
    domains: ['economy', 'digital'],
    modifyEffect: (e) => {
      if (ECONOMY_INDICATORS.has(e.indicator) || e.indicator === 'digitalInfra') {
        return { ...e, delta: e.delta * 1.2 };
      }
      return e;
    },
  },
  {
    id: 'euroatlanticist',
    emoji: '🇪🇺',
    name: 'Euro-Atlanticist',
    tagline: '"Brussels has called. We pick up."',
    description:
      'Start with strong EU and NATO standing. National Identity bloc is cool toward you — and Russia notices.',
    startBias: { euStanding: 12, natoRelations: 10, nationalIdentity: -6, russiaRelations: -3 },
    domains: ['foreign', 'EU'],
    modifyEffect: (e) => {
      if (['euStanding', 'natoRelations'].includes(e.indicator) && e.delta > 0) {
        return { ...e, delta: e.delta * 1.25 };
      }
      return e;
    },
  },
  {
    id: 'populist',
    emoji: '🎤',
    name: 'Populist',
    tagline: '"The people know what they want. Usually it\'s lower taxes."',
    description:
      'Public Confidence recovers quickly after setbacks. The fiscal hangover, however, also accumulates faster.',
    startBias: { publicConfidence: 8, publicDebt: 4, foreignInvestment: -3 },
    domains: ['social', 'media'],
    modifyEffect: (e) => {
      if (e.indicator === 'publicConfidence' && e.delta > 0) return { ...e, delta: e.delta * 1.4 };
      if (e.indicator === 'publicDebt' && e.delta > 0) return { ...e, delta: e.delta * 1.2 };
      return e;
    },
  },
  {
    id: 'crisisManager',
    emoji: '🧯',
    name: 'Crisis Manager',
    tagline: '"I do my best work when everything\'s on fire."',
    description:
      'Crisis-category events resolve more favourably. In quiet quarters, you fidget — calm policy moves slightly less effectively.',
    startBias: { socialStrain: -4 },
    domains: ['crisis'],
    // Effect scoping is per-effect, not per-event; the bonus applies indirectly via reduced
    // strain on bad-news effects.
    modifyEffect: (e) => {
      if (SOCIAL_INDICATORS.has(e.indicator) && e.delta < 0) {
        return { ...e, delta: e.delta * 0.8 };
      }
      return e;
    },
  },
  {
    id: 'natoHawk',
    emoji: '🦅',
    name: 'NATO Hawk',
    tagline: '"Two-point-five percent is the floor, not the ceiling."',
    description:
      'Security and military investments overperform. Domestic social spending faces tougher coalition resistance.',
    startBias: { militaryReadiness: 8, natoRelations: 6, socialCohesion: -3, healthcareQuality: -2 },
    domains: ['security', 'defense'],
    modifyEffect: (e) => {
      if (SECURITY_INDICATORS.has(e.indicator)) return { ...e, delta: e.delta * 1.25 };
      if (e.indicator === 'healthcareQuality' && e.delta > 0) return { ...e, delta: e.delta * 0.85 };
      return e;
    },
  },
  {
    id: 'balticPragmatist',
    emoji: '🤝',
    name: 'Baltic Pragmatist',
    tagline: '"No one loves us. No one hates us. It\'s working."',
    description:
      'Every faction starts neutral and stable. The price: nobody adores you, and "passionate ally" events stay locked.',
    startBias: {},
    domains: ['balance'],
    modifyEffect: (e) => ({ ...e, delta: e.delta * 0.9 }),
  },
];

export function getTrait(id: TraitId): TraitDef | undefined {
  return TRAIT_DEFS.find(t => t.id === id);
}

/** Apply all trait-startBias deltas to an indicator map. */
export function applyTraitStartBias(
  indicators: Record<string, number>,
  traitIds: TraitId[],
): Record<string, number> {
  const next = { ...indicators };
  for (const tid of traitIds) {
    const t = getTrait(tid);
    if (!t) continue;
    for (const [key, delta] of Object.entries(t.startBias)) {
      if (typeof delta !== 'number') continue;
      next[key] = (next[key] ?? 0) + delta;
    }
  }
  return next;
}

/** Compose trait effect modifiers — applied in applyEffect before delta variation. */
export function applyTraitEffectModifiers(
  effect: Effect,
  traitIds: TraitId[],
): Effect {
  let result = effect;
  for (const tid of traitIds) {
    const t = getTrait(tid);
    if (t?.modifyEffect) result = t.modifyEffect(result);
  }
  return result;
}
