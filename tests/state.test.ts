import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/engine/state';

describe('state — createInitialState', () => {
  it('creates state with Latvia 2025 baseline values', () => {
    const state = createInitialState(42);
    expect(state.year).toBe(2025);
    expect(state.quarter).toBe(1);
    expect(state.turn).toBe(0);
    expect(state.gameOver).toBe(false);
    expect(state.seed).toBe(42);
  });

  it('initializes all indicators with real-data values', () => {
    const state = createInitialState(42);
    expect(state.indicators.gdp).toBe(45);
    expect(state.indicators.population).toBe(1.86);
    expect(state.indicators.unemployment).toBe(6.8);
    expect(state.indicators.natoRelations).toBe(72);
  });

  it('creates deterministic state from same seed', () => {
    const a = createInitialState(100);
    const b = createInitialState(100);
    expect(a.indicators).toEqual(b.indicators);
    expect(a.seed).toBe(b.seed);
  });

  it('uses random seed when none provided', () => {
    const a = createInitialState();
    const b = createInitialState();
    // Seeds should differ (extremely unlikely to match)
    expect(a.seed).not.toBe(b.seed);
  });

  it('initializes parliament with starting coalition', () => {
    const state = createInitialState(42);
    expect(state.parliament.parties.length).toBeGreaterThan(0);
    expect(state.parliament.coalitionPartyIds).toContain('jv');
    expect(state.parliament.totalSeats).toBe(100);
  });

  it('initializes empty history and scheduled effects', () => {
    const state = createInitialState(42);
    expect(state.history).toEqual([]);
    expect(state.scheduledEffects).toEqual([]);
    expect(state.firedOneTimeEvents.size).toBe(0);
  });

  it('calculates initial ratings', () => {
    const state = createInitialState(42);
    expect(state.ratings).toBeDefined();
    expect(state.ratings.spRating).toBeDefined();
    expect(state.ratings.freedomHouse).toBeGreaterThan(0);
  });
});
