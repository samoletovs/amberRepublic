import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TUTORIAL_STEPS,
  clampStep,
  isLastStep,
  isTutorialCompleted,
  markTutorialCompleted,
  resetTutorial,
  stepAt,
} from '../src/engine/tutorial';

describe('tutorial — steps', () => {
  it('defines a non-trivial sequence with unique ids', () => {
    expect(TUTORIAL_STEPS.length).toBeGreaterThanOrEqual(4);
    const ids = new Set(TUTORIAL_STEPS.map(s => s.id));
    expect(ids.size).toBe(TUTORIAL_STEPS.length);
  });

  it('every step has a title and explanatory body', () => {
    for (const s of TUTORIAL_STEPS) {
      expect(s.title.length).toBeGreaterThan(3);
      expect(s.body.length).toBeGreaterThan(20);
    }
  });

  it('clamps indexes into range', () => {
    expect(clampStep(-5)).toBe(0);
    expect(clampStep(999)).toBe(TUTORIAL_STEPS.length - 1);
    expect(clampStep(Number.NaN)).toBe(0);
    expect(clampStep(1.7)).toBe(1);
  });

  it('stepAt and isLastStep respect bounds', () => {
    expect(stepAt(-1)).toBe(TUTORIAL_STEPS[0]);
    expect(stepAt(999)).toBe(TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1]);
    expect(isLastStep(0)).toBe(false);
    expect(isLastStep(TUTORIAL_STEPS.length - 1)).toBe(true);
  });
});

describe('tutorial — completion persistence', () => {
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
      clear: vi.fn(() => store.clear()),
    });
  });

  it('starts incomplete, then records completion', () => {
    expect(isTutorialCompleted()).toBe(false);
    markTutorialCompleted();
    expect(isTutorialCompleted()).toBe(true);
    resetTutorial();
    expect(isTutorialCompleted()).toBe(false);
  });

  it('treats storage failures as not completed', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('blocked');
      }),
      setItem: vi.fn(() => {
        throw new Error('blocked');
      }),
      removeItem: vi.fn(() => {
        throw new Error('blocked');
      }),
    });
    expect(() => markTutorialCompleted()).not.toThrow();
    expect(() => resetTutorial()).not.toThrow();
    expect(isTutorialCompleted()).toBe(false);
  });
});
