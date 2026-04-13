import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameEvent } from '../src/engine/types';
import { createInitialState } from '../src/engine/state';
import { loadSavedEvents, pickSavedEvent, saveAiEvent } from '../src/engine/savedEvents';

function makeEvent(id: string, overrides: Partial<GameEvent> = {}): GameEvent {
  return {
    id,
    title: `Event ${id}`,
    description: 'Test event',
    preconditions: [],
    choices: [
      {
        label: 'Proceed',
        description: 'Continue',
        effects: [],
      },
    ],
    category: 'economy',
    weight: 1,
    oneTime: false,
    ...overrides,
  };
}

describe('savedEvents', () => {
  beforeEach(() => {
    const store = new Map<string, string>();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(() => {
        store.clear();
      }),
    });
  });

  it('should return empty list for malformed storage JSON', () => {
    localStorage.setItem('amberRepublic_savedAiEvents', '{bad json');
    expect(loadSavedEvents()).toEqual([]);
  });

  it('should ignore invalid event objects when loading', () => {
    localStorage.setItem(
      'amberRepublic_savedAiEvents',
      JSON.stringify([{ id: 'ok' }, makeEvent('valid')]),
    );

    const loaded = loadSavedEvents();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('valid');
  });

  it('should not throw when storage write fails', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(() => saveAiEvent(makeEvent('ai_1'))).not.toThrow();
  });

  it('should pick saved event deterministically for same game state', () => {
    const a = makeEvent('ai_a');
    const b = makeEvent('ai_b');
    localStorage.setItem('amberRepublic_savedAiEvents', JSON.stringify([a, b]));

    const state = createInitialState(1234);

    const pick1 = pickSavedEvent(state, []);
    const pick2 = pickSavedEvent(state, []);

    expect(pick1?.id).toBeDefined();
    expect(pick1?.id).toBe(pick2?.id);
  });

  it('should exclude recently shown titles and return null when all are filtered out', () => {
    const event = makeEvent('ai_recent', { title: 'Repeated title' });
    localStorage.setItem('amberRepublic_savedAiEvents', JSON.stringify([event]));

    const state = createInitialState(42);

    const picked = pickSavedEvent(state, ['Repeated title']);

    expect(picked).toBeNull();
  });
});
