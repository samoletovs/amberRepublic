import { describe, it, expect } from 'vitest';
import {
  FACTIONS,
  createInitialFactionApproval,
  applyFactionReactions,
  driftFactionApproval,
  applyTraitFactionBias,
  factionMood,
  reactionDelta,
} from '../src/engine/factions';
import { createRng } from '../src/engine/random';

describe('factions — Tropico-style ideological blocs', () => {
  it('defines all 7 factions with required fields', () => {
    expect(FACTIONS.length).toBe(7);
    for (const f of FACTIONS) {
      expect(f.id).toBeDefined();
      expect(f.name).toBeTruthy();
      expect(f.leader).toBeTruthy();
      expect(f.leaderInitials.length).toBeGreaterThanOrEqual(2);
      expect(f.praiseQuote).toBeTruthy();
      expect(f.angerQuote).toBeTruthy();
    }
  });

  it('createInitialFactionApproval seeds all factions to a value', () => {
    const a = createInitialFactionApproval();
    for (const f of FACTIONS) {
      expect(typeof a[f.id]).toBe('number');
    }
  });

  it('reactionDelta maps level to signed integer', () => {
    expect(reactionDelta('love')).toBeGreaterThan(0);
    expect(reactionDelta('rage')).toBeLessThan(0);
    expect(reactionDelta('meh')).toBe(0);
  });

  it('applyFactionReactions shifts targeted factions only', () => {
    const a = createInitialFactionApproval();
    const rng = createRng(42);
    const next = applyFactionReactions(a, { entrepreneurs: 'love' }, rng);
    expect(next.entrepreneurs).toBeGreaterThan(a.entrepreneurs);
    expect(next.socialDems).toBe(a.socialDems);
  });

  it('driftFactionApproval moves toward each faction\'s preferred indicators', () => {
    const a = createInitialFactionApproval();
    const rng = createRng(7);
    const indicators: Record<string, number> = {
      foreignInvestment: 90, techSector: 90, gdpGrowth: 6, portActivity: 90,
      taxBurden: 20, corruptionLevel: 20,
    };
    const next = driftFactionApproval(a, indicators, rng);
    // Entrepreneurs care about all of the above going the "right" way
    expect(next.entrepreneurs).toBeGreaterThan(a.entrepreneurs);
  });

  it('applyTraitFactionBias shifts factions by trait map', () => {
    const a = createInitialFactionApproval();
    const next = applyTraitFactionBias(a, ['natoHawk']);
    expect(next.natoBloc).toBeGreaterThan(a.natoBloc);
    expect(next.minority).toBeLessThan(a.minority);
  });

  it('factionMood thresholds', () => {
    expect(factionMood(80)).toBe('love');
    expect(factionMood(60)).toBe('happy');
    expect(factionMood(45)).toBe('neutral');
    expect(factionMood(25)).toBe('unhappy');
    expect(factionMood(10)).toBe('crisis');
  });

  it('cynicism drags drift downward', () => {
    const a = createInitialFactionApproval();
    const rng1 = createRng(99);
    const rng2 = createRng(99);
    const indicators = { foreignInvestment: 50 };
    const noCynicism = driftFactionApproval(a, indicators, rng1, 0);
    const highCynicism = driftFactionApproval(a, indicators, rng2, 30);
    const sumNo = Object.values(noCynicism).reduce((s, v) => s + v, 0);
    const sumHi = Object.values(highCynicism).reduce((s, v) => s + v, 0);
    expect(sumHi).toBeLessThan(sumNo);
  });
});
