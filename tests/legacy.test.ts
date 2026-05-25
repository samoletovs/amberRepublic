import { describe, it, expect } from 'vitest';
import { generateLegacy, ARCHETYPES } from '../src/engine/legacy';
import { createInitialState } from '../src/engine/state';

describe('legacy — historian verdict at game end', () => {
  it('returns one of the defined archetypes', () => {
    const s = createInitialState(42);
    const legacy = generateLegacy(s);
    const ids = ARCHETYPES.map(a => a.id);
    expect(ids).toContain(legacy.archetype.id);
  });

  it('produces multiple narrative paragraphs', () => {
    const s = createInitialState(42);
    const legacy = generateLegacy(s);
    expect(legacy.paragraphs.length).toBeGreaterThanOrEqual(3);
    for (const p of legacy.paragraphs) {
      expect(p.length).toBeGreaterThan(20);
    }
  });

  it('high GDP + growth biases toward Baltic Tiger', () => {
    const s = createInitialState(42);
    s.indicators.gdp = 80;
    s.indicators.gdpGrowth = 5;
    s.indicators.foreignInvestment = 70;
    s.indicators.techSector = 65;
    s.indicators.publicDebt = 35;
    const legacy = generateLegacy(s);
    expect(legacy.archetype.id).toBe('balticTiger');
  });

  it('collapsed economy biases toward Lost Decade', () => {
    const s = createInitialState(42);
    s.indicators.gdp = 22;
    s.indicators.population = 1.45;
    s.indicators.publicDebt = 120;
    s.indicators.publicConfidence = 15;
    const legacy = generateLegacy(s);
    expect(legacy.archetype.id).toBe('lostDecade');
  });

  it('returns 6 highlight stats', () => {
    const s = createInitialState(42);
    const legacy = generateLegacy(s);
    expect(legacy.highlights.length).toBe(6);
  });
});
