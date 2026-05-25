/**
 * Constitution Builder — Frostpunk Book of Laws, Latvia-flavoured.
 *
 * 4 pillars, each with positions -2..+2 (5 steps). Moving along a pillar
 * costs Political Capital. Movement is forbidden in the reverse direction —
 * you can stay or advance, never retreat. This is an *ideological* track,
 * not a tunable parameter.
 *
 * Each step unlocks/locks event pools and gives small permanent indicator
 * shifts. Position is visible on the always-on banner.
 */

export type PillarId = 'economic' | 'foreign' | 'civil' | 'environment';

export interface PillarPosition {
  id: PillarId;
  position: number; // -2..+2, starts at 0
}

export interface PillarStepDef {
  /** New position the player would move to (-2..+2). */
  position: number;
  label: string;
  description: string;
  /** PC cost to advance into this position from the previous one. */
  cost: number;
  /** Permanent indicator deltas applied when entering this position. */
  effects: { indicator: string; delta: number }[];
  /** Faction starting bias deltas (factionId -> delta) applied on entry. */
  factionBias?: Record<string, number>;
}

export interface PillarDef {
  id: PillarId;
  emoji: string;
  name: string;
  axisLeft: string;
  axisRight: string;
  /** Step definitions keyed by position. -2..+2 */
  steps: Record<number, PillarStepDef>;
}

export const PILLARS: PillarDef[] = [
  {
    id: 'economic',
    emoji: '💼',
    name: 'Economic Model',
    axisLeft: 'State-Led',
    axisRight: 'Free Market',
    steps: {
      [-2]: { position: -2, label: 'State-Led Industry', cost: 8, description: 'Public ownership of key sectors. Investment banks frown.', effects: [{ indicator: 'foreignInvestment', delta: -8 }, { indicator: 'gdpGrowth', delta: -0.5 }, { indicator: 'socialCohesion', delta: 4 }], factionBias: { socialDems: 10, entrepreneurs: -10 } },
      [-1]: { position: -1, label: 'Strong Public Sector', cost: 3, description: 'Tilt the mixed economy further to the state side.', effects: [{ indicator: 'healthcareQuality', delta: 4 }, { indicator: 'foreignInvestment', delta: -4 }], factionBias: { socialDems: 5, entrepreneurs: -4 } },
      [0]: { position: 0, label: 'Mixed Economy', cost: 0, description: 'The default Latvian compromise. Everyone is mildly dissatisfied.', effects: [] },
      [1]: { position: 1, label: 'Business-Friendly', cost: 3, description: 'Cut red tape, deregulate strategic sectors.', effects: [{ indicator: 'foreignInvestment', delta: 6 }, { indicator: 'taxBurden', delta: -3 }], factionBias: { entrepreneurs: 6, socialDems: -3 } },
      [2]: { position: 2, label: 'Full Free Market', cost: 8, description: 'Privatise everything that does not move. Brussels asks pointed questions.', effects: [{ indicator: 'foreignInvestment', delta: 12 }, { indicator: 'taxBurden', delta: -6 }, { indicator: 'healthcareQuality', delta: -5 }], factionBias: { entrepreneurs: 12, socialDems: -10 } },
    },
  },
  {
    id: 'foreign',
    emoji: '🌍',
    name: 'Foreign Alignment',
    axisLeft: 'Neutral Pragmatic',
    axisRight: 'Strict Euro-Atlantic',
    steps: {
      [-2]: { position: -2, label: 'Active Non-Alignment', cost: 10, description: 'Hedging between East and West. NATO sends carefully-worded letters.', effects: [{ indicator: 'natoRelations', delta: -15 }, { indicator: 'russiaRelations', delta: 6 }, { indicator: 'euStanding', delta: -10 }], factionBias: { natoBloc: -15 } },
      [-1]: { position: -1, label: 'Quiet Diplomacy', cost: 3, description: 'Less rhetoric, more back-channels.', effects: [{ indicator: 'natoRelations', delta: -5 }], factionBias: { natoBloc: -5 } },
      [0]: { position: 0, label: 'Standard Alignment', cost: 0, description: 'EU and NATO member doing its part. No surprises.', effects: [] },
      [1]: { position: 1, label: 'Forward Atlanticism', cost: 3, description: 'Lean into the alliance. Send the F-35 wishlist again.', effects: [{ indicator: 'natoRelations', delta: 6 }, { indicator: 'militaryReadiness', delta: 4 }], factionBias: { natoBloc: 6, reformBloc: 4 } },
      [2]: { position: 2, label: 'Frontline State Doctrine', cost: 10, description: 'Defence-first foreign policy. The Eastern Brigade gets a budget.', effects: [{ indicator: 'natoRelations', delta: 12 }, { indicator: 'militaryReadiness', delta: 10 }, { indicator: 'russiaRelations', delta: -10 }], factionBias: { natoBloc: 15, reformBloc: 4 } },
    },
  },
  {
    id: 'civil',
    emoji: '⚖️',
    name: 'Civil Order',
    axisLeft: 'Protective Authoritarian',
    axisRight: 'Open Liberal',
    steps: {
      [-2]: { position: -2, label: 'Security State', cost: 10, description: 'Surveillance, expanded police, restricted press. The constitutional court is busy.', effects: [{ indicator: 'borderSecurity', delta: 10 }, { indicator: 'cyberDefense', delta: 8 }, { indicator: 'mediaTrust', delta: -10 }, { indicator: 'socialCohesion', delta: -8 }], factionBias: { reformBloc: -12 } },
      [-1]: { position: -1, label: 'Order First', cost: 3, description: 'Hard line on disorder, looser on civil rights.', effects: [{ indicator: 'borderSecurity', delta: 5 }, { indicator: 'mediaTrust', delta: -3 }], factionBias: { reformBloc: -5 } },
      [0]: { position: 0, label: 'Balanced Liberty', cost: 0, description: 'Civil rights with normal-country exceptions.', effects: [] },
      [1]: { position: 1, label: 'Open Society', cost: 3, description: 'Press freedom expanded; KNAB given teeth.', effects: [{ indicator: 'mediaTrust', delta: 6 }, { indicator: 'corruptionLevel', delta: -4 }], factionBias: { reformBloc: 6 } },
      [2]: { position: 2, label: 'Full Liberal Constitutionalism', cost: 10, description: 'Judicial independence, transparent procurement, robust press. KNAB hires actual auditors.', effects: [{ indicator: 'mediaTrust', delta: 12 }, { indicator: 'corruptionLevel', delta: -10 }, { indicator: 'euStanding', delta: 6 }], factionBias: { reformBloc: 12 } },
    },
  },
  {
    id: 'environment',
    emoji: '🌿',
    name: 'Environmental Posture',
    axisLeft: 'Industrial Growth',
    axisRight: 'Green Mandate',
    steps: {
      [-2]: { position: -2, label: 'Growth First', cost: 8, description: 'Loosen environmental review for major projects. Brussels schedules a meeting.', effects: [{ indicator: 'gdpGrowth', delta: 0.6 }, { indicator: 'greenTransition', delta: -10 }, { indicator: 'euStanding', delta: -4 }], factionBias: { green: -15 } },
      [-1]: { position: -1, label: 'Industry-Friendly', cost: 3, description: 'Tilt regulatory regime toward producers.', effects: [{ indicator: 'gdpGrowth', delta: 0.3 }, { indicator: 'greenTransition', delta: -4 }], factionBias: { green: -5, entrepreneurs: 4 } },
      [0]: { position: 0, label: 'Balanced Pace', cost: 0, description: 'EU green targets met "broadly". Latvian compromise.', effects: [] },
      [1]: { position: 1, label: 'Green Acceleration', cost: 3, description: 'Faster renewable deployment, stricter permitting.', effects: [{ indicator: 'greenTransition', delta: 6 }, { indicator: 'energyIndependence', delta: 4 }], factionBias: { green: 6 } },
      [2]: { position: 2, label: 'Green Mandate', cost: 8, description: 'Carbon neutrality by 2040 is law. The wind turbines outnumber the storks.', effects: [{ indicator: 'greenTransition', delta: 12 }, { indicator: 'energyIndependence', delta: 8 }, { indicator: 'euStanding', delta: 4 }, { indicator: 'gdpGrowth', delta: -0.3 }], factionBias: { green: 15, entrepreneurs: -5 } },
    },
  },
];

export interface ConstitutionState {
  positions: Record<PillarId, number>;
  /** Political capital reserve — earned per turn, spent on amendments. */
  politicalCapital: number;
}

export function createInitialConstitution(): ConstitutionState {
  return {
    positions: { economic: 0, foreign: 0, civil: 0, environment: 0 },
    politicalCapital: 8,
  };
}

/** Can the player advance the given pillar one step in `direction`? */
export function canAdvancePillar(
  c: ConstitutionState,
  pillar: PillarId,
  direction: 1 | -1,
): { ok: boolean; reason?: string; cost?: number } {
  const cur = c.positions[pillar];
  const target = cur + direction;
  if (target < -2 || target > 2) return { ok: false, reason: 'Edge of the constitutional spectrum.' };
  const pillarDef = PILLARS.find(p => p.id === pillar);
  if (!pillarDef) return { ok: false, reason: 'Unknown pillar.' };

  // One-way ladder rule: once you've moved away from 0, you can only continue
  // in that direction — never reverse.
  if (cur > 0 && direction < 0) return { ok: false, reason: 'Constitutional amendments are not reversible.' };
  if (cur < 0 && direction > 0) return { ok: false, reason: 'Constitutional amendments are not reversible.' };

  const step = pillarDef.steps[target];
  if (!step) return { ok: false, reason: 'Step definition missing.' };
  if (c.politicalCapital < step.cost) return { ok: false, reason: `Needs ${step.cost} Political Capital — you have ${c.politicalCapital}.` };
  return { ok: true, cost: step.cost };
}

/** Advance the pillar — returns new constitution state + step deltas to apply elsewhere. */
export function advancePillar(
  c: ConstitutionState,
  pillar: PillarId,
  direction: 1 | -1,
): { next: ConstitutionState; step: PillarStepDef | null } {
  const check = canAdvancePillar(c, pillar, direction);
  if (!check.ok) return { next: c, step: null };
  const target = c.positions[pillar] + direction;
  const pillarDef = PILLARS.find(p => p.id === pillar)!;
  const step = pillarDef.steps[target];
  return {
    next: {
      positions: { ...c.positions, [pillar]: target },
      politicalCapital: c.politicalCapital - (check.cost ?? 0),
    },
    step,
  };
}

/** Earn Political Capital — called from turn.ts each quarter. */
export function earnPoliticalCapital(c: ConstitutionState, base: number = 1, bonus: number = 0): ConstitutionState {
  return { ...c, politicalCapital: Math.min(40, c.politicalCapital + base + bonus) };
}
