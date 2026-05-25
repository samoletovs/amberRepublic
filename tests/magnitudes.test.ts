import { describe, it, expect } from 'vitest';
import { magnitudeOf, delayLabelOf, magnitudeWeight } from '../src/engine/magnitudes';

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
