import { describe, it, expect } from 'vitest';
import {
  PILLARS,
  createInitialConstitution,
  canAdvancePillar,
  advancePillar,
  earnPoliticalCapital,
} from '../src/engine/constitution';

describe('constitution — Frostpunk Book of Laws', () => {
  it('defines all 4 pillars with 5 steps each', () => {
    expect(PILLARS.length).toBe(4);
    for (const p of PILLARS) {
      expect(Object.keys(p.steps).length).toBe(5); // -2..+2
    }
  });

  it('starts at centre (0) on every pillar', () => {
    const c = createInitialConstitution();
    for (const p of PILLARS) {
      expect(c.positions[p.id]).toBe(0);
    }
  });

  it('canAdvancePillar refuses when out of capital', () => {
    const c: ReturnType<typeof createInitialConstitution> = { ...createInitialConstitution(), politicalCapital: 0 };
    const check = canAdvancePillar(c, 'economic', 1);
    expect(check.ok).toBe(false);
    expect(check.reason).toMatch(/Political Capital/);
  });

  it('canAdvancePillar refuses reversing direction', () => {
    const c = createInitialConstitution();
    const { next } = advancePillar({ ...c, politicalCapital: 50 }, 'economic', 1);
    // After moving +1, going back -1 must be forbidden
    const check = canAdvancePillar(next, 'economic', -1);
    expect(check.ok).toBe(false);
    expect(check.reason).toMatch(/not reversible/);
  });

  it('canAdvancePillar refuses going beyond ±2', () => {
    let c: ReturnType<typeof createInitialConstitution> = { ...createInitialConstitution(), politicalCapital: 100 };
    c = advancePillar(c, 'economic', 1).next;
    c = advancePillar(c, 'economic', 1).next;
    expect(c.positions.economic).toBe(2);
    const check = canAdvancePillar(c, 'economic', 1);
    expect(check.ok).toBe(false);
  });

  it('advancePillar decrements political capital by step cost', () => {
    const c: ReturnType<typeof createInitialConstitution> = { ...createInitialConstitution(), politicalCapital: 20 };
    const { next, step } = advancePillar(c, 'economic', 1);
    expect(step).toBeTruthy();
    expect(next.politicalCapital).toBeLessThan(c.politicalCapital);
  });

  it('advancePillar returns step effects so caller can apply them', () => {
    const c: ReturnType<typeof createInitialConstitution> = { ...createInitialConstitution(), politicalCapital: 20 };
    const { step } = advancePillar(c, 'economic', 1);
    expect(step?.effects.length).toBeGreaterThan(0);
  });

  it('earnPoliticalCapital caps at 40', () => {
    const c: ReturnType<typeof createInitialConstitution> = { ...createInitialConstitution(), politicalCapital: 39 };
    const next = earnPoliticalCapital(c, 5);
    expect(next.politicalCapital).toBe(40);
  });
});
