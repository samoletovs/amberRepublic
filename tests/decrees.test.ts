import { describe, it, expect } from 'vitest';
import { DECREES, canEnact, enactDecree, revokeDecree, applyDecreeEffects, createInitialDecrees, getDecree } from '../src/engine/decrees';
import { createInitialState } from '../src/engine/state';
import { INDICATORS } from '../src/engine/indicators';
import type { GameState } from '../src/engine/types';

function stateWithCapital(pc: number): GameState {
  const state = createInitialState(42);
  return { ...state, constitution: { ...state.constitution, politicalCapital: pc } };
}

describe('decrees — definitions', () => {
  it('have unique ids and valid costs', () => {
    const ids = DECREES.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const d of DECREES) {
      expect(d.name).toBeTruthy();
      expect(d.enactCost).toBeGreaterThan(0);
      expect(d.revokeCost).toBeGreaterThan(d.enactCost);
      expect(d.perQuarter.length).toBeGreaterThan(0);
    }
  });

  it('only target known indicators', () => {
    const keys = new Set(INDICATORS.map(i => i.key));
    for (const d of DECREES) {
      for (const eff of d.perQuarter) {
        expect(keys.has(eff.indicator)).toBe(true);
      }
    }
  });

  it('getDecree resolves known ids only', () => {
    expect(getDecree(DECREES[0].id)).toBeDefined();
    expect(getDecree('nope')).toBeUndefined();
  });
});

describe('decrees — enact & revoke', () => {
  it('rejects enacting without enough political capital', () => {
    const decrees = createInitialDecrees();
    const def = DECREES[0];
    expect(canEnact(decrees, def.id, def.enactCost - 1).ok).toBe(false);
    expect(canEnact(decrees, def.id, def.enactCost).ok).toBe(true);
  });

  it('rejects unknown and already-active decrees', () => {
    const def = DECREES[0];
    expect(canEnact(createInitialDecrees(), 'unknown', 99).ok).toBe(false);
    expect(canEnact({ active: [def.id], history: [] }, def.id, 99).ok).toBe(false);
  });

  it('enacting spends capital and records history', () => {
    const def = DECREES[0];
    const before = stateWithCapital(40);
    const { state, def: enacted } = enactDecree(before, def.id);
    expect(enacted?.id).toBe(def.id);
    expect(state.decrees.active).toContain(def.id);
    expect(state.constitution.politicalCapital).toBe(40 - def.enactCost);
    expect(state.decrees.history.at(-1)).toMatchObject({ id: def.id, action: 'enacted' });
    // original state untouched
    expect(before.decrees.active).toEqual([]);
  });

  it('enacting is a no-op without enough capital', () => {
    const def = DECREES[0];
    const before = stateWithCapital(0);
    const { state, def: enacted } = enactDecree(before, def.id);
    expect(enacted).toBeNull();
    expect(state).toBe(before);
  });

  it('revoking costs more and deactivates the decree', () => {
    const def = DECREES[0];
    const { state: enactedState } = enactDecree(stateWithCapital(40), def.id);
    const { state, def: revoked } = revokeDecree(enactedState, def.id);
    expect(revoked?.id).toBe(def.id);
    expect(state.decrees.active).not.toContain(def.id);
    expect(state.constitution.politicalCapital).toBe(40 - def.enactCost - def.revokeCost);
    expect(state.decrees.history.at(-1)).toMatchObject({ id: def.id, action: 'revoked' });
  });

  it('revoking an inactive decree is a no-op', () => {
    const before = stateWithCapital(40);
    const { state, def } = revokeDecree(before, DECREES[0].id);
    expect(def).toBeNull();
    expect(state).toBe(before);
  });
});

describe('decrees — per-quarter effects', () => {
  it('leaves indicators unchanged when nothing is active', () => {
    const indicators = createInitialState(42).indicators;
    expect(applyDecreeEffects(createInitialDecrees(), indicators)).toEqual(indicators);
  });

  it('applies each active decree delta once', () => {
    const indicators = createInitialState(42).indicators;
    const def = DECREES[0];
    const after = applyDecreeEffects({ active: [def.id], history: [] }, indicators);
    for (const eff of def.perQuarter) {
      expect(after[eff.indicator]).toBeCloseTo(indicators[eff.indicator] + eff.delta, 6);
    }
    // does not mutate the input
    expect(indicators[def.perQuarter[0].indicator]).not.toBe(after[def.perQuarter[0].indicator]);
  });

  it('ignores unknown decree ids', () => {
    const indicators = createInitialState(42).indicators;
    expect(applyDecreeEffects({ active: ['unknown'], history: [] }, indicators)).toEqual(indicators);
  });
});
