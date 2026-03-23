import { GameState, Condition, ScheduledEffect, Effect } from './types';
import { INDICATORS } from './indicators';
import { clamp } from './random';
import type { Rng } from './random';

/** Check if a single condition is met */
export function checkCondition(state: GameState, cond: Condition): boolean {
  const val = state.indicators[cond.indicator] ?? 0;
  switch (cond.op) {
    case '<': return val < cond.value;
    case '>': return val > cond.value;
    case '<=': return val <= cond.value;
    case '>=': return val >= cond.value;
    case '==': return Math.abs(val - cond.value) < 0.01;
    case '!=': return Math.abs(val - cond.value) >= 0.01;
    default: return false;
  }
}

/** Apply an effect: either immediately or schedule it */
export function applyEffect(state: GameState, effect: Effect, source: string, rng: Rng): GameState {
  const variedDelta = rng.vary(effect.delta, 0.15);

  if (effect.delay <= 0) {
    // Apply immediately
    if (effect.condition && !checkCondition(state, effect.condition)) {
      return state;
    }
    return applyDelta(state, effect.indicator, variedDelta, effect.duration, source, rng);
  }

  // Schedule for later
  return {
    ...state,
    scheduledEffects: [
      ...state.scheduledEffects,
      {
        indicator: effect.indicator,
        delta: variedDelta,
        turnsRemaining: effect.delay,
        duration: effect.duration,
        source,
        condition: effect.condition,
      },
    ],
  };
}

/** Apply a delta to an indicator, respecting bounds */
function applyDelta(state: GameState, indicator: string, delta: number, duration: number, source: string, _rng: Rng): GameState {
  const meta = INDICATORS.find(i => i.key === indicator);
  if (!meta) return state;

  const current = state.indicators[indicator] ?? 0;
  const newVal = clamp(current + delta, meta.min, meta.max);

  const newState = {
    ...state,
    indicators: { ...state.indicators, [indicator]: newVal },
  };

  // If it's a lasting effect, schedule removal
  if (duration > 0) {
    newState.scheduledEffects = [
      ...newState.scheduledEffects,
      {
        indicator,
        delta: -delta,
        turnsRemaining: duration,
        duration: 0,
        source: `${source} (decay)`,
      },
    ];
  }

  return newState;
}

/** Process all scheduled effects for this turn */
export function processScheduledEffects(state: GameState, rng: Rng): GameState {
  let newState = { ...state, scheduledEffects: [...state.scheduledEffects] };
  const remaining: ScheduledEffect[] = [];

  for (const eff of newState.scheduledEffects) {
    if (eff.turnsRemaining <= 1) {
      // Time to apply
      if (eff.condition && !checkCondition(newState, eff.condition)) {
        continue; // Condition not met, skip
      }
      newState = applyDelta(newState, eff.indicator, eff.delta, eff.duration, eff.source, rng);
    } else {
      remaining.push({ ...eff, turnsRemaining: eff.turnsRemaining - 1 });
    }
  }

  newState.scheduledEffects = remaining;
  return newState;
}

/** 
 * Second-order cascading effects — the real magic.
 * These model how indicators affect each other naturally.
 */
export function applyCascadingEffects(state: GameState, _rng: Rng): GameState {
  const ind = { ...state.indicators };

  // High emigration → workforce & GDP decline
  if (ind.emigrationRate > 60) {
    ind.workforceSkill = clamp(ind.workforceSkill - 0.3, 0, 100);
    ind.gdpGrowth = clamp(ind.gdpGrowth - 0.1, -20, 15);
    ind.population = clamp(ind.population - 0.003, 1.0, 2.5);
  }

  // Low birth rate → slow population decline
  if (ind.birthRate < 30) {
    ind.population = clamp(ind.population - 0.002, 1.0, 2.5);
  }

  // High unemployment → lower happiness & higher emigration
  if (ind.unemployment > 12) {
    ind.publicHappiness = clamp(ind.publicHappiness - 0.5, 0, 100);
    ind.emigrationRate = clamp(ind.emigrationRate + 0.3, 0, 100);
  }

  // Good education → better workforce skills
  if (ind.educationQuality > 65) {
    ind.workforceSkill = clamp(ind.workforceSkill + 0.2, 0, 100);
  }

  // High corruption → lower foreign investment & trust
  if (ind.corruptionLevel > 50) {
    ind.foreignInvestment = clamp(ind.foreignInvestment - 0.3, 0, 100);
    ind.mediaTrust = clamp(ind.mediaTrust - 0.1, 0, 100);
  }

  // Good healthcare → slightly better birth rate
  if (ind.healthcareQuality > 60) {
    ind.birthRate = clamp(ind.birthRate + 0.1, 0, 100);
  }

  // NATO relations → security boost
  if (ind.natoRelations > 70) {
    ind.borderSecurity = clamp(ind.borderSecurity + 0.1, 0, 100);
  }

  // Tech sector → GDP boost
  if (ind.techSector > 60) {
    ind.gdpGrowth = clamp(ind.gdpGrowth + 0.05, -20, 15);
    ind.foreignInvestment = clamp(ind.foreignInvestment + 0.1, 0, 100);
  }

  // Green transition → EU standing
  if (ind.greenTransition > 60) {
    ind.euStanding = clamp(ind.euStanding + 0.1, 0, 100);
  }

  // GDP growth → GDP absolute change
  ind.gdp = clamp(ind.gdp * (1 + ind.gdpGrowth / 400), 15, 120); // quarterly

  // Low social cohesion → political instability
  if (ind.socialCohesion < 25) {
    ind.publicHappiness = clamp(ind.publicHappiness - 0.5, 0, 100);
    ind.foreignInvestment = clamp(ind.foreignInvestment - 0.2, 0, 100);
  }

  // Very low Russia relations + low military → higher threat perception
  if (ind.russiaRelations < 20 && ind.militaryReadiness < 40) {
    ind.publicHappiness = clamp(ind.publicHappiness - 0.3, 0, 100);
  }

  return { ...state, indicators: ind };
}

/** Check game-over conditions */
export function checkGameOver(state: GameState): GameState {
  const ind = state.indicators;

  if (ind.population < 1.2) {
    return { ...state, gameOver: true, gameOverReason: 'Latvia\'s population has fallen below 1.2 million. The country can no longer sustain itself as an independent nation. The Saeima votes to merge into a Nordic-Baltic federation.' };
  }
  if (ind.publicHappiness < 5) {
    return { ...state, gameOver: true, gameOverReason: 'Mass protests erupt across Riga. The government collapses. You are escorted from the Saeima by your own guards. Your portrait will not hang in the presidential gallery.' };
  }
  if (ind.publicDebt > 130) {
    return { ...state, gameOver: true, gameOverReason: 'Latvia defaults on its sovereign debt. The IMF takes control of fiscal policy. Your role as leader is now purely ceremonial — a puppet of international creditors.' };
  }
  if (ind.gdp < 18) {
    return { ...state, gameOver: true, gameOverReason: 'The economy has contracted beyond recovery. Latvia enters a decade-long depression. History books will call this "The Second Lost Decade."' };
  }
  if (state.turn >= 40) { // 10 years
    return { ...state, gameOver: true, gameOverReason: 'Your decade in power has ended. Latvia continues — shaped by your decisions. The question is: did you leave it better than you found it?' };
  }

  return state;
}

/** Calculate a final score based on indicator changes */
export function calculateScore(state: GameState): number {
  const ind = state.indicators;
  let score = 0;

  // Positive factors
  score += ind.gdpGrowth * 3;
  score += (100 - ind.unemployment) * 0.5;
  score += ind.publicHappiness * 0.8;
  score += ind.healthcareQuality * 0.5;
  score += ind.educationQuality * 0.5;
  score += ind.population * 20; // More people = more future
  score += ind.birthRate * 0.3;
  score += ind.socialCohesion * 0.4;
  score += ind.techSector * 0.3;
  score += ind.greenTransition * 0.3;
  score += ind.foreignInvestment * 0.3;
  score += ind.natoRelations * 0.2;
  score += ind.euStanding * 0.2;
  score += ind.cyberDefense * 0.2;

  // Negative factors
  score -= ind.corruptionLevel * 0.5;
  score -= ind.emigrationRate * 0.4;
  score -= ind.publicDebt * 0.1;
  score -= (100 - ind.energyIndependence) * 0.2;

  return Math.round(Math.max(0, score));
}
