import { describe, expect, it } from 'vitest';
import { formatIndicatorValue, projectEffect, summarizeEffects, toneForEffect } from '../src/ui/impactProjection';
import { getIndicatorMeta } from '../src/engine/indicators';

describe('impact projection helpers', () => {
  it('formats projected indicator values using indicator units', () => {
    expect(formatIndicatorValue(getIndicatorMeta('gdp')!, 42.25)).toBe('€42.3B');
    expect(formatIndicatorValue(getIndicatorMeta('population')!, 1.876)).toBe('1.88M');
    expect(formatIndicatorValue(getIndicatorMeta('gdpGrowth')!, 2.34)).toBe('2.3%');
    expect(formatIndicatorValue(getIndicatorMeta('publicConfidence')!, 53.6)).toBe('54');
  });

  it('projects before and after values and clamps at indicator bounds', () => {
    const projection = projectEffect(
      { indicator: 'publicConfidence', delta: 12, delay: 0, duration: 0 },
      { publicConfidence: 94 }
    );

    expect(projection?.currentValue).toBe(94);
    expect(projection?.projectedValue).toBe(100);
    expect(projection?.isClamped).toBe(true);
    expect(projection?.currentPct).toBe(94);
    expect(projection?.projectedPct).toBe(100);
  });

  it('does not draw a delta segment for zero-delta projections', () => {
    const projection = projectEffect(
      { indicator: 'publicConfidence', delta: 0, delay: 0, duration: 0 },
      { publicConfidence: 50 }
    );

    expect(projection?.currentPct).toBe(projection?.projectedPct);
    expect(projection?.barWidthPct).toBe(0);
  });

  it('summarizes helpful, risky, delayed, and temporary effects', () => {
    const summary = summarizeEffects([
      { indicator: 'publicConfidence', delta: 4, delay: 0, duration: 0 },
      { indicator: 'publicDebt', delta: 6, delay: 2, duration: 4 },
    ]);

    expect(summary).toEqual({
      helpful: 1,
      harmful: 1,
      neutral: 0,
      immediate: 1,
      delayed: 1,
      temporary: 1,
    });
  });

  it('counts neutral zero-delta effects in summaries', () => {
    expect(summarizeEffects([
      { indicator: 'publicConfidence', delta: 0, delay: 0, duration: 0 },
    ])).toEqual({
      helpful: 0,
      harmful: 0,
      neutral: 1,
      immediate: 1,
      delayed: 0,
      temporary: 0,
    });
  });

  it('excludes unknown indicators from tone and timing summaries', () => {
    expect(summarizeEffects([
      { indicator: 'unknownIndicator', delta: 10, delay: 3, duration: 2 },
    ])).toEqual({
      helpful: 0,
      harmful: 0,
      neutral: 0,
      immediate: 0,
      delayed: 0,
      temporary: 0,
    });
  });

  it('classifies good direction into player-facing tone', () => {
    const taxBurden = getIndicatorMeta('taxBurden')!;

    expect(toneForEffect(getIndicatorMeta('publicConfidence')!, 1)).toBe('helpful');
    expect(toneForEffect(getIndicatorMeta('publicDebt')!, 1)).toBe('harmful');
    expect(taxBurden.goodDirection).toBe('neutral');
    expect(toneForEffect(taxBurden, 1)).toBe('neutral');
  });
});
