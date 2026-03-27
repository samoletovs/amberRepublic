import { describe, it, expect } from 'vitest';
import { createRng, clamp, lerp } from '../src/engine/random';

describe('random — createRng', () => {
  it('produces deterministic sequence from same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect(a.next()).toBe(b.next());
    expect(a.next()).toBe(b.next());
    expect(a.next()).toBe(b.next());
  });

  it('produces different sequences from different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toBe(b.next());
  });

  it('next() returns values in [0, 1)', () => {
    const rng = createRng(123);
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() returns integers within range (inclusive)', () => {
    const rng = createRng(99);
    for (let i = 0; i < 100; i++) {
      const v = rng.int(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('float() returns floats within range', () => {
    const rng = createRng(77);
    for (let i = 0; i < 100; i++) {
      const v = rng.float(2.0, 5.0);
      expect(v).toBeGreaterThanOrEqual(2.0);
      expect(v).toBeLessThan(5.0);
    }
  });

  it('pick() selects element from array', () => {
    const rng = createRng(55);
    const arr = ['a', 'b', 'c'];
    const picked = rng.pick(arr);
    expect(arr).toContain(picked);
  });

  it('shuffle() returns same elements in some order', () => {
    const rng = createRng(33);
    const arr = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle([...arr]);
    expect(shuffled).toHaveLength(arr.length);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('vary() applies variance within bounds', () => {
    const rng = createRng(44);
    const base = 10;
    for (let i = 0; i < 100; i++) {
      const v = rng.vary(base, 0.15);
      expect(v).toBeGreaterThanOrEqual(base * 0.85);
      expect(v).toBeLessThanOrEqual(base * 1.15);
    }
  });
});

describe('random — clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles min === max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

describe('random — lerp', () => {
  it('returns a at t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns b at t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint at t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});
