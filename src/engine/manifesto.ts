import type { GameState } from './types';

/**
 * Democracy 4-style manifesto system.
 *
 * Before taking office (and after every election win), the player makes
 * 3 promises from a curated list. Each promise has a measurable target.
 * At the next election, kept promises bump the cynicism meter down a bit,
 * broken promises raise it. Cynicism is permanent — it never fully decays.
 *
 * High cynicism makes every faction harder to satisfy (a flat malus on
 * passive faction drift).
 */

export interface PromiseDef {
  id: string;
  title: string;
  description: string;
  /** Indicator key the promise tracks. */
  indicator: string;
  /** "above" or "below" the target value. */
  comparison: 'above' | 'below';
  /** Target value. */
  target: number;
  /** Faction(s) most pleased if delivered. */
  resonates: string[];
}

export const PROMISES: PromiseDef[] = [
  {
    id: 'unemployment-low',
    title: 'Unemployment below 6%',
    description: 'A working country. Pension contributions, less drama.',
    indicator: 'unemployment',
    comparison: 'below',
    target: 6,
    resonates: ['socialDems', 'entrepreneurs'],
  },
  {
    id: 'gdp-grow',
    title: 'GDP growth above 3% annually',
    description: 'Out-perform the Estonians, just this once.',
    indicator: 'gdpGrowth',
    comparison: 'above',
    target: 3,
    resonates: ['entrepreneurs'],
  },
  {
    id: 'debt-floor',
    title: 'Public debt under 50% of GDP',
    description: 'Fiscal discipline. Brussels will notice. So will the bond market.',
    indicator: 'publicDebt',
    comparison: 'below',
    target: 50,
    resonates: ['reformBloc', 'entrepreneurs'],
  },
  {
    id: 'defense-three',
    title: 'Defence spending sustained ≥ 2.5% GDP',
    description: 'A serious country. The General Staff will sleep slightly better.',
    indicator: 'militaryReadiness',
    comparison: 'above',
    target: 65,
    resonates: ['natoBloc'],
  },
  {
    id: 'healthcare-fix',
    title: 'Healthcare quality above 55',
    description: 'No more last place. Just second-to-last.',
    indicator: 'healthcareQuality',
    comparison: 'above',
    target: 55,
    resonates: ['socialDems'],
  },
  {
    id: 'emigration-down',
    title: 'Cut emigration rate below 40',
    description: 'They can keep Dublin. We want our nurses back.',
    indicator: 'emigrationRate',
    comparison: 'below',
    target: 40,
    resonates: ['identity', 'socialDems'],
  },
  {
    id: 'corruption-down',
    title: 'Corruption index below 35',
    description: 'KNAB does more than open inquiries. It finishes them.',
    indicator: 'corruptionLevel',
    comparison: 'below',
    target: 35,
    resonates: ['reformBloc'],
  },
  {
    id: 'green-target',
    title: 'Green transition above 60',
    description: 'Carbon targets met. EU pats on the back received.',
    indicator: 'greenTransition',
    comparison: 'above',
    target: 60,
    resonates: ['green'],
  },
  {
    id: 'tech-sector',
    title: 'Tech sector index above 60',
    description: 'A real Silicon Baltic, not a press release.',
    indicator: 'techSector',
    comparison: 'above',
    target: 60,
    resonates: ['entrepreneurs', 'reformBloc'],
  },
];

export interface PromiseRecord {
  promiseId: string;
  termIndex: number;
  fulfilled?: boolean;
}

export function isPromiseFulfilled(p: PromiseDef, state: GameState): boolean {
  const v = state.indicators[p.indicator] ?? 0;
  return p.comparison === 'above' ? v >= p.target : v <= p.target;
}

/**
 * Evaluate all current-term promises and return the delta to apply to
 * the cynicism meter, plus per-promise kept/broken records.
 *
 * Fulfilled promise: -3 cynicism, capped at 0.
 * Broken promise: +5 cynicism.
 */
export function evaluatePromises(
  promises: PromiseRecord[],
  state: GameState,
  currentTermIndex: number,
): { cynicismDelta: number; resolved: PromiseRecord[] } {
  let cynicismDelta = 0;
  const resolved: PromiseRecord[] = [];
  for (const r of promises) {
    if (r.termIndex !== currentTermIndex || r.fulfilled !== undefined) {
      resolved.push(r);
      continue;
    }
    const def = PROMISES.find(p => p.id === r.promiseId);
    if (!def) {
      resolved.push(r);
      continue;
    }
    const fulfilled = isPromiseFulfilled(def, state);
    cynicismDelta += fulfilled ? -3 : 5;
    resolved.push({ ...r, fulfilled });
  }
  return { cynicismDelta, resolved };
}
