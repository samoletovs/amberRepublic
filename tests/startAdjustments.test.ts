import { describe, expect, it } from 'vitest';
import { applyBudgetAllocationEffects, applyIndicatorOverrides } from '../src/engine/startAdjustments';

describe('startAdjustments', () => {
  it('should apply only valid override keys with numeric values', () => {
    const base = {
      gdp: 45,
      unemployment: 6.8,
    };

    const next = applyIndicatorOverrides(base, {
      gdp: 50,
      unknown: 999,
      unemployment: null,
      invalid: undefined,
      alsoInvalid: Number.NaN,
    });

    expect(next).toEqual({
      gdp: 50,
      unemployment: 6.8,
    });
  });

  it('should not mutate base indicators when applying overrides', () => {
    const base = {
      gdp: 45,
      unemployment: 6.8,
    };

    const next = applyIndicatorOverrides(base, { gdp: 47 });

    expect(base.gdp).toBe(45);
    expect(next.gdp).toBe(47);
    expect(next).not.toBe(base);
  });

  it('should apply budget effects only for mapped budget codes', () => {
    const base = {
      militaryReadiness: 55,
      borderSecurity: 50,
      socialCohesion: 40,
      greenTransition: 40,
    };

    const next = applyBudgetAllocationEffects(base, {
      GF02: 900,
      GF03: 700,
      IGNORE_ME: 1000,
    });

    expect(next.militaryReadiness).toBeCloseTo(56.5, 4);
    expect(next.borderSecurity).toBeCloseTo(49.8, 4);
    expect(next.socialCohesion).toBe(40);
    expect(next.greenTransition).toBe(40);
  });

  it('should clamp budget effect outputs to [0, 100]', () => {
    const base = {
      healthcareQuality: 2,
      greenTransition: 98,
    };

    const next = applyBudgetAllocationEffects(base, {
      GF07: 0,
      GF05: 2000,
    });

    expect(next.healthcareQuality).toBe(0);
    expect(next.greenTransition).toBe(100);
  });
});
