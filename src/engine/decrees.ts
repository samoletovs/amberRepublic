import type { GameState } from './types';

/**
 * Tropico-style Edicts — toggleable persistent policies.
 *
 * Each decree, while active, applies an ongoing per-quarter effect to a
 * set of indicators. Revoking has a Political Capital cost and triggers
 * a "U-turn" headline (handled via newsfeed).
 *
 * Decrees live separately from event choices. They're a strategic
 * background layer — set them and forget them; un-set them and pay.
 */

export interface DecreeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
  /** PC cost to enact. */
  enactCost: number;
  /** PC cost to revoke (always > enactCost). */
  revokeCost: number;
  /** Per-quarter indicator deltas while active. */
  perQuarter: { indicator: string; delta: number }[];
  /** Faction approval impact when first enacted. */
  factionReactions?: Record<string, 'love' | 'cheer' | 'meh' | 'frown' | 'rage'>;
}

export const DECREES: DecreeDef[] = [
  {
    id: 'baltic_investment_zone',
    emoji: '🏗️',
    name: 'Baltic Investment Zone',
    description: 'Tax breaks for foreign capital in industrial parks. Investors smile. Small businesses do not.',
    enactCost: 4,
    revokeCost: 6,
    perQuarter: [
      { indicator: 'foreignInvestment', delta: 0.8 },
      { indicator: 'taxBurden', delta: -0.15 },
      { indicator: 'publicDebt', delta: 0.2 },
    ],
    factionReactions: { entrepreneurs: 'love', reformBloc: 'meh', socialDems: 'frown' },
  },
  {
    id: 'latvian_public_sector',
    emoji: '🇱🇻',
    name: 'Mandatory Latvian in Public Sector',
    description: 'All state services in Latvian only. National Identity cheers. Russian-speaking citizens, less so.',
    enactCost: 5,
    revokeCost: 8,
    perQuarter: [
      { indicator: 'nationalIdentity', delta: 0.6 },
      { indicator: 'russianMinorityIntegration', delta: -0.6 },
    ],
    factionReactions: { identity: 'love', minority: 'rage', reformBloc: 'frown' },
  },
  {
    id: 'emergency_housing',
    emoji: '🏘️',
    name: 'Emergency Housing Construction Program',
    description: 'Government-backed construction in major cities. Cranes everywhere. Treasury sighs.',
    enactCost: 6,
    revokeCost: 8,
    perQuarter: [
      { indicator: 'gdpGrowth', delta: 0.1 },
      { indicator: 'publicDebt', delta: 0.4 },
      { indicator: 'publicConfidence', delta: 0.3 },
      { indicator: 'socialStrain', delta: -0.2 },
    ],
    factionReactions: { socialDems: 'love', entrepreneurs: 'cheer', green: 'frown' },
  },
  {
    id: 'cyber_hardening',
    emoji: '🔒',
    name: 'Cyber-Hardening Program',
    description: 'Mandatory penetration testing across critical infrastructure. The IT department is busier — and angrier.',
    enactCost: 4,
    revokeCost: 5,
    perQuarter: [
      { indicator: 'cyberDefense', delta: 0.5 },
      { indicator: 'digitalInfra', delta: -0.1 },
    ],
    factionReactions: { natoBloc: 'cheer', reformBloc: 'cheer' },
  },
  {
    id: 'visa_free_tech',
    emoji: '💻',
    name: 'Visa-Free Tech Worker Channel',
    description: 'Fast-track residency for tech workers from select countries. Startups rejoice. The interior ministry side-eyes.',
    enactCost: 5,
    revokeCost: 6,
    perQuarter: [
      { indicator: 'techSector', delta: 0.4 },
      { indicator: 'foreignInvestment', delta: 0.3 },
      { indicator: 'nationalIdentity', delta: -0.2 },
    ],
    factionReactions: { entrepreneurs: 'love', identity: 'frown', socialDems: 'meh' },
  },
  {
    id: 'diaspora_return',
    emoji: '🛬',
    name: 'Diaspora Return Incentive',
    description: '5-year tax discount for returnees. Dublin Latvians take meetings.',
    enactCost: 4,
    revokeCost: 5,
    perQuarter: [
      { indicator: 'emigrationRate', delta: -0.3 },
      { indicator: 'population', delta: 0.002 },
      { indicator: 'publicDebt', delta: 0.1 },
    ],
    factionReactions: { identity: 'love', entrepreneurs: 'cheer', socialDems: 'cheer' },
  },
  {
    id: 'wind_corridor',
    emoji: '🌬️',
    name: 'Kurzeme Wind Corridor',
    description: 'Streamlined permits for offshore wind. Storks complain. Engineers cheer.',
    enactCost: 5,
    revokeCost: 6,
    perQuarter: [
      { indicator: 'greenTransition', delta: 0.5 },
      { indicator: 'energyIndependence', delta: 0.4 },
    ],
    factionReactions: { green: 'love', entrepreneurs: 'cheer' },
  },
  {
    id: 'knab_independence',
    emoji: '⚖️',
    name: 'KNAB Independence Charter',
    description: 'Anti-corruption agency reports directly to Saeima. KNAB hires faster. Procurement officers update their CVs.',
    enactCost: 6,
    revokeCost: 8,
    perQuarter: [
      { indicator: 'corruptionLevel', delta: -0.4 },
      { indicator: 'mediaTrust', delta: 0.3 },
    ],
    factionReactions: { reformBloc: 'love', entrepreneurs: 'frown' },
  },
  {
    id: 'rural_basic_income',
    emoji: '🌾',
    name: 'Rural Basic Income Pilot',
    description: 'A modest stipend to rural households in Latgale and Vidzeme. Treasury creaks. Villages exhale.',
    enactCost: 6,
    revokeCost: 9,
    perQuarter: [
      { indicator: 'socialCohesion', delta: 0.4 },
      { indicator: 'publicDebt', delta: 0.3 },
      { indicator: 'emigrationRate', delta: -0.2 },
    ],
    factionReactions: { socialDems: 'love', identity: 'cheer', entrepreneurs: 'frown' },
  },
  {
    id: 'song_festival_funding',
    emoji: '🎤',
    name: 'Song Festival Trust Fund',
    description: 'Permanent endowment for the Song & Dance Festival. National identity index quietly thanks you every June.',
    enactCost: 3,
    revokeCost: 5,
    perQuarter: [
      { indicator: 'nationalIdentity', delta: 0.3 },
      { indicator: 'publicConfidence', delta: 0.2 },
    ],
    factionReactions: { identity: 'love' },
  },
  {
    id: 'startup_grant_engine',
    emoji: '🚀',
    name: 'Startup Grant Engine',
    description: 'Seed grants up to €100k for Latvian-founded startups. MikroTīkls says nothing. Quietly approves.',
    enactCost: 4,
    revokeCost: 5,
    perQuarter: [
      { indicator: 'techSector', delta: 0.5 },
      { indicator: 'rdSpending', delta: 0.02 },
      { indicator: 'publicDebt', delta: 0.1 },
    ],
    factionReactions: { entrepreneurs: 'love', reformBloc: 'cheer' },
  },
  {
    id: 'frontline_brigade',
    emoji: '🛡️',
    name: 'Permanent Eastern Brigade',
    description: 'Standing army formation east of Daugavpils. The General Staff stops phoning at midnight.',
    enactCost: 6,
    revokeCost: 8,
    perQuarter: [
      { indicator: 'militaryReadiness', delta: 0.5 },
      { indicator: 'borderSecurity', delta: 0.4 },
      { indicator: 'publicDebt', delta: 0.3 },
      { indicator: 'russiaRelations', delta: -0.2 },
    ],
    factionReactions: { natoBloc: 'love', minority: 'frown' },
  },
];

export interface DecreeState {
  active: string[]; // decree ids
  history: { id: string; turn: number; action: 'enacted' | 'revoked' }[];
}

export function createInitialDecrees(): DecreeState {
  return { active: [], history: [] };
}

export function getDecree(id: string): DecreeDef | undefined {
  return DECREES.find(d => d.id === id);
}

/** Apply per-quarter effects of all active decrees to the indicators. */
export function applyDecreeEffects(decrees: DecreeState, indicators: Record<string, number>): Record<string, number> {
  const next = { ...indicators };
  for (const did of decrees.active) {
    const d = getDecree(did);
    if (!d) continue;
    for (const eff of d.perQuarter) {
      const cur = next[eff.indicator] ?? 0;
      next[eff.indicator] = cur + eff.delta;
    }
  }
  return next;
}

/** Can the player enact this decree right now? */
export function canEnact(decrees: DecreeState, decreeId: string, politicalCapital: number): { ok: boolean; reason?: string } {
  const d = getDecree(decreeId);
  if (!d) return { ok: false, reason: 'Unknown decree.' };
  if (decrees.active.includes(decreeId)) return { ok: false, reason: 'Already enacted.' };
  if (politicalCapital < d.enactCost) return { ok: false, reason: `Needs ${d.enactCost} PC` };
  return { ok: true };
}

export function enactDecree(state: GameState, decreeId: string): { state: GameState; def: DecreeDef | null } {
  const def = getDecree(decreeId);
  if (!def) return { state, def: null };
  const check = canEnact(state.decrees, decreeId, state.constitution.politicalCapital);
  if (!check.ok) return { state, def: null };
  return {
    state: {
      ...state,
      constitution: { ...state.constitution, politicalCapital: state.constitution.politicalCapital - def.enactCost },
      decrees: {
        active: [...state.decrees.active, decreeId],
        history: [...state.decrees.history, { id: decreeId, turn: state.turn, action: 'enacted' }],
      },
    },
    def,
  };
}

export function revokeDecree(state: GameState, decreeId: string): { state: GameState; def: DecreeDef | null } {
  const def = getDecree(decreeId);
  if (!def || !state.decrees.active.includes(decreeId)) return { state, def: null };
  if (state.constitution.politicalCapital < def.revokeCost) return { state, def: null };
  return {
    state: {
      ...state,
      constitution: { ...state.constitution, politicalCapital: state.constitution.politicalCapital - def.revokeCost },
      decrees: {
        active: state.decrees.active.filter(id => id !== decreeId),
        history: [...state.decrees.history, { id: decreeId, turn: state.turn, action: 'revoked' }],
      },
    },
    def,
  };
}
