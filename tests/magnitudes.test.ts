import { describe, it, expect } from 'vitest';
import { magnitudeOf, delayLabelOf, magnitudeWeight, choiceNetScore } from '../src/engine/magnitudes';
import type { Effect } from '../src/engine/types';

describe('magnitudes — Reigns-style qualitative labels', () => {
  it('classifies small deltas as Slight', () => {
    // publicConfidence has range 100; 0.5 -> ~0.5% of range
    expect(magnitudeOf('publicConfidence', 0.5)).toBe('Slight');
  });

  it('classifies mid deltas as Notable', () => {
    expect(magnitudeOf('publicConfidence', 3)).toBe('Notable');
  });

  it('classifies large deltas as Major', () => {
    expect(magnitudeOf('publicConfidence', 8)).toBe('Major');
  });

  it('classifies huge deltas as Severe', () => {
    expect(magnitudeOf('publicConfidence', 25)).toBe('Severe');
  });

  it('calibrates by indicator range — GDP +3 still Notable on range 105', () => {
    expect(magnitudeOf('gdp', 3)).toBe('Notable');
  });

  it('handles negative deltas the same as positive (absolute value)', () => {
    expect(magnitudeOf('publicConfidence', -8)).toBe('Major');
  });

  it('delayLabelOf maps turns to qualitative words', () => {
    expect(delayLabelOf(0)).toBe('Now');
    expect(delayLabelOf(1)).toBe('Soon');
    expect(delayLabelOf(4)).toBe('Later');
    expect(delayLabelOf(8)).toBe('Long-term');
  });

  it('magnitudeWeight returns ascending weights', () => {
    expect(magnitudeWeight('Slight')).toBe(1);
    expect(magnitudeWeight('Notable')).toBe(2);
    expect(magnitudeWeight('Major')).toBe(3);
    expect(magnitudeWeight('Severe')).toBe(4);
  });
});

describe('choiceNetScore', () => {
  const makeEffect = (indicator: string, delta: number): Effect => ({
    indicator, delta, delay: 0, duration: 1,
  });

  it('returns 0 for an empty effects list', () => {
    expect(choiceNetScore([])).toBe(0);
  });

  it('returns positive score when all effects are beneficial', () => {
    // publicConfidence goodDirection=up, +8 = Major (weight 3)
    // unemployment goodDirection=down, -5 = Notable (weight 2)
    const effects: Effect[] = [
      makeEffect('publicConfidence', 8),
      makeEffect('unemployment', -5),
    ];
    expect(choiceNetScore(effects)).toBeGreaterThan(0);
  });

  it('returns negative score when all effects are harmful', () => {
    // publicConfidence goodDirection=up, -8 = Major (weight 3) → bad
    // militaryReadiness goodDirection=up, -5 = Notable (weight 2) → bad
    const effects: Effect[] = [
      makeEffect('publicConfidence', -8),
      makeEffect('militaryReadiness', -5),
    ];
    expect(choiceNetScore(effects)).toBeLessThan(0);
  });

  it('ignores neutral-direction indicators', () => {
    // inflation and russiaRelations are goodDirection=neutral
    const effects: Effect[] = [
      makeEffect('inflation', 10),
      makeEffect('russiaRelations', 10),
    ];
    expect(choiceNetScore(effects)).toBe(0);
  });

  it('correctly sums mixed positive and negative effects', () => {
    // publicConfidence +8 (range=100, 8% → Major, weight 3, goodDir=up) → +3
    // unemployment +1 (range=29, 3.4% → Notable, weight 2, goodDir=down → bad) → -2
    // Net: 3 - 2 = 1
    const effects: Effect[] = [
      makeEffect('publicConfidence', 8),
      makeEffect('unemployment', 1),
    ];
    const score = choiceNetScore(effects);
    expect(score).toBe(1);
  });

  it('returns 0 for unknown indicator keys', () => {
    const effects: Effect[] = [makeEffect('nonExistentIndicator', 50)];
    expect(choiceNetScore(effects)).toBe(0);
  });
});
