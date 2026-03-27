import { describe, it, expect } from 'vitest';
import { checkCondition, applyEffect, processScheduledEffects, applyCascadingEffects, checkGameOver, calculateScore } from '../src/engine/effects';
import { createInitialState } from '../src/engine/state';
import { createRng } from '../src/engine/random';
import type { GameState, Condition, Effect } from '../src/engine/types';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(42), ...overrides };
}

describe('effects — checkCondition', () => {
  const state = makeState();

  it('evaluates > correctly', () => {
    const cond: Condition = { indicator: 'gdp', op: '>', value: 40 };
    expect(checkCondition(state, cond)).toBe(true); // gdp = 45
  });

  it('evaluates < correctly', () => {
    const cond: Condition = { indicator: 'gdp', op: '<', value: 40 };
    expect(checkCondition(state, cond)).toBe(false);
  });

  it('evaluates == correctly', () => {
    const cond: Condition = { indicator: 'population', op: '==', value: 1.86 };
    expect(checkCondition(state, cond)).toBe(true);
  });

  it('evaluates != correctly', () => {
    const cond: Condition = { indicator: 'population', op: '!=', value: 2.0 };
    expect(checkCondition(state, cond)).toBe(true);
  });

  it('evaluates >= correctly', () => {
    const cond: Condition = { indicator: 'gdp', op: '>=', value: 45 };
    expect(checkCondition(state, cond)).toBe(true);
  });

  it('evaluates <= correctly', () => {
    const cond: Condition = { indicator: 'gdp', op: '<=', value: 45 };
    expect(checkCondition(state, cond)).toBe(true);
  });

  it('returns false for unknown operator', () => {
    const cond = { indicator: 'gdp', op: '~' as Condition['op'], value: 45 };
    expect(checkCondition(state, cond)).toBe(false);
  });

  it('treats missing indicator as 0', () => {
    const cond: Condition = { indicator: 'nonexistent', op: '==', value: 0 };
    expect(checkCondition(state, cond)).toBe(true);
  });
});

describe('effects — applyEffect', () => {
  it('applies immediate effect to indicator', () => {
    const state = makeState();
    const rng = createRng(42);
    const effect: Effect = { indicator: 'publicHappiness', delta: 5, delay: 0, duration: 0 };
    const newState = applyEffect(state, effect, 'test', rng);
    // Delta is varied ±15%, so check it moved in the right direction
    expect(newState.indicators.publicHappiness).toBeGreaterThan(state.indicators.publicHappiness);
  });

  it('schedules delayed effect', () => {
    const state = makeState();
    const rng = createRng(42);
    const effect: Effect = { indicator: 'gdp', delta: 2, delay: 3, duration: 0 };
    const newState = applyEffect(state, effect, 'test', rng);
    expect(newState.scheduledEffects.length).toBe(1);
    expect(newState.scheduledEffects[0].turnsRemaining).toBe(3);
  });

  it('skips effect when condition not met', () => {
    const state = makeState();
    const rng = createRng(42);
    const effect: Effect = {
      indicator: 'publicHappiness',
      delta: 10,
      delay: 0,
      duration: 0,
      condition: { indicator: 'gdp', op: '>', value: 1000 }, // impossible
    };
    const newState = applyEffect(state, effect, 'test', rng);
    expect(newState.indicators.publicHappiness).toBe(state.indicators.publicHappiness);
  });
});

describe('effects — processScheduledEffects', () => {
  it('fires scheduled effects when turnsRemaining reaches 1', () => {
    const state = makeState({
      scheduledEffects: [{
        indicator: 'publicHappiness',
        delta: 5,
        turnsRemaining: 1,
        duration: 0,
        source: 'test',
      }],
    });
    const rng = createRng(42);
    const newState = processScheduledEffects(state, rng);
    expect(newState.indicators.publicHappiness).toBeGreaterThan(state.indicators.publicHappiness);
    expect(newState.scheduledEffects.length).toBe(0);
  });

  it('decrements turnsRemaining for future effects', () => {
    const state = makeState({
      scheduledEffects: [{
        indicator: 'publicHappiness',
        delta: 5,
        turnsRemaining: 3,
        duration: 0,
        source: 'test',
      }],
    });
    const rng = createRng(42);
    const newState = processScheduledEffects(state, rng);
    expect(newState.scheduledEffects.length).toBe(1);
    expect(newState.scheduledEffects[0].turnsRemaining).toBe(2);
  });
});

describe('effects — applyCascadingEffects', () => {
  it('high emigration reduces workforce and GDP growth', () => {
    const state = makeState();
    state.indicators.emigrationRate = 70; // high
    const rng = createRng(42);
    const newState = applyCascadingEffects(state, rng);
    expect(newState.indicators.workforceSkill).toBeLessThan(state.indicators.workforceSkill);
  });

  it('good education improves workforce', () => {
    const state = makeState();
    state.indicators.educationQuality = 70; // above 65 threshold
    const rng = createRng(42);
    const newState = applyCascadingEffects(state, rng);
    expect(newState.indicators.workforceSkill).toBeGreaterThan(state.indicators.workforceSkill);
  });
});

describe('effects — checkGameOver', () => {
  it('returns gameOver when population too low', () => {
    const state = makeState();
    state.indicators.population = 1.1;
    const result = checkGameOver(state);
    expect(result.gameOver).toBe(true);
    expect(result.gameOverReason).toContain('1.2 million');
  });

  it('returns gameOver when happiness too low', () => {
    const state = makeState();
    state.indicators.publicHappiness = 3;
    const result = checkGameOver(state);
    expect(result.gameOver).toBe(true);
  });

  it('returns gameOver when debt too high', () => {
    const state = makeState();
    state.indicators.publicDebt = 135;
    const result = checkGameOver(state);
    expect(result.gameOver).toBe(true);
  });

  it('returns gameOver at turn 40 (10 years)', () => {
    const state = makeState({ turn: 40 });
    const result = checkGameOver(state);
    expect(result.gameOver).toBe(true);
  });

  it('no gameOver with normal values', () => {
    const state = makeState();
    const result = checkGameOver(state);
    expect(result.gameOver).toBe(false);
  });
});

describe('effects — calculateScore', () => {
  it('returns a positive score for initial state', () => {
    const state = makeState();
    const score = calculateScore(state);
    expect(score).toBeGreaterThan(0);
  });

  it('higher happiness → higher score', () => {
    const stateA = makeState();
    const stateB = makeState();
    stateB.indicators.publicHappiness = 90;
    expect(calculateScore(stateB)).toBeGreaterThan(calculateScore(stateA));
  });

  it('higher corruption → lower score', () => {
    const stateA = makeState();
    const stateB = makeState();
    stateB.indicators.corruptionLevel = 90;
    expect(calculateScore(stateB)).toBeLessThan(calculateScore(stateA));
  });
});
