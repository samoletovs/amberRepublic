import type { Rng } from './random';
import { clamp } from './random';

/**
 * Tropico-style ideological factions — a layer on top of the existing
 * Saeima party system. Parties live in politics.ts and care about elections;
 * factions live here and care about every quarter.
 *
 * Each faction has a fictional named leader (the "face" of the bloc),
 * a color, an ideology blurb, and a priority list of indicators they
 * watch. Their approval drifts passively each quarter based on indicators
 * AND can be shifted by explicit event-choice reactions.
 *
 * Acceptance from the plan: every event card shows leader-portrait reaction
 * icons that change as you hover over each choice.
 */

export type FactionId =
  | 'entrepreneurs'
  | 'socialDems'
  | 'natoBloc'
  | 'reformBloc'
  | 'identity'
  | 'green'
  | 'minority';

export type ReactionLevel = 'love' | 'cheer' | 'meh' | 'frown' | 'rage';

export interface FactionDef {
  id: FactionId;
  name: string;
  shortName: string;
  leader: string;
  leaderInitials: string;
  color: string;
  ideology: string;
  /** Indicator keys this faction cares about (positive direction). */
  caresAboutUp: string[];
  /** Indicator keys this faction cares about (wants down). */
  caresAboutDown: string[];
  /** One-liner the faction publishes when *very* happy. */
  praiseQuote: string;
  /** One-liner the faction publishes when *very* unhappy. */
  angerQuote: string;
}

export const FACTIONS: FactionDef[] = [
  {
    id: 'entrepreneurs',
    name: 'Entrepreneurs & Investors',
    shortName: 'ENT',
    leader: 'Andris Kalniņš',
    leaderInitials: 'AK',
    color: '#D4A843',
    ideology: 'Capital-friendly · low tax · single market',
    caresAboutUp: ['foreignInvestment', 'techSector', 'gdpGrowth', 'portActivity'],
    caresAboutDown: ['taxBurden', 'corruptionLevel'],
    praiseQuote: '"Latvia is finally open for business."',
    angerQuote: '"My next office will be in Tallinn."',
  },
  {
    id: 'socialDems',
    name: 'Social Democrats & Unions',
    shortName: 'SD',
    leader: 'Ilze Krastiņa',
    leaderInitials: 'IK',
    color: '#9C27B0',
    ideology: 'Welfare · workers\' rights · public services',
    caresAboutUp: ['healthcareQuality', 'educationQuality', 'socialCohesion', 'publicConfidence'],
    caresAboutDown: ['unemployment', 'socialStrain'],
    praiseQuote: '"For once, the government remembers who pays the bills."',
    angerQuote: '"The strike committee is ready."',
  },
  {
    id: 'natoBloc',
    name: 'NATO & Security Bloc',
    shortName: 'NTO',
    leader: 'Gen. Jānis Ozoliņš (ret.)',
    leaderInitials: 'JO',
    color: '#8B0000',
    ideology: 'Deterrence first · hard border · 3% GDP defense',
    caresAboutUp: ['militaryReadiness', 'natoRelations', 'borderSecurity', 'cyberDefense'],
    caresAboutDown: ['russiaRelations'], // they prefer it cold
    praiseQuote: '"A serious country, at last."',
    angerQuote: '"We will be remembered for what we did not build."',
  },
  {
    id: 'reformBloc',
    name: 'Reform & EU Integration Bloc',
    shortName: 'REF',
    leader: 'Dr. Liene Vītola',
    leaderInitials: 'LV',
    color: '#1B75BB',
    ideology: 'Rule of law · judicial independence · press freedom',
    caresAboutUp: ['euStanding', 'mediaTrust', 'educationQuality', 'digitalInfra'],
    caresAboutDown: ['corruptionLevel'],
    praiseQuote: '"The institutions are working. Note the date."',
    angerQuote: '"The European Court will hear about this."',
  },
  {
    id: 'identity',
    name: 'National Identity & Heritage',
    shortName: 'NAT',
    leader: 'Māris Bērziņš',
    leaderInitials: 'MB',
    color: '#3D3731',
    ideology: 'Language · culture · historical memory',
    caresAboutUp: ['nationalIdentity', 'borderSecurity'],
    caresAboutDown: ['emigrationRate'],
    praiseQuote: '"The dainas approve."',
    angerQuote: '"We are losing the country, quietly."',
  },
  {
    id: 'green',
    name: 'Green Latvia',
    shortName: 'GRN',
    leader: 'Elīna Ozola',
    leaderInitials: 'EO',
    color: '#4CAF50',
    ideology: 'Carbon targets · renewables · EU sustainability',
    caresAboutUp: ['greenTransition', 'energyIndependence'],
    caresAboutDown: [],
    praiseQuote: '"The 2040 target is no longer fiction."',
    angerQuote: '"You burned the future for one cheap winter."',
  },
  {
    id: 'minority',
    name: 'Russian-Speaking Citizens',
    shortName: 'RUS',
    leader: 'Sergejs Pavlovs',
    leaderInitials: 'SP',
    color: '#607D8B',
    ideology: 'Bilingual services · integration · civic equality',
    caresAboutUp: ['russianMinorityIntegration', 'socialCohesion'],
    caresAboutDown: ['socialStrain'],
    praiseQuote: '"We are citizens, too. And finally treated that way."',
    angerQuote: '"This town has two halves again. It does not have to."',
  },
];

export function getFaction(id: FactionId): FactionDef | undefined {
  return FACTIONS.find(f => f.id === id);
}

/** Default approval map — everyone starts middling around 45-55. */
export function createInitialFactionApproval(): Record<FactionId, number> {
  return {
    entrepreneurs: 50,
    socialDems: 48,
    natoBloc: 60,
    reformBloc: 52,
    identity: 55,
    green: 45,
    minority: 38,
  };
}

/** Map reaction level to delta. */
export function reactionDelta(r: ReactionLevel): number {
  switch (r) {
    case 'love': return 8;
    case 'cheer': return 4;
    case 'meh': return 0;
    case 'frown': return -4;
    case 'rage': return -8;
  }
}

/** Visual symbol for a reaction (used on event cards). */
export function reactionSymbol(r: ReactionLevel): string {
  switch (r) {
    case 'love': return '💗';
    case 'cheer': return '👍';
    case 'meh': return '😐';
    case 'frown': return '😠';
    case 'rage': return '🔥';
  }
}

/**
 * Apply explicit faction reactions from a choice.
 * Pure function — returns new approval map.
 */
export function applyFactionReactions(
  approval: Record<FactionId, number>,
  reactions: Partial<Record<FactionId, ReactionLevel>>,
  rng: Rng,
): Record<FactionId, number> {
  const next = { ...approval };
  for (const [id, level] of Object.entries(reactions) as [FactionId, ReactionLevel][]) {
    const base = reactionDelta(level);
    const varied = rng.vary(base, 0.2);
    next[id] = clamp((next[id] ?? 50) + varied, 0, 100);
  }
  return next;
}

/**
 * Passive drift: each faction's approval drifts each quarter based on
 * whether their priority indicators are healthy. This is the "ambient"
 * pressure layer that runs even when no event reaction triggers.
 *
 * Cynicism applies a small uniform malus to every faction's drift.
 */
export function driftFactionApproval(
  approval: Record<FactionId, number>,
  indicators: Record<string, number>,
  rng: Rng,
  cynicism: number = 0,
): Record<FactionId, number> {
  const next = { ...approval };
  const cynicismMalus = -Math.min(0.6, cynicism * 0.015);
  for (const f of FACTIONS) {
    let drift = 0;
    for (const k of f.caresAboutUp) {
      const v = indicators[k] ?? 50;
      drift += (v - 50) * 0.04;
    }
    for (const k of f.caresAboutDown) {
      const v = indicators[k] ?? 50;
      drift += (50 - v) * 0.04;
    }
    // Add gentle reversion toward 50
    drift += (50 - next[f.id]) * 0.02;
    // Cynicism drag
    drift += cynicismMalus;
    drift = rng.vary(drift, 0.2);
    next[f.id] = clamp(next[f.id] + drift, 0, 100);
  }
  return next;
}

/** Apply trait starting biases to faction approval. */
export function applyTraitFactionBias(
  approval: Record<FactionId, number>,
  traitIds: string[],
): Record<FactionId, number> {
  const next = { ...approval };
  // Maps from trait id → faction id offsets.
  const TRAIT_FACTION: Record<string, Partial<Record<FactionId, number>>> = {
    technocrat: { entrepreneurs: 5, reformBloc: 3, socialDems: -4 },
    euroatlanticist: { reformBloc: 12, natoBloc: 8, identity: -10, minority: -3 },
    populist: { entrepreneurs: -3, reformBloc: -6, socialDems: 4, identity: 6 },
    crisisManager: { reformBloc: 5, natoBloc: 3 },
    natoHawk: { natoBloc: 15, identity: 6, socialDems: -5, minority: -8 },
    balticPragmatist: { entrepreneurs: 4, socialDems: 4, natoBloc: 4, reformBloc: 4, identity: 4, green: 4, minority: 4 },
  };
  for (const t of traitIds) {
    const bias = TRAIT_FACTION[t];
    if (!bias) continue;
    for (const [fid, delta] of Object.entries(bias) as [FactionId, number][]) {
      next[fid] = clamp(next[fid] + delta, 0, 100);
    }
  }
  return next;
}

/** Whether a faction is in "love"/"crisis" thresholds — drives event triggers. */
export function factionMood(approval: number): 'love' | 'happy' | 'neutral' | 'unhappy' | 'crisis' {
  if (approval >= 75) return 'love';
  if (approval >= 55) return 'happy';
  if (approval >= 35) return 'neutral';
  if (approval >= 20) return 'unhappy';
  return 'crisis';
}

/** Get current faction quote based on mood. */
export function factionMoodQuote(f: FactionDef, approval: number): string {
  const m = factionMood(approval);
  if (m === 'love') return f.praiseQuote;
  if (m === 'crisis') return f.angerQuote;
  if (m === 'happy') return '"Cautiously approving."';
  if (m === 'unhappy') return '"We have concerns."';
  return '"Watching closely."';
}
