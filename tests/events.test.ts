import { describe, it, expect } from 'vitest';
import { selectEvents, generateNarrative } from '../src/engine/events';
import { createInitialState } from '../src/engine/state';
import { createRng } from '../src/engine/random';
import { ALL_EVENTS } from '../src/data';
import type { GameEvent } from '../src/engine/types';

function makeEvent(overrides: Partial<GameEvent> = {}): GameEvent {
  return {
    id: 'test_event',
    title: 'Test Event',
    description: 'A test.',
    preconditions: [],
    choices: [
      { label: 'Do it', description: 'Yes.', effects: [] },
      { label: 'Do not', description: 'No.', effects: [] },
    ],
    category: 'economy',
    weight: 10,
    oneTime: false,
    ...overrides,
  };
}

describe('events — selectEvents', () => {
  it('returns the requested number of events when the pool is large enough', () => {
    const state = createInitialState(42);
    const selected = selectEvents(state, ALL_EVENTS, createRng(1), 2);
    expect(selected).toHaveLength(2);
  });

  it('never returns the same event twice', () => {
    const state = createInitialState(42);
    const selected = selectEvents(state, ALL_EVENTS, createRng(5), 5);
    expect(new Set(selected.map(e => e.id)).size).toBe(selected.length);
  });

  it('returns an empty array when nothing is eligible', () => {
    const state = createInitialState(42);
    const impossible = makeEvent({
      preconditions: [{ indicator: 'gdp', op: '>', value: 9999 }],
    });
    expect(selectEvents(state, [impossible], createRng(1), 2)).toEqual([]);
  });

  it('only selects events whose preconditions are met', () => {
    const state = createInitialState(42);
    const eligible = makeEvent({ id: 'eligible', preconditions: [{ indicator: 'gdp', op: '>', value: 0 }] });
    const blocked = makeEvent({ id: 'blocked', category: 'society', preconditions: [{ indicator: 'gdp', op: '<', value: 0 }] });
    const selected = selectEvents(state, [eligible, blocked], createRng(3), 2);
    expect(selected.map(e => e.id)).toEqual(['eligible']);
  });

  it('skips one-time events that already fired', () => {
    const state = createInitialState(42);
    const fired = { ...state, firedOneTimeEvents: new Set(['once']) };
    const once = makeEvent({ id: 'once', oneTime: true });
    expect(selectEvents(fired, [once], createRng(1), 2)).toEqual([]);
    expect(selectEvents(state, [once], createRng(1), 2).map(e => e.id)).toEqual(['once']);
  });

  it('is deterministic for the same rng seed', () => {
    const state = createInitialState(42);
    const a = selectEvents(state, ALL_EVENTS, createRng(77), 2);
    const b = selectEvents(state, ALL_EVENTS, createRng(77), 2);
    expect(a.map(e => e.id)).toEqual(b.map(e => e.id));
  });

  it('prefers different categories when picking multiple events', () => {
    const state = createInitialState(42);
    const pool = [
      makeEvent({ id: 'eco1', category: 'economy' }),
      makeEvent({ id: 'eco2', category: 'economy' }),
      makeEvent({ id: 'soc1', category: 'society' }),
    ];
    const selected = selectEvents(state, pool, createRng(9), 2);
    expect(new Set(selected.map(e => e.category)).size).toBe(2);
  });
});

describe('events — generateNarrative', () => {
  it('mentions the quarter, year and chosen labels', () => {
    const state = { ...createInitialState(42), year: 2030, quarter: 2 };
    const event = makeEvent();
    const narrative = generateNarrative(state, [{ event, choiceIndex: 1 }]);
    expect(narrative).toContain('April-June 2030');
    expect(narrative).toContain('Test Event');
    expect(narrative).toContain('Do not');
  });

  it('adds flavor when public happiness is extreme', () => {
    const state = createInitialState(42);
    const happy = generateNarrative({ ...state, indicators: { ...state.indicators, publicHappiness: 85 } }, []);
    const unhappy = generateNarrative({ ...state, indicators: { ...state.indicators, publicHappiness: 10 } }, []);
    expect(happy).toContain('content');
    expect(unhappy).toContain('Grumbling');
  });

  it('works with no decisions', () => {
    const state = createInitialState(42);
    expect(generateNarrative(state, []).length).toBeGreaterThan(0);
  });
});
