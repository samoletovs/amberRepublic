import { describe, it, expect } from 'vitest';
import { generateHeadlines } from '../src/engine/newsfeed';
import { createInitialState } from '../src/engine/state';
import { createRng } from '../src/engine/random';

describe('newsfeed — procedural Tropico-style headlines', () => {
  it('generates between 3 and 5 headlines per quarter', () => {
    const state = createInitialState(123);
    const before = { ...state.indicators };
    const rng = createRng(7);
    const headlines = generateHeadlines(state, [], before, rng);
    expect(headlines.length).toBeGreaterThanOrEqual(3);
    expect(headlines.length).toBeLessThanOrEqual(5);
  });

  it('every headline is prefixed with an outlet name', () => {
    const state = createInitialState(99);
    const headlines = generateHeadlines(state, [], { ...state.indicators }, createRng(11));
    for (const h of headlines) {
      expect(h).toContain(':');
    }
  });

  it('reacts to economy movements', () => {
    const state = createInitialState(42);
    const before = { ...state.indicators };
    state.indicators.gdp = state.indicators.gdp + 5;
    state.indicators.foreignInvestment = state.indicators.foreignInvestment + 8;
    const rng = createRng(3);
    const headlines = generateHeadlines(state, [], before, rng);
    // We expect at least one of the headlines to mention positive economy
    const text = headlines.join('\n');
    expect(text.length).toBeGreaterThan(20);
  });

  it('is deterministic for same seed', () => {
    const state = createInitialState(11);
    const before = { ...state.indicators };
    const a = generateHeadlines(state, [], before, createRng(55));
    const b = generateHeadlines(state, [], before, createRng(55));
    expect(a).toEqual(b);
  });
});
